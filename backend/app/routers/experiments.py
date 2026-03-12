from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from ..database import get_session
from ..models import Experiment, ExperimentCreate, ExperimentRead, AuditLog, TimelineEvent
from typing import List
import json
from datetime import datetime

router = APIRouter(prefix="/api/experiments", tags=["experiments"])

@router.get("/", response_model=List[ExperimentRead])
def list_experiments(session: Session = Depends(get_session)):
    """List all experiments"""
    experiments = session.exec(select(Experiment)).all()
    return experiments

@router.post("/", response_model=ExperimentRead)
def create_experiment(exp: ExperimentCreate, session: Session = Depends(get_session)):
    """Create a new experiment"""
    db_exp = Experiment(**exp.dict())
    session.add(db_exp)
    session.commit()
    session.refresh(db_exp)
    
    # Log action
    log = AuditLog(
        action=f"Experiment Created: {db_exp.name}",
        result="Success",
        details=f"ID: {db_exp.id}"
    )
    session.add(log)
    session.commit()
    
    return db_exp

@router.get("/{exp_id}", response_model=ExperimentRead)
def get_experiment(exp_id: str, session: Session = Depends(get_session)):
    """Get experiment details"""
    exp = session.get(Experiment, exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp

@router.post("/{exp_id}/start")
def start_experiment(exp_id: str, session: Session = Depends(get_session)):
    """Start an experiment"""
    exp = session.get(Experiment, exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    exp.status = "running"
    exp.updated_at = datetime.utcnow()
    session.add(exp)
    session.commit()
    
    # Log action
    log = AuditLog(
        action=f"Experiment Started: {exp.name}",
        result="Success",
        details=f"ID: {exp.id}"
    )
    session.add(log)
    session.commit()
    
    return {"status": "started", "id": exp_id}

@router.post("/{exp_id}/stop")
def stop_experiment(exp_id: str, session: Session = Depends(get_session)):
    """Stop a running experiment"""
    exp = session.get(Experiment, exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    exp.status = "stopped"
    exp.updated_at = datetime.utcnow()
    session.add(exp)
    session.commit()
    
    # Log action
    log = AuditLog(
        action=f"Experiment Stopped: {exp.name}",
        result="Success",
        details=f"ID: {exp.id}"
    )
    session.add(log)
    session.commit()
    
    return {"status": "stopped", "id": exp_id}

@router.delete("/{exp_id}")
def delete_experiment(exp_id: str, session: Session = Depends(get_session)):
    """Delete an experiment"""
    exp = session.get(Experiment, exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    session.delete(exp)
    session.commit()
    
    # Log action
    log = AuditLog(
        action=f"Experiment Deleted: {exp.name}",
        result="Success",
        details=f"ID: {exp_id}"
    )
    session.add(log)
    session.commit()
    
    return {"status": "deleted", "id": exp_id}

@router.post("/{exp_id}/metrics")
def update_metrics(exp_id: str, metrics: dict, session: Session = Depends(get_session)):
    """Update experiment metrics (called by training process)"""
    exp = session.get(Experiment, exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # Parse existing metrics
    current_metrics = json.loads(exp.metrics_json) if exp.metrics_json else []
    current_metrics.append(metrics)
    
    exp.metrics_json = json.dumps(current_metrics)
    exp.current_round = metrics.get("round", exp.current_round)
    exp.updated_at = datetime.utcnow()
    
    # Mark as completed if reached final round
    if exp.current_round >= exp.rounds:
        exp.status = "completed"
    
    session.add(exp)
    session.commit()
    
    return {"status": "updated", "current_round": exp.current_round}
