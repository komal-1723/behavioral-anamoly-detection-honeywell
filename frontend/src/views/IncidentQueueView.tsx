import React, { useEffect, useState } from 'react';
import { IncidentAlert } from '../types';
import { getIncidentQueue, updateIncidentStatus } from '../services/api';
import { AlertTriangle, Filter, Search, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface IncidentQueueViewProps {
  onSelectAlert: (alert: IncidentAlert) => void;
}

export const IncidentQueueView: React.FC<IncidentQueueViewProps> = ({ onSelectAlert }) => {
  const [alerts, setAlerts] = useState<IncidentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await getIncidentQueue(statusFilter || undefined, severityFilter || undefined);
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load incident queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [statusFilter, severityFilter]);

  const filteredAlerts = alerts.filter(a => 
    a.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.attack_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-cyber-card/90 border border-cyber-border p-4 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-cyber-warning" />
            SOC ANALYST INCIDENT QUEUE
          </h2>
          <p className="text-xs text-slate-400 font-mono">Ranked by Explainable Risk Score & Anomaly Confidence</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Entity / Attack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-cyber-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:border-cyber-blue outline-none"
            />
          </div>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-cyber-border rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-cyber-blue outline-none"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-cyber-border rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-cyber-blue outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Mitigated">Mitigated</option>
            <option value="False Positive">False Positive</option>
          </select>
        </div>
      </div>

      {/* Incident Queue Table */}
      <div className="bg-cyber-card/90 border border-cyber-border rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-cyber-border uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Alert ID</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Entity ID</th>
                <th className="p-4">Attack Vector</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">XAI Confidence</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/50 transition duration-150">
                  <td className="p-4 font-bold text-slate-400">#{alert.id}</td>
                  <td className="p-4 text-slate-400">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-4 font-bold text-white">{alert.entity_id}</td>
                  <td className="p-4 font-semibold text-slate-200">{alert.attack_type}</td>
                  <td className="p-4 font-extrabold text-cyber-crimson">{alert.risk_score}/100</td>
                  <td className="p-4 text-cyber-blue">{(alert.confidence_score * 100).toFixed(0)}%</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      alert.severity === 'CRITICAL' ? 'bg-cyber-crimson/20 border-cyber-crimson text-cyber-crimson' :
                      alert.severity === 'HIGH' ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
                      'bg-cyber-warning/20 border-cyber-warning text-cyber-warning'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue rounded text-[10px] font-bold">
                      {alert.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onSelectAlert(alert)}
                      className="px-3 py-1.5 bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 border border-cyber-blue/40 text-cyber-blue hover:text-white hover:border-cyber-blue rounded-lg transition font-mono font-semibold"
                    >
                      XAI Drawer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAlerts.length === 0 && !loading && (
            <div className="text-center p-12 text-slate-500 font-mono text-xs">
              No incident alerts found matching current filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
