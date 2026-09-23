'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ArrowLeft, FileText, Sparkles, Layers, Shield } from 'lucide-react';

export default function DocumentDetailPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const domainSlug = (params?.domain as string) || 'hr';
  const docId = (params?.id as string) || '';

  const { data: document, isLoading } = useQuery({
    queryKey: ['document', docId],
    queryFn: () => api.documents.getById(docId),
    enabled: !!docId,
  });

  const chunks = (document as any)?.chunks || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        href={`/${tenantSlug}/${domainSlug}/knowledge`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Knowledge Base</span>
      </Link>

      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {document?.filename || `Document #${docId.slice(0, 8)}`}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Domain: {domainSlug.toUpperCase()} • ID: {docId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
            {document?.status || 'Indexed'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
            Vector Embedding Space
          </span>
        </div>
      </div>

      {/* Chunks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Vector Chunks & Embeddings ({chunks.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Dense Cosine Metric</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
            Loading document chunks and embeddings...
          </div>
        ) : chunks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
            No extracted vector chunks available for this document.
          </div>
        ) : (
          chunks.map((chunk: any, idx: number) => (
            <div
              key={chunk.id || chunk.index || idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Chunk #{chunk.index ?? idx}
                  </span>
                  {chunk.page && (
                    <span className="text-slate-400 text-[11px]">Page {chunk.page}</span>
                  )}
                </div>
                {chunk.tokens && (
                  <span className="text-slate-500 font-mono text-[10px]">{chunk.tokens} tokens</span>
                )}
              </div>

              <p className="text-slate-200 leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                {chunk.content || chunk.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
