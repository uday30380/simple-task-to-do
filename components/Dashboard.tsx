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
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 mb-10 hover:shadow-2xl transition-all duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
        
        {/* Stats Grid */}
        <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="group bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-default">
            <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-bold uppercase tracking-wider mb-1 transition-colors">Total</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white group-hover:scale-110 transition-transform">{total}</p>
          </div>
          <div className="group bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:bg-green-50 dark:hover:bg-green-900/20 cursor-default">
            <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 font-bold uppercase tracking-wider mb-1 transition-colors">Done</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white group-hover:scale-110 transition-transform">{completed}</p>
          </div>
          <div className="group bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-default">
            <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 font-bold uppercase tracking-wider mb-1 transition-colors">Pending</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white group-hover:scale-110 transition-transform">{pending}</p>
          </div>
           <div className="group bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-default">
            <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 font-bold uppercase tracking-wider mb-1 transition-colors">Overdue</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white group-hover:scale-110 transition-transform">{overdue}</p>
          </div>
        </div>

        {/* Animated Circular Progress */}
        <div className="relative w-36 h-36 flex-shrink-0 bg-slate-50 dark:bg-slate-700/30 rounded-full p-2">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-md">
            {/* Background Circle */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-200 dark:text-slate-600 transition-colors"
            />
            {/* Progress Circle */}
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
              className="text-indigo-500 dark:text-indigo-400 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-700 dark:text-white tracking-tighter">{completionRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;