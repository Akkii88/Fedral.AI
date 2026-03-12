from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
import uuid

# --- Hospitals ---
class HospitalBase(SQLModel):
    name: str = Field(index=True)
    type: str = Field(default="General Hospital")
    location: Optional[str] = None
    contact_email: Optional[str] = None
    status: str = Field(default="online") # online, training, offline
    samples: int = Field(default=0)
    latency_ms: int = Field(default=0)
    last_accuracy: float = Field(default=0.0)
    privacy_budget: float = Field(default=5.0)

class Hospital(HospitalBase, table=True):
    id: str = Field(default_factory=lambda: f"CL-{uuid.uuid4().hex[:6].upper()}", primary_key=True)
    connected_since: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class HospitalCreate(HospitalBase):
    pass

class HospitalRead(HospitalBase):
    id: str
    connected_since: datetime

# --- Roles & Permissions ---
class Role(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    permissions: str  # Comma-separated permissions for simplicity

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    email: str
    role_id: Optional[int] = Field(default=None, foreign_key="role.id")
    hospital_id: Optional[str] = Field(default=None, foreign_key="hospital.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Audit Logs ---
class AuditLog(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None) # Nullable if system action
    action: str
    result: str # Success, Failed
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[str] = None

# --- Settings ---
class Setting(SQLModel, table=True):
    key: str = Field(primary_key=True)
    value: str

# --- Experiments ---
class ExperimentBase(SQLModel):
    name: str
    dataset: str = Field(default="ICU Biomarkers")
    model: str = Field(default="Logistic Regression")
    rounds: int = Field(default=10)
    epsilon: float = Field(default=2.0)
    # New fields from UI
    min_clients: int = Field(default=2)
    fairness_enforced: bool = Field(default=False)
    robust_aggregation: bool = Field(default=False)
    
class Experiment(ExperimentBase, table=True):
    id: str = Field(default_factory=lambda: f"EXP-{uuid.uuid4().hex[:8].upper()}", primary_key=True)
    status: str = Field(default="draft") # draft, running, completed, stopped
    current_round: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    # Store metrics as JSON string
    metrics_json: Optional[str] = Field(default="[]")

class ExperimentCreate(ExperimentBase):
    pass

class ExperimentRead(ExperimentBase):
    id: str
    status: str
    current_round: int
    current_round: int
    created_at: datetime
    metrics_json: Optional[str] = "[]"

# --- Timeline Events ---
class TimelineEvent(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hospital_id: str = Field(foreign_key="hospital.id")
    title: str
    description: Optional[str] = None
    event_type: str = Field(default="info")  # info, success, error, warning
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# --- Hospital Testing Feature ---
class Download(SQLModel, table=True):
    """Track desktop agent downloads"""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    platform: str  # Windows, macOS
    version: str = Field(default="2.0.0")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    anonymous_id: Optional[str] = None  # Browser fingerprint
    ip_hash: Optional[str] = None  # Hashed IP for privacy
    country: Optional[str] = None  # Geo-location (country only)

class Contribution(SQLModel, table=True):
    """Track federated learning contributions"""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hospital_id: str = Field(foreign_key="hospital.id")
    hospital_name: str
    contribution_hash: str  # Hash of the contribution for deduplication
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    model_version: str = Field(default="2.0.0")
    weight_delta_size: int  # Size in bytes
    privacy_budget: float = Field(default=1.0)  # Epsilon used
    samples_count: int = Field(default=0)
    accuracy: float = Field(default=0.0)
    status: str = Field(default="pending")  # pending, accepted, rejected

class GlobalModel(SQLModel, table=True):
    """Aggregate state of the federated model"""
    id: str = Field(default="global-latest", primary_key=True)
    version: str = Field(default="2.0.0")
    total_samples: int = Field(default=0)
    current_accuracy: float = Field(default=0.0)
    weights_path: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
