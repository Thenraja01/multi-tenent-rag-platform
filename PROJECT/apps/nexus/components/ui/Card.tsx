import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverGlow?: boolean;
  glass?: boolean;
  children: React.ReactNode;
}

export function Card({
  className,
  hoverGlow = true,
  glass = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 p-6 transition-all duration-300 relative",
        glass ? "bg-white/80 dark:bg-slate-900/60 backdrop-blur-md shadow-xs dark:shadow-none" : "bg-white dark:bg-slate-900",
        hoverGlow &&
          "hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-950/20 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
