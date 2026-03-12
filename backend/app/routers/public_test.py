"""
Public API Router for Hospital Testing Feature

Public endpoints that don't require authentication for hospitals
to test FEDRAL.AI on their own data.
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from typing import List, Optional, Dict
from pydantic import BaseModel
from datetime import datetime
import hashlib
import sys

from ..database import get_session
from ..models import Download, Contribution
from ..services.csv_validator import CSVValidator, ValidationResult
from ..services.federated_learning import (
    FederatedLearningService, 
    ContributionData
)

router = APIRouter(prefix="/api/public", tags=["Public - Hospital Testing"])


# --- Request/Response Models ---

class CSVValidationRequest(BaseModel):
    """Request to validate CSV format"""
    columns: List[str]
    row_count: int
    sample_data: Optional[Dict[str, List]] = None


class DownloadTrackRequest(BaseModel):
    """Request to track a download"""
    platform: str  # Windows, macOS
    version: str = "2.0.0"
    anonymous_id: Optional[str] = None


class ContributionRequest(BaseModel):
    """Request to submit a contribution"""
    model_version: str
    weight_deltas: Dict[str, List[float]]
    samples_count: int
    privacy_budget: float = 1.0


class ContributionResponse(BaseModel):
    """Response after submitting a contribution"""
    contribution_id: str
    status: str
    message: str
    privacy_report: Dict


# --- Endpoints ---

@router.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Hospital Testing API",
        "version": "2.0.0"
    }


@router.post("/test/validate", response_model=ValidationResult)
def validate_csv(request: CSVValidationRequest):
    """
    Validate CSV file format without uploading data
    
    This endpoint validates the structure and format of a CSV file
    to ensure it meets the requirements for FEDRAL.AI predictions.
    No actual patient data is uploaded.
    """
    # Validate metadata (columns and row count)
    result = CSVValidator.validate_metadata(
        columns=request.columns,
        row_count=request.row_count
    )
    
    # If sample data is provided, validate data types
    if request.sample_data and result.valid:
        type_result = CSVValidator.validate_column_types(request.sample_data)
        result.errors.extend(type_result.errors)
        result.warnings.extend(type_result.warnings)
        result.valid = result.valid and type_result.valid
    
    return result


@router.get("/test/format-example")
def get_format_example():
    """
    Get an example of the correct CSV format
    
    Returns example data and descriptions for each column.
    """
    return CSVValidator.get_format_example()


@router.post("/downloads/track")
def track_download(request: DownloadTrackRequest, http_request: Request, session: Session = Depends(get_session)):
    """
    Track desktop agent downloads
    
    Records download statistics for analytics while preserving privacy.
    IP addresses are hashed and not stored in plain text.
    """
    # Hash IP address for privacy
    client_ip = http_request.client.host if http_request.client else "unknown"
    ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()
    
    # Create download record
    download = Download(
        platform=request.platform,
        version=request.version,
        anonymous_id=request.anonymous_id,
        ip_hash=ip_hash,
        timestamp=datetime.utcnow()
    )
    
    session.add(download)
    session.commit()
    session.refresh(download)
    
    return {
        "download_id": str(download.id),
        "message": "Download tracked successfully",
        "timestamp": download.timestamp
    }


@router.post("/test/contribute", response_model=ContributionResponse)
def submit_contribution(request: ContributionRequest, session: Session = Depends(get_session)):
    """
    Submit a federated learning contribution
    
    Accepts model weight deltas from hospitals that have opted in to
    contribute to research. Applies differential privacy before storage.
    """
    # Convert request to ContributionData
    contribution_data = ContributionData(
        model_version=request.model_version,
        weight_deltas=request.weight_deltas,
        samples_count=request.samples_count,
        privacy_budget=request.privacy_budget
    )
    
    # Validate contribution
    is_valid, error_message = FederatedLearningService.validate_contribution(contribution_data)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)
    
    # Apply differential privacy
    noised_deltas = FederatedLearningService.apply_differential_privacy(
        weight_deltas=contribution_data.weight_deltas,
        epsilon=contribution_data.privacy_budget
    )
    
    # Compute contribution hash for deduplication
    contribution_hash = FederatedLearningService.compute_contribution_hash(contribution_data)
    
    # Check for duplicate contributions
    existing = session.exec(
        select(Contribution).where(Contribution.contribution_hash == contribution_hash)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=409,
            detail="This contribution has already been submitted"
        )
    
    # Calculate weight delta size
    import json
    weight_delta_size = len(json.dumps(noised_deltas).encode())
    
    # Create contribution record
    contribution = Contribution(
        contribution_hash=contribution_hash,
        model_version=request.model_version,
        weight_delta_size=weight_delta_size,
        privacy_budget=request.privacy_budget,
        samples_count=request.samples_count,
        status="validated",
        timestamp=datetime.utcnow()
    )
    
    session.add(contribution)
    session.commit()
    session.refresh(contribution)
    
    # Generate privacy report
    privacy_report = FederatedLearningService.get_privacy_report(
        epsilon=request.privacy_budget,
        samples_count=request.samples_count
    )
    
    return ContributionResponse(
        contribution_id=str(contribution.id),
        status="success",
        message="Contribution received and validated. Thank you for contributing to medical research!",
        privacy_report=privacy_report
    )


@router.get("/stats/downloads")
def get_download_stats(session: Session = Depends(get_session)):
    """
    Get download statistics
    
    Returns aggregated download statistics for analytics.
    """
    downloads = session.exec(select(Download)).all()
    
    # Aggregate by platform
    platform_stats = {}
    for download in downloads:
        platform = download.platform
        if platform not in platform_stats:
            platform_stats[platform] = 0
        platform_stats[platform] += 1
    
    return {
        "total_downloads": len(downloads),
        "by_platform": platform_stats,
        "latest_version": "2.0.0"
    }


@router.get("/stats/contributions")
def get_contribution_stats(session: Session = Depends(get_session)):
    """
    Get contribution statistics
    
    Returns aggregated contribution statistics.
    """
    contributions = session.exec(select(Contribution)).all()
    
    # Aggregate statistics
    total_samples = sum(c.samples_count or 0 for c in contributions)
    avg_privacy_budget = sum(c.privacy_budget for c in contributions) / len(contributions) if contributions else 0
    
    status_counts = {}
    for contrib in contributions:
        status = contrib.status
        if status not in status_counts:
            status_counts[status] = 0
        status_counts[status] += 1
    
    return {
        "total_contributions": len(contributions),
        "total_samples": total_samples,
        "average_privacy_budget": round(avg_privacy_budget, 2),
        "by_status": status_counts
    }
