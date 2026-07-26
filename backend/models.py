from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="SOC_Analyst") # Admin, SOC_Analyst, Auditor
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(String, index=True, nullable=False) # e.g. usr_102, dev_994
    entity_type = Column(String, index=True, nullable=False) # user, service_account, edge_device
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source_ip = Column(String, nullable=False)
    country = Column(String, nullable=False)
    city = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    department = Column(String, nullable=True)
    role = Column(String, nullable=True)
    device_id = Column(String, index=True, nullable=False)
    device_type = Column(String, nullable=False) # laptop, workstation, pos_terminal, iot_gateway
    device_fingerprint = Column(String, nullable=False)
    operating_system = Column(String, nullable=False)
    browser = Column(String, nullable=False)
    auth_method = Column(String, nullable=False) # password, token, certificate, biometric
    mfa_enabled = Column(Boolean, default=False)
    vpn_used = Column(Boolean, default=False)
    session_duration = Column(Float, nullable=False) # in seconds
    login_status = Column(String, nullable=False) # SUCCESS, FAILED
    resource_accessed = Column(String, nullable=False)
    application = Column(String, nullable=False)
    command_sequence = Column(Text, nullable=True) # JSON list or string
    network_protocol = Column(String, nullable=False) # HTTPS, SSH, RDP, TLS, MQTT
    risk_features = Column(JSON, nullable=True)
    label = Column(String, default="normal") # normal or attack_type
    
    # Relationship to incident alert if created
    alerts = relationship("IncidentAlert", back_populates="telemetry")

class EntityBaseline(Base):
    __tablename__ = "entity_baselines"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(String, unique=True, index=True, nullable=False)
    entity_type = Column(String, nullable=False)
    habitual_hours_json = Column(JSON, nullable=False) # distribution over 24 hrs
    top_ips_json = Column(JSON, nullable=False)
    top_locations_json = Column(JSON, nullable=False)
    typical_resources_json = Column(JSON, nullable=False)
    avg_session_duration = Column(Float, default=0.0)
    std_session_duration = Column(Float, default=0.0)
    known_devices_json = Column(JSON, nullable=False)
    total_events = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)

class IncidentAlert(Base):
    __tablename__ = "incident_alerts"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("telemetry_logs.id"), nullable=False)
    entity_id = Column(String, index=True, nullable=False)
    entity_type = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    anomaly_score = Column(Float, nullable=False) # 0.0 to 1.0
    attack_type = Column(String, nullable=False) # Credential Misuse, Impossible Travel, etc.
    confidence_score = Column(Float, nullable=False) # 0.0 to 1.0
    severity = Column(String, nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    risk_score = Column(Integer, nullable=False) # 0 to 100
    feature_contributions_json = Column(JSON, nullable=False) # {feature_name: weight}
    natural_language_explanation = Column(Text, nullable=False)
    analyst_recommendation = Column(Text, nullable=False)
    status = Column(String, default="Open") # Open, In Progress, Mitigated, False Positive
    assigned_to = Column(String, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    telemetry = relationship("TelemetryLog", back_populates="alerts")

class MLModelArtifact(Base):
    __tablename__ = "ml_model_artifacts"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    algorithm = Column(String, nullable=False)
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    parameters_json = Column(JSON, nullable=True)
    metrics_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ConceptDriftLog(Base):
    __tablename__ = "concept_drift_logs"

    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String, nullable=False)
    psi_score = Column(Float, nullable=False)
    ks_stat = Column(Float, nullable=False)
    p_value = Column(Float, nullable=False)
    drift_detected = Column(Boolean, default=False)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
