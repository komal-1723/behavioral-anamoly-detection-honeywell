import React, { useState } from 'react';
import { Zap, ShieldAlert, Play, CheckCircle2, AlertOctagon, Terminal } from 'lucide-react';
import { triggerAttackSimulation } from '../services/api';

const ATTACK_VECTORS = [
  "Credential Misuse",
  "Brute Force",
  "Impossible Travel",
  "Password Spraying",
  "Device Spoofing",
  "Insider Threat",
  "Privilege Escalation",
  "Session Hijacking",
  "Abnormal Data Download",
  "Lateral Movement",
  "Impossible Login Time",
  "Rare Country Login",
  "TOR Exit Node Access",
  "VPN Abuse",
  "Concurrent Sessions",
  "Suspicious API Usage",
  "Multiple Failed Logins"
];

export const AttackSimulatorView: React.FC = () => {
  const [selectedAttack, setSelectedAttack] = useState<string>('Impossible Travel');
  const [targetEntity, setTargetEntity] = useState<string>('usr_001');
  const [intensity, setIntensity] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleLaunch = async () => {
    try {
      setLoading(true);
      const res = await triggerAttackSimulation(selectedAttack, targetEntity || undefined, intensity);
      setSimulationResult(res);
    } catch (err: any) {
      console.error("Simulation failed", err);
      alert("Failed to execute simulation: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyber-card via-slate-900 to-cyber-card border border-cyber-border p-6 rounded-xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyber-warning animate-bounce" />
            CYBER ATTACK VECTOR SIMULATION CONTROL CENTER
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Inject realistic intrusion scenarios to test UEBA machine learning models in real-time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Card */}
        <div className="bg-cyber-card/90 border border-cyber-border p-5 rounded-xl space-y-5 shadow-lg">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2 border-b border-cyber-border pb-3">
            <ShieldAlert className="w-4 h-4 text-cyber-crimson" />
            Simulation Parameters
          </h3>

          {/* Attack Vector Selector */}
          <div>
            <label className="text-xs text-slate-400 font-mono block mb-2">Select Attack Taxonomy Vector:</label>
            <select
              value={selectedAttack}
              onChange={(e) => setSelectedAttack(e.target.value)}
              className="w-full bg-slate-900 border border-cyber-border rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-cyber-blue outline-none"
            >
              {ATTACK_VECTORS.map((atk) => (
                <option key={atk} value={atk}>{atk}</option>
              ))}
            </select>
          </div>

          {/* Target Entity ID */}
          <div>
            <label className="text-xs text-slate-400 font-mono block mb-2">Target Entity ID (Optional):</label>
            <input
              type="text"
              placeholder="e.g. usr_001 or dev_012"
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
              className="w-full bg-slate-900 border border-cyber-border rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-cyber-blue outline-none"
            />
          </div>

          {/* Burst Intensity */}
          <div>
            <label className="text-xs text-slate-400 font-mono block mb-2">
              Malicious Event Burst Intensity: <span className="text-cyber-blue font-bold">{intensity} logs</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full accent-cyber-blue bg-slate-800"
            />
          </div>

          <button
            onClick={handleLaunch}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyber-crimson via-red-600 to-cyber-purple text-white font-mono font-bold text-xs rounded-xl shadow-lg hover:brightness-125 transition flex items-center justify-center gap-2"
          >
            {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{loading ? "INJECTING ATTACK VECTOR..." : "LAUNCH CYBER ATTACK SIMULATION"}</span>
          </button>
        </div>

        {/* Console / Output Inspector */}
        <div className="lg:col-span-2 bg-slate-950 border border-cyber-border p-5 rounded-xl space-y-4 font-mono shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-bold text-cyber-blue flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                SIMULATION EXECUTION CONSOLE
              </span>
              <span className="text-[10px] text-slate-500">LIVE FEED</span>
            </div>

            {simulationResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">ATTACK VECTOR INJECTED SUCCESSFULLY</p>
                    <p className="text-[11px] text-slate-300">
                      Injected {simulationResult.logs_injected} malicious telemetry frames targeting entity <span className="font-mono text-white font-bold">{simulationResult.target_entity}</span>.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2 text-slate-300">
                  <p><span className="text-slate-500">Attack Category:</span> <span className="text-cyber-warning font-bold">{simulationResult.attack_type}</span></p>
                  <p><span className="text-slate-500">Alerts Triggered:</span> <span className="text-cyber-crimson font-bold">{simulationResult.alerts_triggered} Alerts</span></p>
                  <p><span className="text-slate-500">Max Risk Score Computed:</span> <span className="text-cyber-crimson font-bold">{simulationResult.max_risk_score}/100</span></p>
                  <p><span className="text-slate-500">Status:</span> <span className="text-cyber-emerald">Processed by UEBA Inference Engine</span></p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-600 text-xs">
                <AlertOctagon className="w-10 h-10 mb-2 stroke-[1.5]" />
                Ready to launch simulation. Select an attack vector and click Launch.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-600 border-t border-slate-900 pt-3">
            * All simulated events are instantly routed to the WebSocket stream and Incident Queue.
          </div>
        </div>
      </div>
    </div>
  );
};
