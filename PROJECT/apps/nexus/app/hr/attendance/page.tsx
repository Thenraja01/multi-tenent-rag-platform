'use client';

import React, { useState } from 'react';
import { EnterpriseAppShell } from '@/components/layout/EnterpriseAppShell';
import { useAuthStore } from '@/stores/auth-store';
import { AccessScope } from '@/components/shared/DataScopeIndicator';
import {
  CalendarCheck,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
} from 'lucide-react';

export default function HRAttendancePage() {
  const { user } = useAuthStore();
  const [selectedDept, setSelectedDept] = useState('ALL');

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
  const isEmployee = resolvedScope === 'SELF';

  const deptsBreakdown = [
    { name: 'Human Resources', present: 76, absent: 2, leave: 4, late: 2 },
    { name: 'Finance & Accounting', present: 39, absent: 1, leave: 1, late: 1 },
    { name: 'IT & DevOps', present: 34, absent: 0, leave: 2, late: 0 },
    { name: 'Sales & Marketing', present: 52, absent: 2, leave: 3, late: 2 },
    { name: 'Legal & Operations', present: 30, absent: 0, leave: 2, late: 2 },
  ];

  const displayedDepts =
    resolvedScope === 'DEPARTMENT'
      ? deptsBreakdown.filter((d) => d.name === deptName)
      : resolvedScope === 'TEAM'
      ? [deptsBreakdown[0]]
      : selectedDept === 'ALL'
      ? deptsBreakdown
      : deptsBreakdown.filter((d) => d.name === selectedDept);

  return (
    <EnterpriseAppShell
      scope={resolvedScope}
      departmentName={deptName}
      breadcrumbItems={[
        { label: 'HR', href: '/hr' },
        { label: 'Attendance', href: '/hr/attendance' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isEmployee ? 'My Attendance' : 'Attendance Tracking'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isEmployee
                ? 'Daily check-in/check-out timestamps and monthly compliance records.'
                : 'Real-time clock-in compliance and departmental absenteeism breakdown.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Today: Sep 22, 2026</span>
            </button>
            <button className="px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PRESENT
              </span>
            </div>
            <span className="text-2xl font-black text-slate-900">
              {isEmployee ? '22 days' : '231'}
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ABSENT
              </span>
            </div>
            <span className="text-2xl font-black text-slate-900">
              {isEmployee ? '0 days' : '5'}
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <CalendarDays className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ON LEAVE
              </span>
            </div>
            <span className="text-2xl font-black text-slate-900">
              {isEmployee ? '1 day' : '12'}
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                LATE ARRIVALS
              </span>
            </div>
            <span className="text-2xl font-black text-slate-900">
              {isEmployee ? '0' : '7'}
            </span>
          </div>
        </div>

        {/* Breakdown Table */}
        {!isEmployee && (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Department Breakdown
              </h3>
              {resolvedScope === 'ORGANIZATION' && (
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="IT & DevOps">IT & DevOps</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                </select>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">DEPARTMENT</th>
                    <th className="px-5 py-3.5 text-emerald-600">PRESENT</th>
                    <th className="px-5 py-3.5 text-rose-600">ABSENT</th>
                    <th className="px-5 py-3.5 text-amber-600">LEAVE</th>
                    <th className="px-5 py-3.5 text-purple-600">LATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedDepts.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-800">{d.name}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">
                        {d.present}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-rose-600">{d.absent}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-amber-700">{d.leave}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-purple-700">{d.late}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </EnterpriseAppShell>
  );
}
