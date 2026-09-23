'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { FormProvider } from './FormProvider';
import { FormField } from './FormField';
import { FormInput, FormPassword, FormSelect } from './FormControls';
import { FormSubmitButton, FormCancelButton, FormActionGroup } from './FormActions';
import { superadminApi } from '@/lib/api/superadmin';

const userSchema = z.object({
  name: z.string().min(2, 'Full name is required (at least 2 characters)'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().optional(),
  role_id: z.string().min(1, 'Please select a user role'),
  organization_id: z.string().optional(),
  department_id: z.string().optional(),
});

export type CreateUserFormValues = z.infer<typeof userSchema>;

export interface CreateUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultOrgId?: string;
  isOrgLocked?: boolean;
  initialUser?: any; // When passed, switches form to Update mode
}

export function CreateUserForm({
  onSuccess,
  onCancel,
  defaultOrgId,
  isOrgLocked = false,
  initialUser,
}: CreateUserFormProps) {
  const isUpdateMode = Boolean(initialUser?.id);
  const [roles, setRoles] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialUser?.full_name || initialUser?.name || '',
      email: initialUser?.email || '',
      password: isUpdateMode ? '' : 'Password123!',
      role_id: initialUser?.role_id || initialUser?.role || '',
      organization_id: initialUser?.organization_id || defaultOrgId || '',
      department_id: initialUser?.department_id || '',
    },
  });

  const selectedOrgId = form.watch('organization_id');
  const selectedRoleId = form.watch('role_id');
  const selectedRoleObj = roles.find((r) => r.id === selectedRoleId || r.slug === selectedRoleId);
  const isSuperAdminRole = selectedRoleObj?.slug === 'super_admin' || selectedRoleId === 'super_admin';
  const noOrganizationsAvailable = !isSuperAdminRole && organizations.length === 0;

  // Initial load of roles and organizations
  useEffect(() => {
    async function loadInitialMetadata() {
      try {
        const [rolesData, orgsData] = await Promise.all([
          superadminApi.getRoles().catch(() => []),
          superadminApi.getOrganizations().catch(() => []),
        ]);

        setRoles(rolesData || []);
        setOrganizations(orgsData || []);

        // Pre-select default role if empty
        if (rolesData && rolesData.length > 0 && !form.getValues('role_id')) {
          const defaultRole = rolesData.find((r: any) => r.slug === 'org_admin') || rolesData[0];
          if (defaultRole?.id) {
            form.setValue('role_id', defaultRole.id);
          }
        }

        // Pre-select organization
        if (defaultOrgId) {
          form.setValue('organization_id', defaultOrgId);
        } else if (orgsData && orgsData.length > 0 && !form.getValues('organization_id')) {
          form.setValue('organization_id', orgsData[0].id);
        }
      } finally {
        setLoadingMetadata(false);
      }
    }
    loadInitialMetadata();
  }, [form, defaultOrgId]);

  // Dynamically load departments when selected organization changes
  const loadOrgDepartments = useCallback(async (orgId?: string) => {
    if (!orgId) {
      setDepartments([]);
      setSelectedDeptIds([]);
      return;
    }
    setLoadingDepartments(true);
    try {
      const depts = await superadminApi.getCatalogDepartments(orgId);
      const deptsList = depts || [];
      setDepartments(deptsList);

      // Initialize selected departments
      if (initialUser?.departments && initialUser.departments.length > 0) {
        setSelectedDeptIds(initialUser.departments.map((d: any) => d.id || d.slug));
      } else if (initialUser?.department_id) {
        setSelectedDeptIds([initialUser.department_id]);
      } else if (deptsList.length > 0) {
        setSelectedDeptIds([deptsList[0].id || deptsList[0].slug]);
      } else {
        setSelectedDeptIds([]);
      }
    } catch (err) {
      console.error('Failed to load departments for org:', orgId, err);
      setDepartments([]);
      setSelectedDeptIds([]);
    } finally {
      setLoadingDepartments(false);
    }
  }, [initialUser]);

  useEffect(() => {
    const targetOrg = selectedOrgId || defaultOrgId;
    if (targetOrg && !isSuperAdminRole) {
      loadOrgDepartments(targetOrg);
    }
  }, [selectedOrgId, defaultOrgId, isSuperAdminRole, loadOrgDepartments]);

  const toggleDepartment = (deptId: string) => {
    setSelectedDeptIds((prev) => {
      const exists = prev.includes(deptId);
      if (exists) {
        return prev.filter((id) => id !== deptId);
      } else {
        return [...prev, deptId];
      }
    });
  };

  const onSubmit = async (values: CreateUserFormValues) => {
    // Strict Validation: Organization is mandatory for tenant users
    if (!isSuperAdminRole && !values.organization_id && !defaultOrgId) {
      throw new Error('Please select an organization. Users must be assigned to an organization.');
    }

    // Strict Validation: Department is mandatory for tenant users
    if (!isSuperAdminRole && selectedDeptIds.length === 0) {
      throw new Error('Please select at least one assigned department.');
    }

    if (!isUpdateMode && (!values.password || values.password.length < 6)) {
      throw new Error('Password is required and must be at least 6 characters.');
    }

    const payload: any = {
      full_name: values.name,
      name: values.name,
      email: values.email,
      role: selectedRoleObj?.slug || values.role_id,
      role_id: values.role_id,
      is_superadmin: isSuperAdminRole,
      is_org_admin: selectedRoleObj?.slug === 'org_admin',
      department_ids: selectedDeptIds,
      department_id: selectedDeptIds[0] || undefined,
      organization_id: isSuperAdminRole ? undefined : (values.organization_id || defaultOrgId || undefined),
    };

    if (values.password) {
      payload.password = values.password;
    }

    if (isUpdateMode) {
      await superadminApi.updateUser(initialUser.id, payload);
    } else {
      await superadminApi.createUser(payload);
    }

    if (onSuccess) onSuccess();
  };

  return (
    <FormProvider form={form} onSubmit={onSubmit} className="space-y-3.5 text-xs">
      {/* Alert when no organizations exist */}
      {noOrganizationsAvailable && !loadingMetadata && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">No Organizations Found</span>
            <p className="text-[11px] text-amber-200/80 leading-snug">
              Users cannot be created without an organization.{' '}
              <Link href="/superadmin/organizations" className="underline font-bold text-amber-300 hover:text-amber-100">
                Create an organization first
              </Link>.
            </p>
          </div>
        </div>
      )}

      {/* Row 1: Full Name & Email Address (Side by Side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Full Name" required error={form.formState.errors.name?.message}>
          <FormInput
            {...form.register('name')}
            placeholder="e.g. John Doe"
            icon={User}
            hasError={Boolean(form.formState.errors.name)}
          />
        </FormField>

        <FormField label="Email Address" required error={form.formState.errors.email?.message}>
          <FormInput
            type="email"
            {...form.register('email')}
            placeholder="jdoe@example.com"
            icon={Mail}
            hasError={Boolean(form.formState.errors.email)}
          />
        </FormField>
      </div>

      {/* Row 2: Password */}
      <FormField
        label={isUpdateMode ? 'Update Password' : 'Password'}
        required={!isUpdateMode}
        optional={isUpdateMode}
        hint={isUpdateMode ? 'Leave blank to keep unchanged' : 'Initial password'}
        error={form.formState.errors.password?.message}
      >
        <FormPassword
          {...form.register('password')}
          value={form.watch('password')}
          placeholder={isUpdateMode ? '••••••••••••' : 'Enter password'}
          allowGenerate
          onGenerate={(pwd) => form.setValue('password', pwd)}
          hasError={Boolean(form.formState.errors.password)}
        />
      </FormField>

      {/* Row 3: Role Selection & Compact Badge */}
      <FormField
        label="Platform / Tenant Role"
        required
        hint="From RBAC Catalog"
        error={form.formState.errors.role_id?.message}
      >
        <FormSelect
          {...form.register('role_id')}
          hasError={Boolean(form.formState.errors.role_id)}
          disabled={loadingMetadata}
        >
          {roles.length === 0 ? (
            <option value="">{loadingMetadata ? 'Fetching dynamic roles from database...' : 'No roles found in database'}</option>
          ) : (
            roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.tier_label || r.name}
              </option>
            ))
          )}
        </FormSelect>

        {selectedRoleObj && (
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[11px] mt-1">
            <span className="font-bold flex items-center gap-1.5 text-indigo-300">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              {selectedRoleObj.name}
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {isSuperAdminRole ? 'Root Platform Scope' : 'Tenant Workspace Scope'}
            </span>
          </div>
        )}
      </FormField>

      {/* Row 4: Organization & Department (Side by Side) */}
      {!isSuperAdminRole && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
          {/* Target Organization */}
          <FormField
            label="Tenant Organization"
            required
            hint={`${organizations.length} available`}
            error={form.formState.errors.organization_id?.message}
          >
            <FormSelect
              {...form.register('organization_id')}
              hasError={Boolean(form.formState.errors.organization_id)}
              disabled={isOrgLocked || Boolean(defaultOrgId) || loadingMetadata}
            >
              {organizations.length === 0 ? (
                <option value="" disabled>No organizations found</option>
              ) : (
                organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.slug})
                  </option>
                ))
              )}
            </FormSelect>
          </FormField>

          {/* Department Selection (Multi-select Checkboxes) */}
          <FormField
            label="Assigned Departments"
            required
            hint={loadingDepartments ? 'Loading...' : `${selectedDeptIds.length} of ${departments.length} selected`}
          >
            {loadingDepartments ? (
              <div className="flex items-center gap-2 p-2.5 text-slate-400 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span className="text-xs">Loading departments...</span>
              </div>
            ) : departments.length === 0 ? (
              <div className="p-2.5 text-slate-500 bg-slate-950/40 border border-slate-800/50 rounded-xl text-xs">
                No departments found
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {departments.map((dept) => {
                  const id = dept.id || dept.slug;
                  const isSelected = selectedDeptIds.includes(id);
                  return (
                    <div
                      key={id}
                      onClick={() => toggleDepartment(id)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-indigo-500/15 border-indigo-500/50 text-white shadow-sm shadow-indigo-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent onClick
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer accent-indigo-500"
                      />
                      <div className="flex items-center justify-between min-w-0 flex-1">
                        <span className="text-xs font-medium truncate">{dept.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">({dept.slug})</span>
                      </div>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </FormField>
        </div>
      )}

      {/* Action Buttons */}
      <FormActionGroup className="pt-3">
        {onCancel && <FormCancelButton onClick={onCancel} />}
        <FormSubmitButton
          label={isUpdateMode ? 'Update User' : 'Create User'}
          submittingLabel={isUpdateMode ? 'Updating...' : 'Creating...'}
          disabled={noOrganizationsAvailable || (departments.length === 0 && !isSuperAdminRole)}
        />
      </FormActionGroup>
    </FormProvider>
  );
}

// Convenient alias for User Edit flows
export const UpdateUserForm = CreateUserForm;
