import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Radio, 
  ArrowUpRight, 
  UserX,
  Flame
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ExecutiveMetrics, IncidentAlert } from '../types';
import { getDashboardMetrics } from '../services/api';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';

interface DashboardViewProps {
  onSelectAlert: (alert: IncidentAlert) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectAlert }) => {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    window.addEventListener("AEGIS_STATUS_UPDATED", loadData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("AEGIS_STATUS_UPDATED", loadData);
    };
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-cyber-blue animate-pulse">
        <Activity className="w-6 h-6 mr-2 animate-spin" />
        LOADING EXECUTIVE THREAT METRICS...
      </div>
    );
  }

  const COLORS = ['#ff0055', '#ffb703', '#00f0ff', '#7000ff', '#00f5a0', '#ec4899'];

  const pieData = Object.entries(metrics?.attack_type_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Top Metric Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Access Logs"
          value={metrics?.total_events.toLocaleString() || '0'}
          subtitle="Processed in near real-time"
          icon={Activity}
          color="blue"
          trend="+12.4%"
        />
        <StatCard
          title="Active Incident Alerts"
          value={metrics?.active_threats.toString() || '0'}
          subtitle="Require SOC Investigation"
          icon={AlertTriangle}
          color="crimson"
          trend="+4 active"
        />
        <StatCard
          title="Average Threat Risk"
          value={`${metrics?.avg_risk_score || 0}/100`}
          subtitle="Enterprise Posture Score"
          icon={Flame}
          color="warning"
        />
        <StatCard
          title="Critical Severity"
          value={metrics?.critical_alerts_count.toString() || '0'}
          subtitle="Active unresolved threats"
          icon={ShieldAlert}
          color="purple"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Anomaly Velocity Area Chart */}
        <div className="lg:col-span-2 bg-cyber-card/90 border border-cyber-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-blue" />
                24-HOUR ANOMALY VELOCITY TREND
              </h3>
              <p className="text-xs text-slate-400 font-mono">Volume of access events vs flagged anomalies</p>
            </div>
            <span className="px-2.5 py-1 bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue text-[10px] font-mono rounded-lg">
              LOG STREAM ACTIVE
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.hourly_event_trend || []}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAnom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff0055" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff0055" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#00f0ff" fillOpacity={1} fill="url(#colorTotal)" name="Total Logs" />
                <Area type="monotone" dataKey="anomalies" stroke="#ff0055" fillOpacity={1} fill="url(#colorAnom)" name="Flagged Anomalies" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Taxonomy Distribution Donut Chart */}
        <div className="bg-cyber-card/90 border border-cyber-border rounded-xl p-5 shadow-lg">
          <div className="mb-4">
            <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyber-crimson" />
              ATTACK TAXONOMY BREAKDOWN
            </h3>
            <p className="text-xs text-slate-400 font-mono">Distribution across 17 threat vectors</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Key Legend */}
          <div className="mt-2 space-y-1 max-h-24 overflow-y-auto pr-1">
            {pieData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-slate-300 truncate w-36">{item.name}</span>
                </div>
                <span className="text-slate-400 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ranked Threat Queue & Top Targeted Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranked Threat Incident Queue */}
        <div className="lg:col-span-2 bg-cyber-card/90 border border-cyber-border rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-cyber-warning" />
                RANKED INCIDENT ALERT QUEUE
              </h3>
              <p className="text-xs text-slate-400 font-mono">Prioritized by explainable risk score</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{metrics?.recent_alerts.length || 0} Alerts Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-cyber-border uppercase text-[10px]">
                <tr>
                  <th className="p-3">Risk</th>
                  <th className="p-3">Entity ID</th>
                  <th className="p-3">Attack Category</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {metrics?.recent_alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-cyber-crimson">
                      {alert.risk_score}/100
                    </td>
                    <td className="p-3 font-semibold text-white">
                      {alert.entity_id}
                    </td>
                    <td className="p-3 text-slate-200">
                      {alert.attack_type}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        alert.severity === 'CRITICAL' ? 'bg-cyber-crimson/20 border-cyber-crimson text-cyber-crimson' :
                        alert.severity === 'HIGH' ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
                        'bg-cyber-warning/20 border-cyber-warning text-cyber-warning'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-cyber-blue font-semibold">{alert.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectAlert(alert)}
                        className="px-2.5 py-1 bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/20 rounded transition text-[11px]"
                      >
                        Inspect XAI
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Targeted Entities Sidebar */}
        <div className="bg-cyber-card/90 border border-cyber-border rounded-xl p-5 shadow-lg">
          <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2 mb-3">
            <UserX className="w-4 h-4 text-cyber-purple" />
            TOP TARGETED ENTITIES
          </h3>
          <p className="text-xs text-slate-400 font-mono mb-4">Entities with repeated threat anomalies</p>

          <div className="space-y-3">
            {metrics?.top_targeted_entities.map((entity, idx) => (
              <div key={entity.entity_id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white font-mono">{entity.entity_id}</p>
                  <p className="text-[10px] text-slate-400">{entity.alert_count} Security Alerts Flagged</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyber-crimson block">
                    Max {entity.max_risk}/100
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Risk Level</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
