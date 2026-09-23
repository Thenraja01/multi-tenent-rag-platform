import React from "react";
import { Metadata } from "next";
import {
  Wrench,
  Database,
  Cpu,
  Sparkles,
  GitBranch,
  Sliders,
  Layers,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Custom Domains — Extensible AI Knowledge Architecture",
  description:
    "Build custom domain applications on NexusRAG with dedicated business logic, custom databases, specialized retrieval strategies, and autonomous AI agents.",
};

export default function CustomDomainPage() {
  const customFeatures = [
    {
      title: "Independent Business Logic",
      description: "Embed your organization's unique domain algorithms, scoring metrics, validation steps, and decision rules.",
      icon: <Code2 className="w-5 h-5" />,
      badge: "Logic",
    },
    {
      title: "Dedicated Databases & Schemas",
      description: "Provision isolated relational tables and pgvector collections tailored precisely to your domain entities.",
      icon: <Database className="w-5 h-5" />,
      badge: "Data Isolation",
    },
    {
      title: "Tailored Knowledge Bases",
      description: "Define domain-specific metadata taxonomies, chunking strategies, and parsing rules for proprietary formats.",
      icon: <Layers className="w-5 h-5" />,
      badge: "Knowledge",
    },
    {
      title: "Custom System Prompts & Guardrails",
      description: "Tune domain persona, tone, safety constraints, hallucination thresholds, and response formatting.",
      icon: <Sliders className="w-5 h-5" />,
      badge: "Prompting",
    },
    {
      title: "Specialized Retrieval Strategies",
      description: "Configure custom dense/sparse weighting, cross-encoder models, and filtering thresholds per domain.",
      icon: <Cpu className="w-5 h-5" />,
      badge: "Retrieval",
    },
    {
      title: "Autonomous Domain AI Agents",
      description: "Equip custom domain agents with domain-specific tool execution, API calls, and automated sub-workflows.",
      icon: <Sparkles className="w-5 h-5" />,
      badge: "Agentic",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb
          items={[
            { label: "Solutions", href: "/solutions" },
            { label: "Custom Domains" },
          ]}
        />
      </div>

      <HeroSection
        badge="Extensible Domain Architecture"
        title="Your Business Doesn't Fit Into a Template."
        highlightedWord="Your AI Shouldn't Either."
        subtitle="NexusRAG empowers enterprise teams to engineer specialized business domains with dedicated logic, databases, retrieval pipelines, and AI assistants while sharing core platform security."
        primaryCtaText="Build Custom Domain"
        primaryCtaHref="/contact"
        secondaryCtaText="View Architecture"
        secondaryCtaHref="/architecture"
      />

      {/* Feature Grid */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Custom Capabilities"
            title="Complete Domain Autonomy"
            subtitle="Build custom departmental applications that evolve independently without being constrained by rigid platform templates."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {customFeatures.map((feat, idx) => (
              <FeatureCard
                key={idx}
                icon={feat.icon}
                title={feat.title}
                description={feat.description}
                badge={feat.badge}
                badgeVariant="purple"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Domain Evolution Diagram */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <Wrench className="w-6 h-6 text-indigo-400" />
            <div>
              <h4 className="text-lg font-bold text-white">
                How Custom Domains Evolve in NexusRAG
              </h4>
              <p className="text-xs text-slate-400">
                Shared platform foundations enable rapid custom domain deployment with zero security compromise.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-blue-400 font-mono font-bold block mb-1">01. Register</span>
              <p className="text-slate-300">
                Register a new domain identifier and mount custom API routes on the platform gateway.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-indigo-400 font-mono font-bold block mb-1">02. Ingest</span>
              <p className="text-slate-300">
                Upload proprietary domain schemas, documents, and define custom RBAC roles.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-emerald-400 font-mono font-bold block mb-1">03. Execute</span>
              <p className="text-slate-300">
                Deploy domain AI agents with scoped context, custom tools, and verifiable source citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Design Your Custom Domain AI Experience"
        subtitle="Schedule an architecture workshop with our platform engineers to blueprint your domain application."
      />
    </div>
  );
}
