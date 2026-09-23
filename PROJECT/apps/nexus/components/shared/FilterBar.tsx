'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Search, X, RotateCcw, Filter } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSelectConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
}

interface FilterBarProps {
  search?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterSelectConfig[];
  onReset?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  onReset,
  actions,
  className,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(search || filters.some((f) => f.value && f.value !== 'ALL'));

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl',
        className
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Dynamic Select Filters */}
        {filters.map((filter) => (
          <div key={filter.key} className="relative">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 transition appearance-none pr-8 cursor-pointer font-medium"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
              ▼
            </div>
          </div>
        ))}

        {/* Reset Button */}
        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Extra Action Buttons */}
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
