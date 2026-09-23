'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { CalendarCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export function AttendanceCard({ dataScope = 'SELF' }: { dataScope?: string }) {
  const { user } = useWorkspace();
  const queryClient = useQueryClient();

  // Fetch real attendance records from backend
  const { data: rawAttendance, isLoading } = useQuery({
    queryKey: ['hr-attendance', user?.id],
    queryFn: async () => {
      const res = await apiClient.get('/hr/attendance');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const attendanceLogs = Array.isArray(rawAttendance)
    ? rawAttendance
    : rawAttendance?.items || rawAttendance?.data || [];
  const todayRecord = attendanceLogs[0];
  const isClockedIn = !!todayRecord && !todayRecord.check_out;

  const clockMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/hr/attendance/check-in', {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-dashboard'] });
    },
  });

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Attendance Overview</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Scope: {dataScope}
            </span>
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
            isClockedIn
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-slate-800 border border-slate-700 text-slate-400'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {isClockedIn ? 'Clocked In' : 'Not Clocked In'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-3">
        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/50">
          <span className="text-[11px] text-slate-400 block mb-1">Check-in Time</span>
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            {todayRecord?.check_in || '—'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/50">
          <span className="text-[11px] text-slate-400 block mb-1">Check-out Time</span>
          <span className="text-sm font-bold text-slate-300">
            {todayRecord?.check_out || (isClockedIn ? 'In Progress' : '—')}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Logged as <strong className="text-slate-200">{user?.full_name || 'Member'}</strong>
        </span>
        <button
          onClick={() => clockMutation.mutate()}
          disabled={clockMutation.isPending}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors shadow-sm"
        >
          {clockMutation.isPending ? 'Processing...' : isClockedIn ? 'Clock Out' : 'Clock In'}
        </button>
      </div>
    </div>
  );
}
