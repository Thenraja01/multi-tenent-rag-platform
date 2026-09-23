import React from "react";
import { Metadata } from "next";
import {
  Compass,
  ShieldCheck,
  Layers,
  Sparkles,
  GitBranch,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About NexusRAG — Vision & Architectural Philosophy",
  description:
    "Learn about NexusRAG: our mission to build secure, domain-aware AI infrastructure with multi-tenant isolation and verified knowledge grounding.",
};

export default function AboutPage() {
  const pillars = [
    {
      title: "Our Vision",
      icon: <Compass className="w-6 h-6 text-blue-400" />,
      desc: "To provide the definitive enterprise AI substrate where organizations can deploy intelligent, domain-aware agents over proprietary knowledge without ever risking data leakage or hallucinated outputs.",
    },
    {
      title: "Platform Philosophy",
      icon: <Layers className="w-6 h-6 text-indigo-400" />,
      desc: "Common infrastructure (authentication, ingestion, OCR, vector storage, telemetry) should be centralized and rock-solid, while business domain logic remains strictly isolated and autonomously extensible.",
    },
    {
      title: "Domain-Driven AI",
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      desc: "Generic AI lacks context. True enterprise productivity requires specialized agents tuned with domain terminology, role-restricted knowledge, and custom departmental workflows.",
    },
    {
      title: "Secure Knowledge by Design",
      icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
      desc: "Security is not a plugin. Multi-tenant schema isolation, domain boundaries, and dynamic RBAC checks are baked into every vector query and LLM synthesis loop.",
    },
    {
      title: "Extensible Architecture",
      icon: <GitBranch className="w-6 h-6 text-cyan-400" />,
      desc: "Organizations can introduce custom domains, custom databases, and proprietary workflows without rewriting core platform code or disrupting existing operational domains.",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "About Us" }]} />
      </div>

      <HeroSection
        badge="About NexusRAG"
        title="Building the Infrastructure for"
        highlightedWord="Domain-Aware Enterprise AI"
        subtitle="NexusRAG was engineered from the ground up to solve the fundamental enterprise problem: how to give organizations domain-specialized AI without compromising multi-tenant security or role-based privacy."
        primaryCtaText="Explore Platform"
        primaryCtaHref="/platform"
        secondaryCtaText="Contact Us"
        secondaryCtaHref="/contact"
      />

      {/* Philosophy Pillars */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="Core Philosophy"
            title="What Drives Our Architecture"
            subtitle="Explore the guiding engineering principles behind NexusRAG."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((item, idx) => (
              <Card
                key={idx}
                className="p-6 sm:p-7 flex flex-col justify-between border-slate-800 bg-slate-900/60"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Join the Enterprise AI Knowledge Revolution"
        subtitle="Discover how NexusRAG can become the secure AI backbone for your organization."
      />
    </div>
  );
}
