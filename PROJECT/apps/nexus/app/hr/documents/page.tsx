'use client';

import React, { useState } from 'react';
import { EnterpriseAppShell } from '@/components/layout/EnterpriseAppShell';
import { useAuthStore } from '@/stores/auth-store';
import { AccessScope } from '@/components/shared/DataScopeIndicator';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  CheckCircle2,
  Sparkles,
  Shield,
  Eye,
} from 'lucide-react';

const MOCK_DOCS = [
  {
    id: '1',
    title: 'Globex Employee Handbook.pdf',
    department: 'Human Resources',
    owner: 'HR Admin',
    version: 'v3.2',
    ragStatus: 'Indexed',
    access: 'Organization',
    updated: 'Today',
    size: '2.4 MB',
  },
  {
    id: '2',
    title: 'Leave Policy & PTO Guidelines.pdf',
    department: 'Human Resources',
    owner: 'HR Admin',
    version: 'v2.0',
    ragStatus: 'Indexed',
    access: 'Human Resources',
    updated: 'Yesterday',
    size: '840 KB',
  },
  {
    id: '3',
    title: 'Health Benefits & Medical Coverage.pdf',
    department: 'Human Resources',
    owner: 'HR Admin',
    version: 'v1.5',
    ragStatus: 'Indexed',
    access: 'Organization',
    updated: 'Sep 10, 2026',
    size: '1.8 MB',
  },
  {
    id: '4',
    title: 'Compensation & Bonus Structure.pdf',
    department: 'Finance & HR',
    owner: 'Org Administrator',
    version: 'v1.0',
    ragStatus: 'Indexed',
    access: 'Confidential / Admin',
    updated: 'Aug 28, 2026',
    size: '520 KB',
  },
];

export default function HRDocumentsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

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

  const filtered = MOCK_DOCS.filter((d) => {
    if (isEmployee && d.access.includes('Confidential')) return false;

    const matchesSearch =
      !search || d.title.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || d.department.includes(selectedDept);
    const matchesStatus =
      selectedStatus === 'ALL' || d.ragStatus.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <EnterpriseAppShell
      scope={resolvedScope}
      departmentName={deptName}
      breadcrumbItems={[
        { label: 'HR', href: '/hr' },
        { label: 'Documents', href: '/hr/documents' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              HR Document Vault
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Enterprise policies and HR reference assets ingested into the Nexus RAG knowledge graph.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {!isEmployee && (
              <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>+ Upload Document</span>
              </button>
            )}
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
              placeholder="Search documents by filename or policy name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Departments</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance & HR">Finance & HR</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="ALL">All RAG Status</option>
              <option value="indexed">Indexed (Active)</option>
              <option value="processing">Processing</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">DOCUMENT</th>
                  <th className="px-5 py-3.5">DEPARTMENT</th>
                  <th className="px-5 py-3.5">VERSION</th>
                  <th className="px-5 py-3.5">RAG STATUS</th>
                  <th className="px-5 py-3.5">ACCESS LEVEL</th>
                  <th className="px-5 py-3.5">UPDATED</th>
                  <th className="px-5 py-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{d.title}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{d.size}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle font-medium text-slate-700">
                      {d.department}
                    </td>

                    <td className="px-5 py-4 align-middle font-mono font-bold text-slate-600">
                      {d.version}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>{d.ragStatus}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle font-medium text-slate-600">
                      {d.access}
                    </td>

                    <td className="px-5 py-4 align-middle font-mono text-slate-400">
                      {d.updated}
                    </td>

                    <td className="px-5 py-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EnterpriseAppShell>
  );
}
