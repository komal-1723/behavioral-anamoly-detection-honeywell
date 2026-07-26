import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'crimson' | 'warning' | 'emerald' | 'purple';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const colorStyles = {
    blue: 'border-cyber-blue/30 text-cyber-blue bg-cyber-blue/10 shadow-cyber-blue/5',
    crimson: 'border-cyber-crimson/30 text-cyber-crimson bg-cyber-crimson/10 shadow-cyber-crimson/5',
    warning: 'border-cyber-warning/30 text-cyber-warning bg-cyber-warning/10 shadow-cyber-warning/5',
    emerald: 'border-cyber-emerald/30 text-cyber-emerald bg-cyber-emerald/10 shadow-cyber-emerald/5',
    purple: 'border-cyber-purple/30 text-cyber-purple bg-cyber-purple/10 shadow-cyber-purple/5',
  };

  return (
    <div className="bg-cyber-card/90 backdrop-blur-md border border-cyber-border rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color]} shadow-md group-hover:scale-110 transition duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">24h Variance</span>
          <span className={trend.startsWith('+') ? 'text-cyber-crimson font-semibold' : 'text-cyber-emerald font-semibold'}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
