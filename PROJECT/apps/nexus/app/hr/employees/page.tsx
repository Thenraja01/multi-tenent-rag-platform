'use client';

import React, { useState } from 'react';
import { EnterpriseAppShell } from '@/components/layout/EnterpriseAppShell';
import { useAuthStore } from '@/stores/auth-store';
import { AccessScope } from '@/components/shared/DataScopeIndicator';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Building2,
  Calendar,
  Shield,
  User,
} from 'lucide-react';

const MOCK_EMPLOYEES = [
  {
    id: '1',
    name: 'Arun Kumar',
    email: 'arun@globex.com',
    department: 'Human Resources',
    role: 'Department Manager',
    status: 'Active',
    joined: 'Jan 2026',
    location: 'Headquarters',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@globex.com',
    department: 'Finance',
    role: 'Department Employee',
    status: 'Active',
    joined: 'Feb 2026',
    location: 'Headquarters',
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david@globex.com',
    department: 'IT & DevOps',
    role: 'Department Manager',
    status: 'Active',
    joined: 'Mar 2026',
    location: 'Remote',
  },
  {
    id: '4',
    name: 'Sarah Jenkins',
    email: 'sarah.j@globex.com',
    department: 'Human Resources',
    role: 'Department Admin',
    status: 'Active',
    joined: 'Jan 2026',
    location: 'Headquarters',
  },
  {
    id: '5',
    name: 'Michael Ross',
    email: 'michael.r@globex.com',
    department: 'Sales & Marketing',
    role: 'Department Employee',
    status: 'Active',
    joined: 'Apr 2026',
    location: 'West Coast Office',
  },
  {
    id: '6',
    name: 'Elena Rostova',
    email: 'elena@globex.com',
    department: 'Human Resources',
    role: 'Department Employee',
    status: 'Active',
    joined: 'May 2026',
    location: 'Headquarters',
  },
];

export default function HREmployeesPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');

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

  // Filter employees based on scope and search
  const filtered = MOCK_EMPLOYEES.filter((emp) => {
    // Scope restriction
    if (resolvedScope === 'DEPARTMENT' && emp.department !== deptName) return false;
    if (resolvedScope === 'TEAM' && emp.department !== deptName) return false;

    // Search query
    const matchesSearch =
      !search ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    // Filters
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || emp.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesLoc = selectedLocation === 'ALL' || emp.location === selectedLocation;

    return matchesSearch && matchesDept && matchesStatus && matchesLoc;
  });

  return (
    <EnterpriseAppShell
      scope={resolvedScope}
      departmentName={deptName}
      breadcrumbItems={[
        { label: 'HR', href: '/hr' },
        { label: 'Employees', href: '/hr/employees' },
        ...(resolvedScope !== 'ORGANIZATION' ? [{ label: deptName }] : []),
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isEmployee ? 'My Profile' : 'Employees'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isEmployee
                ? 'Your personal employee profile, department allocation, and role details.'
                : `Directory of ${filtered.length} active personnel in your authorized scope.`}
            </p>
          </div>

          {!isEmployee && (
            <div className="flex items-center gap-2.5">
              <button className="px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                <span>Export Roster</span>
              </button>
              <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>+ Add Employee</span>
              </button>
            </div>
          )}
        </div>

        {/* Employee Self-Service Profile View */}
        {isEmployee ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                {(user?.full_name || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{user?.full_name || 'Employee'}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    ● Active Status
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-bold text-slate-800">{deptName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Role</span>
                <span className="font-bold text-slate-800">{user?.role || 'Department Employee'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Employment Type</span>
                <span className="font-bold text-slate-800">Full-Time Permanent</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Joined Date</span>
                <span className="font-bold text-slate-800">Jan 15, 2026</span>
              </div>
            </div>
          </div>
        ) : (
          /* Administrative Directory Table */
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees by name or email..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              {/* Dropdowns */}
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
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="ALL">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="ALL">All Locations</option>
                  <option value="Headquarters">Headquarters</option>
                  <option value="Remote">Remote</option>
                  <option value="West Coast Office">West Coast Office</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3.5">USER</th>
                      <th className="px-5 py-3.5">DEPARTMENT</th>
                      <th className="px-5 py-3.5">ROLE</th>
                      <th className="px-5 py-3.5">STATUS</th>
                      <th className="px-5 py-3.5">JOINED</th>
                      <th className="px-5 py-3.5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {emp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block leading-tight">
                                {emp.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-normal block leading-tight mt-0.5">
                                {emp.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 align-middle">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {emp.department}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-middle">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                            {emp.role}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-middle">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-700">
                              {emp.status}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 align-middle font-mono text-slate-500">
                          {emp.joined}
                        </td>

                        <td className="px-5 py-4 align-middle text-right">
                          <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </EnterpriseAppShell>
  );
}
