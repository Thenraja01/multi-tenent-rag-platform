"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  ScanText,
  Scissors,
  Cpu,
  Database,
  Layers,
  Search,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DocumentPipeline() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const stages = [
    {
      step: 1,
      title: "Document Ingestion",
      icon: UploadCloud,
      formats: "PDF, DOCX, XLSX, TXT, CSV, Scanned TIFF",
      desc: "Secure upload through tenant-isolated domain endpoints with MIME validation and malware filtering.",
    },
    {
      step: 2,
      title: "Pre-Processing & Validation",
      icon: FileText,
      formats: "Structure Analysis",
      desc: "Document sanity checks, metadata tagging (author, domain, classification), and character decoding.",
    },
    {
      step: 3,
      title: "OCR & Content Extraction",
      icon: ScanText,
      formats: "Multi-Language Optical Recognition",
      desc: "High-accuracy layout-aware extraction preserving tables, headers, and semantic document hierarchies.",
    },
    {
      step: 4,
      title: "Semantic Chunking",
      icon: Scissors,
      formats: "Recursive / Markdown Chunking",
      desc: "Intelligent paragraph and section-aware splitting with dynamic token overlap to preserve contextual continuity.",
    },
    {
      step: 5,
      title: "Vector Embeddings",
      icon: Cpu,
      formats: "Dense & Sparse Representations",
      desc: "High-dimensional mathematical vector representation generated via enterprise embedding models.",
    },
    {
      step: 6,
      title: "Isolated Vector Storage",
      icon: Database,
      formats: "pgvector & Domain Partitioning",
      desc: "Storage in tenant-isolated database partitions indexed with HNSW or IVFFlat for sub-millisecond retrieval.",
    },
    {
      step: 7,
      title: "Domain Knowledge Base",
      icon: Layers,
      formats: "Categorized Domain Repositories",
      desc: "Organized knowledge units tagged with RBAC permission levels ready for authoritative query resolution.",
    },
    {
      step: 8,
      title: "RAG Retrieval Ready",
      icon: Search,
      formats: "Hybrid Search & Re-ranking",
      desc: "Active index primed to serve grounded context to domain-specific AI agents in real time.",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Document Intelligence Engine
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Enterprise Ingestion to Knowledge Base Pipeline
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
          8 Processing Stages
        </div>
      </div>

      {/* Desktop Grid with Selector */}
      <div className="hidden md:grid grid-cols-4 gap-3 mb-6">
        {stages.map((st, i) => {
          const Icon = st.icon;
          const isCurrent = activeStep === i;
          return (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                isCurrent
                  ? "border-emerald-500/80 bg-emerald-950/20 ring-1 ring-emerald-500/50"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-emerald-400">0{st.step}</span>
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isCurrent ? "text-emerald-400" : "text-slate-400"
                  )}
                />
              </div>
              <div className="text-xs font-bold text-white mb-1">{st.title}</div>
              <div className="text-[10px] text-slate-400 line-clamp-1">{st.formats}</div>
            </button>
          );
        })}
      </div>

      {/* Selected stage callout on desktop */}
      <div className="hidden md:block p-5 rounded-xl border border-slate-800 bg-slate-900/70 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            {React.createElement(stages[activeStep].icon, { className: "w-6 h-6" })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Phase {stages[activeStep].step}
              </span>
              <h4 className="text-base font-bold text-white">
                {stages[activeStep].title}
              </h4>
            </div>
            <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
              {stages[activeStep].desc}
            </p>
            <div className="mt-2 text-xs font-mono text-slate-400">
              Format / Process: <span className="text-slate-200">{stages[activeStep].formats}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Stacked Numbered Cards */}
      <div className="md:hidden space-y-3">
        {stages.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-mono text-emerald-400">
                  Step 0{st.step}
                </span>
                <h5 className="text-sm font-bold text-white mb-1">{st.title}</h5>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">{st.desc}</p>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 inline-block">
                  {st.formats}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Preserves semantic context, citation page numbers, and original document formatting.
        </span>
      </div>
    </div>
  );
}
