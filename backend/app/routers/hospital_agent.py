"""
Hospital Agent Router - Endpoints for Desktop Agent Communication

This router handles communication from the desktop hospital agents,
including registration, model uploads, and status tracking.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional, List, Dict, Any
from datetime import datetime
import pickle
import numpy as np
import uuid
from pydantic import BaseModel
from sqlmodel import Session, select
from ..database import get_session
from ..models import Hospital, TimelineEvent, Contribution, GlobalModel, Experiment
import hashlib
import os

UPLOAD_DIR = "uploads"
os.makedirs(os.path.join(UPLOAD_DIR, "contributions"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "global"), exist_ok=True)

router = APIRouter(prefix="/api/agent", tags=["Hospital Agent"])

# In-memory storage (replace with database in production)
hospital_registry: Dict[str, Dict[str, Any]] = {}
model_updates: List[Dict[str, Any]] = []
global_model_history: List[Dict[str, Any]] = []

class HospitalRegistration(BaseModel):
    hospital_name: str
    location: str = ""
    facility_type: str = "General Hospital"
    agent_version: str = "1.0.0"
    first_run: bool = True

class HospitalStatusResponse(BaseModel):
    hospital_id: str
    hospital_name: str
    first_joined: str
    last_update: Optional[str] = None
    total_updates: int
    total_samples: int
    last_accuracy: Optional[float] = None
    status: str

@router.post("/register")
async def register_hospital(registration: HospitalRegistration, session: Session = Depends(get_session)):
    """
    Register a new hospital or update existing registration.
    Called when hospital agent runs for the first time.
    """
    hospital_id_slug = registration.hospital_name.lower().replace(" ", "_")
    
    # Check if hospital already exists in database
    statement = select(Hospital).where(Hospital.name == registration.hospital_name)
    db_hospital = session.exec(statement).first()
    
    if not db_hospital:
        db_hospital = Hospital(
            id=f"CL-{hospital_id_slug[:6].upper()}",
            name=registration.hospital_name,
            location=registration.location,
            type=registration.facility_type,
            status="online",
            samples=0
        )
        session.add(db_hospital)
        session.commit()
        session.refresh(db_hospital)
        
        return {
            "status": "registered",
            "hospital_id": db_hospital.id,
            "message": f"Welcome {registration.hospital_name}! You are now registered with FEDRAL.AI."
        }
    else:
        # Update existing registration
        db_hospital.status = "online"
        db_hospital.location = registration.location or db_hospital.location
        db_hospital.type = registration.facility_type or db_hospital.type
        db_hospital.updated_at = datetime.utcnow()
        
        session.add(db_hospital)
        session.commit()
        
        return {
            "status": "updated",
            "hospital_id": db_hospital.id,
            "message": f"Welcome back {registration.hospital_name}!"
        }

@router.post("/upload_model")
async def upload_model(
    hospital_name: str = Form(...),
    num_samples: int = Form(...),
    accuracy: float = Form(...),
    update: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """
    Receive model update from hospital agent.
    Stores the model coefficients and updates hospital statistics.
    """
    # Find hospital in DB
    statement = select(Hospital).where(Hospital.name == hospital_name)
    db_hospital = session.exec(statement).first()
    
    if not db_hospital:
        # Auto-register if not found
        db_hospital = Hospital(
            name=hospital_name,
            status="training",
            samples=num_samples
        )
        session.add(db_hospital)
        session.commit()
        session.refresh(db_hospital)
    
    # Read model coefficients
    try:
        model_data = await update.read()
        try:
            coefficients = pickle.loads(model_data)
        except:
            # Fallback for raw binary data (e.g. from JS TypedArray)
            coefficients = np.frombuffer(model_data, dtype=np.float32).tolist()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid model data: {str(e)}")
    
    # Create contribution record for Inbox
    contribution_hash = hashlib.sha256(model_data).hexdigest()
    contribution = Contribution(
        hospital_id=db_hospital.id,
        hospital_name=hospital_name,
        contribution_hash=contribution_hash,
        weight_delta_size=len(model_data),
        samples_count=num_samples,
        accuracy=accuracy,
        status="pending"
    )
    session.add(contribution)
    
    # Save weights for later aggregation
    weights_path = os.path.join(UPLOAD_DIR, "contributions", f"{contribution_hash}.pkl")
    with open(weights_path, "wb") as f:
        f.write(model_data)
    
    # Update hospital database record (last seen, not yet merged)
    db_hospital.updated_at = datetime.utcnow()
    
    # Create timeline event
    event = TimelineEvent(
        hospital_id=db_hospital.id,
        title="Contribution Received (Pending)",
        description=f"Shared model update with {num_samples} samples. Awaiting admin review.",
        event_type="info"
    )
    session.add(event)
    session.add(db_hospital)
    session.commit()
    
    # Update the legacy in-memory registry for existing dashboard metrics if still used
    hospital_id_slug = hospital_name.lower().replace(" ", "_")
    if hospital_id_slug not in hospital_registry:
        hospital_registry[hospital_id_slug] = {"hospital_name": hospital_name, "total_updates": 0}
    hospital_registry[hospital_id_slug]["total_updates"] += 1
    
    return {
        "status": "success",
        "message": f"Update received from {hospital_name}. Awaiting merge review in Inbox.",
        "hospital_id": db_hospital.id,
        "contribution_id": str(contribution.id)
    }

@router.get("/contributions")
async def list_contributions(status: Optional[str] = "pending", session: Session = Depends(get_session)):
    """List hospital contributions for the Inbox."""
    statement = select(Contribution)
    if status:
        statement = statement.where(Contribution.status == status)
    statement = statement.order_by(Contribution.timestamp.desc())
    return session.exec(statement).all()

def aggregate_contribution(session: Session, contribution: Contribution):
    """
    Perform Federated Averaging (FedAvg) on the global model using the new contribution.
    W_new = (W_global * N_global + W_local * N_local) / (N_global + N_local)
    """
    statement = select(GlobalModel).where(GlobalModel.id == "global-latest")
    global_model = session.exec(statement).first()
    
    if not global_model:
        # Initialize
        global_model = GlobalModel(id="global-latest")
        session.add(global_model)
        session.flush()
    
    # Load local weights
    contribution_path = os.path.join(UPLOAD_DIR, "contributions", f"{contribution.contribution_hash}.pkl")
    if not os.path.exists(contribution_path):
        return # Should not happen if accepted
    
    with open(contribution_path, "rb") as f:
        file_content = f.read()
    
    try:
        local_weights = pickle.loads(file_content)
        # Ensure it's a numpy array for math
        if isinstance(local_weights, list):
            local_weights = np.array(local_weights)
    except:
        # Fallback for raw binary data
        local_weights = np.frombuffer(file_content, dtype=np.float32)
    
    n_global = global_model.total_samples
    n_local = contribution.samples_count
    
    if global_model.weights_path and os.path.exists(global_model.weights_path):
        with open(global_model.weights_path, "rb") as f:
            global_weights = pickle.load(f)
            if isinstance(global_weights, list):
                global_weights = np.array(global_weights)
        
        # Weighted average
        if n_global + n_local > 0:
            new_weights = (global_weights * n_global + local_weights * n_local) / (n_global + n_local)
        else:
            new_weights = local_weights
    else:
        new_weights = local_weights
    
    # Save new global weights
    new_weights_path = os.path.join(UPLOAD_DIR, "global", f"global_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pkl")
    
    # Convert back to list for portable pickling
    weights_to_save = new_weights
    if hasattr(new_weights, 'tolist'):
        weights_to_save = new_weights.tolist()
        
    with open(new_weights_path, "wb") as f:
        pickle.dump(weights_to_save, f)
    
    # Update global model stats
    old_n = global_model.total_samples
    global_model.total_samples += n_local
    
    if global_model.total_samples > 0:
        global_model.current_accuracy = (float(global_model.current_accuracy) * old_n + float(contribution.accuracy) * n_local) / global_model.total_samples
    else:
        global_model.current_accuracy = contribution.accuracy
        
    global_model.weights_path = new_weights_path
    global_model.updated_at = datetime.utcnow()
    session.add(global_model)

@router.get("/global_model")
async def get_global_model(session: Session = Depends(get_session)):
    """Fetch the latest global model metadata."""
    statement = select(GlobalModel).where(GlobalModel.id == "global-latest")
    global_model = session.exec(statement).first()
    if not global_model:
        return {"total_samples": 0, "current_accuracy": 0.0, "version": "2.0.0"}
    return global_model

@router.post("/contributions/{contrib_id}/review")
async def review_contribution(contrib_id: str, action: str, session: Session = Depends(get_session)):
    """Accept or Reject a contribution."""
    with open("review_debug.log", "a") as log:
        log.write(f"\nProcessing review for {contrib_id} action={action}\n")
    try:
        # Convert string ID to UUID
        try:
            contrib_uuid = uuid.UUID(contrib_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid contribution ID format")
            
        contribution = session.get(Contribution, contrib_uuid)
        if not contribution:
            raise HTTPException(status_code=404, detail="Contribution not found")
        
        if action not in ["accepted", "rejected"]:
            raise HTTPException(status_code=400, detail="Invalid action")
        
        contribution.status = action
        session.add(contribution)
        
        # Update hospital stats if accepted
        if action == "accepted":
            hospital = session.get(Hospital, contribution.hospital_id)
            if hospital:
                hospital.last_accuracy = contribution.accuracy
                hospital.samples = contribution.samples_count
                hospital.status = "online"
                session.add(hospital)
                
                event = TimelineEvent(
                    hospital_id=hospital.id,
                    title="Merge Accepted",
                    description=f"Model update merged into global model. accuracy: {contribution.accuracy*100:.1f}%",
                    event_type="success"
                )
                session.add(event)
                
            # Mathematical Aggregation (FedAvg)
            aggregate_contribution(session, contribution)

            # Update Active Experiment
            statement = select(Experiment).where(Experiment.status == "running")
            active_experiments = session.exec(statement).all()
            
            # Fetch updated global model metrics
            gm = session.get(GlobalModel, "global-latest")
            current_acc = gm.current_accuracy if gm else contribution.accuracy
            
            for exp in active_experiments:
                # Update round
                exp.current_round += 1
                if exp.current_round >= exp.rounds:
                    exp.status = "completed"
                
                # Update metrics
                import json
                try:
                    metrics = json.loads(exp.metrics_json) if exp.metrics_json else []
                except:
                    metrics = []
                
                metrics.append({
                    "round": exp.current_round,
                    "accuracy": current_acc,
                    "fairness_gap": abs(current_acc - contribution.accuracy), # Simple proxy for gap
                    "timestamp": datetime.utcnow().isoformat()
                })
                exp.metrics_json = json.dumps(metrics)
                exp.updated_at = datetime.utcnow()
                session.add(exp)
        
        session.commit()
        with open("review_debug.log", "a") as log:
            log.write("Review committed successfully\n")
        return {"status": action, "message": f"Contribution {action}"}
    except Exception as e:
        import traceback
        error = traceback.format_exc()
        with open("review_debug.log", "a") as log:
            log.write(f"ERROR: {error}\n")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hospitals")
async def list_hospitals():
    """
    Get list of all registered hospitals with their status.
    """
    hospitals = list(hospital_registry.values())
    
    # Sort by last update (most recent first)
    hospitals.sort(key=lambda x: x.get("last_update") or x.get("first_joined", ""), reverse=True)
    
    return hospitals

@router.get("/hospitals/{hospital_id}")
async def get_hospital_status(hospital_id: str):
    """
    Get detailed status for a specific hospital.
    """
    if hospital_id not in hospital_registry:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    hospital = hospital_registry[hospital_id]
    
    # Get recent updates from this hospital
    recent_updates = [
        u for u in model_updates 
        if u["hospital_id"] == hospital_id
    ][-5:]  # Last 5 updates
    
    return {
        **hospital,
        "recent_updates": recent_updates
    }

@router.get("/activity")
async def get_recent_activity(limit: int = 10):
    """
    Get recent activity feed showing latest hospital contributions.
    """
    recent = model_updates[-limit:] if len(model_updates) >= limit else model_updates
    recent_list = list(recent)
    recent_list.reverse()  # Most recent first
    
    return {
        "total_updates": len(model_updates),
        "recent_activity": recent_list
    }

@router.get("/global_model")
async def get_global_model():
    """
    Get current global model statistics.
    """
    if not global_model_history:
        return {
            "status": "no_model",
            "message": "No global model available yet"
        }
    
    latest = global_model_history[-1]
    
    return {
        "status": "available",
        "version": latest["version"],
        "coefficients": latest["coefficients"],
        "num_hospitals": latest["num_hospitals"],
        "total_samples": latest["total_samples"],
        "avg_accuracy": latest["avg_accuracy"],
        "last_updated": latest["timestamp"]
    }

@router.get("/stats")
async def get_statistics():
    """
    Get overall system statistics for dashboard.
    """
    active_hospitals = sum(1 for h in hospital_registry.values() if h.get("status") == "active")
    total_samples = sum(h.get("total_samples", 0) for h in hospital_registry.values())
    
    return {
        "total_hospitals": len(hospital_registry),
        "active_hospitals": active_hospitals,
        "total_updates": len(model_updates),
        "total_samples": total_samples,
        "global_model_version": f"v1.0.{len(global_model_history)}" if global_model_history else "v1.0.0",
        "latest_accuracy": global_model_history[-1]["avg_accuracy"] if global_model_history else 0.0
    }

@router.delete("/hospitals/{hospital_id}")
async def remove_hospital(hospital_id: str):
    """
    Remove a hospital from the registry (admin only).
    """
    if hospital_id not in hospital_registry:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    del hospital_registry[hospital_id]
    
    return {
        "status": "removed",
        "message": f"Hospital {hospital_id} removed from registry"
    }
