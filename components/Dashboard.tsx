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
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
        
        {/* Stats Grid */}
        <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-200">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Total</p>
            <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-200">
            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-1">Done</p>
            <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{completed}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-200">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mb-1">Pending</p>
            <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{pending}</p>
          </div>
           <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-200">
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider mb-1">Overdue</p>
            <p className="text-2xl font-extrabold text-gray-800 dark:text-white">{overdue}</p>
          </div>
        </div>

        {/* Animated Circular Progress */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
            {/* Background Circle */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-100 dark:text-gray-600 transition-colors"
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
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{completionRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;