import React from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "slate" | "emerald" | "amber" | "purple" | "indigo" | "red" | "outline";
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = "blue",
  className,
  icon,
}: BadgeProps) {
  const variants = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    slate: "bg-slate-800 text-slate-300 border-slate-700",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    outline: "bg-transparent text-slate-400 border-slate-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border tracking-wide select-none",
        variants[variant],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
