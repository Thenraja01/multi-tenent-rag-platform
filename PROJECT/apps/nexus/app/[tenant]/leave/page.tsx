'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { CalendarDays, Plus, Check, X, RefreshCw } from 'lucide-react';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { ModuleGuard } from '@/components/guards/ModuleGuard';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export default function LeavePage() {
  const { user, can, getDataScope } = useWorkspace();
  const dataScope = getDataScope('leave');
  const canApprove = can('leave:approve');
  const queryClient = useQueryClient();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual Vacation');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // Fetch real leaves from database
  const { data: leaves = [], isLoading, refetch } = useQuery({
    queryKey: ['hr-leaves-page', user?.id],
    queryFn: async () => {
      const res = await apiClient.get('/hr/leaves');
      return res.data;
    },
    refetchInterval: 30000,
  });

  // Apply leave mutation
  const applyMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/hr/leaves', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-leaves-page'] });
      queryClient.invalidateQueries({ queryKey: ['hr-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-dashboard'] });
      setShowApplyModal(false);
      setReason('');
    },
  });

  // Approve / Reject mutation
  const decisionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiClient.put(`/hr/leaves/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-leaves-page'] });
      queryClient.invalidateQueries({ queryKey: ['hr-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['hr-leave-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-dashboard'] });
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate({
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      total_days: 1.0,
      reason: reason || 'Personal Leave',
    });
  };

  const pendingCount = leaves.filter((l: any) => l.status === 'PENDING').length;
  const approvedDays = leaves
    .filter((l: any) => l.status === 'APPROVED')
    .reduce((acc: number, l: any) => acc + (l.total_days || 0), 0);

  const vacationLeft = Math.max(0, 24 - approvedDays);

  return (
    <ModuleGuard moduleSlug="leave">
      <PermissionGuard permission="leave:view">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Leave & PTO Management</h1>
              </div>
              <p className="text-xs text-slate-400">
                Scope: <strong className="text-purple-400 uppercase font-mono">{dataScope}</strong> • Real-Time Database Leave Applications & Quotas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowApplyModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Apply for Leave
              </button>
            </div>
          </div>

          {/* Leave Quotas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Annual Paid Leave</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{vacationLeft}</span>
                <span className="text-xs text-slate-500">/ 24 days remaining</span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Approved Days</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400">{approvedDays}</span>
                <span className="text-xs text-slate-500">days taken</span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Pending Requests</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-400">{pendingCount}</span>
                <span className="text-xs text-slate-500">in review</span>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Leave Application History</span>
              <span className="text-[11px] text-slate-400">{leaves.length} records</span>
            </div>
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
                Loading leave records...
              </div>
            ) : leaves.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No leave requests found. Click &quot;Apply for Leave&quot; to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Days</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      {canApprove && <th className="px-4 py-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {leaves.map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{row.employee_name || 'Member'}</td>
                        <td className="px-4 py-3">{row.leave_type}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{row.start_date} to {row.end_date}</td>
                        <td className="px-4 py-3">{row.total_days}d</td>
                        <td className="px-4 py-3 text-slate-400">{row.reason}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              row.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : row.status === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        {canApprove && (
                          <td className="px-4 py-3 text-right">
                            {row.status === 'PENDING' && (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => decisionMutation.mutate({ id: row.id, status: 'APPROVED' })}
                                  disabled={decisionMutation.isPending}
                                  className="p-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors"
                                  title="Approve"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => decisionMutation.mutate({ id: row.id, status: 'REJECTED' })}
                                  disabled={decisionMutation.isPending}
                                  className="p-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal */}
          {showApplyModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Apply for Time Off</h3>
                  <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleApply} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                    >
                      <option value="Annual Vacation">Annual Vacation</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Compensatory Off">Compensatory Off</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Reason</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      placeholder="Enter details..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applyMutation.isPending}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white shadow-md shadow-purple-500/20"
                    >
                      {applyMutation.isPending ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </PermissionGuard>
    </ModuleGuard>
  );
}
