'use client';

import React from 'react';
import { Workflow, Sparkles, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function OrgAdminWorkflowsPage() {
  const workflows = [
    { name: 'Document Chunking & Vector Ingestion', status: 'Active', trigger: 'On Upload', dept: 'All' },
    { name: 'RRF Hybrid Search Ranking', status: 'Active', trigger: 'On Query', dept: 'All' },
    { name: 'Cross-Encoder Re-Ranking Pipeline', status: 'Active', trigger: 'On Top-K Hits', dept: 'All' },
    { name: 'Ollama / OpenAI Token Streamer', status: 'Active', trigger: 'On Generation', dept: 'All' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI & Pipeline Workflows</h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated processing flows for knowledge retrieval, citation extraction, and vector synthesis
        </p>
      </div>

      <div className="space-y-3">
        {workflows.map((wf) => (
          <Card key={wf.name} className="p-5 bg-slate-900/60 border-slate-800 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Workflow className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{wf.name}</h3>
                <span className="text-[11px] text-slate-400">Trigger: {wf.trigger} &bull; Scope: {wf.dept}</span>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{wf.status}</span>
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
