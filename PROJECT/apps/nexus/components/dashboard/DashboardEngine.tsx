'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { DASHBOARD_REGISTRY } from '@/config/dashboard-registry';
import { Sparkles, RefreshCw, AlertCircle, Building2, ShieldCheck } from 'lucide-react';

export function DashboardEngine() {
  const { organization, user, roles, permissions, plan, isLoading: wsLoading } = useWorkspace();

  const {
    data: dashboardData,
    isLoading: dbLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['workspace-dashboard', organization?.id, user?.id],
    queryFn: async () => {
      const res = await apiClient.get('/workspace/dashboard');
      return res.data;
    },
    refetchInterval: 30000,
  });

  if (wsLoading || dbLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3" />
        <span className="text-xs font-mono">Building dynamic authorization dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <span>Failed to load dynamic dashboard cards.</span>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 rounded-lg bg-rose-800/40 hover:bg-rose-800 text-white font-medium text-xs flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const cards: Array<{
    id: string;
    title: string;
    module: string;
    required_permission: string;
    size: 'small' | 'medium' | 'large';
    position: number;
    data_scope: string;
  }> = dashboardData?.cards || [];

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono uppercase tracking-wider">
              {organization?.name || 'Workspace'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
              Status: {organization?.status || 'ACTIVE'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name || 'Member'}
          </h1>
          <p className="text-xs text-slate-400">
            Assigned Role: <strong className="text-slate-200">{typeof user?.role === 'string' ? user.role : (user?.role as any)?.name || (user?.role as any)?.slug || 'Member'}</strong>
            {user?.department?.name && ` • Department: ${user.department.name}`}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Cards Grid */}
      {cards.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-500" />
          <h3 className="font-semibold text-white text-sm mb-1">No Dynamic Cards Configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You currently have no cards matching your assigned pack permissions. Contact your tenant administrator to grant feature access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards.map((card) => {
            const cardDef = DASHBOARD_REGISTRY[card.id];
            if (!cardDef) return null;

            const CardComponent = cardDef.component;
            const isLarge = card.size === 'large';

            return (
              <div
                key={card.id}
                className={isLarge ? 'lg:col-span-2' : 'lg:col-span-1'}
              >
                <CardComponent dataScope={card.data_scope} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
