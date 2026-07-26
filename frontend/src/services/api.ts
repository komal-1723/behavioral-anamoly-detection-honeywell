import axios from 'axios';
import { 
  ExecutiveMetrics, 
  IncidentAlert, 
  TelemetryLog, 
  EntityProfile, 
  MLModelMetrics, 
  ConceptDriftData 
} from '../types';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardMetrics = async (): Promise<ExecutiveMetrics> => {
  const res = await api.get('/dashboard/metrics');
  return res.data;
};

export const getIncidentQueue = async (
  status?: string, 
  severity?: string, 
  attackType?: string
): Promise<IncidentAlert[]> => {
  const res = await api.get('/incidents/queue', {
    params: { status, severity, attack_type: attackType }
  });
  return res.data;
};

export const updateIncidentStatus = async (
  id: number, 
  status: string, 
  assignedTo?: string, 
  notes?: string
): Promise<IncidentAlert> => {
  const res = await api.patch(`/incidents/${id}`, {
    status,
    assigned_to: assignedTo,
    resolution_notes: notes
  });
  return res.data;
};

export const generateSyntheticTelemetry = async (
  count: number = 1000, 
  anomalyRate: float = 0.03
) => {
  const res = await api.post('/telemetry/generate', {
    count,
    anomaly_rate: anomalyRate
  });
  return res.data;
};

export const getTelemetryLogs = async (
  skip: number = 0, 
  limit: number = 50, 
  entityId?: string
): Promise<TelemetryLog[]> => {
  const res = await api.get('/telemetry/logs', {
    params: { skip, limit, entity_id: entityId }
  });
  return res.data;
};

export const getEntityProfile = async (entityId: string): Promise<EntityProfile> => {
  const res = await api.get(`/telemetry/entity/${entityId}/profile`);
  return res.data;
};

export const triggerAttackSimulation = async (
  attackType: string, 
  targetEntityId?: string, 
  intensity: number = 5
) => {
  const res = await api.post('/simulate/attack', {
    attack_type: attackType,
    target_entity_id: targetEntityId,
    intensity
  });
  return res.data;
};

export const getMLModelStatus = async (): Promise<MLModelMetrics[]> => {
  const res = await api.get('/ml/status');
  return res.data;
};

export const triggerModelRetraining = async (algorithm: string = 'Ensemble') => {
  const res = await api.post('/ml/train', { algorithm, contamination: 0.03 });
  return res.data;
};

export const getConceptDriftStatus = async (): Promise<ConceptDriftData> => {
  const res = await api.get('/ml/concept-drift');
  return res.data;
};

type float = number;

export default api;
