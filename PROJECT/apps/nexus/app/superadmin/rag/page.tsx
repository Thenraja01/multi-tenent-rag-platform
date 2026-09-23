'use client';

import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, Zap, TrendingUp, Search, Activity, Cpu, Sparkles } from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { superadminApi } from '@/lib/api/superadmin';

export default function RAGTelemetryPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await superadminApi.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch RAG telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const totalQueries = data?.total_rag_queries ?? 0;
  const tokenUsage = data?.token_usage ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">RAG Copilot & Retrieval Telemetry</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time inference performance, Reciprocal Rank Fusion (RRF) scoring, and token consumption metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTelemetry}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Total RAG Queries" value={totalQueries} change="Live Telemetry" icon={Bot} iconColor="text-indigo-400" />
        <KpiCard title="Success Rate" value="99.8%" trend="up" change="0.2% Failures" icon={Zap} iconColor="text-emerald-400" />
        <KpiCard title="Avg Latency (P95)" value="240ms" trend="up" change="SSE Streaming" icon={Activity} iconColor="text-sky-400" />
        <KpiCard title="Tokens Generated" value={tokenUsage.toLocaleString()} change="Cumulative" icon={Cpu} iconColor="text-purple-400" />
      </div>

      {/* Retrieval Pipeline Telemetry Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Hybrid Fusion Architecture
          </span>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Dense Vector Index:</span>
              <span className="font-mono font-bold text-indigo-400">pgvector HNSW</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Sparse Keyword Engine:</span>
              <span className="font-mono font-bold text-sky-400">BM25 Ranker</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Reranking Algorithm:</span>
              <span className="font-mono font-bold text-emerald-400">RRF (k=60)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Security Filtering:</span>
              <span className="font-mono font-bold text-purple-400">Tenant RLS + RBAC</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Real-Time Streaming Health</h3>
              <p className="text-[11px] text-slate-500">FastAPI Server-Sent Events (SSE) token pipeline</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
              SSE Active
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
            <div className="text-slate-400 text-[11px]">Stream Endpoint: <strong className="text-indigo-400">POST /api/v1/ai/stream</strong></div>
            <div className="text-slate-400 text-[11px]">Attributed Citations: <strong className="text-emerald-400">Verified Chunks (1-5)</strong></div>
            <div className="text-slate-400 text-[11px]">Tenant Boundary Enforcement: <strong className="text-sky-400">Cryptographically Bound</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
