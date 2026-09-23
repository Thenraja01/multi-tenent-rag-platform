import React from "react";
import { Metadata } from "next";
import {
  Building2,
  KeyRound,
  ShieldAlert,
  Users2,
  Layers3,
  FileBox,
  FileCode2,
  ScanLine,
  FileSpreadsheet,
  ScissorsLineDashed,
  Cpu,
  Database,
  SearchCode,
  Sparkles,
  ClipboardList,
  Activity,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";

export const metadata: Metadata = {
  title: "Platform Overview — Core Multi-Tenant Architecture",
  description:
    "Explore the NexusRAG core platform infrastructure: tenant management, document OCR, semantic chunking, vector storage, and domain-level RBAC.",
};

export default function PlatformPage() {
  const platformModules = [
    {
      category: "Tenant & Identity Governance",
      features: [
        {
          title: "Tenant Management",
          description: "Provision, configure, and isolate distinct client organizations with separate schema namespaces.",
          icon: <Building2 className="w-5 h-5" />,
          badge: "Core",
        },
        {
          title: "Authentication",
          description: "Secure session management, JWT authentication, and token verification across domain boundaries.",
          icon: <KeyRound className="w-5 h-5" />,
          badge: "Security",
        },
        {
          title: "Authorization & RBAC",
          description: "Fine-grained access control policies evaluated dynamically at tenant and domain levels.",
          icon: <ShieldAlert className="w-5 h-5" />,
          badge: "Access",
        },
        {
          title: "User & Role Management",
          description: "Hierarchical user assignment, role delegations, and group permissions across departments.",
          icon: <Users2 className="w-5 h-5" />,
          badge: "Identity",
        },
      ],
    },
    {
      category: "Domain Registry & Workflows",
      features: [
        {
          title: "Domain Registration",
          description: "Plug-and-play registration of independent business domains (HR, Finance, IT, Legal, Custom).",
          icon: <Layers3 className="w-5 h-5" />,
          badge: "Modular",
        },
        {
          title: "Document Management",
          description: "Multi-format ingestion pipeline supporting PDFs, spreadsheets, Word documents, and text files.",
          icon: <FileBox className="w-5 h-5" />,
          badge: "Ingestion",
        },
        {
          title: "File Processing & Sanitization",
          description: "Automated MIME verification, file integrity validation, and content normalization.",
          icon: <FileCode2 className="w-5 h-5" />,
          badge: "Pipeline",
        },
        {
          title: "OCR & Text Extraction",
          description: "Optical Character Recognition preserving layout, structural headers, and table formatting.",
          icon: <ScanLine className="w-5 h-5" />,
          badge: "OCR",
        },
      ],
    },
    {
      category: "Document Intelligence & Vector Core",
      features: [
        {
          title: "Content Extraction",
          description: "High-fidelity extraction of complex documents, structured tables, and embedded diagrams.",
          icon: <FileSpreadsheet className="w-5 h-5" />,
          badge: "Parsing",
        },
        {
          title: "Semantic Chunking",
          description: "Recursive and Markdown chunking strategies with contextual token overlap.",
          icon: <ScissorsLineDashed className="w-5 h-5" />,
          badge: "Chunking",
        },
        {
          title: "Embeddings Generation",
          description: "Dense vector representations generated via high-performance enterprise embedding models.",
          icon: <Cpu className="w-5 h-5" />,
          badge: "Vectors",
        },
        {
          title: "Vector Storage",
          description: "Partitioned pgvector indexing with HNSW/IVFFlat algorithms for sub-millisecond retrieval.",
          icon: <Database className="w-5 h-5" />,
          badge: "Database",
        },
      ],
    },
    {
      category: "Enterprise RAG & AI Execution",
      features: [
        {
          title: "RAG Retrieval Engine",
          description: "Hybrid vector + BM25 keyword retrieval with cross-encoder re-ranking and ACL filtering.",
          icon: <SearchCode className="w-5 h-5" />,
          badge: "Retrieval",
        },
        {
          title: "LLM Integration",
          description: "Standardized orchestration with domain system prompts and hallucination-guard rails.",
          icon: <Sparkles className="w-5 h-5" />,
          badge: "Inference",
        },
        {
          title: "Audit Logging",
          description: "Immutable query logs recording prompt, retrieved chunks, user role, and generated citations.",
          icon: <ClipboardList className="w-5 h-5" />,
          badge: "Audit",
        },
        {
          title: "Usage Monitoring & Health",
          description: "Real-time telemetry on token consumption, query latency, and domain resource utilization.",
          icon: <Activity className="w-5 h-5" />,
          badge: "Telemetry",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "Platform" }]} />
      </div>

      <HeroSection
        badge="Core Infrastructure"
        title="The Core Platform Behind"
        highlightedWord="Enterprise AI"
        subtitle="NexusRAG standardizes security, document ingestion, vector storage, and permission-aware retrieval — allowing business domains to operate independently on a shared, robust foundation."
        primaryCtaText="Explore Solutions"
        primaryCtaHref="/solutions"
        secondaryCtaText="View Architecture"
        secondaryCtaHref="/architecture"
      />

      {/* Architecture Visualizer */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Unified Platform Engine"
            title="Shared Services. Dedicated Domain Execution."
            subtitle="Understand how common platform components power distinct domain knowledge bases without cross-contamination."
          />
          <ArchitectureDiagram />
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto space-y-16">
          {platformModules.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="flex items-center gap-3 mb-8 pb-3 border-b border-slate-800/80">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {group.category}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {group.features.map((feat, fIdx) => (
                  <FeatureCard
                    key={fIdx}
                    icon={feat.icon}
                    title={feat.title}
                    description={feat.description}
                    badge={feat.badge}
                    badgeVariant="blue"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <CTASection
        title="Ready to Scale Your Knowledge Infrastructure?"
        subtitle="Talk to our team about deploying NexusRAG within your enterprise environment."
      />
    </div>
  );
}
