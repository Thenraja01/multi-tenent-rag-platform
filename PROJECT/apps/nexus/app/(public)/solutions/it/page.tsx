import React from "react";
import { Metadata } from "next";
import {
  Terminal,
  FileCode,
  Server,
  AlertTriangle,
  History,
  Sparkles,
  Workflow,
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
  title: "IT Support Solution — AI-Powered IT Knowledge",
  description:
    "Accelerate technical troubleshooting, incident response, API documentation retrieval, and server runbook searches with domain-scoped IT AI.",
};

export default function ITDomainPage() {
  const itFeatures = [
    {
      title: "Technical Documentation",
      description: "Index architecture diagrams, internal software packages, deploy configs, and development wikis.",
      icon: <FileCode className="w-5 h-5" />,
      badge: "Docs",
    },
    {
      title: "API Documentation",
      description: "Search endpoint definitions, authentication schemas, payloads, and error codes across services.",
      icon: <Terminal className="w-5 h-5" />,
      badge: "APIs",
    },
    {
      title: "Server & Infrastructure Docs",
      description: "Query network topologies, container orchestration runbooks, environment configs, and port allocations.",
      icon: <Server className="w-5 h-5" />,
      badge: "Infrastructure",
    },
    {
      title: "Troubleshooting Knowledge",
      description: "Step-by-step diagnostic workflows for service degradation, database lockups, and failover scenarios.",
      icon: <AlertTriangle className="w-5 h-5" />,
      badge: "Diagnostics",
    },
    {
      title: "Incident Post-Mortems",
      description: "Retrieve past root cause analyses (RCAs), resolution timelines, and preventative action items.",
      icon: <History className="w-5 h-5" />,
      badge: "Incident RCA",
    },
    {
      title: "IT Support Assistant",
      description: "AI assistant equipped with command syntax, error diagnostics, and code-aware technical context.",
      icon: <Sparkles className="w-5 h-5" />,
      badge: "AI Agent",
    },
    {
      title: "Technical Workflows",
      description: "Assist DevOps engineers with deployment checklists, rollback SOPs, and certificate rotation guides.",
      icon: <Workflow className="w-5 h-5" />,
      badge: "Workflows",
    },
    {
      title: "Access Control for Secrets",
      description: "Prevent non-authorized developers or contractors from viewing restricted server credentials or prod topologies.",
      icon: <ShieldCheck className="w-5 h-5" />,
      badge: "Security",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb
          items={[
            { label: "Solutions", href: "/solutions" },
            { label: "IT Support" },
          ]}
        />
      </div>

      <HeroSection
        badge="IT & DevOps Domain"
        title="AI-Powered"
        highlightedWord="IT Knowledge"
        subtitle="Empower engineers and IT support desks with instant, permission-verified access to server runbooks, API specifications, and troubleshooting playbooks."
        primaryCtaText="Deploy IT AI"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore Platform"
        secondaryCtaHref="/platform"
      />

      {/* Feature Grid */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Engineering Capabilities"
            title="Built for Technical Teams & Support Desks"
            subtitle="NexusRAG processes Markdown repositories, OpenAPI JSONs, YAML configs, and troubleshooting runbooks with code block fidelity."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {itFeatures.map((feat, idx) => (
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

      {/* Technical Scenario */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8 border-purple-500/30 bg-slate-900/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Example IT Diagnostics Query & Runbook Grounding
                </h4>
                <span className="text-xs text-slate-400">
                  Domain: IT • Role: DevOps Engineer • Technical Index
                </span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-purple-400 font-bold">Query:</span> "What is the recovery procedure when Postgres connection pool exhausts on cluster db-prod-02?"
              </div>
              <div className="p-4 rounded-lg bg-purple-950/20 border border-purple-900/50 text-slate-200 leading-relaxed">
                <div className="text-purple-400 font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>IT Support Assistant Response:</span>
                </div>
                According to the Incident Runbook RB-DB-04, execute the following actions:
                1. Inspect active connection leaks via `SELECT count(*), state FROM pg_stat_activity GROUP BY state;`
                2. If max pool of 300 is reached, terminate idle transactions older than 10 mins using script `/scripts/pg_reclaim_idle.sh`.
                3. Check PgBouncer routing configuration before restarting service.
                <div className="mt-3 pt-2 border-t border-purple-900/40 text-[11px] text-purple-300">
                  📚 Source Citations: [Postgres_Cluster_Runbook_v3.md • Section 7.1]
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <CTASection
        title="Supercharge Your IT Helpdesk & Engineering Operations"
        subtitle="Turn static technical runbooks into active diagnostic intelligence."
      />
    </div>
  );
}
