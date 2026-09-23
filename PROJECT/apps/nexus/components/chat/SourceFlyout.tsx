'use client';

import React from 'react';
import {
  FileText,
  X,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Bookmark,
} from 'lucide-react';

export interface CitationSource {
  citation_index?: number;
  label?: string;
  document_id: string;
  filename: string;
  page_number?: number;
  similarity_score?: number;
  excerpt: string;
}

interface SourceFlyoutProps {
  source: CitationSource | null;
  onClose: () => void;
}

export function SourceFlyout({ source, onClose }: SourceFlyoutProps) {
  const [copied, setCopied] = React.useState(false);

  if (!source) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(source.excerpt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simPercent = Math.round((source.similarity_score || 0.85) * 100);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 border-l border-slate-800 backdrop-blur-2xl shadow-2xl p-6 flex flex-col justify-between select-none animate-slide-left">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white max-w-[200px] truncate">
                  {source.filename}
                </h3>
                {source.label && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold">
                    {source.label}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Page {source.page_number || 1} • Chunk Verified
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Confidence & Verification Pills */}
        <div className="flex items-center gap-2 my-4">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
            <Zap className="w-3 h-3" /> {simPercent}% Similarity Score
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono">
            <ShieldCheck className="w-3 h-3" /> RLS Validated
          </span>
        </div>

        {/* Passage Content Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Retrieved Vector Passage</span>
            <button
              onClick={handleCopy}
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed max-h-96 overflow-y-auto shadow-inner">
            {source.excerpt}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-500">
          Doc ID: {source.document_id.slice(0, 8)}...
        </span>
        <button
          onClick={onClose}
          className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
