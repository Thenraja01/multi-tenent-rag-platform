'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export function NexusAICard({ dataScope = 'DOMAIN' }: { dataScope?: string }) {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = (params?.tenant as string) || '';
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/${tenantSlug}/ai?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-indigo-950/40 border border-blue-800/40 backdrop-blur-xl shadow-xl relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              Nexus AI Copilot
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 font-mono">
                RAG ACTIVE
              </span>
            </h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Vector Filter: ACL Pre-Filtered • Scope: {dataScope}
            </span>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
      </div>

      <p className="text-xs text-slate-300 leading-relaxed my-2">
        Ask natural language questions across policy documents, HR benefits, and org guidelines.
        Retrieval strictly verifies role ACLs before synthesis.
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. What is the leave policy for annual vacation?"
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 shrink-0"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span>Pre-filtered retrieval on PostgreSQL pgvector</span>
        <Link
          href={`/${tenantSlug}/ai`}
          className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
        >
          Open AI Copilot <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
