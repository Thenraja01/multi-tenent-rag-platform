'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Shield,
  Layers,
  Network,
  Lock,
  CheckCircle2,
  X,
  Key,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  AlertCircle,
  Edit3,
  Trash2,
  Check,
  Building2,
  Sparkles,
  Sliders,
  Eye,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { apiClient } from '@/lib/api/client';

interface DepartmentItem {
  id: string;
  name: string;
  slug: string;
  is_primary?: boolean;
}

interface RoleItem {
  id: string;
  name: string;
  slug: string;
  is_system?: boolean;
}

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  is_active: boolean;
  status?: string; // ACTIVE, PENDING_APPROVAL, SUSPENDED, INVITED
  is_org_admin?: boolean;
  is_superadmin?: boolean;
  departments?: DepartmentItem[];
  roles?: RoleItem[];
  department_id?: string | null;
  department_name?: string;
  department_slug?: string;
  role_id?: string | null;
  role_name?: string;
  role_slug?: string;
  role?: string;
  permission_keys?: string[];
  created_at?: string;
}

interface DepartmentRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status?: string;
}

interface RoleRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_system?: boolean;
  permission_keys?: string[];
}

export default function TenantUsersPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'globex';

  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [departmentsList, setDepartmentsList] = useState<DepartmentRecord[]>([]);
  const [rolesList, setRolesList] = useState<RoleRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Member Management & UBAC Drawer/Modal State
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editTab, setEditTab] = useState<'profile' | 'ubac'>('profile');
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDeptId, setEditDeptId] = useState<string>('');
  const [editRoleId, setEditRoleId] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');
  const [savingUser, setSavingUser] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // User Creation Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Matrix@2026Secure!');
  const [newUserDeptId, setNewUserDeptId] = useState<string>('');
  const [newUserRoleId, setNewUserRoleId] = useState<string>('');
  const [newUserStatus, setNewUserStatus] = useState<string>('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  const getRoleLabel = (slug?: string, name?: string) => {
    if (name && !['emp', 'superadmin', 'tenant_admin', 'department_admin', 'manager', 'support'].includes(name.toLowerCase())) {
      return name;
    }
    switch ((slug || '').toLowerCase()) {
      case 'superadmin':
      case 'super_admin':
        return 'Super Admin';
      case 'tenant_admin':
      case 'org_admin':
      case 'admin':
        return 'Organization Administrator';
      case 'department_admin':
        return 'Department Admin';
      case 'manager':
        return 'Manager';
      case 'support':
        return 'Support Specialist';
      case 'emp':
      case 'employee':
        return 'Employee';
      default:
        return name || slug || 'Employee';
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, deptsRes, rolesRes] = await Promise.all([
        apiClient.get<any>('/users?page=1&page_size=100').catch(() => ({ data: { items: [] } })),
        apiClient.get<DepartmentRecord[]>('/departments').catch(() => ({ data: [] })),
        apiClient.get<RoleRecord[]>('/roles').catch(() => ({ data: [] })),
      ]);

      const rawUsers = usersRes.data;
      const users: UserRecord[] = Array.isArray(rawUsers)
        ? rawUsers
        : (rawUsers?.items || []);
      const depts = Array.isArray(deptsRes.data) ? deptsRes.data : [];
      const roles = Array.isArray(rolesRes.data) ? rolesRes.data : [];

      setUsersList(users);
      setDepartmentsList(depts);
      setRolesList(roles);

      if (depts.length > 0 && !newUserDeptId) setNewUserDeptId(depts[0].id);
      if (roles.length > 0 && !newUserRoleId) {
        const empRole = roles.find((r) => r.slug === 'emp') || roles[0];
        setNewUserRoleId(empRole.id);
      }
    } catch (err) {
      console.error('Failed to load users from backend API:', err);
      setError('Could not connect to API backend to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const name = u.full_name || u.name || '';
      const email = u.email || '';
      const deptName = u.department_name || (u.departments && u.departments[0]?.name) || '';
      const roleSlug = u.role_slug || (u.roles && u.roles[0]?.slug) || u.role || '';
      const statusVal = (u.status || (u.is_active ? 'ACTIVE' : 'PENDING_APPROVAL')).toUpperCase();

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        deptName.toLowerCase().includes(query) ||
        roleSlug.toLowerCase().includes(query);

      const userDeptId = u.department_id || (u.departments && u.departments[0]?.id);
      const matchesDept =
        selectedDeptFilter === 'ALL' ||
        (selectedDeptFilter === 'NONE' ? !userDeptId : userDeptId === selectedDeptFilter);

      const matchesStatus =
        selectedStatusFilter === 'ALL' || statusVal === selectedStatusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [usersList, searchQuery, selectedDeptFilter, selectedStatusFilter]);

  // Open Edit & UBAC Drawer
  const handleOpenEditUser = (user: UserRecord) => {
    setEditingUser(user);
    setEditFullName(user.full_name || user.name || '');
    setEditEmail(user.email || '');
    setEditDeptId(user.department_id || (user.departments && user.departments[0]?.id) || '');
    setEditRoleId(user.role_id || (user.roles && user.roles[0]?.id) || '');
    setEditStatus(user.status || (user.is_active ? 'ACTIVE' : 'PENDING_APPROVAL'));
    setEditTab('profile');
    setSaveSuccess(false);
  };

  // Approve Pending Registration
  const handleApproveUser = async (userId: string) => {
    try {
      await apiClient.post(`/users/${userId}/approve`);
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, status: 'ACTIVE', is_active: true }
            : u
        )
      );
      if (editingUser?.id === userId) {
        setEditingUser((prev) => prev ? { ...prev, status: 'ACTIVE', is_active: true } : null);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve member.');
    }
  };

  // Save User Updates
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingUser(true);
    try {
      const payload = {
        full_name: editFullName.trim(),
        email: editEmail.trim(),
        status: editStatus,
        is_active: editStatus === 'ACTIVE',
        department_id: editDeptId || null,
        role_id: editRoleId || null,
      };

      const res = await apiClient.patch<UserRecord>(`/users/${editingUser.id}`, payload);
      if (res.data) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...res.data } : u))
        );
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setEditingUser(null);
        }, 1000);
      }
    } catch (err: any) {
      console.error('Failed to update user:', err);
      alert(err.response?.data?.detail || 'Failed to update user on the server.');
    } finally {
      setSavingUser(false);
    }
  };

  // Create / Invite User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        full_name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        department_id: newUserDeptId || undefined,
        role_id: newUserRoleId || undefined,
        status: newUserStatus,
        is_active: newUserStatus === 'ACTIVE',
      };

      const res = await apiClient.post<UserRecord>('/users', payload);
      if (res.data) {
        setUsersList((prev) => [res.data, ...prev]);
      }
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('Matrix@2026Secure!');
      setNewUserStatus('ACTIVE');
      setCreateModalOpen(false);
    } catch (err: any) {
      console.error('Failed to create user via API:', err);
      alert(err.response?.data?.detail || 'Failed to create user on the server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Deactivate User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this member?')) return;

    try {
      await apiClient.delete(`/users/${userId}`);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: false, status: 'SUSPENDED' } : u))
      );
      if (editingUser?.id === userId) setEditingUser(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to deactivate member.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Organization Members & Access</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-semibold">
              {tenantSlug.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage organization members, approve onboarding registrations, assign dynamic departments, and configure canonical RBAC roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Live API Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite / Add Member</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Departments</option>
            <option value="NONE">Tenant Wide (No Dept)</option>
            {departmentsList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">🟢 Active</option>
            <option value="PENDING_APPROVAL">🟡 Pending Approval</option>
            <option value="SUSPENDED">🔴 Suspended</option>
            <option value="INVITED">🔵 Invited</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
            Loading organization directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            No members match your current search/filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Member Identity</th>
                  <th className="py-3 px-4">Department Mention</th>
                  <th className="py-3 px-4">Assigned Role (RBAC)</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const deptDisplay = u.department_name || (u.departments && u.departments[0]?.name) || 'Tenant Wide';
                  const roleSlug = u.role_slug || (u.roles && u.roles[0]?.slug) || u.role || (u.is_org_admin ? 'tenant_admin' : 'emp');
                  const roleLabel = getRoleLabel(roleSlug);
                  const isTenantAdmin = roleSlug === 'tenant_admin' || u.is_org_admin;
                  const statusVal = (u.status || (u.is_active ? 'ACTIVE' : 'PENDING_APPROVAL')).toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-950/40 transition">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                            {(u.full_name || u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{u.full_name || u.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department Mention */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                          <Network className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-slate-200 font-medium">{deptDisplay}</span>
                        </div>
                      </td>

                      {/* Canonical Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            isTenantAdmin
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {roleLabel}
                        </span>
                      </td>

                      {/* Lifecycle Status */}
                      <td className="py-3.5 px-4">
                        {statusVal === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : statusVal === 'PENDING_APPROVAL' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                            Pending Approval
                          </span>
                        ) : statusVal === 'INVITED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <UserCheck className="w-3 h-3 text-blue-400" />
                            Invited
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {statusVal === 'PENDING_APPROVAL' ? (
                          <button
                            onClick={() => handleApproveUser(u.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Review & Approve</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-semibold transition inline-flex items-center gap-1.5 border border-slate-700/60 hover:border-blue-500"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit & Access</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Member Management Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Member Configuration & RBAC</h2>
                  <p className="text-[11px] text-slate-400">{editingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Department Selection */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Network className="w-3 h-3 text-emerald-400" />
                    <span>Dynamic Department</span>
                  </label>
                  <select
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Tenant Wide (None)</option>
                    {departmentsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.slug})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Canonical Role Assignment */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-400" />
                    <span>Canonical Role</span>
                  </label>
                  <select
                    value={editRoleId}
                    onChange={(e) => setEditRoleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {rolesList.length === 0 ? (
                      <option value="">Loading roles from database...</option>
                    ) : (
                      rolesList.map((r: any) => (
                        <option key={r.id} value={r.id}>
                          {r.tier_label || r.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Lifecycle Status Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lifecycle Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">🟢 Active (Full Access)</option>
                  <option value="PENDING_APPROVAL">🟡 Pending Approval (Blocked)</option>
                  <option value="SUSPENDED">🔴 Suspended (Deactivated)</option>
                  <option value="INVITED">🔵 Invited (Awaiting Signup)</option>
                </select>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Member details and permissions updated successfully.</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteUser(editingUser.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Deactivate Member</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold shadow-md transition"
                  >
                    {savingUser ? 'Saving...' : 'Save Member Configuration'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Invite / Provision Member</h2>
                  <p className="text-[11px] text-slate-400">Assign dynamic department and canonical role</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Raja"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="raja@company.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Password *</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Department Selection */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Network className="w-3 h-3 text-emerald-400" />
                    <span>Department Mention</span>
                  </label>
                  <select
                    value={newUserDeptId}
                    onChange={(e) => setNewUserDeptId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Tenant Wide (None)</option>
                    {departmentsList.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.slug})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-400" />
                    <span>Canonical Role</span>
                  </label>
                  <select
                    value={newUserRoleId}
                    onChange={(e) => setNewUserRoleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {rolesList.length === 0 ? (
                      <option value="">Loading roles from database...</option>
                    ) : (
                      rolesList.map((r: any) => (
                        <option key={r.id} value={r.id}>
                          {r.tier_label || r.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Status</label>
                <select
                  value={newUserStatus}
                  onChange={(e) => setNewUserStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">🟢 Active (Immediate Access)</option>
                  <option value="PENDING_APPROVAL">🟡 Pending Approval</option>
                  <option value="INVITED">🔵 Invited</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold shadow-md transition"
                >
                  {submitting ? 'Inviting...' : 'Provision Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
