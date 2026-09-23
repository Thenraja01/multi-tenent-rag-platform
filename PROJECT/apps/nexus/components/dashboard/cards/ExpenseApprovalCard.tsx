'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Receipt, Check, X } from 'lucide-react';

export function ExpenseApprovalCard({ dataScope = 'DEPARTMENT' }: { dataScope?: string }) {
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['finance-expenses-pending'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/expenses?status=PENDING');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const pendingExpenses = Array.isArray(expenses)
    ? expenses
    : (expenses as any)?.items || (expenses as any)?.data || [];

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'APPROVE' | 'REJECT' }) => {
      const res = await apiClient.post(`/finance/expenses/${id}/approve`, { action });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-expenses-pending'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-dashboard'] });
    },
  });

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Expense Reimbursements</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Scope: {dataScope} • Permission: expense:approve
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 border border-purple-500/20 text-purple-300">
          {pendingExpenses.length} Pending
        </span>
      </div>

      {pendingExpenses.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          <Check className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          No pending employee expense claims.
        </div>
      ) : (
        <div className="space-y-2.5 my-2 max-h-56 overflow-y-auto pr-1">
          {pendingExpenses.map((exp: any) => (
            <div
              key={exp.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{exp.employee_name || 'Staff Member'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-medium">
                    {exp.category || 'General'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                  {exp.currency || 'INR'} {Number(exp.amount).toLocaleString()} • {exp.title}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => actionMutation.mutate({ id: exp.id, action: 'APPROVE' })}
                  disabled={actionMutation.isPending}
                  className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors"
                  title="Approve Claim"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => actionMutation.mutate({ id: exp.id, action: 'REJECT' })}
                  disabled={actionMutation.isPending}
                  className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                  title="Reject Claim"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-slate-800/60 text-xs text-slate-400">
        Receipt attachment & policy validation active
      </div>
    </div>
  );
}
