'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export function EmployeeCountCard({ dataScope = 'ORGANIZATION' }: { dataScope?: string }) {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const { can } = useWorkspace();

  const { data: usersData } = useQuery({
    queryKey: ['workspace-users-count'],
    queryFn: async () => {
      const res = await apiClient.get('/users');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const users = Array.isArray(usersData) ? usersData : usersData?.items || usersData?.data || [];
  const activeCount = users.filter((u: any) => u.is_active !== false).length;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Organization Headcount</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Scope: {dataScope}
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
          Active Roster
        </span>
      </div>

      <div className="my-3 flex items-baseline justify-between">
        <div>
          <span className="text-3xl font-extrabold text-white tracking-tight">{activeCount}</span>
          <span className="text-xs text-slate-400 ml-2">Total Staff Members</span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5 justify-end">
            100% Active
          </span>
          <span className="text-[10px] text-slate-500">Live directory</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-xs text-slate-400">Tenant Member Directory</span>
        {can('user:create') && (
          <Link
            href={`/${tenantSlug}/users`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </Link>
        )}
      </div>
    </div>
  );
}
