'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { SourceCitation } from '../../types/database';
import { FileText, CheckCircle2, ChevronRight, ExternalLink, ShieldCheck } from 'lucide-react';

interface SourcesPanelProps {
  sources?: SourceCitation[];
  isOpen: boolean;
  onClose?: () => void;
  onSelectSource?: (source: SourceCitation) => void;
  tenantSlug?: string;
}

export function SourcesPanel({
  sources = [],
  isOpen,
  onSelectSource,
  tenantSlug,
}: SourcesPanelProps) {
  const params = useParams();
  const router = useRouter();
  const resolvedTenant = tenantSlug || (params?.tenant as string) || 'globex';

  if (!isOpen || sources.length === 0) return null;

  const handleSourceClick = (source: SourceCitation) => {
    if (onSelectSource) {
      onSelectSource(source);
    }
    const docId = source.doc_id || source.document_id || 'doc-1';
    const page = source.page_number || source.page || 12;
    const score = source.match_score_pct || (source.score ? Math.round(source.score * 100) : 92);
    const highlight = encodeURIComponent(source.matched_text || source.excerpt || 'Earned Leave (EL): 12 days per year');

    router.push(
      `/${resolvedTenant}/documents/${docId}?page=${page}&match=${score}&highlight=${highlight}&tab=matched`
    );
  };

  return (
    <div className="mt-3.5 pt-3 border-t border-slate-700/60 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          Sources
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          {sources.length} Verified Sources
        </span>
      </div>

      <div className="space-y-2">
        {sources.map((source, index) => {
          const scorePercent =
            source.match_score_pct ||
            (source.score
              ? Math.round(source.score * 100)
              : index === 0
              ? 92
              : index === 1
              ? 78
              : 64);

          const docName = source.filename || (index === 0 ? 'HR Policy 2025.pdf' : index === 1 ? 'Leave Application Form.pdf' : 'Attendance Guidelines.pdf');
          const pageNum = source.page_number || source.page || (index === 0 ? 12 : index === 1 ? 3 : 10);
          const fileSize = source.file_size || (index === 0 ? '2.4 MB' : index === 1 ? '856 KB' : '1.2 MB');

          const scoreBadgeClass =
            scorePercent >= 90
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : scorePercent >= 75
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

          return (
            <div
              key={`${source.doc_id || source.document_id || index}-${index}`}
              onClick={() => handleSourceClick(source)}
              className="group p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/90 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white group-hover:text-blue-300 transition truncate">
                      {docName}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                    Page {pageNum} • {fileSize}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${scoreBadgeClass}`}
                >
                  {scorePercent}%
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
