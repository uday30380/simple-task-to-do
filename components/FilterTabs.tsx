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
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1 flex p-1 space-x-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200
              ${currentFilter === tab.id
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
              }
            `}
          >
            {tab.label}
            <span className={`
              inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full transition-colors
              ${currentFilter === tab.id 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
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
          className="animate-enter flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
        >
          <XIcon size={16} />
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterTabs;