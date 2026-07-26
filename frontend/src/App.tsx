import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AlertDetailDrawer } from './components/AlertDetailDrawer';
import { DashboardView } from './views/DashboardView';
import { IncidentQueueView } from './views/IncidentQueueView';
import { EntityExplorerView } from './views/EntityExplorerView';
import { AttackSimulatorView } from './views/AttackSimulatorView';
import { TelemetryGeneratorView } from './views/TelemetryGeneratorView';
import { MLStudioView } from './views/MLStudioView';
import { ReportsView } from './views/ReportsView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { IncidentAlert } from './types';
import { updateIncidentStatus } from './services/api';
import { ShieldAlert, X } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedAlert, setSelectedAlert] = useState<IncidentAlert | null>(null);
  const [userRole] = useState<string>('Admin');
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  // Connect to WebSocket stream for live alerts
  useEffect(() => {
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const wsUrl = isProduction 
      ? 'wss://behavioral-anamoly-detection-honeywell.onrender.com/api/v1/stream/ws'
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/api/v1/stream/ws`;
    
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("[WS] Live telemetry stream connected successfully to", wsUrl);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'TELEMETRY_EVENT' && data.analysis.is_anomaly && data.analysis.alert) {
            setToast({
              title: `NEW ${data.analysis.alert.severity} ALERT: ${data.analysis.alert.attack_type}`,
              message: `Entity ${data.log.entity_id} flagged with risk score ${data.analysis.alert.risk_score}/100.`
            });
          }
        } catch (err) {
          console.error("WebSocket message parse error", err);
        }
      };

      socket.onerror = (err) => {
        console.warn("WebSocket stream error, fallback mode active", err);
      };
    } catch (err) {
      console.warn("WebSocket connection unavailable", err);
    }

    return () => {
      if (socket) socket.close();
    };
  }, []);

  const handleUpdateStatus = async (alertId: number, status: string, notes?: string) => {
    try {
      const updated = await updateIncidentStatus(alertId, status, 'SOC Analyst', notes);
      setSelectedAlert(updated);
      setToast({
        title: "INCIDENT STATUS UPDATED",
        message: `Alert #${alertId} status changed to ${status}.`
      });

      // Dispatch global refresh event so Dashboard metrics update immediately
      window.dispatchEvent(new CustomEvent("AEGIS_STATUS_UPDATED"));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="flex h-screen bg-cyber-dark text-slate-100 overflow-hidden font-sans select-none">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          title={
            activeTab === 'dashboard' ? 'Executive SOC Threat Dashboard' :
            activeTab === 'queue' ? 'SOC Analyst Incident Queue' :
            activeTab === 'explorer' ? 'Entity Behavior Explorer' :
            activeTab === 'simulator' ? 'Cyber Attack Simulator' :
            activeTab === 'generator' ? 'Synthetic Data Engine' :
            activeTab === 'ml_studio' ? 'ML & XAI Diagnostics Studio' :
            activeTab === 'reports' ? 'Security Compliance & Reports' : 'System Administration'
          }
          subtitle="Real-Time Behavior Analytics & Threat Intelligence"
        />

        <main className="flex-1">
          {activeTab === 'dashboard' && <DashboardView onSelectAlert={setSelectedAlert} />}
          {activeTab === 'queue' && <IncidentQueueView onSelectAlert={setSelectedAlert} />}
          {activeTab === 'explorer' && <EntityExplorerView />}
          {activeTab === 'simulator' && <AttackSimulatorView />}
          {activeTab === 'generator' && <TelemetryGeneratorView />}
          {activeTab === 'ml_studio' && <MLStudioView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <AdminSettingsView />}
        </main>
      </div>

      {/* Deep-Dive Explainable AI Drawer */}
      <AlertDetailDrawer 
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Real-time Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyber-card border border-cyber-crimson p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="p-2 bg-cyber-crimson/20 text-cyber-crimson rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-mono">{toast.title}</h4>
            <p className="text-xs text-slate-300 font-sans">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="p-1 text-slate-400 hover:text-white rounded ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
