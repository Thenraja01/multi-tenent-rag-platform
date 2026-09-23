'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  CalendarCheck,
  CalendarDays,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  Shield,
  Download,
} from 'lucide-react';
import { AccessScope } from '@/components/shared/DataScopeIndicator';

/* -------------------------------------------------------------
 * 1. Summary Cards Widget
 * ------------------------------------------------------------- */
interface SummaryCardsProps {
  scope: AccessScope;
  stats?: {
    totalEmployees: number;
    presentToday: number;
    onLeave: number;
    pendingApprovals: number;
  };
}

export function SummaryCardsWidget({
  scope,
  stats = {
    totalEmployees: 248,
    presentToday: 231,
    onLeave: 12,
    pendingApprovals: 8,
  },
}: SummaryCardsProps) {
  // Adjust values based on scope
  const isOrg = scope === 'ORGANIZATION';
  const isDept = scope === 'DEPARTMENT';
  const isTeam = scope === 'TEAM';

  const total = isOrg ? stats.totalEmployees : isDept ? 82 : isTeam ? 12 : 1;
  const present = isOrg ? stats.presentToday : isDept ? 76 : isTeam ? 10 : 1;
  const onLeave = isOrg ? stats.onLeave : isDept ? 4 : isTeam ? 1 : 0;
  const pending = isOrg ? stats.pendingApprovals : isDept ? 5 : isTeam ? 3 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1 */}
      <Link
        href="/hr/employees"
        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {isTeam ? 'TEAM MEMBERS' : 'TOTAL EMPLOYEES'}
            </span>
            <span className="text-2xl font-black text-slate-900 tracking-tight block">
              {total}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+8</span>
          <span className="text-slate-400 font-normal text-[11px]">this month</span>
        </div>
      </Link>

      {/* Card 2 */}
      <Link
        href="/hr/attendance"
        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              PRESENT TODAY
            </span>
            <span className="text-2xl font-black text-slate-900 tracking-tight block">
              {present}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{Math.round((present / (total || 1)) * 100)}%</span>
          <span className="text-slate-400 font-normal text-[11px]">attendance rate</span>
        </div>
      </Link>

      {/* Card 3 */}
      <Link
        href="/hr/leave?status=on_leave"
        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition flex flex-col justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              ON LEAVE
            </span>
            <span className="text-2xl font-black text-slate-900 tracking-tight block">
              {onLeave}
            </span>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-400 font-medium">
          Approved PTO & sick leaves
        </div>
      </Link>

      {/* Card 4 */}
      <Link
        href="/hr/leave?status=pending"
        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition flex flex-col justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              PENDING TASKS
            </span>
            <span className="text-2xl font-black text-slate-900 tracking-tight block">
              {pending}
            </span>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-purple-600 font-semibold">
          Requires administrative review
        </div>
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------
 * 2. Attendance Overview Widget
 * ------------------------------------------------------------- */
