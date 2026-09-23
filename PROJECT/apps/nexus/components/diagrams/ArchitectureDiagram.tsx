"use client";

import React, { useState } from "react";
import { Server, Layers, Database, Sparkles, Shield, Cpu, ArrowDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ArchitectureDiagram() {
  const [activeDomain, setActiveDomain] = useState<string>("hr");

  const domains = [
    {
      id: "hr",
      name: "HR Domain",
      description: "Scoped employee data, onboarding workflows, leave tracking & HR assistant.",
      badge: "Port 8001 / Domain App",
      kb: "HR Knowledge Base",
      agent: "HR Specialist AI",
    },
    {
      id: "finance",
      name: "Finance Domain",
      description: "Financial reports, invoice retrieval, accounting policies & budget assistant.",
      badge: "Port 8002 / Domain App",
      kb: "Finance Knowledge Base",
      agent: "Finance Analyst AI",
    },
    {
      id: "it",
      name: "IT Domain",
      description: "Infrastructure runbooks, incident response, API docs & tech support assistant.",
      badge: "Port 8003 / Domain App",
      kb: "IT Knowledge Base",
      agent: "IT Support AI",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
      {/* Top tier: Core Platform */}
      <div className="relative rounded-xl border border-blue-500/30 bg-blue-950/30 p-5 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-bold text-white">
                  NexusRAG Core Platform Infrastructure
                </h4>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Shared Foundation
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Centralized services shared securely across all client organizations & domains
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium">Tenant Auth & RBAC</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-slate-300 font-medium">OCR & Chunking Engine</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-slate-300 font-medium">Vector Storage & Embeddings</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300 font-medium">Audit Telemetry & Logs</span>
          </div>
        </div>
      </div>

      {/* Downward connector arrows */}
      <div className="flex justify-around items-center my-2 text-blue-400/60">
        <div className="flex flex-col items-center">
          <ArrowDown className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-500 uppercase">Domain Boundary</span>
        </div>
        <div className="hidden sm:flex flex-col items-center">
          <ArrowDown className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-500 uppercase">Domain Boundary</span>
        </div>
        <div className="flex flex-col items-center">
          <ArrowDown className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-500 uppercase">Domain Boundary</span>
        </div>
      </div>

      {/* Domain Cards Tier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {domains.map((dom) => {
          const isSelected = activeDomain === dom.id;
          return (
            <div
              key={dom.id}
              onClick={() => setActiveDomain(dom.id)}
              className={cn(
                "p-5 rounded-xl border transition-all cursor-pointer relative",
                isSelected
                  ? "border-blue-500 bg-slate-900 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/50"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/40">
                  {dom.badge}
                </span>
                {isSelected && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </div>

              <h5 className="text-base font-bold text-white mb-1.5">{dom.name}</h5>
              <p className="text-xs text-slate-400 mb-4">{dom.description}</p>

              <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-mono text-[11px]">{dom.kb}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-mono text-[11px]">{dom.agent}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Independent Business Logic & Isolation per Domain</span>
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          Domain State Isolated & RBAC Scoped
        </span>
      </div>
    </div>
  );
}
