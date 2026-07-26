import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Shield, HardDrive, MapPin, Clock, Key } from 'lucide-react';
import { EntityProfile, TelemetryLog } from '../types';
import { getEntityProfile, getTelemetryLogs } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const EntityExplorerView: React.FC = () => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>('usr_001');
  const [profile, setProfile] = useState<EntityProfile | null>(null);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntityData = async (entityId: string) => {
    try {
      setLoading(true);
      const [profData, logsData] = await Promise.all([
        getEntityProfile(entityId),
        getTelemetryLogs(0, 20, entityId)
      ]);
      setProfile(profData);
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to fetch entity explorer data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntityData(selectedEntityId);
  }, [selectedEntityId]);

  const hoursData = Object.entries(profile?.habitual_hours_json || {}).map(([hour, prob]) => ({
    hour: `${hour.padStart(2, '0')}:00`,
    frequency: Math.round(prob * 100)
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Search Header */}
      <div className="bg-cyber-card/90 border border-cyber-border p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyber-blue" />
            ENTITY BEHAVIORAL PROFILE EXPLORER
          </h2>
          <p className="text-xs text-slate-400 font-mono">Deep-dive habitual baselines for Users & Edge Devices</p>
        </div>

        {/* Entity Selector Bar */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Entity ID e.g. usr_001..."
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full bg-slate-900 border border-cyber-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:border-cyber-blue outline-none font-mono"
            />
          </div>
          <button
            onClick={() => fetchEntityData(selectedEntityId)}
            className="px-4 py-1.5 bg-cyber-blue text-black font-mono font-bold text-xs rounded-lg hover:bg-cyan-300 transition"
          >
            Fetch Baseline
          </button>
        </div>
      </div>

      {/* Entity Profile Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Habitual Hours Chart */}
        <div className="md:col-span-2 bg-cyber-card/90 border border-cyber-border p-5 rounded-xl shadow-lg">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyber-blue" />
            Habitual Business Hours Distribution (% Probability)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursData}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="frequency" fill="#00f0ff" radius={[4, 4, 0, 0]} name="Access Probability %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Behavioral Metrics Summary */}
        <div className="bg-cyber-card/90 border border-cyber-border p-5 rounded-xl space-y-4 shadow-lg">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-cyber-purple" />
            Entity Profile Metadata
          </h3>
          <div className="space-y-3 text-xs font-mono text-slate-300 divide-y divide-slate-800">
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Entity ID:</span>
              <span className="font-bold text-white">{profile?.entity_id || selectedEntityId}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Total Recorded Events:</span>
              <span className="text-cyber-blue font-bold">{profile?.total_events || 0}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Avg Session Duration:</span>
              <span className="text-slate-200">{profile ? Math.round(profile.avg_session_duration / 60) : 0} mins</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Known Devices Count:</span>
              <span className="text-cyber-emerald font-bold">{profile?.known_devices_json.length || 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Session Log History Table */}
      <div className="bg-cyber-card/90 border border-cyber-border rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-cyber-border">
          <h3 className="text-xs font-mono font-bold text-white uppercase">
            Recent Telemetry Session Logs ({logs.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-cyber-border uppercase text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Source IP</th>
                <th className="p-3">Location</th>
                <th className="p-3">Device ID</th>
                <th className="p-3">Resource Requested</th>
                <th className="p-3">Login Status</th>
                <th className="p-3">Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold">{log.source_ip}</td>
                  <td className="p-3 text-slate-300">{log.city}, {log.country}</td>
                  <td className="p-3 text-slate-400">{log.device_id}</td>
                  <td className="p-3 text-cyber-blue truncate max-w-xs">{log.resource_accessed}</td>
                  <td className="p-3">
                    <span className={log.login_status === 'SUCCESS' ? 'text-cyber-emerald font-bold' : 'text-cyber-crimson font-bold'}>
                      {log.login_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.label === 'normal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-crimson/10 text-cyber-crimson border border-cyber-crimson/30'
                    }`}>
                      {log.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
