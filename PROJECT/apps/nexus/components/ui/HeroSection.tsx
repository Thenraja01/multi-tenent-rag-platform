import React from "react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  badge?: string;
  title: string;
  highlightedWord?: string;
  subtitle: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  children?: React.ReactNode;
  className?: string;
  stats?: Array<{ label: string; value: string }>;
}

export function HeroSection({
  badge,
  title,
  highlightedWord,
  subtitle,
  primaryCtaText = "Get Started",
  primaryCtaHref = "/contact",
  secondaryCtaText = "Request Demo",
  secondaryCtaHref = "/contact",
  children,
  className,
  stats,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/60 transition-colors duration-200",
        className
      )}
    >
      {/* Background ambient mesh and glow */}
      <div className="absolute inset-0 nexus-hero-glow pointer-events-none" />
      <div className="absolute inset-0 nexus-grid-pattern opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {badge && (
            <Badge
              variant="blue"
              icon={<Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              className="mb-6 px-3.5 py-1.5 text-xs sm:text-sm backdrop-blur-md"
            >
              {badge}
            </Badge>
          )}

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
            {title}{" "}
            {highlightedWord && (
              <span className="nexus-gradient-text">
                {highlightedWord}
              </span>
            )}
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mb-8 sm:mb-10">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-10">
            <Button
              href={primaryCtaHref}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-md"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {primaryCtaText}
            </Button>
            <Button
              href={secondaryCtaHref}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              {secondaryCtaText}
            </Button>
          </div>

          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-slate-200 dark:border-slate-800/80 w-full max-w-3xl">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {children && <div className="mt-12 sm:mt-16">{children}</div>}
      </div>
    </section>
  );
}
