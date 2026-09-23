'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  DollarSign,
  Plus,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Building2,
  PieChart,
} from 'lucide-react';

export default function BudgetsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'supernova';
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [allocatedAmount, setAllocatedAmount] = useState<string>('');
  const [fiscalYear, setFiscalYear] = useState<string>('2025-2026');
  const [period, setPeriod] = useState<string>('ANNUAL');

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['finance-budgets', tenantSlug],
    queryFn: () => api.finance.getBudgets(),
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data: any) => api.finance.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
      setIsCreateOpen(false);
      setDepartmentName('');
      setAllocatedAmount('');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createBudgetMutation.mutate({
      department_name: departmentName,
      allocated_amount: parseFloat(allocatedAmount || '0'),
      fiscal_year: fiscalYear,
      period,
      alert_threshold_pct: 80.0,
    });
  };

  const totalAllocated = budgets.reduce((acc: number, b: any) => acc + (b.allocated_amount || 0), 0);
  const totalSpent = budgets.reduce((acc: number, b: any) => acc + (b.spent_amount || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

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
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span>Department Budget Governance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fiscal allocation caps, spend thresholds, real-time burn rates, and automated overrun alerts
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Allocation</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <span className="text-xs font-medium text-slate-400">Total Allocated Budget</span>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            ₹{totalAllocated.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">FY 2025–26 Consolidated</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <span className="text-xs font-medium text-slate-400">Total Spent to Date</span>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-400/80 font-mono">{overallUtilization.toFixed(1)}% Consolidated Burn</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <span className="text-xs font-medium text-slate-400">Remaining Budget</span>
          <div className="mt-2 text-2xl font-black text-blue-400 font-mono">
            ₹{totalRemaining.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-blue-400/80 font-mono">Available for fiscal year</span>
        </div>
      </div>

      {/* Budgets Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {budgets.map((b: any) => {
          const isWarning = b.utilization_pct >= b.alert_threshold_pct && b.utilization_pct < 90;
          const isCritical = b.utilization_pct >= 90;
          return (
            <div
              key={b.id}
              className={`p-6 rounded-3xl border shadow-xl bg-slate-900/80 space-y-4 ${
                isCritical
                  ? 'border-rose-500/40'
                  : isWarning
                  ? 'border-amber-500/40'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-slate-800 text-emerald-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{b.department_name}</h3>
                    <span className="text-[11px] font-mono text-slate-500">{b.period} • {b.fiscal_year}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                      isCritical
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : isWarning
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {b.utilization_pct}% Utilized
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(b.utilization_pct, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>Spent: <strong className="text-white">₹{b.spent_amount.toLocaleString('en-IN')}</strong></span>
                  <span>Allocated: <strong className="text-white">₹{b.allocated_amount.toLocaleString('en-IN')}</strong></span>
                </div>
              </div>

              {isWarning && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Approaching 80% threshold. Spend moderation advised.</span>
                </div>
              )}

              {isCritical && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Exceeds 90% allocation limit. Manager approval mandatory for new POs.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Department Budget</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-500 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Enterprise AI Research"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Allocated Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={allocatedAmount}
                  onChange={(e) => setAllocatedAmount(e.target.value)}
                  placeholder="5000000"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fiscal Year</label>
                  <input
                    type="text"
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="ANNUAL">Annual</option>
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
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
                  disabled={createBudgetMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition"
                >
                  {createBudgetMutation.isPending ? 'Allocating...' : 'Allocate Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
