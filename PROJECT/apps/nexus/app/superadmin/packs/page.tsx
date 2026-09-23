'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  Boxes,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  Sliders,
  DollarSign
} from 'lucide-react';
import { superadminApi } from '@/lib/api/superadmin';
import { apiClient } from '@/lib/api/client';

export default function SuperAdminPacksPage() {
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const data = await superadminApi.getPlans();
      setPacks(data || []);
    } catch (err) {
      console.error('Failed to fetch packs from backend API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const filtered = packs.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Department Capability Packs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-packaged bundles of business domains, modules, and RAG capabilities provisioned to tenant organizations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPacks}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-xs transition"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <Link
            href="/superadmin/packs/new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Department Pack</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Packs</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{packs.length}</span>
              <span className="text-[11px] font-bold text-slate-400">Live Backend API</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Active Templates</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{packs.filter(p => p.status !== 'INACTIVE').length}</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Deployable</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Modularity</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">Dynamic</span>
              <span className="text-[11px] font-bold text-slate-400">Pluggable</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Isolation</span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-purple-700">Multi-Domain RLS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search packs by department, name, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Grid of Department Packs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading live capability packs from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No packs registered. Click "Create Department Pack" to build one.
          </div>
        ) : (
          filtered.map((pack) => (
            <div
              key={pack.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {pack.status || 'ACTIVE'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {pack.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {pack.description || 'Pre-configured capability suite with integrated RAG pipeline and domain isolation.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Included Modules</span>
                    <span className="font-bold text-slate-700">{pack.modules?.length || pack.modules_count || 4} Modules</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Domain Verticals</span>
                    <span className="font-bold text-slate-700">{pack.domains?.length || pack.domains_count || 2} Domains</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">RAG Vector Access</span>
                    <span className="font-bold text-emerald-600">Enabled</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-900">
                  {pack.price_cents ? `$${(pack.price_cents / 100).toFixed(0)}/mo` : 'Enterprise Tier'}
                </span>
                <Link
                  href={`/superadmin/packs/${pack.id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                >
                  <span>Configure</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
