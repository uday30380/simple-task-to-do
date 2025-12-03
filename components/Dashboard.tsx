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
    <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl shadow-black/50 border border-slate-800 relative overflow-hidden group">
      {/* Subtle Background Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center justify-between gap-4 relative z-10">
        
        {/* Stats Pills Row */}
        <div className="flex-1 flex justify-between gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
          <StatPill label="Total" value={total} />
          <StatPill label="Done" value={completed} />
          <StatPill label="Pending" value={pending} />
          <StatPill label="Overdue" value={overdue} />
        </div>

        {/* Circular Progress Chart */}
        <div className="relative w-28 h-28 flex-shrink-0 bg-slate-950/30 rounded-full p-2 ml-2 shadow-inner border border-slate-800/50">
          <svg className="w-full h-full transform -rotate-90">
             {/* Track */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-800"
            />
            {/* Indicator */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-indigo-500 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black text-white tracking-tighter">{completionRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatPill = ({ label, value }: { label: string; value: number }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/80 rounded-2xl py-4 min-w-[50px] border border-slate-700/50 shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-center scale-90">{label}</p>
    <p className="text-2xl font-black text-white leading-none">{value}</p>
  </div>
);

export default Dashboard;