'use client';

import React from 'react';
import { EnterpriseAppShell } from '@/components/layout/EnterpriseAppShell';
import { useAuthStore } from '@/stores/auth-store';
import { AccessScope } from '@/components/shared/DataScopeIndicator';
import {
  BarChart3,
  TrendingUp,
  Users,
  CalendarCheck,
  Award,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';

export default function HRAnalyticsPage() {
  const { user } = useAuthStore();

  // Resolve scope
  let resolvedScope: AccessScope = 'ORGANIZATION';
  if (user?.is_org_admin || user?.role === 'org_admin' || user?.is_superadmin) {
    resolvedScope = 'ORGANIZATION';
  } else if (user?.role === 'department_admin') {
    resolvedScope = 'DEPARTMENT';
  } else if (user?.role === 'manager') {
    resolvedScope = 'TEAM';
  } else {
    resolvedScope = 'SELF';
  }

  const deptName = user?.department_name || 'Human Resources';

  return (
    <EnterpriseAppShell
      scope={resolvedScope}
      departmentName={deptName}
      breadcrumbItems={[
        { label: 'HR', href: '/hr' },
        { label: 'Analytics', href: '/hr/analytics' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Workforce & HR Analytics
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Longitudinal employee retention, hiring telemetry, and attendance performance trends.
            </p>
          </div>
        </div>

        {/* Analytics KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ATTRITION RATE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                -1.4% MoM
              </span>
            </div>
            <span className="text-3xl font-black text-slate-900 mt-2 block">2.8%</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Top 5% industry benchmark</span>
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                TIME TO HIRE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                Avg 18 Days
              </span>
            </div>
            <span className="text-3xl font-black text-slate-900 mt-2 block">18.4 d</span>
            <span className="text-xs text-slate-400 font-normal mt-1 block">
              Faster than target (25 days)
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PTO UTILIZATION
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                Optimal
              </span>
            </div>
            <span className="text-3xl font-black text-slate-900 mt-2 block">68.2%</span>
            <span className="text-xs text-slate-400 font-normal mt-1 block">
              Balanced rest & productivity
            </span>
          </div>
        </div>

        {/* Analytics Visual Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Headcount Growth Trend</h3>
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Q1 2026</span>
                  <span className="font-mono font-bold text-slate-900">+32 hires</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Q2 2026</span>
                  <span className="font-mono font-bold text-slate-900">+41 hires</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Q3 2026 (Current)</span>
                  <span className="font-mono font-bold text-slate-900">+24 hires</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '74%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Department Diversity & Composition</h3>
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800">Engineering & IT</span>
                <span className="font-mono font-bold text-blue-600">35%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800">Human Resources & Ops</span>
                <span className="font-mono font-bold text-emerald-600">28%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800">Sales & Marketing</span>
                <span className="font-mono font-bold text-amber-600">22%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-800">Finance & Accounting</span>
                <span className="font-mono font-bold text-purple-600">15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnterpriseAppShell>
  );
}
