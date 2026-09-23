'use client';

import React, { useState } from 'react';
import { EnterpriseAppShell } from '@/components/layout/EnterpriseAppShell';
import { useAuthStore } from '@/stores/auth-store';
import { AccessScope } from '@/components/shared/DataScopeIndicator';
import {
  CalendarDays,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  X,
} from 'lucide-react';

const MOCK_LEAVE_REQUESTS = [
  {
    id: '1',
    employee: 'Priya Sharma',
    department: 'Finance',
    type: 'Sick Leave',
    dates: 'Sep 22 - Sep 23, 2026',
    days: '2 days',
    status: 'Pending',
    reason: 'Medical recovery under doctor prescription.',
  },
  {
    id: '2',
    employee: 'Arun Kumar',
    department: 'Human Resources',
    type: 'Casual Leave',
    dates: 'Sep 24, 2026',
    days: '1 day',
    status: 'Pending',
    reason: 'Family event attendance.',
  },
  {
    id: '3',
    employee: 'David Chen',
    department: 'IT & DevOps',
    type: 'Annual Leave',
    dates: 'Sep 25 - Sep 27, 2026',
    days: '3 days',
    status: 'Approved',
    reason: 'Pre-scheduled annual personal leave.',
  },
  {
    id: '4',
    employee: 'Michael Ross',
    department: 'Sales & Marketing',
    type: 'Casual Leave',
    dates: 'Sep 28, 2026',
    days: '1 day',
    status: 'Approved',
    reason: 'Personal errands.',
  },
];

export default function HRLeavePage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState(MOCK_LEAVE_REQUESTS);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [reviewingReq, setReviewingReq] = useState<any | null>(null);

  // Form State
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

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

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: String(Date.now()),
      employee: user?.full_name || 'Employee User',
      department: deptName,
      type: leaveType,
      dates: `${startDate || 'Oct 02'} - ${endDate || 'Oct 03, 2026'}`,
      days: '2 days',
      status: 'Pending',
      reason: reason || 'Personal leave request.',
    };
    setRequests([newReq, ...requests]);
    setIsApplyOpen(false);
    setReason('');
  };

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    setReviewingReq(null);
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    setReviewingReq(null);
  };

  const filtered = requests.filter((r) => {
    if (resolvedScope === 'DEPARTMENT' && r.department !== deptName) return false;
    if (resolvedScope === 'TEAM' && r.department !== deptName) return false;
    if (resolvedScope === 'SELF' && r.employee !== (user?.full_name || 'Arun Kumar')) {
      // For demo self view
    }

    const matchesSearch =
      !search ||
      r.employee.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || r.department === selectedDept;
    const matchesType = selectedType === 'ALL' || r.type === selectedType;
    const matchesStatus =
      selectedStatus === 'ALL' || r.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesDept && matchesType && matchesStatus;
  });

  return (
    <EnterpriseAppShell
      scope={resolvedScope}
      departmentName={deptName}
      breadcrumbItems={[
        { label: 'HR', href: '/hr' },
        { label: 'Leave Management', href: '/hr/leave' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isEmployee ? 'My Leave' : 'Leave Management'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isEmployee
                ? 'Check leave balances, submit PTO applications, and review request statuses.'
                : 'Review, approve, and audit departmental leave requests across authorized teams.'}
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsApplyOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Apply Leave</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leave requests by employee or notes..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {resolvedScope === 'ORGANIZATION' && (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Departments</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="IT & DevOps">IT & DevOps</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
              </select>
            )}

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Leave Types</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Annual Leave">Annual Leave</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">EMPLOYEE</th>
                  <th className="px-5 py-3.5">DEPARTMENT</th>
                  <th className="px-5 py-3.5">LEAVE TYPE</th>
                  <th className="px-5 py-3.5">DATES</th>
                  <th className="px-5 py-3.5">STATUS</th>
                  <th className="px-5 py-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                          {r.employee.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{r.employee}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle font-medium text-slate-700">
                      {r.department}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                        {r.type}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle font-mono text-slate-600">
                      {r.dates}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                            : r.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                            : 'bg-rose-50 text-rose-700 border-rose-200/60'
                        }`}
                      >
                        {r.status === 'Approved' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{r.status}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle text-right">
                      {r.status === 'Pending' && !isEmployee ? (
                        <button
                          onClick={() => setReviewingReq(r)}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          Review
                        </button>
                      ) : (
                        <button
                          onClick={() => setReviewingReq(r)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Apply Leave Modal */}
        {isApplyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span>Apply for Time Off</span>
                </h3>
                <button
                  onClick={() => setIsApplyOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="Annual Leave">Annual Leave (12 days available)</option>
                    <option value="Sick Leave">Sick Leave (10 days available)</option>
                    <option value="Casual Leave">Casual Leave (4 days available)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason / Notes</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly state reason for leave..."
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsApplyOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 transition"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Review Leave Modal */}
        {reviewingReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Review Leave — {reviewingReq.employee}
                </h3>
                <button
                  onClick={() => setReviewingReq(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Department:</span>
                  <span className="font-bold text-slate-800">{reviewingReq.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Leave Type:</span>
                  <span className="font-bold text-slate-800">{reviewingReq.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Dates:</span>
                  <span className="font-bold text-slate-800">{reviewingReq.dates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Reason:</span>
                  <span className="text-slate-800 italic">{reviewingReq.reason}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleReject(reviewingReq.id)}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(reviewingReq.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 transition"
                >
                  Approve Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EnterpriseAppShell>
  );
}
