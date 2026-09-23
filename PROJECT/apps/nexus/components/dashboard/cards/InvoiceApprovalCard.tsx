'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { FileText, Check, X, Building2 } from 'lucide-react';

export function InvoiceApprovalCard({ dataScope = 'DEPARTMENT' }: { dataScope?: string }) {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['finance-invoices-pending'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/invoices?approval=PENDING');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const pendingInvoices = Array.isArray(invoices)
    ? invoices
    : (invoices as any)?.items || (invoices as any)?.data || [];

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'APPROVE' | 'REJECT' }) => {
      const res = await apiClient.post(`/finance/invoices/${id}/approve`, { action });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-invoices-pending'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-dashboard'] });
    },
  });

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Vendor Invoice Approvals</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Scope: {dataScope} • Permission: invoice:approve
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 border border-blue-500/20 text-blue-300">
          {pendingInvoices.length} Pending
        </span>
      </div>

      {pendingInvoices.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          <Check className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          No pending vendor invoices requiring approval.
        </div>
      ) : (
        <div className="space-y-2.5 my-2 max-h-56 overflow-y-auto pr-1">
          {pendingInvoices.map((inv: any) => (
            <div
              key={inv.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{inv.vendor_name || 'Vendor'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    #{inv.invoice_number}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                  {inv.currency || 'INR'} {Number(inv.total_amount).toLocaleString()} • Due: {inv.due_date || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => actionMutation.mutate({ id: inv.id, action: 'APPROVE' })}
                  disabled={actionMutation.isPending}
                  className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors"
                  title="Approve Invoice"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => actionMutation.mutate({ id: inv.id, action: 'REJECT' })}
                  disabled={actionMutation.isPending}
                  className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                  title="Reject Invoice"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
        <span>3-Way Matching OCR Verified</span>
        <span className="font-mono text-[10px]">Finance Dept Queue</span>
      </div>
    </div>
  );
}
