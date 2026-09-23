import React from "react";
import { Metadata } from "next";
import {
  Sparkles,
  Users,
  DollarSign,
  Terminal,
  Scale,
  Cog,
  BrainCircuit,
  FileCheck2,
  GitBranch,
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
  title: "AI Agents — Domain-Specific Autonomous AI Assistants",
  description:
    "Deploy specialized domain AI agents with dedicated personas, scoped retrieval, customized system prompts, and source-backed answers.",
};

export default function AIAgentsPage() {
  const domainAgents = [
    {
      title: "HR Specialist AI",
      role: "Human Resources Agent",
      icon: <Users className="w-6 h-6 text-blue-400" />,
      description:
        "Tuned with empathetic tone and deep comprehension of organizational policies, leave structures, employee benefits, and onboarding schedules.",
      persona: "HR Policy Specialist",
      scope: "Scoped to HR Knowledge Base & Employee Handbooks",
      samplePrompt: "Explain the parental leave policy guidelines and required advance notice.",
    },
    {
      title: "Finance Analyst AI",
      role: "Financial Intelligence Agent",
      icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
      description:
        "Engineered for numerical precision, tabular extraction, invoice validation, and standard accounting nomenclature.",
      persona: "Quantitative Financial Analyst",
      scope: "Scoped to Financial Reports, Invoices & Expense SOPs",
      samplePrompt: "Summarize Q3 variance between projected and actual cloud infrastructure spend.",
    },
    {
      title: "IT Support AI",
      role: "DevOps & Helpdesk Agent",
      icon: <Terminal className="w-6 h-6 text-purple-400" />,
      description:
        "Proficient in infrastructure troubleshooting, terminal command syntax, API specifications, and incident response playbooks.",
      persona: "Senior Systems Engineer",
      scope: "Scoped to Technical Docs, API Specs & Incident RCAs",
      samplePrompt: "Provide the rollback command sequence for failed Kubernetes deployment v2.1.",
    },
    {
      title: "Legal Knowledge AI",
      role: "Policy & Contract Research Agent",
      icon: <Scale className="w-6 h-6 text-amber-400" />,
      description:
        "Specialized in contract clause indexing, standard agreement retrieval, and internal policy citation (non-advisory).",
      persona: "Legal Research Assistant",
      scope: "Scoped to Contract Precedents & Internal Governance Manuals",
      samplePrompt: "Locate standard indemnification clauses in approved vendor NDA templates.",
    },
    {
      title: "Operations Field AI",
      role: "Operations & Logistics Agent",
      icon: <Cog className="w-6 h-6 text-cyan-400" />,
      description:
        "Equipped with standard operating procedures, logistics checklists, warehouse storage guidelines, and equipment maintenance protocols.",
      persona: "Operations Lead",
      scope: "Scoped to Facility SOPs, Safety Guidelines & Logistics Manuals",
      samplePrompt: "What is the mandatory checklist before starting warehouse shift A in facility 4?",
    },
  ];

  const agentPillars = [
    {
      title: "Domain Context & Scoping",
      description: "Agents are bound to their specific business domain. An HR agent never sees IT server keys or finance ledgers.",
      icon: <ShieldCheck className="w-5 h-5" />,
      badge: "Isolation",
    },
    {
      title: "Domain Knowledge Bases",
      description: "Embeddings and vector storage are partitioned so retrieval queries search only authoritative domain documents.",
      icon: <BrainCircuit className="w-5 h-5" />,
      badge: "Indexing",
    },
    {
      title: "Specialized System Prompts",
      description: "Each agent runs with carefully engineered domain instructions, formatting rules, and safety guardrails.",
      icon: <Sparkles className="w-5 h-5" />,
      badge: "Prompts",
    },
    {
      title: "Grounded Source Citations",
      description: "Every assertion is linked directly to an exact document title, page number, and paragraph citation.",
      icon: <FileCheck2 className="w-5 h-5" />,
      badge: "Factual",
    },
    {
      title: "Domain Workflows & Triggers",
      description: "Agents can initiate structured domain workflows like ticket creation, invoice status checks, or policy approvals.",
      icon: <GitBranch className="w-5 h-5" />,
      badge: "Workflows",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "AI Assistants" }]} />
      </div>

      <HeroSection
        badge="Domain-Specific AI Architecture"
        title="Domain-Specific"
        highlightedWord="AI Agents"
        subtitle="NexusRAG rejects generic one-size-fits-all chatbots. Every business domain receives a dedicated AI assistant tailored with specialized context, strict knowledge boundaries, and verified source grounding."
        primaryCtaText="Deploy Domain Agents"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore RAG Pipeline"
        secondaryCtaHref="/rag"
      />

      {/* Pillars of Domain AI */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Agent Principles"
            title="How Domain AI Differs from Generic Chatbots"
            subtitle="Explore the fundamental capabilities that make domain-specific AI agents reliable for enterprise operations."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentPillars.slice(0, 3).map((feat, idx) => (
              <FeatureCard
                key={idx}
                icon={feat.icon}
                title={feat.title}
                description={feat.description}
                badge={feat.badge}
                badgeVariant="purple"
              />
            ))}
            <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {agentPillars.slice(3).map((feat, idx) => (
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
        </div>
      </section>

      {/* Domain Agents Showcase */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Active Domain Agents"
            title="Specialized Agents for Every Business Unit"
            subtitle="Review the dedicated AI personas configured for core organizational departments."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domainAgents.map((agent, idx) => (
              <Card key={idx} className="p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                      {agent.icon}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      {agent.role}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2">
                    {agent.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                    {agent.description}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs mb-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Knowledge Scope
                    </span>
                    <span className="text-slate-300 font-medium">{agent.scope}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
                  <span className="text-[10px] font-mono text-blue-400 block mb-1">Sample Intent</span>
                  <span className="italic text-slate-300">"{agent.samplePrompt}"</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Deploy Domain-Specific AI Agents?"
        subtitle="Empower your workforce with purpose-built AI agents grounded in your proprietary documents."
      />
    </div>
  );
}
