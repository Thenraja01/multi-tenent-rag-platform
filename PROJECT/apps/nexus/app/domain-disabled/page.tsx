'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Layers,
  ArrowLeft,
  Building2,
  Mail,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const DOMAIN_CATALOG: Record<string, { name: string; desc: string }> = {
  hr: { name: 'HR & People Operations', desc: 'Employee directories, handbook Q&A, and policy RAG.' },
  finance: { name: 'Finance & Accounts Vault', desc: 'Invoices, expense tracking, and budget RAG.' },
  it: { name: 'IT Systems & Runbooks', desc: 'API docs, incident runbooks, and server knowledge.' },
  legal: { name: 'Legal & Compliance Matrix', desc: 'Contracts, NDAs, and regulatory compliance.' },
  operations: { name: 'Operations & Logistics', desc: 'SOPs, supply chain docs, and vendor workflows.' },
};

function DomainDisabledContent() {
  const searchParams = useSearchParams();
  const domainSlug = searchParams.get('domain') || 'requested';
  const tenantSlug = searchParams.get('tenant') || '';
  const domainInfo = DOMAIN_CATALOG[domainSlug.toLowerCase()] || {
    name: `${domainSlug.toUpperCase()} Domain Workspace`,
    desc: 'Specialized enterprise domain knowledge module.',
  };

  const homeHref = tenantSlug ? `/${tenantSlug}/dashboard` : '/dashboard';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center space-y-6">
        {/* Glowing Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto shadow-2xl shadow-amber-500/10">
          <Layers className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Domain Not Provisioned</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {domainInfo.name} is Inactive
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            The <span className="text-amber-300 font-mono font-semibold">"{domainSlug}"</span> domain has not been enabled for{' '}
            <span className="text-white font-semibold">{tenantSlug || 'this organization'}</span> by your platform administrator.
          </p>
        </div>

        {/* Feature info callout */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Domain Overview</span>
          </div>
          <p className="text-xs text-slate-300">
            {domainInfo.desc}
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Status: <strong className="text-rose-400">Disabled / Unsubscribed</strong></span>
            <span>Tenant: <strong className="text-slate-200">{tenantSlug || 'Current Tenant'}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={homeHref}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Active Workspace Dashboard</span>
          </Link>

          <a
            href={`mailto:admin@nexusrag.app?subject=Request%20Activation%20for%20${domainSlug}%20Domain%20-%20${tenantSlug}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Platform Admin</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function DomainDisabledPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Loading domain status...
      </div>
    }>
      <DomainDisabledContent />
    </Suspense>
  );
}
