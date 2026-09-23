import React from "react";
import { Metadata } from "next";
import {
  Search,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Cpu,
  Layers,
  Building,
  UserCheck,
  Lock,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RAGPipeline } from "@/components/diagrams/RAGPipeline";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Enterprise RAG — Permission-Aware Knowledge Boundaries",
  description:
    "NexusRAG enforces multi-tenant boundary verification, domain scoping, and role-based access checks before executing hybrid retrieval and LLM synthesis.",
};

export default function EnterpriseRAGPage() {
  const boundaryQuestions = [
    {
      q: "Which Tenant?",
      icon: Building,
      desc: "Validates the client organization's workspace, cryptographic namespace, and database schema.",
    },
    {
      q: "Which Domain?",
      icon: Layers,
      desc: "Routes the request specifically to HR, Finance, IT, Legal, Operations, or Custom domain indexes.",
    },
    {
      q: "Which User?",
      icon: UserCheck,
      desc: "Authenticates user session, department assignment, and active organizational identity.",
    },
    {
      q: "Which Role & ACL?",
      icon: Lock,
      desc: "Filters document chunks based on exact role-based permissions prior to vector search.",
    },
    {
      q: "Which Knowledge?",
      icon: Search,
      desc: "Queries the isolated vector partition with hybrid semantic + keyword re-ranking.",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "Enterprise RAG" }]} />
      </div>

      <HeroSection
        badge="Permission-Aware RAG Engine"
        title="Enterprise RAG With"
        highlightedWord="Knowledge Boundaries"
        subtitle="Traditional RAG retrieves text based on similarity alone. NexusRAG verifies tenant identity, domain scope, and user permissions before executing hybrid retrieval and generating source-backed answers."
        primaryCtaText="Request RAG Demo"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore Security"
        secondaryCtaHref="/security"
      />

      {/* Traditional vs NexusRAG Comparison */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="The Architectural Difference"
            title="Beyond Basic Semantic Search"
            subtitle="Understand why enterprise AI requires boundary verification at every stage of the retrieval loop."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional RAG */}
            <Card className="p-6 border-red-500/20 bg-red-950/10">
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Traditional Generic RAG</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Flat Document Ingestion & Naive Retrieval
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                Dumps all organizational files into a single vector database. Any user prompt executes an open search across all chunks, risking catastrophic cross-department data leakage.
              </p>
              <ul className="space-y-2 text-xs text-red-300/80">
                <li className="flex items-center gap-2">✕ No multi-tenant physical/logical boundary</li>
                <li className="flex items-center gap-2">✕ No domain-scoped knowledge indexing</li>
                <li className="flex items-center gap-2">✕ Ignores user role & access control lists</li>
                <li className="flex items-center gap-2">✕ Blind similarity scoring without re-ranking</li>
              </ul>
            </Card>

            {/* NexusRAG Enterprise RAG */}
            <Card className="p-6 border-emerald-500/30 bg-emerald-950/15">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>NexusRAG Enterprise RAG</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Permission-Aware & Domain-Isolated RAG
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Enforces strict tenant isolation, routes queries to dedicated domain knowledge bases, and validates role permissions before returning source-verified answers.
              </p>
              <ul className="space-y-2 text-xs text-emerald-300">
                <li className="flex items-center gap-2">✓ Strict tenant schema partitioning</li>
                <li className="flex items-center gap-2">✓ Independent domain knowledge boundaries</li>
                <li className="flex items-center gap-2">✓ Dynamic RBAC evaluation at query time</li>
                <li className="flex items-center gap-2">✓ Hybrid dense + sparse search with cross-encoder re-ranking</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* 5 Knowledge Boundary Questions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="Boundary Verification"
            title="The 5 Questions NexusRAG Evaluates Before Every Query"
            subtitle="NexusRAG evaluates every incoming query through five rigorous identity and permission gates."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {boundaryQuestions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h5 className="text-sm font-bold text-white mb-2">
                      {item.q}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 mt-4 pt-2 border-t border-slate-800/80">
                    Gate 0{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive RAG Pipeline Visualization */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Execution Pipeline"
            title="End-to-End Enterprise RAG Flow"
            subtitle="Follow the exact 9-step execution lifecycle from prompt ingestion to hallucination-free citation response."
          />
          <RAGPipeline />
        </div>
      </section>

      <CTASection
        title="Experience True Enterprise RAG Grounding"
        subtitle="Bring reliable, hallucination-resistant AI intelligence to your organization's knowledge base."
      />
    </div>
  );
}
