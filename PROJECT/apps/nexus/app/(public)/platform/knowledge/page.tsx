import React from "react";
import { Metadata } from "next";
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  ScanText,
  Scissors,
  Cpu,
  Database,
  Search,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DocumentPipeline } from "@/components/diagrams/DocumentPipeline";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Knowledge Management — Multi-Format Document Intelligence",
  description:
    "Transform unstructured enterprise documents into indexed, domain-scoped vector knowledge with high-accuracy OCR, semantic chunking, and isolated storage.",
};

export default function KnowledgePage() {
  const supportedFormats = [
    {
      title: "PDF Documents",
      desc: "Native and scanned PDFs with multi-column layout detection and table preservation.",
      badge: ".pdf",
    },
    {
      title: "Spreadsheets & Tables",
      desc: "Structured Excel and CSV files parsed into semantic tabular representations.",
      badge: ".xlsx / .csv",
    },
    {
      title: "Word Documents",
      desc: "DOCX agreements, briefs, and manuals with header and paragraph preservation.",
      badge: ".docx",
    },
    {
      title: "Plain Text & Markdown",
      desc: "Technical documentation, code snippets, runbooks, and Markdown wikis.",
      badge: ".txt / .md",
    },
  ];

  const intelligenceCapabilities = [
    {
      title: "Layout-Aware OCR",
      description: "Extract text from high-resolution scans, invoices, receipts, and complex forms without losing spatial relationships.",
      icon: <ScanText className="w-5 h-5" />,
      badge: "Vision OCR",
    },
    {
      title: "Contextual Chunking",
      description: "Break documents into semantically coherent passages with dynamic token overlap, preserving paragraph context.",
      icon: <Scissors className="w-5 h-5" />,
      badge: "Chunking",
    },
    {
      title: "High-Dimensional Embeddings",
      description: "Encode semantic nuances into vector spaces optimized for technical, financial, and legal domain vocabularies.",
      icon: <Cpu className="w-5 h-5" />,
      badge: "Embeddings",
    },
    {
      title: "Partitioned Vector Indexes",
      description: "Maintain separate HNSW/IVFFlat indexes per tenant and domain for instant search and strict boundary isolation.",
      icon: <Database className="w-5 h-5" />,
      badge: "pgvector",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "Knowledge Management" }]} />
      </div>

      <HeroSection
        badge="Document Intelligence"
        title="Turn Enterprise Documents"
        highlightedWord="Into Usable Knowledge"
        subtitle="NexusRAG processes raw, multi-format enterprise files into clean, structured, and permission-aware knowledge bases with high-fidelity OCR, semantic chunking, and vector indexing."
        primaryCtaText="Process Your Docs"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore RAG Flow"
        secondaryCtaHref="/rag"
      />

      {/* Document Pipeline Visualization */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Ingestion Architecture"
            title="The Document-to-Knowledge Pipeline"
            subtitle="Understand every transformation stage that converts unstructured files into grounded retrieval assets."
          />
          <DocumentPipeline />
        </div>
      </section>

      {/* Supported Formats Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Multi-Format Ingestion"
            title="Ingest Any Enterprise Document Type"
            subtitle="NexusRAG normalizes diverse organizational assets into a unified semantic index."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportedFormats.map((fmt, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900 mb-3 inline-block">
                    {fmt.badge}
                  </span>
                  <h4 className="text-base font-bold text-white mb-2">
                    {fmt.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {fmt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Intelligence Features */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Engine Features"
            title="Intelligent Document Extraction"
            subtitle="Engineered for high accuracy across complex tabular and unstructured enterprise assets."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {intelligenceCapabilities.map((item, idx) => (
              <FeatureCard
                key={idx}
                icon={item.icon}
                title={item.title}
                description={item.description}
                badge={item.badge}
                badgeVariant="emerald"
              />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Build Your Domain Knowledge Bases?"
        subtitle="Upload your first document batch and see how NexusRAG constructs an isolated knowledge layer."
      />
    </div>
  );
}
