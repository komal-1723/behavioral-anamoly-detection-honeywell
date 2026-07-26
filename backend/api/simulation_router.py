from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas import AttackSimulationRequest
from backend.engine.attack_simulator import attack_simulator_instance
from backend.models import TelemetryLog, IncidentAlert
from backend.ml.profiler import profiler_instance
from backend.ml.anomaly_detector import anomaly_detector_instance
from backend.ml.attack_classifier import attack_classifier_instance
from backend.ml.explainability import xai_engine_instance

router = APIRouter(prefix="/simulate", tags=["Cyber Attack Simulator"])

@router.post("/attack")
def launch_cyber_attack_simulation(req: AttackSimulationRequest, db: Session = Depends(get_db)):
    """
    Simulates a targeted cyber attack scenario (one of 17 vectors) and injects it into the live stream and DB.
    """
    try:
        simulated_logs = attack_simulator_instance.simulate_attack_burst(
            attack_type=req.attack_type,
            target_entity_id=req.target_entity_id,
            intensity=req.intensity
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    alerts_created = []

    for log_data in simulated_logs:
        prof = profiler_instance.get_cold_start_prior(log_data["entity_type"], "Developer")
        comp_score, feat_dict, is_anomaly = anomaly_detector_instance.predict(log_data, prof)

        db_log = TelemetryLog(**log_data, risk_features=feat_dict)
        db.add(db_log)
        db.flush()

        attack_type, conf = attack_classifier_instance.classify(log_data, feat_dict)
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
        alerts_created.append(alert)

    db.commit()

    return {
        "status": "success",
        "attack_type": req.attack_type,
        "logs_injected": len(simulated_logs),
        "alerts_triggered": len(alerts_created),
        "target_entity": simulated_logs[0]["entity_id"],
        "max_risk_score": max(a.risk_score for a in alerts_created) if alerts_created else 0
    }
