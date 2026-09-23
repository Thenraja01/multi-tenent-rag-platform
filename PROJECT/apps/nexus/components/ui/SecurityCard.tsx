import React from "react";
import { Card } from "./Card";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  boundaryLevel: string;
  points: string[];
  className?: string;
}

export function SecurityCard({
  icon,
  title,
  description,
  boundaryLevel,
  points,
  className,
}: SecurityCardProps) {
  return (
    <Card className={cn("flex flex-col justify-between h-full group p-6", className)}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-all duration-300">
            {icon || <ShieldCheck className="w-5 h-5" />}
          </div>
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400/90 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800/40">
            {boundaryLevel}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {description}
        </p>

        <ul className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {points.map((pt, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-1.5 shrink-0" />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
