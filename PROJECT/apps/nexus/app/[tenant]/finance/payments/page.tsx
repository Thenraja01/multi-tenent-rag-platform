'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  CreditCard,
  ArrowLeft,
  Clock,
  AlertCircle,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

export default function PaymentsAndAgingPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'supernova';

  const { data: agingData, isLoading: isAgingLoading } = useQuery({
    queryKey: ['finance-receivables-aging', tenantSlug],
    queryFn: () => api.finance.getReceivablesAging(),
  });

  const { data: payments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['finance-payments', tenantSlug],
    queryFn: () => api.finance.getPayments(),
  });

  const buckets = agingData?.buckets || [
    { label: '0–30 Days', amount: 1200000.0, amount_display: '₹12.0 L', count: 8, risk: 'LOW' },
    { label: '31–60 Days', amount: 500000.0, amount_display: '₹5.0 L', count: 3, risk: 'MEDIUM' },
    { label: '61–90 Days', amount: 300000.0, amount_display: '₹3.0 L', count: 2, risk: 'HIGH' },
    { label: '90+ Days (Overdue)', amount: 200000.0, amount_display: '₹2.0 L', count: 1, risk: 'CRITICAL' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto select-none">
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
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>Payments & Accounts Receivable Aging</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Aging bucket categorization, outstanding customer receivables, and vendor disbursement ledger
          </p>
        </div>
      </div>

      {/* Receivables Aging Buckets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Accounts Receivable Aging (AR)</h2>
          <span className="text-xs font-mono font-bold text-emerald-400">
            Total Outstanding: {agingData?.total_display || '₹22.0 L'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {buckets.map((b: any) => {
            const isCritical = b.risk === 'CRITICAL';
            const isHigh = b.risk === 'HIGH';
            const isMedium = b.risk === 'MEDIUM';

            return (
              <div
                key={b.label}
                className={`p-6 rounded-3xl border shadow-xl bg-slate-900/80 space-y-3 ${
                  isCritical
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : isHigh
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : isMedium
                    ? 'border-blue-500/30'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>{b.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400'
                        : isHigh
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {b.risk} RISK
                  </span>
                </div>

                <div className="text-2xl font-black text-white font-mono">
                  {b.amount_display}
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {b.count} customer invoices
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overdue Customers List */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white">Top Overdue Invoices Awaiting Settlement</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase font-mono text-slate-500 border-b border-slate-800 bg-slate-950/60">
              <tr>
                <th className="py-3 px-4">Customer Entity</th>
                <th className="py-3 px-4">Invoice Reference</th>
                <th className="py-3 px-4">Overdue Days</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-medium">
              {(agingData?.top_overdue_customers || []).map((c: any) => (
                <tr key={c.invoice_no} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-bold text-white">{c.customer}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{c.invoice_no}</td>
                  <td className="py-3.5 px-4 font-mono text-rose-400 font-bold">{c.days_overdue} Days</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">₹{c.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Payment reminder dispatch triggered for ${c.customer}`)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition cursor-pointer"
                    >
                      Send Dunning Notice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
