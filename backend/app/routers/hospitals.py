from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models import Hospital, HospitalCreate, HospitalRead, AuditLog, TimelineEvent
from datetime import datetime

router = APIRouter(prefix="/api/hospitals", tags=["hospitals"])

@router.get("/", response_model=List[HospitalRead])
def read_hospitals(session: Session = Depends(get_session)):
    hospitals = session.exec(select(Hospital)).all()
    return hospitals

@router.post("/", response_model=HospitalRead)
def create_hospital(hospital: HospitalCreate, session: Session = Depends(get_session)):
    db_hospital = Hospital.from_orm(hospital)
    session.add(db_hospital)
    session.commit()
    session.refresh(db_hospital)
    
    # Audit Log
    log = AuditLog(action="Add Hospital", result="Success", details=f"Added {hospital.name}")
    session.add(log)
    session.commit()
    
    return db_hospital

@router.get("/{hospital_id}", response_model=HospitalRead)
def read_hospital(hospital_id: str, session: Session = Depends(get_session)):
    hospital = session.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital

@router.delete("/{hospital_id}")
def delete_hospital(hospital_id: str, session: Session = Depends(get_session)):
    hospital = session.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    session.delete(hospital)
    session.commit()
    
    # Audit Log
    log = AuditLog(action="Remove Hospital", result="Success", details=f"Removed {hospital.name}")
    session.add(log)
    session.commit()
    
    return {"ok": True}

@router.patch("/{hospital_id}")
def update_hospital(hospital_id: str, updates: dict, session: Session = Depends(get_session)):
    """Update hospital fields (e.g., pause training)"""
    hospital = session.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    # Update fields
    for key, value in updates.items():
        if hasattr(hospital, key):
            setattr(hospital, key, value)
    
    hospital.updated_at = datetime.utcnow()
    session.add(hospital)
    session.commit()
    session.refresh(hospital)
    
    # Create timeline event
    event = TimelineEvent(
        hospital_id=hospital_id,
        title=f"Status Updated",
        description=f"Hospital status changed to {hospital.status}",
        event_type="info"
    )
    session.add(event)
    
    # Audit log
    log = AuditLog(action="Update Hospital", result="Success", details=f"Updated {hospital.name}")
    session.add(log)
    session.commit()
    
    return hospital

@router.get("/{hospital_id}/timeline")
def get_hospital_timeline(hospital_id: str, session: Session = Depends(get_session)):
    """Get activity timeline for a hospital"""
    hospital = session.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    events = session.exec(
        select(TimelineEvent)
        .where(TimelineEvent.hospital_id == hospital_id)
        .order_by(TimelineEvent.timestamp.desc())
        .limit(20)
    ).all()
    
    return [{"title": e.title, "description": e.description, "timestamp": e.timestamp, "type": e.event_type} for e in events]
