import React from 'react';
import { FileText, Download, FileSpreadsheet, Code, ShieldCheck } from 'lucide-react';

export const ReportsView: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-cyber-card/90 border border-cyber-border p-6 rounded-xl shadow-xl">
        <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
          <FileText className="w-6 h-6 text-cyber-blue" />
          SECURITY COMPLIANCE & EXECUTIVE REPORT EXPORTER
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Export audit-ready security reports, incident datasets, and explainability JSON artifacts
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF Executive Summary */}
        <div className="bg-cyber-card/90 border border-cyber-border p-6 rounded-xl space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="p-3 bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue rounded-xl w-fit mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono">Executive Summary PDF</h3>
            <p className="text-xs text-slate-400 mt-2 font-sans">
              Comprehensive CISO executive report containing threat posture summary, top targeted entities, attack taxonomy breakdown, and known ML model limitations.
            </p>
          </div>
          <a
            href="/api/v1/reports/export/pdf"
            download
            className="w-full py-2.5 bg-cyber-blue text-black font-mono font-bold text-xs rounded-lg hover:bg-cyan-300 transition flex items-center justify-center gap-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD PDF REPORT</span>
          </a>
        </div>

        {/* CSV Incident Queue Audit */}
        <div className="bg-cyber-card/90 border border-cyber-border p-6 rounded-xl space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="p-3 bg-cyber-emerald/10 border border-cyber-emerald/30 text-cyber-emerald rounded-xl w-fit mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono">SOC Incident Queue CSV</h3>
            <p className="text-xs text-slate-400 mt-2 font-sans">
              Raw tabular export of all flagged incident alerts, risk scores, confidence levels, analyst triage status, and timestamps.
            </p>
          </div>
          <a
            href="/api/v1/reports/export/csv"
            download
            className="w-full py-2.5 bg-cyber-emerald text-black font-mono font-bold text-xs rounded-lg hover:bg-emerald-300 transition flex items-center justify-center gap-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV DATASET</span>
          </a>
        </div>

        {/* JSON XAI Telemetry Stream */}
        <div className="bg-cyber-card/90 border border-cyber-border p-6 rounded-xl space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="p-3 bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple rounded-xl w-fit mb-3">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono">Structured XAI JSON Feed</h3>
            <p className="text-xs text-slate-400 mt-2 font-sans">
              Machine-readable JSON schema export containing feature attributions, natural language narratives, and recommended SOC mitigation steps.
            </p>
          </div>
          <a
            href="/api/v1/reports/export/json"
            download
            className="w-full py-2.5 bg-cyber-purple text-white font-mono font-bold text-xs rounded-lg hover:bg-purple-600 transition flex items-center justify-center gap-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT JSON ARTIFACT</span>
          </a>
        </div>
      </div>
    </div>
  );
};
