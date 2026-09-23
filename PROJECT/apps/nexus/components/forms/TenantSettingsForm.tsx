'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Clock, Lock, Sparkles, Building2 } from 'lucide-react';
import { FormProvider } from './FormProvider';
import { FormField } from './FormField';
import { FormInput, FormSelect, FormSwitch } from './FormControls';
import { FormSubmitButton, FormActionGroup, FormAlert } from './FormActions';
import { apiClient } from '@/lib/api/client';

const tenantSettingsSchema = z.object({
  name: z.string().min(2, 'Organization name is required'),
  mfa_required: z.boolean(),
  password_login_enabled: z.boolean(),
  session_timeout_minutes: z.number().min(5).max(10080),
  default_embedding_model: z.string(),
  document_retention_days: z.number().min(30).max(3650),
});

export type TenantSettingsFormValues = z.infer<typeof tenantSettingsSchema>;

export interface TenantSettingsFormProps {
  orgId: string;
  initialSettings?: Partial<TenantSettingsFormValues>;
  onSuccess?: () => void;
}

export function TenantSettingsForm({ orgId, initialSettings, onSuccess }: TenantSettingsFormProps) {
  const form = useForm<TenantSettingsFormValues>({
    resolver: zodResolver(tenantSettingsSchema),
    defaultValues: {
      name: initialSettings?.name || '',
      mfa_required: initialSettings?.mfa_required ?? false,
      password_login_enabled: initialSettings?.password_login_enabled ?? true,
      session_timeout_minutes: initialSettings?.session_timeout_minutes || 60,
      default_embedding_model: initialSettings?.default_embedding_model || 'nomic-embed-text',
      document_retention_days: initialSettings?.document_retention_days || 365,
    },
  });

  const onSubmit = async (values: TenantSettingsFormValues) => {
    await apiClient.put(`/organizations/${orgId}`, {
      name: values.name,
      settings: {
        mfa_required: values.mfa_required,
        password_login_enabled: values.password_login_enabled,
        session_timeout_minutes: values.session_timeout_minutes,
        security_config: {
          default_embedding_model: values.default_embedding_model,
          document_retention_days: values.document_retention_days,
        },
      },
    });
    if (onSuccess) onSuccess();
  };

  return (
    <FormProvider form={form} onSubmit={onSubmit} className="space-y-6 text-xs">
      <div className="space-y-4">
        <h4 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>General Organization Identity</span>
        </h4>

        <FormField label="Organization Name" required error={form.formState.errors.name?.message}>
          <FormInput
            {...form.register('name')}
            placeholder="e.g. Enterprise Global Technologies"
            icon={Building2}
            hasError={Boolean(form.formState.errors.name)}
          />
        </FormField>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <h4 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Security & Authentication Governance</span>
        </h4>

        <FormSwitch
          label="Require Multi-Factor Authentication (MFA)"
          description="Force all tenant employees and admins to authenticate with TOTP."
          checked={form.watch('mfa_required')}
          onChange={(val) => form.setValue('mfa_required', val)}
        />

        <FormSwitch
          label="Allow Password-Based Logins"
          description="Enable standard email/password authentication alongside SSO."
          checked={form.watch('password_login_enabled')}
          onChange={(val) => form.setValue('password_login_enabled', val)}
        />

        <FormField label="Session Inactivity Timeout (Minutes)" hint="Security Policy">
          <FormSelect
            value={String(form.watch('session_timeout_minutes'))}
            onChange={(e) => form.setValue('session_timeout_minutes', Number(e.target.value))}
          >
            <option value="15">15 Minutes (Strict Security)</option>
            <option value="30">30 Minutes (Recommended)</option>
            <option value="60">60 Minutes (Standard)</option>
            <option value="480">8 Hours (Work Day)</option>
            <option value="1440">24 Hours</option>
          </FormSelect>
        </FormField>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <h4 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Vector Intelligence & Retention</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Default Embedding Model">
            <FormSelect {...form.register('default_embedding_model')}>
              <option value="nomic-embed-text">Nomic Embed Text (Ollama 768d)</option>
              <option value="text-embedding-3-small">OpenAI text-embedding-3-small (1536d)</option>
              <option value="bge-m3">BGE-M3 Multilingual (1024d)</option>
            </FormSelect>
          </FormField>

          <FormField label="Document Retention Policy (Days)">
            <FormSelect
              value={String(form.watch('document_retention_days'))}
              onChange={(e) => form.setValue('document_retention_days', Number(e.target.value))}
            >
              <option value="90">90 Days</option>
              <option value="180">180 Days</option>
              <option value="365">365 Days (1 Year)</option>
              <option value="1095">3 Years</option>
              <option value="3650">10 Years (Compliance Archive)</option>
            </FormSelect>
          </FormField>
        </div>
      </div>

      <FormActionGroup>
        <FormSubmitButton label="Save Security Settings" submittingLabel="Updating Settings..." />
      </FormActionGroup>
    </FormProvider>
  );
}
