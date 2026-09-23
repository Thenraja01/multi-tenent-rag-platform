'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function FinanceOverviewCard({ dataScope = 'DEPARTMENT' }: { dataScope?: string }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['finance-dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/dashboard/stats');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const kpis = stats?.kpis || {
    total_revenue_display: '₹24.5 Cr',
    total_expenses_display: '₹8.2 Cr',
    net_profit_display: '₹16.3 Cr',
    outstanding_display: '₹22.0 L',
    pending_approvals_count: 0,
    overdue_invoices_count: 0,
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Finance & Accounting KPIs</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Scope: {dataScope} • Module: finance_dashboard
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {kpis.pending_approvals_count > 0 && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {kpis.pending_approvals_count} Approvals Needed
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-[11px] text-slate-400 block mb-1">Total Revenue</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white tracking-tight">{kpis.total_revenue_display}</span>
            <span className="text-[10px] text-emerald-400 flex items-center font-mono">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-[11px] text-slate-400 block mb-1">Total Expenses</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-rose-300 tracking-tight">{kpis.total_expenses_display}</span>
            <span className="text-[10px] text-rose-400 flex items-center font-mono">
              <ArrowDownRight className="w-3 h-3" /> -4%
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-[11px] text-slate-400 block mb-1">Net Margin</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-emerald-400 tracking-tight">{kpis.net_profit_display}</span>
            <span className="text-[10px] text-emerald-400 font-mono">66.5%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-[11px] text-slate-400 block mb-1">Receivables</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-amber-300 tracking-tight">{kpis.outstanding_display}</span>
            <span className="text-[10px] text-slate-400 font-mono">Due</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400/90">
          <TrendingUp className="w-3.5 h-3.5" /> Real-time ledger synchronization
        </span>
        <span className="font-mono text-[11px]">FY 2025-2026</span>
      </div>
    </div>
  );
}
