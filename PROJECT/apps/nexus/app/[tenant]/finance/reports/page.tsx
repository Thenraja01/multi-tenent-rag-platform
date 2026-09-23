'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  PieChart,
  ArrowLeft,
  Download,
  TrendingUp,
  FileText,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';

export default function FinancialReportsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'supernova';

  const { data: reports, isLoading } = useQuery({
    queryKey: ['finance-reports', tenantSlug],
    queryFn: () => api.finance.getReports(),
  });

  const pnl = reports?.profit_and_loss || {
    revenue: 245000000.0,
    cost_of_goods_sold: 121000000.0,
    gross_profit: 124000000.0,
    operating_expenses: 82000000.0,
    operating_profit_ebitda: 42000000.0,
    net_profit_display: '₹3.35 Cr',
    net_margin_pct: 13.67,
  };

  const cashFlow = reports?.cash_flow || {
    operating_cash_flow: 18200000.0,
    investing_cash_flow: -4500000.0,
    financing_cash_flow: -2000000.0,
    net_cash_flow_display: '₹1.17 Cr',
  };

  const deptRevenue = reports?.revenue_by_department || [
    { department: 'Enterprise AI Solutions', revenue: 145000000.0, pct: 59.2 },
    { department: 'Cloud Support & Ops', revenue: 60000000.0, pct: 24.5 },
    { department: 'Consulting & Implementation', revenue: 40000000.0, pct: 16.3 },
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
            <PieChart className="w-6 h-6 text-emerald-400" />
            <span>Financial Statements & Executive Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time P&L synthesis, operating cash flows, gross margins, and business unit performance
          </p>
        </div>

        <button
          onClick={() => alert('Exporting full financial audit package (PDF)...')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Audit Package</span>
        </button>
      </div>

      {/* Grid: Profit & Loss Statement + Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit & Loss Box */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Profit & Loss Statement (P&L)</h2>
              <span className="text-[11px] font-mono text-slate-400">Consolidated FY 2025–26</span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Net Profit: {pnl.net_profit_display}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Gross Operating Revenue</span>
              <span className="text-white font-bold">₹{(pnl.revenue || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Cost of Goods Sold (COGS)</span>
              <span className="text-rose-400">- ₹{(pnl.cost_of_goods_sold || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60 bg-slate-950/40 px-2 rounded-lg">
              <span className="text-slate-300 font-semibold">Gross Profit</span>
              <span className="text-emerald-400 font-bold">₹{(pnl.gross_profit || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Operating Expenses (SG&A, R&D)</span>
              <span className="text-rose-400">- ₹{(pnl.operating_expenses || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60 bg-slate-950/40 px-2 rounded-lg">
              <span className="text-slate-300 font-semibold">Operating Profit (EBITDA)</span>
              <span className="text-blue-400 font-bold">₹{(pnl.operating_profit_ebitda || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2.5 bg-emerald-950/20 border border-emerald-500/20 px-3 rounded-xl">
              <span className="text-white font-bold">Net Profit After Tax</span>
              <span className="text-emerald-400 font-black">{pnl.net_profit_display} ({pnl.net_margin_pct}%)</span>
            </div>
          </div>
        </div>

        {/* Cash Flow Statement */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Cash Flow Statement</h2>
              <span className="text-[11px] font-mono text-slate-400">Quarterly Cash Generation</span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
              Net Flow: {cashFlow.net_cash_flow_display}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Operating Activities Cash</span>
              <span className="text-emerald-400 font-bold">+ ₹{(cashFlow.operating_cash_flow || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Investing Activities (Capex & Hardware)</span>
              <span className="text-rose-400">₹{(cashFlow.investing_cash_flow || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Financing Activities</span>
              <span className="text-rose-400">₹{(cashFlow.financing_cash_flow || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2.5 bg-blue-950/20 border border-blue-500/20 px-3 rounded-xl mt-4">
              <span className="text-white font-bold">Net Cash Inflow</span>
              <span className="text-blue-400 font-black">{cashFlow.net_cash_flow_display}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown by Business Unit */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white">Revenue Share by Business Division</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {deptRevenue.map((d: any) => (
            <div key={d.department} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">{d.department}</span>
                <span className="text-emerald-400 font-mono font-bold">{d.pct}%</span>
              </div>
              <div className="text-lg font-black text-white font-mono">
                ₹{(d.revenue / 10000000).toFixed(1)} Cr
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${d.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
