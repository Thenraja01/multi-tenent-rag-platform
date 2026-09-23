'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Network,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Mail,
  Building2,
  Lock,
  ArrowUpDown
} from 'lucide-react';

export default function AdminUsersPage() {
  const params = useParams();
  const { user: currentAdminUser, organization } = useWorkspace();
  const orgSlug = organization?.slug || (params?.tenant as string) || 'org';
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Realistic user list with multi-department memberships
  const users = [
    {
      id: 'usr_001',
      name: currentAdminUser?.full_name || 'Organization Admin',
      email: currentAdminUser?.email || `admin@${orgSlug}.com`,
      is_org_admin: true,
      status: 'ACTIVE',
      last_active: '5 mins ago',
      created_at: '2026-08-10',
      memberships: [
        { department: 'HR', role: 'HR Manager', scope: 'Department' },
        { department: 'IT', role: 'IT Support', scope: 'Team' },
      ],
    },
    {
      id: 'usr_002',
      name: 'Sarah Chen',
      email: `sarah.chen@${orgSlug}.com`,
      is_org_admin: false,
      status: 'ACTIVE',
      last_active: '12 mins ago',
      created_at: '2026-08-15',
      memberships: [
        { department: 'Finance', role: 'Finance Admin', scope: 'Organization' },
      ],
    },
    {
      id: 'usr_003',
      name: 'David Miller',
      email: `david.m@${orgSlug}.com`,
      is_org_admin: false,
      status: 'ACTIVE',
      last_active: '1 hour ago',
      created_at: '2026-08-20',
      memberships: [
        { department: 'HR', role: 'HR Employee', scope: 'Self' },
      ],
    },
    {
      id: 'usr_004',
      name: 'Elena Rostova',
      email: `elena.r@${orgSlug}.com`,
      is_org_admin: false,
      status: 'ACTIVE',
      last_active: '3 hours ago',
      created_at: '2026-09-01',
      memberships: [
        { department: 'Legal', role: 'Legal Counsel', scope: 'Department' },
      ],
    },
    {
      id: 'usr_005',
      name: 'Marcus Vance',
      email: `marcus.v@${orgSlug}.com`,
      is_org_admin: false,
      status: 'SUSPENDED',
      last_active: '4 days ago',
      created_at: '2026-07-12',
      memberships: [
        { department: 'IT', role: 'IT Admin', scope: 'Department' },
      ],
    },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      departmentFilter === 'ALL' ||
      u.memberships.some((m) => m.department.toUpperCase() === departmentFilter.toUpperCase());
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Organization Members</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage multi-department memberships, tiered roles, and access scopes for all users.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/org-admin/invitations"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs shadow-lg shadow-orange-600/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Invite Member</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Departments</option>
            <option value="HR">HR</option>
            <option value="FINANCE">Finance</option>
            <option value="IT">IT</option>
            <option value="LEGAL">Legal</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Member Name & Email</th>
                <th className="py-3 px-4">Department Memberships & Roles</th>
                <th className="py-3 px-4">Org Admin</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Name & Email */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{u.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Multi-department Memberships */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {u.memberships.map((m, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono flex items-center gap-1.5"
                        >
                          <span className="font-semibold text-orange-400">{m.department}:</span>
                          <span className="text-slate-300">{m.role}</span>
                          <span className="text-[9px] text-slate-500 font-sans">({m.scope})</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Org Admin Flag */}
                  <td className="py-3 px-4">
                    {u.is_org_admin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-mono font-bold">
                        <Shield className="w-3 h-3" />
                        <span>ORG ADMIN</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Member</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {u.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ACTIVE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <XCircle className="w-3 h-3" />
                        <span>SUSPENDED</span>
                      </span>
                    )}
                  </td>

                  {/* Last Active */}
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {u.last_active}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
