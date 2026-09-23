import React from "react";
import { Metadata } from "next";
import {
  Cog,
  Boxes,
  Truck,
  FileCheck2,
  Workflow,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Operations Knowledge Solution — Process Intelligence & SOPs",
  description:
    "Equip operational managers and field staff with instant access to standard operating procedures (SOPs), supply chain protocols, and process knowledge.",
};

export default function OperationsDomainPage() {
  const opFeatures = [
    {
      title: "Standard Operating Procedures (SOPs)",
      description: "Index step-by-step manufacturing, quality control, maintenance, and warehouse operation manuals.",
      icon: <FileCheck2 className="w-5 h-5" />,
      badge: "SOPs",
    },
    {
      title: "Logistics & Supply Chain",
      description: "Instantly retrieve carrier agreements, shipping requirements, customs checklists, and lead-time guidelines.",
      icon: <Truck className="w-5 h-5" />,
      badge: "Logistics",
    },
    {
      title: "Inventory & Warehouse Guidelines",
      description: "Search SKU classification guides, storage temperature thresholds, hazardous material protocols, and safety norms.",
      icon: <Boxes className="w-5 h-5" />,
      badge: "Inventory",
    },
    {
      title: "Operational Workflows",
      description: "Coordinate escalation matrices, incident remediation workflows, and equipment maintenance schedules.",
      icon: <Workflow className="w-5 h-5" />,
      badge: "Workflows",
    },
    {
      title: "Operations AI Assistant",
      description: "Domain-tailored assistant that guides plant managers and operational staff through complex checklists.",
      icon: <Sparkles className="w-5 h-5" />,
      badge: "AI Agent",
    },
    {
      title: "Multi-Facility Access Control",
      description: "Partition facility-specific SOPs and regional vendor details with fine-grained RBAC permissions.",
      icon: <ShieldCheck className="w-5 h-5" />,
      badge: "Facility RBAC",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb
          items={[
            { label: "Solutions", href: "/solutions" },
            { label: "Operations" },
          ]}
        />
      </div>

      <HeroSection
        badge="Operations & Logistics Domain"
        title="AI-Powered"
        highlightedWord="Operations Knowledge"
        subtitle="Turn hundreds of dense standard operating procedures and supply chain manuals into an instant, interactive knowledge layer for your operations teams."
        primaryCtaText="Deploy Operations AI"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore Platform"
        secondaryCtaHref="/platform"
      />

      {/* Feature Grid */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Operations Engine"
            title="Accelerate Operational Execution"
            subtitle="Explore how NexusRAG provides ground teams with verifiable SOP guidance at the point of need."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {opFeatures.map((feat, idx) => (
              <FeatureCard
                key={idx}
                icon={feat.icon}
                title={feat.title}
                description={feat.description}
                badge={feat.badge}
                badgeVariant="emerald"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Operations Scenario */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8 border-emerald-500/30 bg-slate-900/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Cog className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Example Operations SOP Query & Grounding
                </h4>
                <span className="text-xs text-slate-400">
                  Domain: Operations • Role: Facility Supervisor • SOP Verified
                </span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-emerald-400 font-bold">Query:</span> "What is the mandatory calibration cadence and threshold for refrigeration unit RF-09?"
              </div>
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-slate-200 leading-relaxed">
                <div className="text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Operations Assistant Response:</span>
                </div>
                Under Standard Operating Procedure SOP-FAC-402 (Cold Chain Equipment Maintenance), unit RF-09 requires bi-weekly digital calibration. Target temperature range must remain strictly between 2.0°C and 4.5°C with maximum tolerance of ±0.3°C.
                <div className="mt-3 pt-2 border-t border-emerald-900/40 text-[11px] text-emerald-300">
                  📚 Source Citations: [Cold_Storage_SOP_Rev8.pdf • Section 3.4, Page 14]
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <CTASection
        title="Ready to Transform Your Operational SOPs?"
        subtitle="Deploy conversational AI intelligence grounded directly in your company's operational guidelines."
      />
    </div>
  );
}
