import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: "blue" | "slate" | "emerald" | "amber" | "purple";
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  badge,
  badgeVariant = "blue",
  className,
}: FeatureCardProps) {
  return (
    <Card className={cn("flex flex-col justify-between h-full group", className)}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:bg-blue-500/20 transition-all duration-300">
            {icon}
          </div>
          {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
          {description}
        </p>
      </div>
    </Card>
  );
}
