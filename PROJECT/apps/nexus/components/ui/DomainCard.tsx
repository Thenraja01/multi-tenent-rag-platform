import React from "react";
import Link from "next/link";
import { Card } from "./Card";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DomainCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  capabilities: string[];
  href: string;
  tag?: string;
  accentColor?: string;
  className?: string;
}

export function DomainCard({
  icon,
  title,
  description,
  capabilities,
  href,
  tag,
  className,
}: DomainCardProps) {
  return (
    <Card className={cn("flex flex-col justify-between h-full group p-6 sm:p-7", className)}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 group-hover:border-blue-500/40 transition-all duration-300">
            {icon}
          </div>
          {tag && (
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              {tag}
            </span>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          {description}
        </p>

        <div className="space-y-2 mb-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Domain Capabilities
          </span>
          {capabilities.map((cap, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors pt-4 border-t border-slate-100 dark:border-slate-800/60 group-hover:translate-x-0.5 duration-200"
      >
        <span>Explore Solution</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </Card>
  );
}
