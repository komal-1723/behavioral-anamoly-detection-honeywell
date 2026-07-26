from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str
    user_name: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "SOC_Analyst"

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Telemetry Schemas ---
class TelemetryCreate(BaseModel):
    entity_id: str
    entity_type: str
    timestamp: Optional[datetime] = None
    source_ip: str
    country: str
    city: str
    latitude: Optional[float] = 0.0
    longitude: Optional[float] = 0.0
    department: Optional[str] = "Engineering"
    role: Optional[str] = "Analyst"
    device_id: str
    device_type: str
    device_fingerprint: str
    operating_system: str
    browser: str
    auth_method: str
    mfa_enabled: bool = False
    vpn_used: bool = False
    session_duration: float
    login_status: str
    resource_accessed: str
    application: str
    command_sequence: Optional[str] = None
    network_protocol: str
    label: Optional[str] = "normal"

class TelemetryOut(TelemetryCreate):
    id: int
    timestamp: datetime
    risk_features: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- Synthetic Data Generation Request ---
class DataGenerationRequest(BaseModel):
    count: int = Field(default=1000, description="Number of synthetic records to generate (100, 1000, 10000, 100000)")
    anomaly_rate: float = Field(default=0.03, description="Ratio of anomalous records (0.01 to 0.05)")
    attack_types: Optional[List[str]] = None

# --- Incident Alert Schemas ---
class IncidentAlertUpdate(BaseModel):
    status: str
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None

class IncidentAlertOut(BaseModel):
    id: int
    log_id: int
    entity_id: str
    entity_type: str
    timestamp: datetime
    anomaly_score: float
    attack_type: str
    confidence_score: float
    severity: str
    risk_score: int
    feature_contributions_json: Dict[str, float]
    natural_language_explanation: str
    analyst_recommendation: str
    status: str
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    telemetry: Optional[TelemetryOut] = None

    class Config:
        from_attributes = True

# --- Entity Profile Schema ---
class EntityBaselineOut(BaseModel):
    id: int
    entity_id: str
    entity_type: str
    habitual_hours_json: Dict[str, float]
    top_ips_json: Dict[str, int]
    top_locations_json: Dict[str, int]
    typical_resources_json: Dict[str, int]
    avg_session_duration: float
    std_session_duration: float
    known_devices_json: List[str]
    total_events: int
    last_updated: datetime

    class Config:
        from_attributes = True

# --- Cyber Attack Simulation Request ---
class AttackSimulationRequest(BaseModel):
    attack_type: str = Field(..., description="One of 17 attack types e.g., 'Impossible Travel', 'Brute Force'")
    target_entity_id: Optional[str] = None
    intensity: int = Field(default=5, description="Number of sequential malicious logs to generate")

# --- ML Diagnostics Schemas ---
class ModelTrainRequest(BaseModel):
    algorithm: str = Field(default="Ensemble", description="IsolationForest, LOF, OneClassSVM, ZScore, Ensemble")
    contamination: float = Field(default=0.03, description="Contamination factor for anomaly models")

class ModelMetricsOut(BaseModel):
    model_name: str
    version: str
    algorithm: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    is_active: bool
    parameters_json: Dict[str, Any]
    metrics_json: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Executive Dashboard Analytics ---
class ExecutiveDashboardMetrics(BaseModel):
    total_events: int
    total_anomalies: int
    active_threats: int
    avg_risk_score: float
    critical_alerts_count: int
    high_alerts_count: int
    medium_alerts_count: int
    low_alerts_count: int
    top_targeted_entities: List[Dict[str, Any]]
    attack_type_distribution: Dict[str, int]
    recent_alerts: List[IncidentAlertOut]
    hourly_event_trend: List[Dict[str, Any]]

# --- Settings Schema ---
class SettingUpdate(BaseModel):
    key: str
    value: str
