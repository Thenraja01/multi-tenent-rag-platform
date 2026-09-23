'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { superadminApi, OrganizationDTO } from '@/lib/api/superadmin';

export function RecentOrganizationsTable() {
  const [orgs, setOrgs] = useState<OrganizationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await superadminApi.getOrganizations();
        setOrgs(data || []);
      } catch (err) {
        console.error('Failed to load recent organizations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Card className="p-6 bg-slate-900/70 border-slate-800 backdrop-blur-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Recent Organizations</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live Registry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Newly provisioned tenant workspaces across the platform
          </p>
        </div>
        <Link
          href="/superadmin/organizations"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
        >
          <span>View All Organizations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto py-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 text-slate-400 font-mono uppercase text-[10px]">
              <th className="py-2.5 px-3">Organization</th>
              <th className="py-2.5 px-3">Pack</th>
              <th className="py-2.5 px-3">Users</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Created</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500 font-mono text-xs">
                  Loading organizations...
                </td>
              </tr>
            ) : orgs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500 font-mono text-xs">
                  No organizations registered yet.
                </td>
              </tr>
            ) : (
              orgs.slice(0, 5).map((org) => (
                <tr key={org.id} className="hover:bg-slate-950/40 transition">
                  {/* Name & Subdomain */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{org.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">{org.subdomain || org.slug}.localfix.app</span>
                      </div>
                    </div>
                  </td>

                  {/* Pack */}
                  <td className="py-3 px-3">
                    <span className="text-slate-200 font-medium">{org.plan || org.plan_name || 'Standard'}</span>
                  </td>

                  {/* Users */}
                  <td className="py-3 px-3">
                    <span className="font-mono font-semibold text-slate-200">{org.usersCount ?? 1}</span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    {org.status === 'active' || org.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {org.status}
                      </span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'Live'}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/superadmin/organizations/${org.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition inline-flex items-center gap-1"
                      title="Manage Tenant"
                    >
                      <span className="text-[11px] font-semibold text-indigo-400 hover:underline">Manage</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px]">Total Organizations: {orgs.length}</span>
        <Link
          href="/superadmin/organizations/create"
          className="text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          + Provision New Organization
        </Link>
      </div>
    </Card>
  );
}
