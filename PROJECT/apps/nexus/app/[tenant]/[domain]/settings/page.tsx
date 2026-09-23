'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Settings, Cpu, Sliders, Save, Check } from 'lucide-react';

export default function DomainSettingsPage() {
  const params = useParams();
  const domainSlug = (params?.domain as string) || 'hr';
  const [model, setModel] = useState('claude-3-5-sonnet');
  const [temperature, setTemperature] = useState('0.1');
  const [chunkSize, setChunkSize] = useState('1024');
  const [similarityTopK, setSimilarityTopK] = useState('5');
  const [systemPrompt, setSystemPrompt] = useState(
    `You are the expert ${domainSlug.toUpperCase()} AI Assistant for this enterprise. Answer questions strictly based on the provided document excerpts. If information is not in the context, explicitly indicate that.`
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          {domainSlug.toUpperCase()} Domain AI Engine Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Fine-tune RAG generation temperature, chunk window size, and top-K vector retrieval
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">RAG Copilot LLM</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Recommended)</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini (High Speed)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Temperature ({temperature})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full accent-indigo-500"
              />
              <span className="text-[10px] text-slate-500">Lower = More deterministic</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Chunk Window Size
              </label>
              <select
                value={chunkSize}
                onChange={(e) => setChunkSize(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
              >
                <option value="512">512 Tokens</option>
                <option value="1024">1,024 Tokens (Optimal)</option>
                <option value="2048">2,048 Tokens</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Top-K Citations ({similarityTopK})
              </label>
              <select
                value={similarityTopK}
                onChange={(e) => setSimilarityTopK(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
              >
                <option value="3">Top 3 Chunks</option>
                <option value="5">Top 5 Chunks (Balanced)</option>
                <option value="8">Top 8 Chunks (Exhaustive)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Domain System Prompt
            </label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Config Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Engine Parameters</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
