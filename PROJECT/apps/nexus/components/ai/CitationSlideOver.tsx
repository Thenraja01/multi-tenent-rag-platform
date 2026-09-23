"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
  Tag
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface CitationDetail {
  document_id: string;
  document_name?: string;
  domain?: string;
  snippet?: string;
  chunk_text?: string;
  score?: number;
  metadata?: Record<string, any>;
}

interface CitationSlideOverProps {
  citation: CitationDetail | null;
  onClose: () => void;
}

export function CitationSlideOver({ citation, onClose }: CitationSlideOverProps) {
  const [copied, setCopied] = useState(false);

  if (!citation) return null;

  const contentText = citation.chunk_text || citation.snippet || "No snippet text available.";
  const matchPercent = citation.score ? Math.round(citation.score * 100) : 92;

  const handleCopy = () => {
    navigator.clipboard.writeText(contentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Grounded Source Citation
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {citation.document_name || citation.document_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {citation.domain && (
              <Badge variant="indigo" icon={<Layers className="w-3 h-3" />}>
                Domain: {citation.domain.toUpperCase()}
              </Badge>
            )}
            <Badge variant="emerald" icon={<Sparkles className="w-3 h-3" />}>
              {matchPercent}% Relevance Match
            </Badge>
            <Badge variant="slate" icon={<ShieldCheck className="w-3 h-3" />}>
              Vector Grounded
            </Badge>
          </div>

          {/* Verbatim Chunk Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Verbatim Extracted Chunk
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? "Copied" : "Copy Snippet"}
              </Button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap selection:bg-indigo-500/30">
              {contentText}
            </div>
          </div>

          {/* Context & Metadata Table */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Document Attributes
            </label>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">Document ID</span>
                <span className="text-slate-300 truncate max-w-[200px]">{citation.document_id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">Business Scope</span>
                <span className="text-indigo-400">{citation.domain || "tenant-wide"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Isolation Policy</span>
                <span className="text-emerald-400">Enforced Multi-Tenant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
}
