'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Building2,
  Plus,
  ArrowLeft,
  Mail,
  Phone,
  FileCheck,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function VendorsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'supernova';
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form state
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [taxId, setTaxId] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [paymentTerms, setPaymentTerms] = useState<number>(30);
  const [category, setCategory] = useState<string>('Cloud & IT Services');

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['finance-vendors', tenantSlug],
    queryFn: () => api.finance.getVendors(),
  });

  const createVendorMutation = useMutation({
    mutationFn: (data: any) => api.finance.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-vendors'] });
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setName('');
    setCode('');
    setTaxId('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setPaymentTerms(30);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createVendorMutation.mutate({
      name,
      code,
      tax_id: taxId,
      contact_person: contactPerson,
      email,
      phone,
      category,
      payment_terms_days: paymentTerms,
    });
  };

  const filteredVendors = vendors.filter((v: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.name?.toLowerCase().includes(q) ||
      v.code?.toLowerCase().includes(q) ||
      v.tax_id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Link href={`/${tenantSlug}/finance`} className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Finance Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <span>Supplier & Vendor Master Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified corporate tax IDs, statutory MSME terms, contact points, and master service agreements
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Vendor</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800 focus-within:border-emerald-500">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search suppliers by name, code, GSTIN / Tax ID..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredVendors.map((v: any) => (
          <div
            key={v.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{v.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {v.status}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">{v.code} • {v.category}</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Net {v.payment_terms_days} Days
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
              {v.tax_id && (
                <div className="flex items-center justify-between">
                  <span>GSTIN / Tax ID:</span>
                  <span className="text-white font-bold">{v.tax_id}</span>
                </div>
              )}
              {v.contact_person && (
                <div className="flex items-center justify-between">
                  <span>Contact:</span>
                  <span className="text-slate-200">{v.contact_person}</span>
                </div>
              )}
              {v.email && (
                <div className="flex items-center justify-between">
                  <span>Email:</span>
                  <span className="text-slate-200">{v.email}</span>
                </div>
              )}
              {v.phone && (
                <div className="flex items-center justify-between">
                  <span>Phone:</span>
                  <span className="text-slate-200">{v.phone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Register Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Register Commercial Vendor</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-500 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. DataCore Solutions"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Vendor Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VEN-005"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="27AABCT3518Q1ZQ"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="billing@supplier.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Payment Terms (Days)</label>
                  <input
                    type="number"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(parseInt(e.target.value) || 30)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVendorMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition"
                >
                  {createVendorMutation.isPending ? 'Registering...' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
