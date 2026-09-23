import React from "react";
import { Button } from "./Button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  className?: string;
}

export function CTASection({
  title = "Ready to Build Your Enterprise AI Knowledge Layer?",
  subtitle = "Deploy secure, multi-tenant, domain-isolated RAG across your organization with verified source-grounded intelligence.",
  primaryCtaText = "Get Started",
  primaryCtaHref = "/contact",
  secondaryCtaText = "Request Demo",
  secondaryCtaHref = "/contact",
  className,
}: CTASectionProps) {
  return (
    <section className={cn("py-16 sm:py-20 relative overflow-hidden", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-50 via-white to-slate-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-950 p-8 sm:p-12 lg:p-16 text-center overflow-hidden shadow-xl dark:shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enterprise Knowledge Security</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
              {title}
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mb-8">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <Button
                href={primaryCtaHref}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto min-w-[160px] shadow-md"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {primaryCtaText}
              </Button>
              <Button
                href={secondaryCtaHref}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-w-[160px] border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                {secondaryCtaText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
