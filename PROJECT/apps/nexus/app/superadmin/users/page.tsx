'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  RefreshCw,
  Trash2,
  Pencil,
  Shield,
  Building2,
} from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { KpiCard } from '@/components/shared/KpiCard';
import { CreateUserForm } from '@/components/forms';
import { superadminApi, OrganizationDTO } from '@/lib/api/superadmin';

export default function GlobalUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationDTO[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, orgsData, rolesData] = await Promise.all([
        superadminApi.getUsers(),
        superadminApi.getOrganizations(),
        superadminApi.getRoles().catch(() => []),
      ]);
      setUsers(usersData || []);
      setOrganizations(orgsData || []);
      setRoles(rolesData || []);
    } catch (err) {
      console.error('Failed to fetch platform users/orgs/roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (user: any) => {
    try {
      if (user.is_active || user.isActive) {
        await superadminApi.suspendUser(user.id);
      } else {
        await superadminApi.activateUser(user.id);
      }
      await fetchData();
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await superadminApi.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const filtered = safeUsers.filter(
    (u) =>
      (u.name || u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.tenant || u.organization_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.department_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md shadow-indigo-600/20">
            {(row.name || row.full_name || row.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{row.name || row.full_name || 'Unnamed User'}</span>
            <span className="text-[10px] font-mono text-slate-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'Organization',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono text-slate-300">
          {row.is_superadmin ? (
            <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Platform SuperAdmin
            </span>
          ) : (
            row.tenant || row.organization_name || 'Unassigned Tenant'
          )}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (row) => {
        const dept = row.department_name || row.department?.name;
        return dept ? (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
            {dept}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-500">—</span>
        );
      },
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (row) => {
        const rawRole = row.role;
        const roleStr = typeof rawRole === 'string' ? rawRole : rawRole?.name || rawRole?.slug || '';
        const roleName = roleStr || (row.is_superadmin ? 'Platform Super Admin' : row.is_org_admin ? 'Organization Admin' : 'Member');
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
            {roleName}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.is_active || row.isActive !== false ? 'ACTIVE' : 'SUSPENDED'} />
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono text-slate-400">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {/* Edit User Action */}
          <button
            onClick={() => setEditingUser(row)}
            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition cursor-pointer"
            title="Edit user details"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Suspend / Activate Action */}
          <button
            onClick={() => handleToggleStatus(row)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${row.is_active || row.isActive !== false
                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
          >
            {row.is_active || row.isActive !== false ? 'Suspend' : 'Activate'}
          </button>

          {/* Delete Action */}
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
            title="Delete user"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Platform Identity & Access</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Users & Roles</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage all users, tenant members, and platform superadministrators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setEditingUser(null);
              setIsCreateOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Total Users" value={users.length} change="Live Identities" />
        <KpiCard
          title="Active Users"
          value={users.filter((u) => u.is_active || u.isActive !== false).length}
          trend="up"
          change="Authorized"
        />
        <KpiCard title="SuperAdmins" value={users.filter((u) => u.is_superadmin).length} change="Platform Root" />
        <KpiCard title="Configured Roles" value={roles.length} change="RBAC Catalog" />
      </div>

      {/* Search */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users by name, email, department, or tenant..."
        onReset={() => setSearch('')}
      />

      {/* Users Table */}
      <DataTable columns={columns} data={filtered} isLoading={loading} />

      {/* Create / Edit User Modal */}
      {(isCreateOpen || Boolean(editingUser)) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {editingUser ? (
                  <>
                    <Pencil className="w-4 h-4 text-indigo-400" />
                    <span>Edit User — {editingUser.name || editingUser.full_name || editingUser.email}</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Create Platform User</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <CreateUserForm
              initialUser={editingUser}
              onSuccess={() => {
                setIsCreateOpen(false);
                setEditingUser(null);
                fetchData();
              }}
              onCancel={() => {
                setIsCreateOpen(false);
                setEditingUser(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteTarget?.name || deleteTarget?.full_name || deleteTarget?.email}?`}
        confirmText="Delete User"
        variant="danger"
      />
    </div>
  );
}
