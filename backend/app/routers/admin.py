from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models import AuditLog, Role, User, Setting

router = APIRouter(prefix="/api/admin", tags=["admin"])

# --- Audit Logs ---
@router.get("/audit_logs", response_model=List[AuditLog])
def read_audit_logs(session: Session = Depends(get_session)):
    logs = session.exec(select(AuditLog).order_by(AuditLog.timestamp.desc())).all()
    return logs

# --- Settings ---
@router.get("/settings")
def read_settings(session: Session = Depends(get_session)):
    settings = session.exec(select(Setting)).all()
    return {s.key: s.value for s in settings}

@router.post("/settings")
def update_setting(key: str, value: str, session: Session = Depends(get_session)):
    setting = session.get(Setting, key)
    if not setting:
        setting = Setting(key=key, value=value)
    else:
        setting.value = value
    session.add(setting)
    session.commit()
    return {"status": "updated"}

# --- Roles ---
@router.get("/roles", response_model=List[Role])
def read_roles(session: Session = Depends(get_session)):
    return session.exec(select(Role)).all()
