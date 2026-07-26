import React, { useState } from 'react';
import { Database, Play, CheckCircle, Download, Layers } from 'lucide-react';
import { generateSyntheticTelemetry } from '../services/api';

export const TelemetryGeneratorView: React.FC = () => {
  const [count, setCount] = useState<number>(1000);
  const [anomalyRate, setAnomalyRate] = useState<number>(0.03);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await generateSyntheticTelemetry(count, anomalyRate);
      setResult(res);
    } catch (err: any) {
      console.error("Generation failed", err);
      alert("Failed to generate telemetry dataset: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-cyber-card/90 border border-cyber-border p-6 rounded-xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Database className="w-6 h-6 text-cyber-blue" />
            SYNTHETIC TELEMETRY & DATASET GENERATOR
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Generate enterprise cybersecurity datasets matching HirePro telemetry schemas (100 to 100,000 scale)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <div className="bg-cyber-card/90 border border-cyber-border p-5 rounded-xl space-y-5 shadow-lg">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase border-b border-cyber-border pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyber-purple" />
            Benchmark Scale & Config
          </h3>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-2">Record Batch Scale:</label>
            <div className="grid grid-cols-2 gap-2">
              {[100, 1000, 10000, 100000].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCount(num)}
                  className={`py-2 text-xs font-mono font-bold rounded-lg border transition ${
                    count === num 
                      ? 'bg-cyber-blue text-black border-cyber-blue shadow-md' 
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {num.toLocaleString()} Logs
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-2">
              Injected Attack Anomaly Ratio: <span className="text-cyber-blue font-bold">{(anomalyRate * 100).toFixed(1)}%</span>
            </label>
            <input
              type="range"
              min="0.01"
              max="0.10"
              step="0.005"
              value={anomalyRate}
              onChange={(e) => setAnomalyRate(parseFloat(e.target.value))}
              className="w-full accent-cyber-blue bg-slate-800"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyber-blue via-cyan-500 to-cyber-purple text-black font-mono font-bold text-xs rounded-xl shadow-lg hover:brightness-125 transition flex items-center justify-center gap-2"
          >
            {loading ? <Database className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{loading ? "GENERATING DATASET & TRAINING BASELINES..." : "GENERATE & PROCESS DATASET"}</span>
          </button>
        </div>

        {/* Status Output */}
        <div className="lg:col-span-2 bg-slate-950 border border-cyber-border p-5 rounded-xl space-y-4 font-mono shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-cyber-blue mb-4 uppercase border-b border-slate-800 pb-2">
              GENERATION STATUS & SUMMARY
            </h3>

            {result ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">TELEMETRY DATASET GENERATED</p>
                    <p className="text-xs text-slate-300 mt-1">{result.message}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-slate-500 text-[11px]">Total Logs Created</span>
                    <p className="text-xl font-bold text-white mt-1">{result.generated_count.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-slate-500 text-[11px]">Anomalies Flagged</span>
                    <p className="text-xl font-bold text-cyber-crimson mt-1">{result.anomalies_detected}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-600 text-xs">
                <Database className="w-10 h-10 mb-2 stroke-[1.5]" />
                Select dataset size (100 - 100,000) and click Generate.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-600 border-t border-slate-900 pt-3">
            * Generated schema includes: entity_id, entity_type, timestamp, source_ip, geo_location, device_fingerprint, session_duration, resource_accessed, auth_method, command_sequence, label.
          </div>
        </div>
      </div>
    </div>
  );
};
