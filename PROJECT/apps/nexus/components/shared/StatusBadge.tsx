'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type StatusVariant =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'PENDING'
  | 'ARCHIVED'
  | 'INDEXED'
  | 'PROCESSING'
  | 'QUEUED'
  | 'FAILED'
  | 'HEALTHY'
  | 'DEGRADED'
  | 'DOWN'
  | 'CUSTOM';

interface StatusBadgeProps {
  status: string | StatusVariant;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, label, className, size = 'sm' }: StatusBadgeProps) {
  const norm = (status || '').toUpperCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  if (['ACTIVE', 'HEALTHY', 'INDEXED', 'SUCCESS', 'ENABLED'].includes(norm)) {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    dotColor = 'bg-emerald-400';
  } else if (['SUSPENDED', 'FAILED', 'DOWN', 'ERROR', 'DISABLED'].includes(norm)) {
    styles = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    dotColor = 'bg-rose-400';
  } else if (['PENDING', 'PROCESSING', 'QUEUED', 'DEGRADED', 'WARNING'].includes(norm)) {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    dotColor = 'bg-amber-400 animate-pulse';
  } else if (['ARCHIVED', 'DRAFT', 'UNKNOWN'].includes(norm)) {
    styles = 'bg-slate-800 text-slate-400 border-slate-700';
    dotColor = 'bg-slate-500';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-mono font-semibold uppercase tracking-wider border',
        sizeClasses,
        styles,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
      <span>{label || status}</span>
    </span>
  );
}
