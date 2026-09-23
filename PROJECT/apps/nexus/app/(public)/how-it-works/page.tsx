import React from "react";
import { Metadata } from "next";
import {
  Building2,
  Layers,
  Users,
  ShieldCheck,
  FileBox,
  Cpu,
  Search,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "How It Works — The 9-Step Enterprise AI Journey",
  description:
    "Follow the 9-step NexusRAG journey from tenant setup and domain configuration to document processing, permission-aware retrieval, and source-backed answers.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: 1,
      title: "Organization Setup",
      icon: Building2,
      subtitle: "Multi-Tenant Workspace Provisioning",
      desc: "Client organization creates a dedicated tenant namespace with isolated database schemas and administrative credentials.",
    },
    {
      num: 2,
      title: "Domain Selection",
      icon: Layers,
      subtitle: "Modular Department Workspaces",
      desc: "Select and enable the required business domains: HR, Finance, IT Support, Legal, Operations, or Custom Domain applications.",
    },
    {
      num: 3,
      title: "User Directory Integration",
      icon: Users,
      subtitle: "Identity & Department Mapping",
      desc: "Assign enterprise users, team members, and department leads to their respective domain workspaces.",
    },
    {
      num: 4,
      title: "Domain-Level RBAC",
      subtitle: "Role & Permission Governance",
      icon: ShieldCheck,
      desc: "Establish granular access control policies (Admin, Manager, User) for each domain to restrict document visibility.",
    },
    {
      num: 5,
      title: "Document Ingestion",
      icon: FileBox,
      subtitle: "Multi-Format File Ingestion",
      desc: "Upload unstructured PDFs, Word documents, Excel sheets, and text runbooks directly to domain repositories.",
    },
    {
      num: 6,
      title: "Knowledge Processing",
      icon: Cpu,
      subtitle: "OCR, Chunking & Embedding",
      desc: "Platform executes optical character recognition, semantic chunking, and generates high-dimensional embeddings in pgvector.",
    },
    {
      num: 7,
      title: "Hybrid Retrieval",
      icon: Search,
      subtitle: "RBAC-Filtered Search & Re-ranking",
      desc: "When a user asks a question, the platform evaluates user roles and executes hybrid vector + keyword search with cross-encoder re-ranking.",
    },
    {
      num: 8,
      title: "Domain AI Agent",
      icon: Sparkles,
      subtitle: "Specialized Context Reasoning",
      desc: "Domain-specific AI assistant synthesizes the retrieved chunks using customized system prompts and business rules.",
    },
    {
      num: 9,
      title: "Answer + Sources",
      icon: CheckCircle2,
      subtitle: "Grounded, Hallucination-Free Output",
      desc: "User receives a verified, hallucination-resistant answer with exact citations pointing back to source documents and page numbers.",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "How It Works" }]} />
      </div>

      <HeroSection
        badge="End-to-End Enterprise Flow"
        title="From Unstructured Documents"
        highlightedWord="To Grounded Intelligence"
        subtitle="Follow the complete 9-stage lifecycle of how NexusRAG provisions organizational boundaries, transforms documentation into vector knowledge, and powers domain-specific AI."
        primaryCtaText="Get Started"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore RAG Pipeline"
        secondaryCtaHref="/rag"
      />

      {/* 9-Step Journey */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="9-Step Journey"
            title="How NexusRAG Delivers Trusted AI"
            subtitle="Every step is engineered to preserve strict confidentiality, maximize retrieval accuracy, and eliminate hallucinations."
          />

          {/* Desktop Multi-Row Horizontal Timeline */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <Card
                  key={idx}
                  className="p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 font-mono font-bold text-3xl text-slate-800/60 select-none">
                    0{st.num}
                  </div>
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider block mb-1">
                      Step 0{st.num} • {st.subtitle}
                    </span>
                    <h4 className="text-lg font-bold text-white mb-2">
                      {st.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Mobile & Tablet Vertical Stacked Cards */}
          <div className="lg:hidden space-y-4">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-mono text-blue-400 font-bold">
                        Step 0{st.num}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {st.subtitle}
                      </span>
                    </div>
                    <h5 className="text-base font-bold text-white mb-1">
                      {st.title}
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Build Your Organization's 9-Step AI Flow?"
        subtitle="Schedule a technical walkthrough and see NexusRAG in action."
      />
    </div>
  );
}
