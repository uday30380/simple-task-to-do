import React from 'react';
import { FilterType } from '../types';
import { XIcon } from './Icons';

interface FilterTabsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: { all: number; completed: number; pending: number };
  onClear?: () => void;
  hasActiveFilters?: boolean;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ currentFilter, onFilterChange, counts, onClear, hasActiveFilters }) => {
  const tabs: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1 flex p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`
              relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl transition-all duration-300 ease-out
              ${currentFilter === tab.id
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-md ring-1 ring-black/5 dark:ring-white/5 transform scale-[1.02]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-300/30 dark:hover:bg-slate-700/30'
              }
            `}
          >
            {tab.label}
            <span className={`
              inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full transition-colors duration-300
              ${currentFilter === tab.id 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200' 
                : 'bg-slate-300/50 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}
            `}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
      
      {/* Clear Filters Button */}
      {hasActiveFilters && onClear && (
        <button 
          onClick={onClear}
          className="animate-fade-in flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all duration-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow hover:border-rose-200 dark:hover:border-rose-800"
        >
          <XIcon size={16} />
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterTabs;