'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSearch } from '@/hooks/use-search';
import { Search, Sparkles, FileText, ArrowRight, BookOpen } from 'lucide-react';

export default function DomainSearchPage() {
  const params = useParams();
  const domainSlug = (params?.domain as string) || 'hr';
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const { results, isLoading, isFetching } = useSearch(activeQuery, domainSlug);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveQuery(query.trim());
    }
  };

  const displayResults = results;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Semantic & Hybrid Knowledge Search
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Execute dense vector similarity and keyword search strictly across {domainSlug.toUpperCase()} documentation
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${domainSlug.toUpperCase()} manuals, policies, or contracts...`}
          className="w-full pl-12 pr-28 py-4 rounded-2xl bg-slate-900 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xl"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
        >
          {isFetching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Results List */}
      <div className="space-y-4">
        {isLoading || isFetching ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-3" />
            Computing cosine similarities across vector embeddings...
          </div>
        ) : displayResults.length === 0 && activeQuery ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No matching semantic chunks found for &ldquo;{activeQuery}&rdquo;.
          </div>
        ) : (
          displayResults.map((r: any, idx: number) => {
            const scorePercent = Math.round((r.score || 0.9) * 100);
            return (
              <div
                key={r.chunk_id || idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg backdrop-blur-md space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-white text-xs">{r.filename}</span>
                    {r.page && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                        Page {r.page}
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {scorePercent}% similarity
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {r.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
