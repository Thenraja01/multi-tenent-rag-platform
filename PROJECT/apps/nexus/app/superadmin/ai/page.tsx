'use client';

import React, { useState } from 'react';
import {
  Bot,
  Cpu,
  Sparkles,
  Sliders,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Key,
  Server,
  Zap,
  Save,
} from 'lucide-react';

export default function SuperAdminAIConfigPage() {
  const [provider, setProvider] = useState('Ollama / Self-Hosted');
  const [model, setModel] = useState('llama3.2:3b');
  const [embeddingModel, setEmbeddingModel] = useState('nomic-embed-text');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI & Default Nexus Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure global LLM providers, embedding models, temperature limits, and Default Nexus neural parameters.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition flex items-center gap-2"
        >
          {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved Configuration' : 'Save AI Config'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Default Nexus LLM Gateway</h2>
              <p className="text-xs text-slate-500">Global foundation models for knowledge synthesis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Primary Model Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition font-medium"
              >
                <option value="Ollama / Self-Hosted">Ollama (Local / Self-Hosted)</option>
                <option value="OpenAI">OpenAI (GPT-4o, GPT-4o-mini)</option>
                <option value="Google Gemini">Google Gemini (Gemini 1.5 Pro/Flash)</option>
                <option value="Anthropic">Anthropic (Claude 3.5 Sonnet)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Default Synthesis Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Vector Embedding Model</label>
              <input
                type="text"
                value={embeddingModel}
                onChange={(e) => setEmbeddingModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Max Generation Tokens</label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition font-mono"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">Synthesis Temperature: {temperature}</label>
              <span className="text-slate-400">Strict Grounding (0.0) ── Creative (1.0)</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {/* Info & Guardrails */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900">Zero-Trust Guardrails</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Default Nexus uses strict pre-retrieval server authorization filters. LLM prompts never receive document chunks outside the user&apos;s verified tenant, domain, and department scope.
          </p>

          <div className="space-y-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-bold text-emerald-800">Strict Source Citations Enforced</span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-[11px] font-bold text-blue-800">Hybrid BM25 + pgvector RRF Active</span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center gap-2.5">
              <Server className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-[11px] font-bold text-indigo-800">Tenant-Isolated Chunk Partitioning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
