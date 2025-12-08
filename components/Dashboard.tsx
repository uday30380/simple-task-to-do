import React from 'react';
import { Task } from '../types';

interface DashboardProps {
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < Date.now() && !t.completed).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // SVG Configuration
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="relative group rounded-[2.5rem] p-[1px] bg-gradient-to-br from-slate-700 to-slate-900 hover:from-indigo-500/30 hover:to-slate-800 transition-all duration-500 shadow-2xl shadow-black/40">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] p-6 h-full relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-50"></div>
        
        <div className="flex items-center justify-between gap-4 relative z-10">
          
          {/* Stats Pills Row */}
          <div className="flex-1 grid grid-cols-2 sm:flex sm:justify-between gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
            <StatPill label="Total" value={total} color="text-slate-200" />
            <StatPill label="Done" value={completed} color="text-emerald-400" />
            <StatPill label="Pending" value={pending} color="text-amber-400" />
            <StatPill label="Overdue" value={overdue} color="text-rose-400" />
          </div>

          {/* Circular Progress Chart */}
          <div className="relative w-28 h-28 flex-shrink-0 bg-slate-950/50 rounded-full p-2 ml-2 shadow-inner border border-slate-800/50 hidden sm:block">
            <svg className="w-full h-full transform -rotate-90">
               {/* Track */}
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-800"
              />
              {/* Indicator */}
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-indigo-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-black text-white tracking-tighter">{completionRate}%</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase">Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatPill = ({ label, value, color }: { label: string; value: number; color?: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/50 rounded-2xl py-4 min-w-[50px] border border-slate-700/50 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 hover:bg-slate-800 hover:border-slate-600">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center scale-90">{label}</p>
    <p className={`text-2xl font-black leading-none ${color || 'text-white'}`}>{value}</p>
  </div>
);

export default Dashboard;