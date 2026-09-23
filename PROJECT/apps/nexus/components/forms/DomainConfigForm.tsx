'use client';

import React, { useState } from 'react';
import { Layers, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { FormProvider } from './FormProvider';
import { FormSubmitButton, FormCancelButton, FormActionGroup, FormAlert } from './FormActions';
import { superadminApi } from '@/lib/api/superadmin';

export const DOMAIN_CATALOG = [
  {
    slug: 'hr',
    name: 'HR & People Operations',
    description: 'Employee directories, policy handbooks, PTO tracking, onboarding workflows, and RAG Q&A.',
    color: 'from-blue-600 to-indigo-500',
  },
  {
    slug: 'finance',
    name: 'Finance & Accounts Vault',
    description: 'Invoices, expense tracking, financial reports, budget tracking, and tax Q&A.',
    color: 'from-emerald-600 to-teal-500',
  },
  {
    slug: 'it',
    name: 'IT Systems & Runbooks',
    description: 'API documentation, server runbooks, troubleshooting knowledge, and incident triage.',
    color: 'from-cyan-600 to-blue-500',
  },
  {
    slug: 'legal',
    name: 'Legal & Compliance Matrix',
    description: 'Contracts, NDAs, regulatory compliance, clause comparison, and risk matrix.',
    color: 'from-purple-600 to-indigo-500',
  },
  {
    slug: 'operations',
    name: 'Operations & Logistics',
    description: 'Standard operating procedures (SOPs), vendor guides, supply chain documents.',
    color: 'from-amber-600 to-orange-500',
  },
];

export interface DomainConfigFormProps {
  orgId: string;
  orgName?: string;
  initialDomainSlugs?: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DomainConfigForm({
  orgId,
  orgName,
  initialDomainSlugs = [],
  onSuccess,
  onCancel,
}: DomainConfigFormProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialDomainSlugs);

  const toggleDomain = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const onSubmit = async () => {
    await superadminApi.updateOrgDomains(orgId, selectedSlugs);
    if (onSuccess) onSuccess();
  };

  return (
    <FormProvider onSubmit={onSubmit} className="space-y-5 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-bold text-white block">
            Select Active Domains for {orgName || 'Organization'}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Enabled domains will be provisioned with dedicated vector collections and tenant subdomains.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          {selectedSlugs.length} / {DOMAIN_CATALOG.length} Active
        </span>
      </div>

      <div className="space-y-2.5">
        {DOMAIN_CATALOG.map((domain) => {
          const isActive = selectedSlugs.includes(domain.slug);
          return (
            <div
              key={domain.slug}
              onClick={() => toggleDomain(domain.slug)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-4 ${
                isActive
                  ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{domain.name}</span>
                  <code className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    slug: {domain.slug}
                  </code>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg">
                  {domain.description}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'border border-slate-700 bg-slate-900 text-transparent'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      <FormActionGroup>
        {onCancel && <FormCancelButton onClick={onCancel} />}
        <FormSubmitButton label="Save Domain Configuration" submittingLabel="Updating Domains..." />
      </FormActionGroup>
    </FormProvider>
  );
}
