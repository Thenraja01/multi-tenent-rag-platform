'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { CalendarDays, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export function LeaveBalanceCard({ dataScope = 'SELF' }: { dataScope?: string }) {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const { user } = useWorkspace();

  const { data: rawLeaves } = useQuery({
    queryKey: ['hr-leaves', user?.id],
    queryFn: async () => {
      const res = await apiClient.get('/hr/leaves');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const leaves = Array.isArray(rawLeaves) ? rawLeaves : rawLeaves?.items || rawLeaves?.data || [];
  const pendingCount = leaves.filter((l: any) => l.status === 'PENDING').length;
  const approvedDays = leaves
    .filter((l: any) => l.status === 'APPROVED')
    .reduce((acc: number, l: any) => acc + (l.total_days || 0), 0);

  const vacationLeft = Math.max(0, 24 - approvedDays);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Leave & Time Off</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Scope: {dataScope}
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 border border-purple-500/20 text-purple-300">
          Annual Allowance
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 my-3">
        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Vacation Left</span>
          <span className="text-base font-bold text-white">{vacationLeft}</span>
          <span className="text-[10px] text-slate-500 block">days</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Used</span>
          <span className="text-base font-bold text-emerald-400">{approvedDays}</span>
          <span className="text-[10px] text-slate-500 block">days</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Pending</span>
          <span className="text-base font-bold text-amber-400">{pendingCount}</span>
          <span className="text-[10px] text-slate-500 block">requests</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-xs text-slate-400">{leaves.length} total applications</span>
        <Link
          href={`/${tenantSlug}/leave`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Request Leave
        </Link>
      </div>
    </div>
  );
}
