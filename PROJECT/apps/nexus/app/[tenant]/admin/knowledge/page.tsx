'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  FileText,
  Database,
  Bot,
  Sliders,
  Sparkles,
  Shield,
  Upload,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
  Search
} from 'lucide-react';

export default function AdminKnowledgeRAGPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const [chunkSize, setChunkSize] = useState(512);
  const [topK, setTopK] = useState(5);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.75);
  const [hybridSearch, setHybridSearch] = useState(true);
  const [mandatoryCitations, setMandatoryCitations] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const sampleDocuments = [
    { title: 'Employee_Leave_Handbook_2026.pdf', department: 'HR', version: 'v3.1', chunks: 48, status: 'READY', visibility: 'DEPARTMENT' },
    { title: 'Corporate_Expense_Policy.pdf', department: 'Finance', version: 'v2.0', chunks: 32, status: 'READY', visibility: 'ORGANIZATION' },
    { title: 'Kubernetes_Incident_Runbook.md', department: 'IT', version: 'v1.4', chunks: 64, status: 'READY', visibility: 'DEPARTMENT' },
    { title: 'Master_Service_Agreement_Template.docx', department: 'Legal', version: 'v2.2', chunks: 28, status: 'READY', visibility: 'ROLE (Legal Counsel)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Knowledge Vault & Pure RAG Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero-Trust pre-retrieval vector security, pgvector HNSW indexing, and Default Nexus AI Copilot boundaries.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>RAG and Vector parameters updated in PostgreSQL runtime successfully!</span>
        </div>
      )}

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>INDEXED DOCUMENTS</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">2,868</div>
          <div className="text-[11px] text-slate-400">Partitioned across 4 active domains</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PGVECTOR CHUNKS</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">42,190</div>
          <div className="text-[11px] text-purple-400 font-mono">1536-dim normalized embeddings</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>DEFAULT NEXUS COPILOT</span>
            <Bot className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">Ollama / Llama 3.2</div>
          <div className="text-[11px] text-emerald-400 font-mono">&bull; Grounded Citations Enforced</div>
        </div>
      </div>

      {/* Main Grid: RAG Settings & Document ACL sample */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Vector Retrieval Configuration */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              <span>pgvector & Retrieval Parameters</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Tenant Level</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Chunk Size (tokens)</span>
                <span className="font-mono text-orange-400 font-bold">{chunkSize}</span>
              </div>
              <input
                type="range"
                min="256"
                max="1024"
                step="64"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Top-K Relevant Chunks</span>
                <span className="font-mono text-orange-400 font-bold">{topK}</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="1"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Cosine Similarity Threshold</span>
                <span className="font-mono text-orange-400 font-bold">{similarityThreshold}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer">
                <div>
                  <div className="font-semibold text-white">Hybrid RRF Search</div>
                  <div className="text-[11px] text-slate-400">Reciprocal Rank Fusion (Lexical + Vector)</div>
                </div>
                <input
                  type="checkbox"
                  checked={hybridSearch}
                  onChange={(e) => setHybridSearch(e.target.checked)}
                  className="w-4 h-4 accent-orange-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer">
                <div>
                  <div className="font-semibold text-white">Strict Citation Integrity</div>
                  <div className="text-[11px] text-slate-400">Validate all answer claims against retrieved chunk IDs</div>
                </div>
                <input
                  type="checkbox"
                  checked={mandatoryCitations}
                  onChange={(e) => setMandatoryCitations(e.target.checked)}
                  className="w-4 h-4 accent-orange-500 rounded"
                />
              </label>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors mt-2"
            >
              Save Vector Configurations
            </button>
          </div>
        </div>

        {/* Right: Pre-Retrieval ACL & Document Knowledge Vault */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Pre-Retrieval ACL Inspector</span>
            </h2>
            <Link
              href={`/${tenantSlug}/documents`}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
            >
              Vault &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {sampleDocuments.map((doc, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-white text-xs truncate">{doc.title}</div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 ml-2">
                    {doc.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Domain: {doc.department} &bull; {doc.version}</span>
                  <span className="text-orange-400 font-sans">ACL: {doc.visibility}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
