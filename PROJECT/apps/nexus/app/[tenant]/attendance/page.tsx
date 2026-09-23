'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { CalendarCheck, Clock, CheckCircle2, UserCheck, RefreshCw } from 'lucide-react';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { ModuleGuard } from '@/components/guards/ModuleGuard';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export default function AttendancePage() {
  const { user, getDataScope } = useWorkspace();
  const dataScope = getDataScope('attendance');
  const queryClient = useQueryClient();

  // Fetch real attendance records from backend
  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['hr-attendance-page', user?.id],
    queryFn: async () => {
      const res = await apiClient.get('/hr/attendance');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const todayRecord = logs[0];
  const isClockedIn = !!todayRecord && !todayRecord.check_out;

  const clockMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/hr/attendance/check-in', {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-attendance-page'] });
      queryClient.invalidateQueries({ queryKey: ['hr-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-dashboard'] });
    },
  });

  return (
    <ModuleGuard moduleSlug="attendance">
      <PermissionGuard permission="attendance:view">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Attendance Logs</h1>
              </div>
              <p className="text-xs text-slate-400">
                Data Scope: <strong className="text-blue-400 uppercase font-mono">{dataScope}</strong> • Live Database Clock-In & Time Records
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
                onClick={() => clockMutation.mutate()}
                disabled={clockMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-all shadow-md shadow-blue-500/20"
              >
                {clockMutation.isPending ? 'Processing...' : isClockedIn ? 'Clock Out' : 'Clock In'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Daily Attendance Records</span>
              <span className="text-[11px] text-slate-400">{logs.length} logged entries</span>
            </div>
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                Loading attendance records...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No attendance records logged yet. Click &quot;Clock In&quot; to log today&apos;s attendance.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Clock In</th>
                      <th className="px-4 py-3">Clock Out</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {logs.map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-400">{row.attendance_date}</td>
                        <td className="px-4 py-3 font-medium text-white">{row.employee_name || 'Member'}</td>
                        <td className="px-4 py-3">{row.check_in || '—'}</td>
                        <td className="px-4 py-3">{row.check_out || '—'}</td>
                        <td className="px-4 py-3">{row.duration}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </PermissionGuard>
    </ModuleGuard>
  );
}
