'use client';

import React from 'react';
import {
  Bot,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  Lock,
  Cpu,
  CheckCircle2,
  Activity,
  Globe2,
} from 'lucide-react';

interface AuthVisualShowcaseProps {
  mode?: 'login' | 'register';
}

export function AuthVisualShowcase({ mode = 'login' }: AuthVisualShowcaseProps) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-slate-950 border-r border-slate-800/60 select-none">
      {/* Background Gradients & Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Section: Logo & Badge */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <Bot className="w-6 h-6 text-white drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-tight">NexusRAG</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <Sparkles className="w-2.5 h-2.5" /> v2.4 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Multi-Domain Knowledge Mesh</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="mt-12 space-y-3">
          <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
            {mode === 'login' ? (
              <>
                Accelerate Discovery with <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  Neural Multi-Domain Intelligence
                </span>
              </>
            ) : (
              <>
                Deploy Your Isolated <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  Enterprise Vector Realm
                </span>
              </>
            )}
          </h2>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            {mode === 'login'
              ? 'Real-time hybrid search, isolated pgvector RLS partitions, and multi-tenant cognitive routing in one unified platform.'
              : 'Zero-config provisioning with multi-domain knowledge vaults, SOC 2 compliance, and dedicated tenant namespaces.'}
          </p>
        </div>
      </div>

      {/* Middle Section: Floating Glassmorphism Showcase Cards */}
      <div className="relative z-10 my-8 space-y-4">
        {/* Card 1: Active Neural Routing Status */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/40 ring-1 ring-white/5 transform hover:-translate-y-1 transition duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Cpu className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Neural Query Router</h4>
                <p className="text-[10px] text-slate-400 font-mono">Hybrid Sparse-Dense Embedding</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              99.8% Match
            </div>
          </div>

          {/* Active Domains Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-400" /> Legal & Compliance
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> Healthcare RAG
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-indigo-400" /> Global Finance
            </span>
          </div>
        </div>

        {/* Card 2: Live Latency & Security Vault */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-lg ring-1 ring-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">Search Latency</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white font-mono">11.4ms</span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">↓ 42% faster</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">p99 pgvector HNSW</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-lg ring-1 ring-white/5">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">RLS Security</span>
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white font-mono">Enforced</span>
              <span className="text-[10px] text-blue-400 font-mono font-semibold">Isolated</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">AES-256 Tenant Vault</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Social Proof & Certifications */}
      <div className="relative z-10 pt-6 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar Stack */}
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                JD
              </div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                SR
              </div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold text-white">
                AK
              </div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                +50k
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                {'★'.repeat(5)}
                <span className="text-slate-300 font-bold ml-1 text-xs">4.9/5</span>
              </div>
              <p className="text-[11px] text-slate-400">Trusted by Fortune 500 & Tech Leaders</p>
            </div>
          </div>
        </div>

        {/* Compliance Pills */}
        <div className="flex items-center gap-4 mt-4 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            SOC 2 Type II
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            HIPAA Ready
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            ISO 27001
          </span>
        </div>
      </div>
    </div>
  );
}