export function AttendanceOverviewWidget({ scope }: { scope: AccessScope }) {
  const depts = [
    { name: 'Human Resources', rate: 92, count: '76/82 present' },
    { name: 'Finance & Accounting', rate: 94, count: '39/41 present' },
    { name: 'IT & DevOps', rate: 97, count: '34/36 present' },
    { name: 'Sales & Marketing', rate: 89, count: '51/57 present' },
  ];

  const displayedDepts =
    scope === 'DEPARTMENT' ? [depts[0]] : scope === 'TEAM' ? [depts[0]] : depts;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Attendance Overview</h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Daily clock-in compliance across active departments
          </p>
        </div>
        <Link
          href="/hr/attendance"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {displayedDepts.map((d, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{d.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">{d.count}</span>
                <span className="font-bold text-slate-900">{d.rate}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${d.rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Organization Attendance Benchmark:</span>
        <span className="font-bold text-emerald-600">93.1% (Healthy)</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 3. Leave Approval Queue Widget
 * ------------------------------------------------------------- */
export function LeaveApprovalQueueWidget({
  scope,
  onReview,
}: {
  scope: AccessScope;
  onReview?: (req: any) => void;
}) {
  const requests = [
    {
      id: '1',
      employee: 'Priya Sharma',
      dept: 'Finance',
      type: 'Sick Leave',
      dates: 'Sep 22-23 (2d)',
      status: 'Pending',
    },
    {
      id: '2',
      employee: 'Arun Kumar',
      dept: 'Human Resources',
      type: 'Casual Leave',
      dates: 'Sep 24 (1d)',
      status: 'Pending',
    },
    {
      id: '3',
      employee: 'David Chen',
      dept: 'IT & DevOps',
      type: 'Annual Leave',
      dates: 'Sep 25-27 (3d)',
      status: 'Pending',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Leave Requests</h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Pending PTO and leave approval workflow
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
          Pending {requests.length}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {requests.map((r) => (
          <div key={r.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-900 block">{r.employee}</span>
              <span className="text-[11px] text-slate-400 font-medium block">
                {r.type} • {r.dates}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                {r.dept}
              </span>
              <Link
                href="/hr/leave"
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition cursor-pointer"
              >
                Review
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100">
        <Link
          href="/hr/leave"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 w-full text-center"
        >
          <span>View All Leave Requests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 4. Department Distribution Widget
 * ------------------------------------------------------------- */
export function DepartmentDistributionWidget() {
  const depts = [
    { name: 'Human Resources', count: 82, color: 'bg-emerald-500' },
    { name: 'Finance & Accounting', count: 41, color: 'bg-blue-500' },
    { name: 'IT & DevOps', count: 36, color: 'bg-purple-500' },
    { name: 'Sales & Marketing', count: 57, color: 'bg-amber-500' },
    { name: 'Legal & Operations', count: 32, color: 'bg-cyan-500' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Employees by Department</h3>
          <p className="text-[11px] text-slate-400 font-medium">Headcount distribution</p>
        </div>
        <Link
          href="/departments"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>Manage</span>
        </Link>
      </div>

      <div className="space-y-2.5">
        {depts.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
              <span className="font-semibold text-slate-700">{d.name}</span>
            </div>
            <span className="font-bold text-slate-900 font-mono">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 5. Activity Feed Widget
 * ------------------------------------------------------------- */
export function ActivityFeedWidget() {
  const events = [
    { time: '10:42', text: 'Arun Kumar registered new employee', type: 'user' },
    { time: '10:31', text: 'Priya Sharma sick leave approved', type: 'leave' },
    { time: '09:54', text: 'Globex Employee Handbook v3.2 uploaded', type: 'doc' },
    { time: '09:22', text: 'Attendance policy updated by Admin', type: 'setting' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">HR Activity</h3>
          <p className="text-[11px] text-slate-400 font-medium">Real-time audit log events</p>
        </div>
        <Link
          href="/audit"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>Audit Log</span>
        </Link>
      </div>

      <div className="space-y-3">
        {events.map((e, i) => (
          <div key={i} className="flex items-start gap-2.5 text-xs">
            <span className="font-mono text-[11px] text-slate-400 font-bold shrink-0 mt-0.5">
              {e.time}
            </span>
            <p className="text-slate-700 font-medium leading-tight">{e.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 6. Documents Vault Widget
 * ------------------------------------------------------------- */
export function DocumentsVaultWidget() {
  const docs = [
    { title: 'Employee Handbook.pdf', ver: 'v3.2', status: 'Indexed' },
    { title: 'Leave Policy & Guidelines.pdf', ver: 'v2.0', status: 'Indexed' },
    { title: 'Attendance & Clock-In Policy.pdf', ver: 'v1.4', status: 'Indexed' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">HR Documents</h3>
          <p className="text-[11px] text-slate-400 font-medium">RAG indexed organizational policies</p>
        </div>
        <Link
          href="/hr/documents"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>Vault</span>
        </Link>
      </div>

      <div className="space-y-2.5">
        {docs.map((d, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block truncate">{d.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">{d.ver}</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              {d.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 7. Quick Actions Widget
 * ------------------------------------------------------------- */
export function QuickActionsWidget({
  onAddEmployee,
  onUploadDoc,
}: {
  onAddEmployee?: () => void;
  onUploadDoc?: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
        <p className="text-[11px] text-slate-400 font-medium">Frequent operational shortcuts</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/users"
          className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/60 text-blue-700 font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Employee</span>
        </Link>

        <Link
          href="/documents"
          className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>+ Upload Document</span>
        </Link>

        <Link
          href="/hr/leave"
          className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
        >
          <CalendarDays className="w-4 h-4 text-amber-600" />
          <span>Review Leave</span>
        </Link>

        <Link
          href="/hr/analytics"
          className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs"
        >
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span>View Analytics</span>
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * 8. Employee "My HR" Self-Service Widget
 * ------------------------------------------------------------- */
export function MyHRWidget({ onApplyLeave }: { onApplyLeave?: () => void }) {
  return (
    <div className="space-y-6">
      {/* 3 Metric Cards for Employee */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              MY ATTENDANCE
            </span>
            <span className="text-2xl font-black text-slate-900 block">22 / 22 days</span>
            <span className="text-[11px] text-emerald-600 font-semibold">100% On-time</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              LEAVE BALANCE
            </span>
            <span className="text-2xl font-black text-slate-900 block">12 days</span>
            <span className="text-[11px] text-slate-400 font-normal">Accrued annual leave</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              PENDING REQUESTS
            </span>
            <span className="text-2xl font-black text-slate-900 block">1 request</span>
            <span className="text-[11px] text-purple-600 font-semibold">Awaiting Manager Review</span>
          </div>
        </div>
      </div>

      {/* Employee Quick Actions & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Requests & Actions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Leave & Requests</h3>
              <p className="text-[11px] text-slate-400 font-medium">Submit and track time-off</p>
            </div>
            <Link
              href="/hr/leave"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply Leave</span>
            </Link>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Casual Leave</span>
              <span className="text-[11px] text-slate-400 font-medium">Oct 02, 2026 (1 day)</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
              Under Review
            </span>
          </div>
        </div>

        {/* Company Policies */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Company Policies & Handbook</h3>
            <p className="text-[11px] text-slate-400 font-medium">Download authorized employee resources</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">Globex Employee Handbook (v3.2)</span>
              </div>
              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Download">
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">Health Benefits & Insurance Guide</span>
              </div>
              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Download">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
