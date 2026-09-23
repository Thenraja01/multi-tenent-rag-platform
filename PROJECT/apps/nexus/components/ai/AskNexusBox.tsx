'use client';

import React, { useState } from 'react';
import { Bot, Send, Sparkles, CornerDownLeft, FileText, CheckCircle2 } from 'lucide-react';

interface AskNexusBoxProps {
  moduleName?: string;
  suggestedQueries?: string[];
  placeholder?: string;
  className?: string;
}

export function AskNexusBox({
  moduleName = 'Human Resources',
  suggestedQueries = [
    'What is our current leave policy?',
    'How many employees are on leave today?',
    'Show attendance trends for HR',
    'Find the employee handbook',
  ],
  placeholder = 'Ask anything about policies, team stats, or documents...',
  className = '',
}: AskNexusBoxProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleAsk = (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setResponse(null);

    // Simulate grounded RAG query resolution
    setTimeout(() => {
      setIsLoading(false);
      if (q.toLowerCase().includes('leave')) {
        setResponse(
          `According to the Globex Employee Handbook (v3.2): Standard annual leave allowance is 18 days per fiscal year, accrued monthly. Sick leave allows up to 10 days with manager notification.`
        );
      } else if (q.toLowerCase().includes('handbook') || q.toLowerCase().includes('policy')) {
        setResponse(
          `The official Globex Employee Handbook is indexed in the Document Vault under HR/Policies. It was last updated on Sep 15, 2026.`
        );
      } else {
        setResponse(
          `Grounded response for "${q}": Verified against current ${moduleName} repository records with 98% citation confidence.`
        );
      }
    }, 600);
  };

  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3.5 ${className}`}
    >
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">
              Ask Nexus about {moduleName}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">
              Grounded enterprise RAG retrieval with citation verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" />
          <span>RAG AI</span>
        </div>
      </div>

      {/* Query Input Box */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAsk();
          }}
          placeholder={placeholder}
          className="w-full pl-3.5 pr-20 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
        />
        <button
          onClick={() => handleAsk()}
          disabled={!query.trim() || isLoading}
          className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <CornerDownLeft className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* Suggested Query Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Suggested:
        </span>
        {suggestedQueries.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(item);
              handleAsk(item);
            }}
            className="text-[11px] font-medium text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 px-2.5 py-1 rounded-lg shrink-0 transition cursor-pointer"
          >
            &ldquo;{item}&rdquo;
          </button>
        ))}
      </div>

      {/* AI Answer Box */}
      {response && (
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs text-slate-800 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 font-bold text-blue-700">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Nexus Answer</span>
          </div>
          <p className="text-slate-700 leading-relaxed text-xs">{response}</p>
        </div>
      )}
    </div>
  );
}
