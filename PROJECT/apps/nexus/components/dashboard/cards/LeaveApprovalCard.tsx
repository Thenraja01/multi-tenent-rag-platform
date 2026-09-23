'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { ShieldCheck, Check, X } from 'lucide-react';

export function LeaveApprovalCard({ dataScope = 'DEPARTMENT' }: { dataScope?: string }) {
  const queryClient = useQueryClient();

  const { data: rawLeaves, isLoading } = useQuery({
    queryKey: ['hr-leave-approvals'],
    queryFn: async () => {
      const res = await apiClient.get('/hr/leaves');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const leaves = Array.isArray(rawLeaves) ? rawLeaves : rawLeaves?.items || rawLeaves?.data || [];
  const pendingRequests = leaves.filter((l: any) => l.status === 'PENDING');

  const actionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiClient.put(`/hr/leaves/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-leave-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['hr-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-dashboard'] });
    },
  });

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Leave Approval Queue</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Action Scope: {dataScope} • Permission: leave:approve
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300">
          {pendingRequests.length} Pending
        </span>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          <Check className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          No pending leave requests requiring review.
        </div>
      ) : (
        <div className="space-y-2.5 my-2 max-h-56 overflow-y-auto pr-1">
          {pendingRequests.map((req: any) => (
            <div
              key={req.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{req.employee_name || 'Staff Member'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">
                    {req.leave_type}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {req.start_date} to {req.end_date} ({req.total_days}d) • {req.reason}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => actionMutation.mutate({ id: req.id, status: 'APPROVED' })}
                  disabled={actionMutation.isPending}
                  className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors"
                  title="Approve"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => actionMutation.mutate({ id: req.id, status: 'REJECTED' })}
                  disabled={actionMutation.isPending}
                  className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-slate-800/60 text-xs text-slate-400">
        Review authority enforced via backend RBAC / UBAC
      </div>
    </div>
  );
}
