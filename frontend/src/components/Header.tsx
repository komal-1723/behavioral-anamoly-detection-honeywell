import React from 'react';
import { Search, Bell, Shield, Download, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onRefresh }) => {
  return (
    <header className="h-16 bg-cyber-card/80 backdrop-blur-md border-b border-cyber-border px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h2>
        <p className="text-xs text-slate-400 font-mono">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search entity_id, IP, attack..."
            className="w-full bg-slate-900/80 border border-cyber-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
          />
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 bg-slate-800/80 border border-cyber-border hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync</span>
          </button>
        )}

        <div className="relative">
          <button className="p-2 bg-slate-800/80 border border-cyber-border hover:bg-slate-700 text-slate-300 rounded-lg transition relative">
            <Bell className="w-4 h-4 text-cyber-warning" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyber-crimson rounded-full"></span>
          </button>
        </div>

        <div className="px-3 py-1 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg text-cyber-blue text-xs font-mono font-medium flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>PROD MODE</span>
        </div>
      </div>
    </header>
  );
};
