'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users, Shield, ArrowRight } from 'lucide-react';

export default function DomainUsersPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const domainSlug = (params?.domain as string) || 'hr';

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['domain-users', domainSlug],
    queryFn: () => api.users.getAll(),
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {domainSlug.toUpperCase()} Domain Authorized Users
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Employees authorized to query or manage the {domainSlug.toUpperCase()} knowledge vector space
          </p>
        </div>

        <Link
          href={`/${tenantSlug}/users`}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
        >
          Manage All Tenant Users
        </Link>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5 font-semibold">User Profile</th>
              <th className="px-5 py-3.5 font-semibold">Domain Role</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-slate-500">
                  Loading authorized users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-slate-500">
                  No users assigned to this domain yet.
                </td>
              </tr>
            ) : (
              users.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-semibold text-xs">
                        {(m.full_name || m.first_name || m.email || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email}</p>
                        <p className="text-[10px] text-slate-400">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {typeof m.role === 'string' ? m.role : m.role?.name || m.role?.slug || `${domainSlug}-member`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                      {m.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
