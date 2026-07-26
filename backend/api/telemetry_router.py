from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.database import get_db
from backend.models import TelemetryLog, EntityBaseline, IncidentAlert
from backend.schemas import TelemetryOut, DataGenerationRequest, EntityBaselineOut
from backend.engine.generator import generator_instance
from backend.ml.profiler import profiler_instance
from backend.ml.anomaly_detector import anomaly_detector_instance
from backend.ml.attack_classifier import attack_classifier_instance
from backend.ml.explainability import xai_engine_instance

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.post("/generate")
def generate_synthetic_data(req: DataGenerationRequest, db: Session = Depends(get_db)):
    """
    Generates synthetic access logs (100, 1,000, 10,000, or 100,000 records)
    and processes them through the anomaly detection pipeline.
    """
    if req.count > 100000:
        raise HTTPException(status_code=400, detail="Maximum batch generation limit is 100,000 records.")

    raw_dataset = generator_instance.generate_dataset(count=req.count, anomaly_rate=req.anomaly_rate)

    logs_to_commit = []
    alerts_to_commit = []

    # Map for building baseline profiles
    entity_logs_map = {}
    for log_data in raw_dataset:
        entity_id = log_data["entity_id"]
        entity_logs_map.setdefault(entity_id, []).append(log_data)

    # Compute baseline profiles
    baselines = {}
    for entity_id, logs in entity_logs_map.items():
        prof = profiler_instance.build_profile(logs)
        baselines[entity_id] = prof

        # Save/update baseline in DB
        existing_b = db.query(EntityBaseline).filter(EntityBaseline.entity_id == entity_id).first()
        if not existing_b:
            eb = EntityBaseline(
                entity_id=entity_id,
                entity_type=logs[0]["entity_type"],
                habitual_hours_json=prof["habitual_hours_json"],
                top_ips_json=prof["top_ips_json"],
                top_locations_json=prof["top_locations_json"],
                typical_resources_json=prof["typical_resources_json"],
                avg_session_duration=prof["avg_session_duration"],
                std_session_duration=prof["std_session_duration"],
                known_devices_json=prof["known_devices_json"],
                total_events=prof["total_events"]
            )
            db.add(eb)

    # Process logs through anomaly detector & XAI
    for log_data in raw_dataset:
        prof = baselines.get(log_data["entity_id"], profiler_instance.get_cold_start_prior(log_data["entity_type"], "Developer"))
        comp_score, feat_dict, is_anomaly = anomaly_detector_instance.predict(log_data, prof)

        db_log = TelemetryLog(**log_data, risk_features=feat_dict)
        db.add(db_log)
        db.flush() # assign ID

        if is_anomaly or log_data["label"] != "normal":
            attack_type, conf = attack_classifier_instance.classify(log_data, feat_dict)
            if log_data["label"] != "normal":
                attack_type = log_data["label"]
                conf = 0.95

            xai = xai_engine_instance.generate_explanation(log_data, feat_dict, comp_score, attack_type, conf)

            alert = IncidentAlert(
                log_id=db_log.id,
                entity_id=log_data["entity_id"],
                entity_type=log_data["entity_type"],
                timestamp=log_data["timestamp"],
                anomaly_score=xai["anomaly_score"],
                attack_type=xai["attack_type"],
                confidence_score=xai["confidence_score"],
                severity=xai["severity"],
                risk_score=xai["risk_score"],
                feature_contributions_json=xai["feature_contributions_json"],
                natural_language_explanation=xai["natural_language_explanation"],
                analyst_recommendation=xai["analyst_recommendation"],
                status="Open"
            )
            db.add(alert)

    db.commit()

    return {
        "status": "success",
        "generated_count": len(raw_dataset),
        "anomalies_detected": db.query(IncidentAlert).count(),
        "message": f"Successfully generated and analyzed {req.count} telemetry records."
    }

@router.get("/logs", response_model=List[TelemetryOut])
def get_telemetry_logs(
    skip: int = 0, 
    limit: int = 50, 
    entity_id: Optional[str] = None,
    login_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TelemetryLog)
    if entity_id:
        query = query.filter(TelemetryLog.entity_id == entity_id)
    if login_status:
        query = query.filter(TelemetryLog.login_status == login_status)
    return query.order_by(TelemetryLog.timestamp.desc()).offset(skip).limit(limit).all()

@router.get("/entity/{entity_id}/profile", response_model=EntityBaselineOut)
def get_entity_profile(entity_id: str, db: Session = Depends(get_db)):
    baseline = db.query(EntityBaseline).filter(EntityBaseline.entity_id == entity_id).first()
    if not baseline:
        # Generate cold start representation
        prior = profiler_instance.get_cold_start_prior("user", "Developer")
        return EntityBaselineOut(
            id=0,
            entity_id=entity_id,
            entity_type="user",
            habitual_hours_json=prior["habitual_hours_json"],
            top_ips_json=prior["top_ips_json"],
            top_locations_json=prior["top_locations_json"],
            typical_resources_json=prior["typical_resources_json"],
            avg_session_duration=prior["avg_session_duration"],
            std_session_duration=prior["std_session_duration"],
            known_devices_json=prior["known_devices_json"],
            total_events=prior["total_events"],
            last_updated=datetime.utcnow()
        )
    return baseline
