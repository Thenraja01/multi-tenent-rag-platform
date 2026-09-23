'use client';

import React from 'react';
import { Cpu, Sparkles, Check, Server, Shield, Zap, Layers, RefreshCw } from 'lucide-react';

export default function SuperAdminModelsPage() {
  const models = [
    {
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic Bedrock',
      type: 'Chat & Reasoning LLM',
      context: '200,000 tokens',
      status: 'Active (Default)',
      latency: '~650ms',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      name: 'GPT-4o',
      provider: 'Azure OpenAI',
      type: 'Chat & Extraction LLM',
      context: '128,000 tokens',
      status: 'Active',
      latency: '~520ms',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      name: 'text-embedding-3-large',
      provider: 'Azure OpenAI',
      type: 'Dense Vector Embeddings',
      context: '3,072 dimensions',
      status: 'Active (Embedding Engine)',
      latency: '~120ms',
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      name: 'Cohere Rerank v3',
      provider: 'Cohere API',
      type: 'Cross-Encoder Reranker',
      context: 'Top-50 chunks',
      status: 'Active (Reranker)',
      latency: '~95ms',
      badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-indigo-400" />
            AI & Embedding Models Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure model endpoints, vector dimensions, and routing fallback chains across all tenants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Providers
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((m) => (
          <div
            key={m.name}
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{m.name}</h3>
                    <p className="text-[11px] text-slate-400">{m.provider}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${m.badge}`}>
                  {m.status}
                </span>
              </div>

              <div className="space-y-2.5 mt-5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Model Role:</span>
                  <span className="text-white font-medium">{m.type}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Context / Vector:</span>
                  <span className="text-sky-400 font-mono font-medium">{m.context}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Avg Latency:</span>
                  <span className="text-emerald-400 font-mono font-medium">{m.latency}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Enterprise SLA: 99.99%
              </span>
              <button className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition">
                Configure Chain
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
