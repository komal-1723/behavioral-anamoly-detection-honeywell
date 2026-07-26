export interface TelemetryLog {
  id: number;
  entity_id: str;
  entity_type: string;
  timestamp: string;
  source_ip: string;
  country: string;
  city: string;
  latitude?: number;
  longitude?: number;
  department: string;
  role: string;
  device_id: string;
  device_type: string;
  device_fingerprint: string;
  operating_system: string;
  browser: string;
  auth_method: string;
  mfa_enabled: boolean;
  vpn_used: boolean;
  session_duration: number;
  login_status: string;
  resource_accessed: string;
  application: string;
  command_sequence?: string;
  network_protocol: string;
  risk_features?: Record<string, number>;
  label: string;
}

export type str = string;

export interface IncidentAlert {
  id: number;
  log_id: number;
  entity_id: string;
  entity_type: string;
  timestamp: string;
  anomaly_score: number;
  attack_type: string;
  confidence_score: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  feature_contributions_json: Record<string, number>;
  natural_language_explanation: string;
  analyst_recommendation: string;
  status: 'Open' | 'Investigating' | 'Mitigated' | 'False Positive';
  assigned_to?: string;
  resolution_notes?: string;
  created_at: string;
  telemetry?: TelemetryLog;
}

export interface EntityProfile {
  id: number;
  entity_id: string;
  entity_type: string;
  habitual_hours_json: Record<string, number>;
  top_ips_json: Record<string, number>;
  top_locations_json: Record<string, number>;
  typical_resources_json: Record<string, number>;
  avg_session_duration: number;
  std_session_duration: number;
  known_devices_json: string[];
  total_events: number;
  last_updated: string;
}

export interface ExecutiveMetrics {
  total_events: number;
  total_anomalies: number;
  active_threats: number;
  avg_risk_score: number;
  critical_alerts_count: number;
  high_alerts_count: number;
  medium_alerts_count: number;
  low_alerts_count: number;
  top_targeted_entities: Array<{ entity_id: string; alert_count: number; max_risk: number }>;
  attack_type_distribution: Record<string, number>;
  recent_alerts: IncidentAlert[];
  hourly_event_trend: Array<{ hour: string; total: number; anomalies: number }>;
}

export interface MLModelMetrics {
  model_name: string;
  version: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  is_active: boolean;
  parameters_json: Record<string, any>;
  metrics_json: Record<string, any>;
  created_at?: string;
}

export interface ConceptDriftData {
  psi_score: number;
  ks_stat: number;
  p_value: number;
  drift_detected: boolean;
  recommendation: string;
}
