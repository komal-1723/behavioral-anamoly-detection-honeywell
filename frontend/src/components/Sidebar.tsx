import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  AlertTriangle, 
  UserCheck, 
  Zap, 
  Database, 
  Cpu, 
  FileText, 
  Settings, 
  Radio
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'SOC Executive Overview', icon: LayoutDashboard },
    { id: 'queue', label: 'Incident Alert Queue', icon: AlertTriangle },
    { id: 'explorer', label: 'Entity Behavior Explorer', icon: UserCheck },
    { id: 'simulator', label: 'Cyber Attack Simulator', icon: Zap },
    { id: 'generator', label: 'Synthetic Data Engine', icon: Database },
    { id: 'ml_studio', label: 'ML & XAI Diagnostics', icon: Cpu },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'settings', label: 'Admin Settings', icon: Settings, roles: ['Admin'] },
  ];

  return (
    <aside className="w-64 bg-cyber-card border-r border-cyber-border flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* App Branding */}
      <div className="p-5 border-b border-cyber-border flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-cyber-blue to-cyber-purple rounded-xl text-black shadow-lg shadow-cyber-blue/20">
          <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-bold tracking-wide text-lg text-white font-mono flex items-center gap-1.5">
            AEGIS<span className="text-cyber-blue font-extrabold">UEBA</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Enterprise AI Security</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Security Modules
        </div>
        {navItems.map((item) => {
          if (item.roles && !item.roles.includes(userRole)) return null;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/10 text-cyber-blue border border-cyber-blue/30 shadow-md shadow-cyber-blue/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-blue' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Real-time Status Card */}
      <div className="p-4 border-t border-cyber-border m-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-slate-400 font-mono">AI Stream Status</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-emerald"></span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyber-emerald font-medium">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>LIVE TELEMETRY STREAM</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 font-mono">Inference engine online (&lt;12ms)</p>
      </div>

      {/* User Role Profile */}
      <div className="p-4 border-t border-cyber-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-purple to-pink-600 flex items-center justify-center font-bold text-white shadow">
            {userRole.charAt(0)}
          </div>
          <div>
            <p className="text-white font-medium truncate w-28">SOC Security Analyst</p>
            <p className="text-[10px] text-cyber-blue font-mono">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
