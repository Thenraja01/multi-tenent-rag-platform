'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PieChart, AlertCircle, CheckCircle2 } from 'lucide-react';

export function BudgetAlertCard({ dataScope = 'ORGANIZATION' }: { dataScope?: string }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['finance-dashboard-budgets'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/dashboard/stats');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const budgetAlerts = stats?.budget_alerts || [];

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Department Budget Allocation & Limits</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Scope: {dataScope} • Permission: budget:view
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
          FY 2025-26
        </span>
      </div>

      {budgetAlerts.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
          All department budgets are operating within safe variance thresholds (&lt; 80%).
        </div>
      ) : (
        <div className="space-y-3.5 my-2">
          {budgetAlerts.map((b: any) => {
            const pct = Math.min(b.utilization_pct || 0, 100);
            const isCritical = pct >= 90;
            return (
              <div key={b.id || b.department} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    {b.department}
                    {isCritical && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        CRITICAL
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-slate-300 font-bold">
                    {pct}% Spent ({b.currency || 'INR'} {b.spent?.toLocaleString()} / {b.allocated?.toLocaleString()})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all rounded-full ${
                      isCritical ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400" /> Automated 80% threshold warnings
        </span>
        <span className="font-mono text-[11px]">Ledger Sync Active</span>
      </div>
    </div>
  );
}
