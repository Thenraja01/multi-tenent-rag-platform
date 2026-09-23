'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Layers } from 'lucide-react';
import { FormProvider } from './FormProvider';
import { FormField } from './FormField';
import { FormInput, FormTextarea, FormSelect, FormCheckbox } from './FormControls';
import { FormSubmitButton, FormCancelButton, FormActionGroup } from './FormActions';
import { superadminApi } from '@/lib/api/superadmin';

const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  slug: z.string().min(2, 'Role identifier must be at least 2 characters'),
  description: z.string().optional(),
  scope: z.enum(['platform', 'organization', 'domain']),
  permission_keys: z.array(z.string()),
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

export interface CreateRoleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialRole?: any;
}

export function CreateRoleForm({ onSuccess, onCancel, initialRole }: CreateRoleFormProps) {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(initialRole?.permission_keys || []);

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: initialRole?.name || '',
      slug: initialRole?.slug || '',
      description: initialRole?.description || '',
      scope: initialRole?.scope || 'organization',
      permission_keys: initialRole?.permission_keys || [],
    },
  });

  useEffect(() => {
    async function loadPermissions() {
      try {
        const perms = await superadminApi.getCatalogPermissions();
        setPermissions(perms || []);
      } catch (err) {
        console.error('Failed to load permissions catalog:', err);
      }
    }
    loadPermissions();
  }, []);

  const togglePermission = (key: string) => {
    const updated = selectedKeys.includes(key)
      ? selectedKeys.filter((k) => k !== key)
      : [...selectedKeys, key];
    setSelectedKeys(updated);
    form.setValue('permission_keys', updated);
  };

  const selectAll = () => {
    const all = permissions.map((p) => p.permission_key || p.key || p.name);
    setSelectedKeys(all);
    form.setValue('permission_keys', all);
  };

  const deselectAll = () => {
    setSelectedKeys([]);
    form.setValue('permission_keys', []);
  };

  const onSubmit = async (values: CreateRoleFormValues) => {
    if (initialRole?.id) {
      await superadminApi.updateRole(initialRole.id, {
        ...values,
        permission_keys: selectedKeys,
      });
    } else {
      await superadminApi.createRole({
        ...values,
        permission_keys: selectedKeys,
      });
    }
    if (onSuccess) onSuccess();
  };

  return (
    <FormProvider form={form} onSubmit={onSubmit} className="space-y-4 text-xs">
      <FormField label="Role Name" required error={form.formState.errors.name?.message}>
        <FormInput
          {...form.register('name')}
          onChange={(e) => {
            form.setValue('name', e.target.value);
            if (!initialRole) {
              const autoSlug = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_');
              form.setValue('slug', autoSlug);
            }
          }}
          placeholder="e.g. Legal Compliance Auditor"
          icon={Shield}
          hasError={Boolean(form.formState.errors.name)}
        />
      </FormField>

      <FormField
        label="Role Slug / Key"
        required
        hint="Unique RBAC identifier"
        error={form.formState.errors.slug?.message}
      >
        <FormInput
          {...form.register('slug')}
          placeholder="legal_compliance_auditor"
          icon={Lock}
          hasError={Boolean(form.formState.errors.slug)}
        />
      </FormField>

      <FormField label="Scope" required>
        <FormSelect {...form.register('scope')}>
          <option value="organization">Organization (Tenant Workspace)</option>
          <option value="domain">Domain Specific (e.g. HR or IT only)</option>
          <option value="platform">Platform Wide (Superadmin)</option>
        </FormSelect>
      </FormField>

      <FormField label="Description" optional>
        <FormTextarea
          {...form.register('description')}
          placeholder="Brief description of what permissions this role grants..."
          rows={2}
        />
      </FormField>

      {/* Permissions Selector Grid */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Assigned Permissions ({selectedKeys.length})</span>
          </label>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <button
              type="button"
              onClick={selectAll}
              className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
            >
              Select All
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          {permissions.length === 0 ? (
            <p className="text-[11px] text-slate-500 font-mono py-2 text-center">
              Loading permissions catalog...
            </p>
          ) : (
            permissions.map((p) => {
              const key = p.permission_key || p.key || p.name;
              const isChecked = selectedKeys.includes(key);
              return (
                <label
                  key={p.id || key}
                  className={`flex items-center justify-between p-2 rounded-lg transition cursor-pointer select-none ${
                    isChecked
                      ? 'bg-indigo-600/10 border border-indigo-500/30 text-white'
                      : 'hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(key)}
                      className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-800 text-indigo-600 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-medium">{key}</span>
                  </div>
                  {p.description && (
                    <span className="text-[10px] text-slate-500 truncate max-w-xs">{p.description}</span>
                  )}
                </label>
              );
            })
          )}
        </div>
      </div>

      <FormActionGroup>
        {onCancel && <FormCancelButton onClick={onCancel} />}
        <FormSubmitButton
          label={initialRole ? 'Update Role' : 'Create RBAC Role'}
          submittingLabel="Saving Role..."
        />
      </FormActionGroup>
    </FormProvider>
  );
}
