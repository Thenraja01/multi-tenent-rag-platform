'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  ArrowLeft,
  Boxes,
  Layers,
  Sparkles,
  Shield,
  DollarSign,
  CheckCircle2,
  Save,
  HelpCircle
} from 'lucide-react';
import { superadminApi } from '@/lib/api/superadmin';

export default function CreatePackPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('199');
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [doms, mods] = await Promise.all([
          superadminApi.getCatalogDomains(),
          superadminApi.getCatalogModules(),
        ]);
        setDomains(doms || []);
        setModules(mods || []);
        if (doms && doms.length > 0) {
          setSelectedDomains(doms.map((d: any) => d.slug || d.id));
        }
        if (mods && mods.length > 0) {
          setSelectedModules(mods.map((m: any) => m.slug || m.id));
        }
      } catch (err) {
        console.error('Failed to load domains and modules:', err);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await superadminApi.createPlan({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        description,
        price_cents: Math.round(parseFloat(price || '0') * 100),
        billing_interval: billingInterval,
        domains: selectedDomains,
        modules: selectedModules,
      });
      router.push('/superadmin/packs');
    } catch (err) {
      console.error('Failed to create department pack:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/superadmin/packs"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Packs Catalog</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-mono uppercase tracking-widest text-blue-600 font-bold">
              Dynamic Pack Builder
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Department Capability Pack</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure bundled domains, application modules, and pgvector knowledge quotas for tenant provisioning.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pack Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise HR & People Operations Pack"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pack Slug / Key *</label>
              <input
                type="text"
                required
                placeholder="hr_enterprise_pack"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Explain the department capabilities, default knowledge documents, and AI tools included in this pack..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Monthly Price (USD)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  placeholder="199"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Billing Cycle</label>
              <select
                value={billingInterval}
                onChange={(e) => setBillingInterval(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              >
                <option value="monthly">Monthly Recurring</option>
                <option value="annual">Annual Billing (20% Discount)</option>
                <option value="custom">Enterprise Custom Agreement</option>
              </select>
            </div>
          </div>

          {/* Domain Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">Included Domains</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {selectedDomains.length} of {domains.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {domains.map((dom) => {
                const domKey = dom.slug || dom.id;
                const isSelected = selectedDomains.includes(domKey);
                return (
                  <label
                    key={dom.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) setSelectedDomains(selectedDomains.filter((k) => k !== domKey));
                        else setSelectedDomains([...selectedDomains, domKey]);
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">{dom.name || dom.slug}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{dom.slug}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Module Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">Bundled Application Modules</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {selectedModules.length} of {modules.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {modules.map((mod) => {
                const modKey = mod.slug || mod.id;
                const isSelected = selectedModules.includes(modKey);
                return (
                  <label
                    key={mod.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) setSelectedModules(selectedModules.filter((k) => k !== modKey));
                        else setSelectedModules([...selectedModules, modKey]);
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">{mod.name || mod.slug}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{mod.slug}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              href="/superadmin/packs"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Pack...' : 'Publish Department Pack'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
