"use client";

import React, { useState } from "react";
import {
  User,
  Building,
  Layers,
  ShieldCheck,
  Database,
  Search,
  Filter,
  FileCheck,
  Sparkles,
  Cpu,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function RAGPipeline() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      num: 1,
      title: "User Prompt",
      icon: User,
      category: "Context Identification",
      desc: "Employee or client submits a query from their domain portal.",
      detail: "Captures user identity token, session context, and request query.",
    },
    {
      num: 2,
      title: "Tenant Check",
      icon: Building,
      category: "Tenant Boundary",
      desc: "Validates tenant workspace and multi-tenant schema isolation.",
      detail: "Ensures tenant A can never cross-pollinate with tenant B data.",
    },
    {
      num: 3,
      title: "Domain Scope",
      icon: Layers,
      category: "Domain Boundary",
      desc: "Maps query to HR, Finance, IT, Legal, or Operations domain.",
      detail: "Confines the retrieval target to domain-specific knowledge indexes.",
    },
    {
      num: 4,
      title: "RBAC & Access",
      icon: ShieldCheck,
      category: "Authorization",
      desc: "Evaluates role permissions before any retrieval is performed.",
      detail: "Strict policy filter: only documents permitted for user's role are retrieved.",
    },
    {
      num: 5,
      title: "Domain Knowledge",
      icon: Database,
      category: "Vector Store",
      desc: "Queries the isolated domain vector database and text index.",
      detail: "Targeted embeddings comparison against domain document chunks.",
    },
    {
      num: 6,
      title: "Hybrid Retrieval",
      icon: Search,
      category: "Search Strategy",
      desc: "Dense semantic vector retrieval combined with keyword BM25.",
      detail: "Ensures high recall for both exact terms and conceptual questions.",
    },
    {
      num: 7,
      title: "Re-ranking",
      icon: Filter,
      category: "Precision Engine",
      desc: "Cross-encoder re-ranking scores the most authoritative passages.",
      detail: "Removes noise, filters duplicates, and preserves high-signal chunks.",
    },
    {
      num: 8,
      title: "Domain AI Agent",
      icon: Sparkles,
      category: "Agentic Reasoning",
      desc: "Domain-tailored agent receives verified context and system prompt.",
      detail: "Applies specialized business rules and domain context instructions.",
    },
    {
      num: 9,
      title: "Answer + Sources",
      icon: CheckCircle2,
      category: "Grounded Output",
      desc: "Generates hallucination-free response with clickable document citations.",
      detail: "Every claim links directly to its source chunk with permission-verified citations.",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400">
            Permission-Aware Architecture
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Enterprise RAG Execution Pipeline
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Boundary Enforcement</span>
        </div>
      </div>

      {/* Desktop Horizontal Interactive Stepper */}
      <div className="hidden lg:block mb-8">
        <div className="grid grid-cols-9 gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "flex flex-col items-center text-center p-3 rounded-xl border transition-all cursor-pointer relative",
                  isSelected
                    ? "border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-colors",
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 mb-0.5">
                  0{step.num}
                </span>
                <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed step inspector card */}
        <div className="mt-6 p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              {React.createElement(steps[activeStep].icon, { className: "w-6 h-6" })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-900">
                  Step 0{steps[activeStep].num} • {steps[activeStep].category}
                </span>
                <h4 className="text-base font-bold text-white">
                  {steps[activeStep].title}
                </h4>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                {steps[activeStep].desc}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {steps[activeStep].detail}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded border border-slate-800 shrink-0">
            Stage {activeStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      {/* Mobile Vertical Numbered Timeline */}
      <div className="lg:hidden space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-800 bg-slate-900/50"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono text-blue-400">
                    0{step.num}. {step.category}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-white mb-1">
                  {step.title}
                </h5>
                <p className="text-xs text-slate-300 mb-1">{step.desc}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer distinction note */}
      <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Every retrieval query is checked for Tenant ID + Domain ID + User Role ACL before execution.
          </span>
        </div>
        <span className="font-mono text-[11px] text-blue-400">
          Zero cross-tenant leakage guarantee
        </span>
      </div>
    </div>
  );
}
