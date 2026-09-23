'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { usePermissions } from '@/providers/WorkspaceProvider';
import {
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Filter,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function HRLeavePage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // 1. Fetch Leave Types & Balances
  const { data: leaveTypes = [] } = useQuery({
    queryKey: ['hr-leave-types'],
    queryFn: () => api.hr.getLeaveTypes(),
  });

  const { data: leaveBalances = [] } = useQuery({
    queryKey: ['hr-leave-balances'],
    queryFn: () => api.hr.getLeaveBalances(),
  });

  // 2. Fetch Leave Requests
  const { data: leaveRequests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ['hr-leave-requests'],
    queryFn: () => api.hr.getLeaveRequests(),
  });

  // Apply Leave Mutation
  const applyMutation = useMutation({
    mutationFn: (data: any) => api.hr.applyLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['hr-leave-balances'] });
      setIsApplyOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
    },
  });

  // Approve / Reject Action Mutation
  const actionMutation = useMutation({
    mutationFn: ({ id, approved, reason }: { id: string; approved: boolean; reason?: string }) =>
      api.hr.reviewLeaveRequest(id, approved, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['hr-leave-balances'] });
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId && leaveTypes.length > 0) {
      applyMutation.mutate({
        leave_type_id: leaveTypes[0].id,
        start_date: startDate,
        end_date: endDate,
        reason,
      });
    } else {
      applyMutation.mutate({
        leave_type_id: selectedTypeId,
        start_date: startDate,
        end_date: endDate,
        reason,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            Leave & Time-Off Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track allowance balances, submit time-off requests, and manage departmental approvals
          </p>
        </div>

        {can('leave:apply') && (
          <button
            onClick={() => {
              if (leaveTypes.length > 0 && !selectedTypeId) {
                setSelectedTypeId(leaveTypes[0].id);
              }
              setIsApplyOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {leaveBalances.length === 0 ? (
          <div className="col-span-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500">
            No specific leave balances allocated for your account.
          </div>
        ) : (
          leaveBalances.map((bal: any) => (
            <div
              key={bal.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{bal.leave_type_name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {bal.leave_type_code}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">{bal.available}</span>
                <span className="text-xs text-slate-400">days available</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                <span>Allocated: {bal.allocated}d</span>
                <span>Used: {bal.used}d</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Leave Requests & Approvals
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Real-Time Database</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Employee</th>
              <th className="px-5 py-3.5 font-semibold">Leave Type</th>
              <th className="px-5 py-3.5 font-semibold">Duration</th>
              <th className="px-5 py-3.5 font-semibold">Reason</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              {can('leave:approve') && <th className="px-5 py-3.5 font-semibold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {isLoadingRequests ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  Loading leave requests...
                </td>
              </tr>
            ) : leaveRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  No active or past leave requests found.
                </td>
              </tr>
            ) : (
              leaveRequests.map((req: any) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5 font-semibold text-white">
                    {req.employee_name}
                  </td>
                  <td className="px-5 py-3.5 text-indigo-300">
                    {req.leave_type_name}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-300">
                    {req.start_date} → {req.end_date} ({req.days_count}d)
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 max-w-xs truncate">
                    {req.reason}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : req.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  {can('leave:approve') && (
                    <td className="px-5 py-3.5 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => actionMutation.mutate({ id: req.id, approved: true })}
                            className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => actionMutation.mutate({ id: req.id, approved: false, reason: 'Declined' })}
                            className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Resolved</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Apply Leave Modal */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Apply for Leave</h3>
            <form onSubmit={handleApply} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Leave Type *</label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  {leaveTypes.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.days_allowed} days/year)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reason for Leave *</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Family commitment, medical appointment, vacation..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow transition disabled:opacity-50"
                >
                  {applyMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
