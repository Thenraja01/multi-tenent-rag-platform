import React from "react";
import { cn } from "@/lib/utils";

interface StatItem {
  value: string;
  label: string;
  description?: string;
}

interface StatsSectionProps {
  stats: StatItem[];
  className?: string;
}

export function StatsSection({ stats, className }: StatsSectionProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-12",
        className
      )}
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="p-6 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm flex flex-col items-start justify-between shadow-xs"
        >
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-400 dark:to-indigo-200 dark:bg-clip-text tracking-tight mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {stat.label}
            </div>
          </div>
          {stat.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {stat.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
