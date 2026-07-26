import React from 'react';
import { X, ShieldAlert, CheckCircle, Clock, AlertTriangle, Cpu, Terminal, ArrowRight, UserCheck } from 'lucide-react';
import { IncidentAlert } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface AlertDetailDrawerProps {
  alert: IncidentAlert | null;
  onClose: () => void;
  onUpdateStatus: (alertId: number, status: string, notes?: string) => void;
}

export const AlertDetailDrawer: React.FC<AlertDetailDrawerProps> = ({ alert, onClose, onUpdateStatus }) => {
  if (!alert) return null;

  const contributionsData = Object.entries(alert.feature_contributions_json || {}).map(([key, value]) => ({
    feature: key.replace('_score', '').replace('_', ' '),
    weight: value
  }));

  const severityColors = {
    CRITICAL: 'bg-cyber-crimson/20 border-cyber-crimson text-cyber-crimson',
    HIGH: 'bg-orange-500/20 border-orange-500 text-orange-400',
    MEDIUM: 'bg-cyber-warning/20 border-cyber-warning text-cyber-warning',
    LOW: 'bg-blue-500/20 border-blue-500 text-blue-400',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-cyber-card border-l border-cyber-border h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-6 border-b border-cyber-border flex items-center justify-between sticky top-0 bg-cyber-card/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyber-crimson/10 border border-cyber-crimson/40 text-cyber-crimson rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${severityColors[alert.severity]}`}>
                {alert.severity} SEVERITY
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{alert.attack_type}</h3>
              <p className="text-xs text-slate-400 font-mono">Alert ID: #{alert.id} | Entity: {alert.entity_id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Risk Score & Confidence Dials */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center">
              <span className="text-xs text-slate-400 font-mono uppercase">Risk Score</span>
              <div className="text-3xl font-extrabold text-cyber-crimson font-mono mt-1">
                {alert.risk_score}<span className="text-sm text-slate-500 font-normal">/100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyber-warning to-cyber-crimson h-full rounded-full"
                  style={{ width: `${alert.risk_score}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center">
              <span className="text-xs text-slate-400 font-mono uppercase">XAI Confidence</span>
              <div className="text-3xl font-extrabold text-cyber-blue font-mono mt-1">
                {(alert.confidence_score * 100).toFixed(0)}<span className="text-sm text-slate-500 font-normal">%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">Ensemble Model Agreement</p>
            </div>
          </div>

          {/* Explainable AI Natural Language Narrative */}
          <div className="bg-slate-900/60 border border-cyber-blue/30 rounded-xl p-4 relative">
            <div className="flex items-center gap-2 text-xs font-mono text-cyber-blue font-semibold mb-2">
              <Cpu className="w-4 h-4" />
              <span>EXPLAINABLE AI DIAGNOSTIC NARRATIVE</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              "{alert.natural_language_explanation}"
            </p>
          </div>

          {/* Feature Attribution Breakdown Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase mb-3">
              Feature Attribution Breakdown (%)
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contributionsData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={10} width={90} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} 
                  />
                  <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                    {contributionsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00f0ff' : '#7000ff'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Actionable Analyst Recommendations */}
          <div className="bg-slate-900/80 border border-cyber-warning/30 rounded-xl p-4">
            <h4 className="text-xs font-mono font-semibold text-cyber-warning uppercase mb-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" />
              <span>RECOMMENDED MITIGATION ACTIONS</span>
            </h4>
            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
              {alert.analyst_recommendation}
            </p>
          </div>

          {/* Telemetry Snapshot Details */}
          {alert.telemetry && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono">
              <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase mb-2">Raw Telemetry Attributes</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div>Source IP: <span className="text-slate-200">{alert.telemetry.source_ip}</span></div>
                <div>Location: <span className="text-slate-200">{alert.telemetry.city}, {alert.telemetry.country}</span></div>
                <div>Device ID: <span className="text-slate-200">{alert.telemetry.device_id}</span></div>
                <div>Resource: <span className="text-slate-200 truncate block">{alert.telemetry.resource_accessed}</span></div>
                <div>Auth Method: <span className="text-slate-200">{alert.telemetry.auth_method}</span></div>
                <div>MFA Status: <span className={alert.telemetry.mfa_enabled ? "text-cyber-emerald" : "text-cyber-crimson"}>{alert.telemetry.mfa_enabled ? "ENABLED" : "DISABLED"}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Triage Footer Controls */}
        <div className="p-6 border-t border-cyber-border bg-cyber-card/95 flex items-center justify-between sticky bottom-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Current Status:</span>
            <span className="text-xs font-bold text-cyber-blue font-mono uppercase bg-cyber-blue/10 px-2 py-1 rounded border border-cyber-blue/30">
              {alert.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateStatus(alert.id, 'Mitigated', 'Mitigated by SOC analyst')}
              className="px-3 py-1.5 bg-cyber-emerald/20 border border-cyber-emerald/40 hover:bg-cyber-emerald/30 text-cyber-emerald rounded-lg text-xs font-mono font-medium transition flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mitigate</span>
            </button>
            <button
              onClick={() => onUpdateStatus(alert.id, 'False Positive', 'Flagged as false positive')}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-medium transition"
            >
              <span>False Positive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
