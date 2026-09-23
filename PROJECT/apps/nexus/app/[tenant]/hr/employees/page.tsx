'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { usePermissions } from '@/providers/WorkspaceProvider';
import { useDepartments } from '@/hooks/use-departments';
import { useTenantStore } from '@/stores/tenant-store';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  Building2,
  Calendar,
  Sparkles,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function HREmployeesPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const { tenant } = useTenantStore();
  const { enabledDepartments, departments } = useDepartments(tenant?.id || tenantSlug);
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formDesignation, setFormDesignation] = useState('Software Engineer');
  const [formBio, setFormBio] = useState('');

  // Auto-set default department when departments load
  React.useEffect(() => {
    if (!formDepartment && enabledDepartments.length > 0) {
      setFormDepartment(enabledDepartments[0].name);
    }
  }, [enabledDepartments, formDepartment]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr-employees', search, departmentFilter],
    queryFn: () =>
      api.hr.getEmployees({
        search: search || undefined,
        department: departmentFilter || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (newEmp: any) => api.hr.createEmployee(newEmp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
      setIsCreateOpen(false);
      setFormCode('');
      setFormFirstName('');
      setFormLastName('');
      setFormEmail('');
      setFormPhone('');
      setFormBio('');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      employee_code: formCode,
      first_name: formFirstName,
      last_name: formLastName,
      email: formEmail,
      phone: formPhone,
      department: formDepartment,
      designation: formDesignation,
      bio: formBio,
    });
  };

  const employees = data?.items || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Users className="w-5 h-5" />
            </div>
            HR Employee Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centrally manage personnel, departmental designations, profiles, and reporting structures
          </p>
        </div>

        {can('employee:create') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Employee</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or employee code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Departments</option>
          {enabledDepartments.map((dept) => (
            <option key={dept.id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Employees Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Employee</th>
              <th className="px-5 py-3.5 font-semibold">Code</th>
              <th className="px-5 py-3.5 font-semibold">Department & Role</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2" />
                  Loading employee directory...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-rose-400">
                  Failed to load employee records from backend.
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  No employee records found matching your filters.
                </td>
              </tr>
            ) : (
              employees.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/20 to-indigo-500/20 border border-slate-700 flex items-center justify-center text-slate-200 font-semibold text-xs">
                        {emp.first_name?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{emp.full_name}</p>
                        <p className="text-[10px] text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-indigo-300">
                    {emp.employee_code}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-200 font-medium">{emp.designation}</p>
                    <p className="text-[10px] text-slate-500">{emp.department}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">
                    {emp.joining_date || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Onboard Employee Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Onboard New Employee</h3>
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-1002"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    required
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {enabledDepartments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Bio / Profile Summary</label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Senior engineer specializing in cloud platforms..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow transition disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
