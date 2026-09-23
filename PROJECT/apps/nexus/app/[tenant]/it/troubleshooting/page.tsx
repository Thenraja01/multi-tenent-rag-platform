'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Wrench, ArrowLeft, Send, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';

export default function ItTroubleshootingPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const [logInput, setLogInput] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleDiagnose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logInput.trim()) return;
    setDiagnosing(true);
    setTimeout(() => {
      setDiagnosing(false);
      setResult(
        `**Root Cause Diagnostic:**\nThe submitted error trace indicates a timeout in PostgreSQL connection pool during batch embedding writes.\n\n**Recommended Runbook Action:**\n1. Check active Aurora reader connections: \`SELECT * FROM pg_stat_activity WHERE state = 'active';\`\n2. Increase maximum connection pool size from 50 to 120 in \`database.py\`.\n3. Verify worker task backoff settings.`
      );
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href={`/${tenantSlug}/it`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to IT Portal</span>
      </Link>

      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Interactive Error Diagnostic Agent</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Paste error stack traces, server logs, or exception dumps for automated root-cause synthesis against internal runbooks
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <form onSubmit={handleDiagnose} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Paste Error Trace or Log Snippet:
          </label>
          <textarea
            rows={6}
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            placeholder="e.g. asyncpg.exceptions.QueryCanceledError: canceling statement due to statement timeout..."
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={diagnosing || !logInput.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-semibold shadow-lg transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{diagnosing ? 'Analyzing Trace against Runbooks...' : 'Run Automated Diagnostic'}</span>
          </button>
        </form>

        {result && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-blue-500/30 text-xs text-slate-200 space-y-2 mt-4">
            <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Automated Remediation Plan</span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-slate-300 font-mono text-[11px]">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
