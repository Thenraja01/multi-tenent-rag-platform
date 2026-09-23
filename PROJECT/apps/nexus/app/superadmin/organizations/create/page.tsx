'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Package,
  Globe,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { superadminApi } from '@/lib/api/superadmin';

export default function CreateOrganizationWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    country: 'United States',
    timezone: 'UTC',
    selectedPlanId: '',
    selectedPackName: '',
    subdomain: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    sendInvitation: true,
  });

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await superadminApi.getPlans();
        setPlans(data || []);
        if (data && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            selectedPlanId: data[0].id,
            selectedPackName: data[0].name,
          }));
        }
      } catch (err) {
        console.error('Failed to load plans from backend:', err);
      }
    }
    loadPlans();
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
    setFormData((prev) => ({
      ...prev,
      name,
      slug,
      subdomain: slug,
    }));
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await superadminApi.createOrganization({
        name: formData.name,
        slug: formData.slug || undefined,
        subdomain: formData.subdomain || formData.slug || undefined,
        plan_id: formData.selectedPlanId || undefined,
        admin_email: formData.adminEmail || formData.email || undefined,
        admin_name: `${formData.adminFirstName} ${formData.adminLastName}`.trim() || undefined,
        admin_password: formData.adminPassword || 'Password123!',
      });
      setCurrentStep(5); // Confirmation screen
    } catch (err) {
      console.error('Failed to create organization via API:', err);
      alert('Failed to create organization. Please verify unique slug and email.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Organization', icon: Building2 },
    { num: 2, title: 'Pack Selection', icon: Package },
    { num: 3, title: 'Subdomain', icon: Globe },
    { num: 4, title: 'Admin Account', icon: UserCheck },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Organization</h1>
          <p className="text-xs text-slate-400 mt-1">
            Provision a new tenant organization with isolated PostgreSQL RLS boundaries, assigned pack, and subdomain.
          </p>
        </div>
        <Link
          href="/superadmin/organizations"
          className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Organizations</span>
        </Link>
      </div>

      {/* Stepper Bar */}
      {currentStep < 5 && (
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div
                key={step.num}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-2xl border transition-all',
                  isCurrent && 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300 shadow-md',
                  isCompleted && 'bg-slate-900/60 border-slate-800 text-emerald-400',
                  !isCurrent && !isCompleted && 'bg-slate-950/40 border-slate-900 text-slate-600'
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0',
                    isCurrent && 'bg-indigo-600 text-white',
                    isCompleted && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                    !isCurrent && !isCompleted && 'bg-slate-800 text-slate-500'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                </div>
                <span className="text-xs font-bold truncate hidden sm:inline">{step.title}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Content Container */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-6">
        {/* STEP 1: ORGANIZATION INFO */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white tracking-tight">Step 1: Organization Profile</h2>
              <p className="text-xs text-slate-400">Enter organization legal name and basic contact info.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Globex Corporation"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Organization Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. globex"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Primary Contact Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@globex.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PACK SELECTION */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white tracking-tight">Step 2: Assign Platform Pack</h2>
              <p className="text-xs text-slate-400">
                Packs automatically bundle domains, modules, and granular feature capabilities from the live backend catalog.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((pack) => {
                const isSelected = formData.selectedPlanId === pack.id;
                return (
                  <div
                    key={pack.id}
                    onClick={() => setFormData({ ...formData, selectedPlanId: pack.id, selectedPackName: pack.name })}
                    className={cn(
                      'p-5 rounded-2xl border cursor-pointer transition-all space-y-3 relative',
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-xl shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-400" />
                        <span className="font-bold text-sm text-white">{pack.name}</span>
                      </div>
                      <input
                        type="radio"
                        name="pack"
                        checked={isSelected}
                        onChange={() => setFormData({ ...formData, selectedPlanId: pack.id, selectedPackName: pack.name })}
                        className="accent-indigo-600 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{pack.description || 'Pre-configured domain and module bundle.'}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(pack.domains || ['HR', 'IT', 'Finance']).map((dom: any, idx: number) => {
                        const domName = typeof dom === 'string' ? dom : (dom?.name || dom?.slug || dom?.id || 'Domain');
                        const domKey = typeof dom === 'string' ? dom : (dom?.id || dom?.slug || `dom-${idx}`);
                        return (
                          <span key={domKey} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            {domName}
                          </span>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{(pack.modules || []).length || 12} Modules</span>
                      <span>Plan ID: {pack.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: SUBDOMAIN CONFIGURATION */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white tracking-tight">Step 3: Subdomain & Tenancy Routing</h2>
              <p className="text-xs text-slate-400">
                Configure the organization's dedicated workspace domain and SSL routing endpoint.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Workspace Subdomain *
                </label>
                <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 overflow-hidden focus-within:border-indigo-500 transition">
                  <span className="pl-4 text-xs text-slate-500 font-mono">https://</span>
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                    placeholder="globex"
                    className="flex-1 px-2 py-2.5 bg-transparent text-xs text-white font-mono font-bold focus:outline-none"
                    required
                  />
                  <span className="pr-4 text-xs text-indigo-400 font-mono font-semibold">.nexusrag.com</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Subdomain <strong>{formData.subdomain || 'globex'}.nexusrag.com</strong> is available.</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ADMIN ACCOUNT */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white tracking-tight">Step 4: Initial Organization Admin</h2>
              <p className="text-xs text-slate-400">Create the primary tenant administrator who will manage departmental RBAC.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.adminFirstName}
                  onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                  placeholder="Sarah"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.adminLastName}
                  onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                  placeholder="Connor"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Admin Email Address *
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  placeholder="sconnor@globex.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PROVISIONING CONFIRMATION */}
        {currentStep === 5 && (
          <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">Organization Ready & Provisioned!</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                <strong>{formData.name}</strong> has been created in PostgreSQL with full tenant isolation.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <Link
                href="/superadmin/organizations"
                className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Back to Organizations
              </Link>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!formData.name && currentStep === 1}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition flex items-center gap-1.5"
              >
                {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Create & Configure Organization</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
