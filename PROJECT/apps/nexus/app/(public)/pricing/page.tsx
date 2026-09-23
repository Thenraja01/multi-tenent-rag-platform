import React from "react";
import { Metadata } from "next";
import { Check, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing & Deployment Options — Enterprise RAG Platform",
  description:
    "Flexible deployment and licensing options for NexusRAG: Starter, Business, and Enterprise tiers for multi-tenant domain AI infrastructure.",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      tagline: "For single-organization departmental pilots & testing.",
      price: "Contact Us",
      badge: "Pilot Tier",
      popular: false,
      features: [
        "1 Tenant Organization",
        "Up to 2 Business Domains (e.g. HR or IT)",
        "Up to 50 Active Users",
        "Standard Document OCR & Ingestion",
        "Domain-Level RBAC (Standard Roles)",
        "Partitioned pgvector Indexing",
        "Standard Audit Logging",
        "Email & Community Support",
      ],
      ctaText: "Contact for Starter",
      ctaHref: "/contact",
    },
    {
      name: "Business",
      tagline: "For growing companies requiring multiple isolated domain workspaces.",
      price: "Contact Us",
      badge: "Most Popular",
      popular: true,
      features: [
        "Up to 5 Tenant Organizations",
        "Up to 6 Business Domains (HR, Finance, IT, Legal, Ops)",
        "Up to 500 Active Users",
        "High-Volume Document OCR & Extraction",
        "Advanced Domain-Level RBAC & Custom Roles",
        "Hybrid Semantic + Keyword Re-Ranking",
        "Immutable Audit Logs & Usage Telemetry",
        "Priority Technical Support & SLAs",
      ],
      ctaText: "Request Business Demo",
      ctaHref: "/contact",
    },
    {
      name: "Enterprise",
      tagline: "For large multi-tenant enterprises requiring custom domains & dedicated SLAs.",
      price: "Contact Us",
      badge: "Unlimited Scale",
      popular: false,
      features: [
        "Unlimited Tenant Organizations",
        "Unlimited Business & Custom Domains",
        "Unlimited Users & Role Trees",
        "Custom Document OCR & Ingestion Pipelines",
        "Custom Embedding & Chunking Models",
        "Dedicated Database Clusters & Partitions",
        "Real-Time Audit Stream & Telemetry Export",
        "Dedicated Technical Account Manager (TAM)",
      ],
      ctaText: "Contact Enterprise Sales",
      ctaHref: "/contact",
    },
  ];

  const comparisonMatrix = [
    { feature: "Organizations / Tenants", starter: "1 Tenant", business: "Up to 5 Tenants", enterprise: "Unlimited" },
    { feature: "Business Domains", starter: "2 Domains", business: "All Standard (6)", enterprise: "Unlimited + Bespoke" },
    { feature: "Active Users", starter: "50 Users", business: "500 Users", enterprise: "Unlimited" },
    { feature: "Knowledge Bases", starter: "Isolated per domain", business: "Isolated per domain", enterprise: "Dedicated Clusters" },
    { feature: "AI Usage / Agents", starter: "Standard Domain Agents", business: "Domain-Specific Agents", enterprise: "Autonomous Custom Agents" },
    { feature: "Vector Storage", starter: "Partitioned pgvector", business: "Partitioned pgvector", enterprise: "Dedicated HNSW Instances" },
    { feature: "RBAC & Governance", starter: "Standard 3-tier", business: "Granular Domain Trees", enterprise: "Custom Hierarchies" },
    { feature: "Audit Telemetry", starter: "30-Day History", business: "90-Day History", enterprise: "Immutable Long-Term" },
    { feature: "Support SLA", starter: "Standard Email", business: "Priority Business", enterprise: "24/7 Dedicated Support" },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "Pricing" }]} />
      </div>

      <HeroSection
        badge="Licensing & Deployment"
        title="Predictable Deployment for"
        highlightedWord="Enterprise Scale"
        subtitle="Provision NexusRAG tailored to your organizational scale. All tiers include cryptographic multi-tenant isolation, domain-level RBAC, and verified source grounding."
        primaryCtaText="Request Custom Quote"
        primaryCtaHref="/contact"
        secondaryCtaText="View Architecture"
        secondaryCtaHref="/architecture"
      />

      {/* Pricing Cards */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Plans & Packages"
            title="Choose the Right Foundation"
            subtitle="Start with a targeted departmental pilot or deploy an enterprise-wide multi-tenant knowledge network."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={cn(
                  "p-8 flex flex-col justify-between relative",
                  plan.popular
                    ? "border-blue-500/80 bg-slate-900 ring-1 ring-blue-500 shadow-xl shadow-blue-950/40"
                    : "border-slate-800 bg-slate-900/50"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                    {!plan.popular && (
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                    {plan.tagline}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-800">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">
                      {plan.price}
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Customized based on domains and capacity
                    </span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      Included Capabilities:
                    </span>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  href={plan.ctaHref}
                  variant={plan.popular ? "primary" : "outline"}
                  size="lg"
                  className="w-full"
                >
                  {plan.ctaText}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Matrix Table */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge="Detailed Comparison"
            title="Feature Comparison Matrix"
            subtitle="Review resource and architectural allocations across tiers."
          />

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-200 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-4 sm:p-5">Capability Category</th>
                  <th className="p-4 sm:p-5">Starter</th>
                  <th className="p-4 sm:p-5 text-blue-400">Business</th>
                  <th className="p-4 sm:p-5">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {comparisonMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 sm:p-5 font-semibold text-white">
                      {row.feature}
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">{row.starter}</td>
                    <td className="p-4 sm:p-5 font-medium text-blue-300 bg-blue-950/10">
                      {row.business}
                    </td>
                    <td className="p-4 sm:p-5 text-slate-200">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <CTASection
        title="Need a Custom Enterprise Sizing Estimate?"
        subtitle="Speak directly with our technical team to configure an optimal deployment plan."
      />
    </div>
  );
}
