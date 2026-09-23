'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  iconColor?: string;
  description?: string;
  className?: string;
  onClick?: () => void;
}

export function KpiCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  iconColor = 'text-indigo-400',
  description,
  className,
  onClick,
}: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden transition-all',
        onClick && 'cursor-pointer hover:border-slate-700 hover:bg-slate-900/90 shadow-lg hover:shadow-indigo-500/5',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        {Icon && (
          <div className={cn('p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0', iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>

        {change && (
          <div
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full',
              trend === 'up' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
              trend === 'down' && 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
              trend === 'neutral' && 'bg-slate-800 text-slate-400 border border-slate-700'
            )}
          >
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {description && (
        <p className="mt-2 text-[11px] text-slate-500 leading-relaxed truncate">
          {description}
        </p>
      )}
    </div>
  );
}
