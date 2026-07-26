from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend.models import IncidentAlert
from backend.schemas import IncidentAlertOut, IncidentAlertUpdate

router = APIRouter(prefix="/incidents", tags=["Incidents & Alerts"])

@router.get("/queue", response_model=List[IncidentAlertOut])
def get_incident_queue(
    severity: Optional[str] = None,
    attack_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(IncidentAlert)
    if severity:
        query = query.filter(IncidentAlert.severity == severity)
    if attack_type:
        query = query.filter(IncidentAlert.attack_type == attack_type)
    if status:
        query = query.filter(IncidentAlert.status == status)

    # Rank queue by risk score descending
    alerts_orm = query.order_by(IncidentAlert.risk_score.desc(), IncidentAlert.timestamp.desc()).offset(skip).limit(limit).all()
    return [IncidentAlertOut.model_validate(a) for a in alerts_orm]

@router.get("/{alert_id}", response_model=IncidentAlertOut)
def get_incident_detail(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(IncidentAlert).filter(IncidentAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Incident alert not found.")
    return IncidentAlertOut.model_validate(alert)

@router.patch("/{alert_id}", response_model=IncidentAlertOut)
def update_incident_status(alert_id: int, update_in: IncidentAlertUpdate, db: Session = Depends(get_db)):
    alert = db.query(IncidentAlert).filter(IncidentAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Incident alert not found.")

    alert.status = update_in.status
    if update_in.assigned_to:
        alert.assigned_to = update_in.assigned_to
    if update_in.resolution_notes:
        alert.resolution_notes = update_in.resolution_notes

    db.commit()
    db.refresh(alert)
    return IncidentAlertOut.model_validate(alert)
