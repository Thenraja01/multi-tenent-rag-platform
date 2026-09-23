'use client';

import React from 'react';
import { useDocumentStatus } from '../../hooks/use-documents';
import {
  CheckCircle2,
  Clock,
  Cpu,
  FileCode,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface ProcessingPipelineTrackerProps {
  documentId: string;
  filename: string;
  onRetry?: () => void;
  onClose?: () => void;
}

const STAGES = [
  { id: 'queued', label: 'Queued', icon: Clock },
  { id: 'processing', label: 'Processing', icon: Cpu },
  { id: 'extracting', label: 'Extracting Text', icon: FileCode },
  { id: 'embedding', label: 'Vector Embedding', icon: Sparkles },
  { id: 'done', label: 'Ready', icon: CheckCircle2 },
] as const;

export function ProcessingPipelineTracker({
  documentId,
  filename,
  onRetry,
  onClose,
}: ProcessingPipelineTrackerProps) {
  const { data: statusData, isLoading } = useDocumentStatus(documentId);

  const currentStage = statusData?.stage || 'queued';
  const isFailed = statusData?.status === 'failed';
  const isDone = statusData?.status === 'done';

  const stageIndex = STAGES.findIndex((s) => s.id === currentStage);
  const activeIndex = stageIndex >= 0 ? stageIndex : 0;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white truncate max-w-sm">{filename}</h4>
            <p className="text-xs text-slate-400">RAG Ingestion Pipeline</p>
          </div>
        </div>

        {onClose && isDone && (
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            Dismiss
          </button>
        )}
      </div>

      {isFailed ? (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{statusData?.message || 'Ingestion failed during extraction or embedding.'}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-xs px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stage Progress Pills */}
          <div className="grid grid-cols-5 gap-2">
            {STAGES.map((stg, idx) => {
              const Icon = stg.icon;
              const isPast = idx < activeIndex || isDone;
              const isCurrent = idx === activeIndex && !isDone;

              return (
                <div
                  key={stg.id}
                  className={`flex flex-col items-center text-center p-2 rounded-xl border transition-all ${
                    isPast
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : isCurrent
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/40 border-slate-800 text-slate-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isCurrent ? 'animate-bounce' : ''}`} />
                  <span className="text-[10px] font-medium leading-tight">{stg.label}</span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 h-full transition-all duration-500"
              style={{
                width: isDone ? '100%' : `${Math.max(10, ((activeIndex + 1) / STAGES.length) * 100)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {isDone
                ? 'Document indexed and ready for semantic vector search!'
                : isLoading
                ? 'Connecting to ingestion worker...'
                : `Current phase: ${currentStage}...`}
            </span>
            <span className="font-mono text-slate-500">Auto-refreshing 3s</span>
          </div>
        </div>
      )}
    </div>
  );
}
