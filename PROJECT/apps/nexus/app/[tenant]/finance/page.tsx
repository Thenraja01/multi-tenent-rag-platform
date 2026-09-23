'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  PieChart,
  Building2,
  CreditCard,
  Calculator,
  Bot,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function FinanceDashboardPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'supernova';

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['finance-dashboard-stats', tenantSlug],
    queryFn: () => api.finance.getDashboardStats(),
  });

  const kpis = stats?.kpis || {
    total_revenue_display: '₹24.5 Cr',
    total_expenses_display: '₹8.2 Cr',
    net_profit_display: '₹16.3 Cr',
    outstanding_display: '₹22.0 L',
    pending_approvals_count: 2,
    overdue_invoices_count: 1,
  };

  const monthlyTrend = stats?.monthly_trend || [
    { month: 'Jan', revenue: 18.5, expenses: 6.2 },
    { month: 'Feb', revenue: 19.2, expenses: 6.8 },
    { month: 'Mar', revenue: 21.0, expenses: 7.1 },
    { month: 'Apr', revenue: 20.4, expenses: 7.4 },
    { month: 'May', revenue: 22.8, expenses: 7.9 },
    { month: 'Jun', revenue: 23.5, expenses: 8.0 },
    { month: 'Jul', revenue: 24.5, expenses: 8.2 },
  ];

  const recentInvoices = stats?.recent_invoices || [];
  const budgetAlerts = stats?.budget_alerts || [];
  const aiInsights = stats?.ai_insights || [];

  const navCards = [
    { title: 'Invoices', href: `/${tenantSlug}/finance/invoices`, desc: 'OCR parsing, tax/GST, and vendor approvals', icon: Receipt, badge: `${stats?.pending_invoices_count || 0} Pending` },
    { title: 'Expenses', href: `/${tenantSlug}/finance/expenses`, desc: 'Employee claims, receipts, and reimbursements', icon: FileSpreadsheet, badge: `${stats?.pending_expenses_count || 0} Claims` },
    { title: 'Budgets', href: `/${tenantSlug}/finance/budgets`, desc: 'Department allocations and limit alerts', icon: DollarSign, badge: `${budgetAlerts.length} Alerts` },
    { title: 'Financial Reports', href: `/${tenantSlug}/finance/reports`, desc: 'Executive P&L, balance sheets, cash flow', icon: PieChart },
    { title: 'Payments & Aging', href: `/${tenantSlug}/finance/payments`, desc: 'Accounts receivable aging and disbursements', icon: CreditCard },
    { title: 'Vendors Master', href: `/${tenantSlug}/finance/vendors`, desc: 'Supplier contracts, payment terms, and GSTINs', icon: Building2 },
    { title: 'Compliance & Tax', href: `/${tenantSlug}/finance/accounting`, desc: 'GST rules, Ind AS standards, and policies', icon: Calculator },
    { title: 'Finance Knowledge Base', href: `/${tenantSlug}/finance/knowledge`, desc: 'Policies, standards, circulars, and pgvector corpus', icon: BookOpen },
    { title: 'Finance AI Copilot', href: `/${tenantSlug}/finance/chat`, desc: 'Domain-scoped RAG Q&A with pgvector citations', icon: Bot, isHighlighted: true },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto select-none">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 font-mono">
            <DollarSign className="w-4 h-4" />
            <span>Finance Intelligence Workspace • {tenantSlug.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Financial Health & Governance
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Streamlined departmental workflows, vendor invoice approvals, expense auditing, and domain-partitioned RAG AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${tenantSlug}/finance/invoices`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New Invoice</span>
          </Link>
          <Link
            href={`/${tenantSlug}/finance/chat`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition shrink-0"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Finance AI</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Revenue (FYTD)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{kpis.total_revenue_display}</span>
            <span className="text-[11px] text-emerald-400 font-semibold ml-2">+14.2% vs last year</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Operating Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{kpis.total_expenses_display}</span>
            <span className="text-[11px] text-slate-400 ml-2">Within 85% budget cap</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Net Profit (EBITDA)</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{kpis.net_profit_display}</span>
            <span className="text-[11px] text-blue-400 font-semibold ml-2">16.3% Margin</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Outstanding Receivables</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{kpis.outstanding_display}</span>
            <span className="text-[11px] text-amber-400 ml-2">{kpis.pending_approvals_count} approvals pending</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Monthly Chart & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Revenue / Expense Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Monthly Revenue vs. Operating Expenses</h2>
              <p className="text-xs text-slate-400">2026 Fiscal Trend (in ₹ Crores)</p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300">
              FY 2025–26
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tickLine={false} fontSize={11} />
                <YAxis stroke="#64748b" tickLine={false} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Revenue (₹ Cr)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses (₹ Cr)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: AI Insights & Budget Alerts */}
        <div className="space-y-6">
          {/* AI Insights Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-500/20 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Finance AI Copilot Insights</span>
            </div>
            <div className="space-y-2.5 text-xs text-slate-300">
              {aiInsights.map((insight: string, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-indigo-500/10 flex items-start gap-2">
                  <span className="text-indigo-400 font-mono text-[10px] mt-0.5">•</span>
                  <p className="leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Limit Warnings */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Department Budget Utilization</span>
              </h3>
              <Link href={`/${tenantSlug}/finance/budgets`} className="text-[11px] text-emerald-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {budgetAlerts.map((b: any) => (
                <div key={b.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{b.department}</span>
                    <span className={b.is_critical ? 'text-rose-400 font-bold font-mono' : 'text-amber-400 font-bold font-mono'}>
                      {b.utilization_pct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className={b.is_critical ? 'bg-rose-500 h-full' : 'bg-amber-500 h-full'}
                      style={{ width: `${Math.min(b.utilization_pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white">Recent Vendor Invoices & Status</h2>
            <p className="text-xs text-slate-400">Processed through automated OCR and approval matrix</p>
          </div>
          <Link
            href={`/${tenantSlug}/finance/invoices`}
            className="flex items-center gap-1 text-xs text-emerald-400 font-semibold hover:underline"
          >
            <span>All Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase font-mono text-slate-500 border-b border-slate-800/60 bg-slate-950/40">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Approval</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-medium">
              {recentInvoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{inv.invoice_number}</td>
                  <td className="py-3.5 px-4 text-slate-200">{inv.vendor_name}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                    ₹{inv.total_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{inv.due_date || '—'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inv.payment_status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : inv.payment_status === 'OVERDUE'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {inv.payment_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inv.approval_status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : inv.approval_status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      {inv.approval_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/${tenantSlug}/finance/invoices`}
                      className="text-slate-400 hover:text-white transition"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finance Workflow Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white">Finance Domain Capabilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {navCards.map((sec) => {
            const Icon = sec.icon;
            return (
              <Link
                key={sec.title}
                href={sec.href}
                className={`p-5 rounded-3xl border transition shadow-xl group flex flex-col justify-between ${
                  sec.isHighlighted
                    ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit group-hover:scale-110 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    {sec.badge && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20">
                        {sec.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{sec.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{sec.desc}</p>
                </div>

                <div className="mt-4 flex items-center justify-end text-xs text-emerald-400 font-semibold gap-1">
                  <span>Explore</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
