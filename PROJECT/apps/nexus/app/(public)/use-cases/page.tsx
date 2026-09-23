import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  DollarSign,
  Terminal,
  Scale,
  Cog,
  Search,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Use Cases — Enterprise AI Knowledge Applications",
  description:
    "Real-world enterprise use cases for NexusRAG: HR handbook lookups, financial invoice extraction, IT troubleshooting, legal policy search, and operational SOP guidance.",
};

export default function UseCasesPage() {
  const useCases = [
    {
      title: "HR Knowledge & Policy Lookup",
      category: "Human Resources",
      icon: <Users className="w-6 h-6 text-blue-400" />,
      problem:
        "HR teams are overwhelmed by repetitive inquiries regarding parental leave, healthcare tiers, remote work guidelines, and vacation rollover.",
      solution:
        "NexusRAG ingests all employee handbooks and policy updates into a secure HR domain knowledge base with an empathetic, source-grounded assistant.",
      example:
        "'What is the parental leave duration for new fathers in regional office #3?' -> AI instantly cites Page 42 of Regional Policy Handbook.",
      ctaHref: "/solutions/hr",
      ctaText: "Explore HR Solution",
    },
    {
      title: "Finance & Invoice Intelligence",
      category: "Finance & Accounting",
      icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
      problem:
        "Finance analysts waste hours cross-referencing multi-page PDF invoices, vendor contracts, and accounting policy revisions across siloed folders.",
      solution:
        "NexusRAG performs layout-aware OCR and structured tabular chunking to allow instant natural-language search over invoice line items and payment terms.",
      example:
        "'Show all approved cloud vendor invoices from Q3 exceeding $20k with Net 30 terms.' -> AI extracts rows with direct document links.",
      ctaHref: "/solutions/finance",
      ctaText: "Explore Finance Solution",
    },
    {
      title: "IT Support & Incident Resolution",
      category: "IT & DevOps",
      icon: <Terminal className="w-6 h-6 text-purple-400" />,
      problem:
        "Engineers and support desks lose valuable incident response time searching through disparate Markdown wikis, OpenAPI files, and server runbooks.",
      solution:
        "NexusRAG builds a code-aware IT knowledge base providing diagnostic commands, rollback steps, and post-mortem incident analyses.",
      example:
        "'How do we recover from a Redis sentinel split-brain on cluster 02?' -> AI outputs verified runbook steps.",
      ctaHref: "/solutions/it",
      ctaText: "Explore IT Solution",
    },
    {
      title: "Legal Policy & Precedent Search",
      category: "Legal & Policy",
      icon: <Scale className="w-6 h-6 text-amber-400" />,
      problem:
        "Legal teams manually review hundreds of historic agreements to locate approved fallback language and standard liability clauses.",
      solution:
        "NexusRAG indexes internal contract playbooks and regulatory guidelines with strict RBAC to prevent unauthorized contract exposure.",
      example:
        "'Find the standard approved clause for IP indemnification in enterprise SaaS agreements.' -> AI surfaces verbatim playbook clause.",
      ctaHref: "/solutions/legal",
      ctaText: "Explore Legal Solution",
    },
    {
      title: "Operations & Facility SOPs",
      category: "Operations & Logistics",
      icon: <Cog className="w-6 h-6 text-cyan-400" />,
      problem:
        "Plant operators and field logistics staff struggle with outdated paper binders or complex intranet folders when operating equipment.",
      solution:
        "NexusRAG converts standard operating procedures into an instant, conversational mobile-friendly knowledge assistant.",
      example:
        "'What are the required pressure safety checks before starting turbine pump B?' -> AI retrieves exact SOP calibration parameters.",
      ctaHref: "/solutions/operations",
      ctaText: "Explore Operations Solution",
    },
    {
      title: "Unified Enterprise Search",
      category: "Cross-Department Search",
      icon: <Search className="w-6 h-6 text-blue-400" />,
      problem:
        "Employees cannot find internal information because organizational knowledge is scattered across different departments with varying permissions.",
      solution:
        "NexusRAG provides a permission-aware gateway that queries across authorized domains simultaneously without leaking restricted data.",
      example:
        "Employee searches for 'remote work equipment budget' -> surfaces HR policy and Finance expense rules simultaneously.",
      ctaHref: "/rag",
      ctaText: "Explore Enterprise RAG",
    },
    {
      title: "Domain AI Assistants",
      category: "Autonomous Agents",
      icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
      problem:
        "Generic chatbots hallucinate or provide generic answers without department context or organizational ground truth.",
      solution:
        "NexusRAG provides domain-tailored agents equipped with custom system prompts, specialized tools, and strict knowledge scoping.",
      example:
        "Specialized AI agents resolve complex multi-step queries with citations back to verified enterprise documents.",
      ctaHref: "/ai",
      ctaText: "Explore AI Assistants",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "Use Cases" }]} />
      </div>

      <HeroSection
        badge="Enterprise Applications"
        title="Proven AI Use Cases for"
        highlightedWord="Modern Organizations"
        subtitle="Discover how enterprise teams leverage NexusRAG to accelerate operations, streamline compliance, and empower employees with source-verified knowledge."
        primaryCtaText="Explore Solutions"
        primaryCtaHref="/solutions"
        secondaryCtaText="Request a Demo"
        secondaryCtaHref="/contact"
      />

      {/* Use Cases Grid */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Real-World Impact"
            title="Engineered for High-Consequence Knowledge"
            subtitle="Explore how domain-isolated RAG solves specific operational friction across business units."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {useCases.map((uc, idx) => (
              <Card
                key={idx}
                className="p-6 sm:p-8 flex flex-col justify-between border-slate-800 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                        {uc.icon}
                      </div>
                      <div>
                        <span className="text-[11px] font-mono uppercase text-blue-400 font-semibold">
                          {uc.category}
                        </span>
                        <h4 className="text-lg font-bold text-white">
                          {uc.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5 my-5 text-xs sm:text-sm">
                    <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-slate-300">
                      <span className="text-red-400 font-bold block mb-1">Problem:</span>
                      {uc.problem}
                    </div>

                    <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 text-slate-300">
                      <span className="text-blue-400 font-bold block mb-1">NexusRAG Solution:</span>
                      {uc.solution}
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-slate-300">
                      <span className="text-emerald-400 font-bold block mb-1">Example Interaction:</span>
                      <span className="font-mono text-xs text-slate-200">{uc.example}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    href={uc.ctaHref}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>{uc.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Have a Unique Enterprise Use Case?"
        subtitle="Our solutions architecture team can design a custom domain blueprint for your organization."
      />
    </div>
  );
}
