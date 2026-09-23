'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';

type TimeFilter = '7D' | '30D' | '3M' | '6M' | '1Y';

const filterData: Record<
  TimeFilter,
  { labels: string[]; values: number[]; growth: string; totalNew: number }
> = {
  '7D': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [120, 122, 123, 125, 126, 127, 128],
    growth: '+6.6%',
    totalNew: 8,
  },
  '30D': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [112, 118, 124, 128],
    growth: '+14.2%',
    totalNew: 16,
  },
  '3M': {
    labels: ['Month 1', 'Month 2', 'Month 3'],
    values: [98, 114, 128],
    growth: '+30.6%',
    totalNew: 30,
  },
  '6M': {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    values: [74, 86, 98, 109, 119, 128],
    growth: '+72.9%',
    totalNew: 54,
  },
  '1Y': {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    values: [45, 68, 96, 128],
    growth: '+184.4%',
    totalNew: 83,
  },
};

export function OrganizationGrowthChart() {
  const [filter, setFilter] = useState<TimeFilter>('30D');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const current = filterData[filter];
  const maxVal = Math.max(...current.values) * 1.15;
  const minVal = Math.min(...current.values) * 0.85;

  const points = current.values.map((val, idx) => {
    const x = (idx / (current.values.length - 1)) * 460 + 20;
    const y = 160 - ((val - minVal) / (maxVal - minVal)) * 120;
    return { x, y, val, label: current.labels[idx] };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[idx - 1];
    const cx1 = (prev.x + pt.x) / 2;
    const cy1 = prev.y;
    const cx2 = (prev.x + pt.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

  return (
    <Card className="p-6 bg-slate-900/70 border-slate-800 backdrop-blur-xl flex flex-col justify-between">
      {/* Header with Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Organization Growth</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              {current.growth}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active tenant organizations provisioned across the platform
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
          {(['7D', '30D', '3M', '6M', '1Y'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setHoverIndex(null);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {f === '7D'
                ? '7 Days'
                : f === '30D'
                ? '30 Days'
                : f === '3M'
                ? '3 Months'
                : f === '6M'
                ? '6 Months'
                : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative py-4 w-full overflow-hidden">
        <svg viewBox="0 0 500 180" className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="orgGrowthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line x1="20" y1="40" x2="480" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="20" y1="90" x2="480" y2="90" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="20" y1="140" x2="480" y2="140" stroke="#1e293b" strokeDasharray="3 3" />

          {/* Gradient Fill Area */}
          <path d={areaD} fill="url(#orgGrowthGradient)" />

          {/* Smooth Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer transition"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  className={`transition-all ${
                    isHovered
                      ? 'fill-indigo-400 stroke-white stroke-2'
                      : 'fill-slate-950 stroke-indigo-500 stroke-2'
                  }`}
                />
                {/* X-axis labels */}
                <text
                  x={pt.x}
                  y="178"
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px] font-mono select-none"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-indigo-500/40 rounded-xl px-3 py-1.5 shadow-xl text-center pointer-events-none"
          >
            <div className="text-[10px] font-mono text-slate-400">
              {points[hoverIndex].label}
            </div>
            <div className="text-xs font-bold text-white">
              {points[hoverIndex].val} Organizations
            </div>
          </div>
        )}
      </div>

      {/* Footer KPI Summary */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>New in Period: <strong className="text-white">+{current.totalNew} orgs</strong></span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Total: <span className="text-indigo-400 font-bold">128 Total Organizations</span>
        </div>
      </div>
    </Card>
  );
}
