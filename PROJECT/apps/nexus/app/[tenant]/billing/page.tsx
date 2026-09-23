'use client';

import React from 'react';
import { useBilling } from '@/hooks/use-billing';
import { useTenantStore } from '@/stores/tenant-store';
import { CreditCard, Check, Zap, Shield, ArrowUpRight } from 'lucide-react';

export default function TenantBillingPage() {
  const { tenant } = useTenantStore();
  const { subscription, usage, createCheckout, isCreatingCheckout } = useBilling(tenant?.id);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Subscription & Token Quota</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your enterprise plan, vector storage limits, and monthly AI tokens
        </p>
      </div>

      {/* Active Subscription Summary */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {tenant?.plan || 'Enterprise'} Plan
          </span>
          <h2 className="text-2xl font-bold text-white mt-3">Active Workspace License</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Dedicated PostgreSQL RLS cluster with multi-department vector partitions.
          </p>
        </div>

        <button
          onClick={() =>
            createCheckout({
              plan: 'enterprise',
              success_url: window.location.href,
              cancel_url: window.location.href,
            })
          }
          disabled={isCreatingCheckout}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition flex items-center gap-2 shrink-0"
        >
          <CreditCard className="w-4 h-4" />
          <span>{isCreatingCheckout ? 'Redirecting to Stripe...' : 'Upgrade / Manage in Stripe'}</span>
        </button>
      </div>

      {/* Quota Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Monthly AI Tokens
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">4.8M / 25M</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-indigo-500 h-full w-[19%]" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">19% consumed this cycle</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Activated Domains
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">3 / 5</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full w-[60%]" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">HR, Finance, IT active</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Vector Storage
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">1.2 GB</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-sky-500 h-full w-[24%]" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">pgvector embeddings & chunks</p>
        </div>
      </div>
    </div>
  );
}
