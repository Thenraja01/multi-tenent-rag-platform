'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Shield, ArrowLeft, Check, Save, User } from 'lucide-react';
import { DomainRoleType } from '@/types/database';

export default function UserRolesAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = (params?.tenant as string) || 'default';
  const userId = (params?.id as string) || '';

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.users.getById(userId),
    enabled: !!userId,
  });

  const domains = [
    {
      name: 'Human Resources (HR)',
      slug: 'hr',
      roles: [
        { value: 'none', label: 'No Access' },
        { value: 'hr-user', label: 'HR User (Read & Query)' },
        { value: 'hr-knowledge-manager', label: 'HR Knowledge Manager (Upload docs)' },
        { value: 'hr-manager', label: 'HR Manager (Review & Chat)' },
        { value: 'hr-admin', label: 'HR Admin (Full Domain Control)' },
      ],
    },
    {
      name: 'Finance & Accounting',
      slug: 'finance',
      roles: [
        { value: 'none', label: 'No Access' },
        { value: 'finance-user', label: 'Finance User (Read only)' },
        { value: 'finance-analyst', label: 'Finance Analyst (Queries & Invoices)' },
        { value: 'finance-manager', label: 'Finance Manager (Approval & Docs)' },
        { value: 'finance-admin', label: 'Finance Admin (Full Domain Control)' },
      ],
    },
    {
      name: 'IT & Engineering',
      slug: 'it',
      roles: [
        { value: 'none', label: 'No Access' },
        { value: 'it-user', label: 'IT User (Read docs)' },
        { value: 'it-engineer', label: 'IT Engineer (Architecture & API docs)' },
        { value: 'it-manager', label: 'IT Manager (Runbooks & Incidents)' },
        { value: 'it-admin', label: 'IT Admin (Full IT Control)' },
      ],
    },
  ];

  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({
    hr: 'hr-manager',
    finance: 'finance-user',
    it: 'none',
  });

  const [saved, setSaved] = useState(false);

  const updateRolesMutation = useMutation({
    mutationFn: async () => {
      const formattedRoles = Object.entries(selectedRoles)
        .filter(([, role]) => role !== 'none')
        .map(([domainSlug, role]) => ({
          domain_id: domainSlug,
          role,
        }));
      return await api.users.updateUserRoles(userId, formattedRoles);
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleRoleChange = (domainSlug: string, roleValue: string) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [domainSlug]: roleValue,
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href={`/${tenantSlug}/users`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Team Members</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {user?.full_name || 'Member Profile'}
            </h1>
            <p className="text-xs text-slate-400">{user?.email || 'user@tenant.com'}</p>
          </div>
        </div>

        <button
          onClick={() => updateRolesMutation.mutate()}
          disabled={updateRolesMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold shadow-lg transition"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Roles Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{updateRolesMutation.isPending ? 'Saving...' : 'Save Role Assignments'}</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Domain Role Configuration
        </h3>

        {domains.map((dom) => (
          <div
            key={dom.slug}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">{dom.name}</h4>
                <p className="text-xs text-slate-400">Namespace: {dom.slug}</p>
              </div>

              <select
                value={selectedRoles[dom.slug] || 'none'}
                onChange={(e) => handleRoleChange(dom.slug, e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 max-w-xs"
              >
                {dom.roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
