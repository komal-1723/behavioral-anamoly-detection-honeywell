import React, { useState } from 'react';
import { Settings, Sliders, Shield, Users, Save, CheckCircle } from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const [percentile, setPercentile] = useState<number>(99.0);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-cyber-card/90 border border-cyber-border p-6 rounded-xl shadow-xl">
        <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyber-blue" />
          SYSTEM ADMINISTRATION & SOC THRESHOLD CONFIGURATION
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Configure alert budget percentiles, inference controls, and user role policies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Thresholds Card */}
        <div className="bg-cyber-card/90 border border-cyber-border p-5 rounded-xl space-y-5 shadow-lg">
          <h3 className="text-xs font-mono font-bold text-white uppercase border-b border-cyber-border pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyber-warning" />
            SOC Alert Budget & Threshold Sliders
          </h3>

          <div>
            <label className="text-xs text-slate-300 font-mono block mb-1">
              Top Alert Budget Quantile Threshold: <span className="text-cyber-crimson font-bold">Top {(100 - percentile).toFixed(1)}% of events</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-3 font-sans">
              Controls false positive rates by tuning the quantile cutoff for analyst alert budgets.
            </p>
            <input
              type="range"
              min="95.0"
              max="99.9"
              step="0.1"
              value={percentile}
              onChange={(e) => setPercentile(parseFloat(e.target.value))}
              className="w-full accent-cyber-crimson bg-slate-800"
            />
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Enforced Contamination Rate:</span>
              <span className="text-white">0.03 (3.0%)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>WebSocket Stream Heartbeat:</span>
              <span className="text-cyber-emerald">2.0s Interval</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-cyber-blue text-black font-mono font-bold text-xs rounded-lg hover:bg-cyan-300 transition flex items-center justify-center gap-2"
          >
            {saved ? <CheckCircle className="w-4 h-4 text-emerald-900" /> : <Save className="w-4 h-4" />}
            <span>{saved ? "SETTINGS SAVED!" : "SAVE CONFIGURATION"}</span>
          </button>
        </div>

        {/* User Roles & Permissions Card */}
        <div className="bg-cyber-card/90 border border-cyber-border p-5 rounded-xl space-y-4 shadow-lg">
          <h3 className="text-xs font-mono font-bold text-white uppercase border-b border-cyber-border pb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyber-purple" />
            Configured User Accounts & Roles
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-white">admin@cyber.sec</p>
                <p className="text-[10px] text-slate-400">SOC Lead Administrator</p>
              </div>
              <span className="px-2 py-1 bg-cyber-crimson/20 border border-cyber-crimson/40 text-cyber-crimson rounded text-[10px] font-bold">
                Admin
              </span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-white">analyst@cyber.sec</p>
                <p className="text-[10px] text-slate-400">Senior SOC Analyst</p>
              </div>
              <span className="px-2 py-1 bg-cyber-blue/20 border border-cyber-blue/40 text-cyber-blue rounded text-[10px] font-bold">
                SOC_Analyst
              </span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-white">auditor@cyber.sec</p>
                <p className="text-[10px] text-slate-400">Compliance Auditor</p>
              </div>
              <span className="px-2 py-1 bg-cyber-warning/20 border border-cyber-warning/40 text-cyber-warning rounded text-[10px] font-bold">
                Auditor
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
