'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Bot,
  Building2,
  Lock,
  User,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Globe2,
  Activity,
  AlertCircle,
  Cpu,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

const DOMAIN_OPTIONS = [
  {
    slug: 'hr',
    name: 'HR & People Operations',
    description: 'Leave policies, employee handbook, recruitment knowledge, and HR AI assistant.',
    icon: User,
    badge: 'Popular',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
  },
  {
    slug: 'finance',
    name: 'Finance & Accounts Vault',
    description: 'Invoices, expense analytics, financial reports, budget tracking, and tax Q&A.',
    icon: Activity,
    badge: 'Essential',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
  },
  {
    slug: 'it',
    name: 'IT Systems & Runbooks',
    description: 'API documentation, server runbooks, troubleshooting knowledge, and incident triage.',
    icon: Cpu,
    badge: 'Technical',
    color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400',
  },
  {
    slug: 'legal',
    name: 'Legal & Compliance Matrix',
    description: 'Contracts, NDAs, regulatory compliance, clause comparison, and risk assessment.',
    icon: ShieldCheck,
    badge: 'Enterprise',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
  },
  {
    slug: 'operations',
    name: 'Operations & Logistics',
    description: 'Standard operating procedures (SOPs), vendor guides, supply chain documents.',
    icon: Layers,
    badge: 'Core',
    color: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-400',
  },
];

function ActivationWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [step, setStep] = useState<number>(1);
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['hr', 'it', 'finance']);
  const [embeddingModel, setEmbeddingModel] = useState<string>('nomic-embed-text');
  const [retentionDays, setRetentionDays] = useState<number>(365);
  const [serverError, setServerError] = useState<string | null>(null);

  // Verify token on load
  const { data: tokenData, isLoading, isError, error } = useQuery({
    queryKey: ['activation-token', token],
    queryFn: async () => {
      if (!token) throw new Error('No activation token provided');
      const res = await axios.get(`http://localhost:8000/api/auth/verify-activation-token?token=${token}`);
      return res.data;
    },
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (tokenData?.admin_full_name) {
      setFullName(tokenData.admin_full_name);
    }
  }, [tokenData]);

  const toggleDomain = (slug: string) => {
    setSelectedDomains((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  const activateMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('http://localhost:8000/api/auth/activate-tenant', {
        token,
        password: password || undefined,
        full_name: fullName || undefined,
        selected_domain_slugs: selectedDomains,
        default_embedding_model: embeddingModel,
        document_retention_days: retentionDays,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.access_token) {
        document.cookie = `nexus_access_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `nexus_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax`;
        localStorage.setItem('nexus_token', data.access_token);
        localStorage.setItem('nexus_active_tenant_slug', data.organization_slug);
      }
      const slug = data.organization_slug || tokenData?.organization_slug || 'dashboard';
      window.location.href = `/${slug}/dashboard`;
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || 'Failed to activate tenant workspace.';
      setServerError(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin mb-4" />
        <p className="text-sm font-mono">Verifying enterprise activation key...</p>
      </div>
    );
  }

  if (isError || !token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Activation Link Expired or Invalid</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            This one-time tenant setup link has either expired (48h window) or has already been used.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      {/* Background Mesh Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 shadow-xl shadow-blue-500/25 mb-4 ring-1 ring-white/20">
            <Bot className="w-7 h-7 text-white drop-shadow" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Superadmin
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Configure {tokenData?.organization_name || 'Organization'} Realm
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Workspace: <strong className="text-white font-mono">{tokenData?.organization_slug}.nexusrag.com</strong>
          </p>
        </div>

        {/* Step Indicator Pills */}
        <div className="grid grid-cols-3 gap-2 mb-8 select-none">
          <div
            className={`py-2 px-3 rounded-xl border text-center text-xs font-medium transition ${
              step === 1
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 ring-1 ring-blue-500/20'
                : step > 1
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            1. Admin Account
          </div>
          <div
            className={`py-2 px-3 rounded-xl border text-center text-xs font-medium transition ${
              step === 2
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 ring-1 ring-blue-500/20'
                : step > 2
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            2. Choose Domains
          </div>
          <div
            className={`py-2 px-3 rounded-xl border text-center text-xs font-medium transition ${
              step === 3
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 ring-1 ring-blue-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            3. AI & Retention
          </div>
        </div>

        {/* Card Container */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5 space-y-6">
          {serverError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{serverError}</span>
            </div>
          )}

          {/* STEP 1: Admin Credentials */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Administrator Credentials</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm your administrator profile details for <span className="text-slate-200">{tokenData?.admin_email}</span>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Admin Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Set Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure master password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength */}
                {password.length > 0 && (
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Security Score:</span>
                      <span className={strengthScore >= 3 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {strengthScore <= 1 ? 'Weak' : strengthScore === 2 ? 'Fair' : strengthScore === 3 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5">
                      {[1, 2, 3, 4].map((s) => (
                        <div
                          key={s}
                          className={`h-full rounded-full transition-all ${
                            strengthScore >= s ? (strengthScore >= 3 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <span>Next: Choose Business Domains</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Domain Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Select Active Business Domains</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose which business units your organization requires. You can activate more at any time.
                </p>
              </div>

              <div className="space-y-2.5">
                {DOMAIN_OPTIONS.map((domain) => {
                  const isSelected = selectedDomains.includes(domain.slug);
                  const Icon = domain.icon;
                  return (
                    <div
                      key={domain.slug}
                      onClick={() => toggleDomain(domain.slug)}
                      className={`p-3.5 rounded-2xl border transition duration-200 cursor-pointer flex items-start justify-between ${
                        isSelected
                          ? 'bg-slate-950 border-blue-500/50 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20'
                          : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl border ${domain.color} shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{domain.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                              {domain.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            {domain.description}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedDomains.length === 0) {
                      alert('Please select at least one business domain.');
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <span>Next: Default Configurations</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Default Configs & Final Launch */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Default Workspace Configurations</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure default vector indexing preferences and compliance settings.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Default Vector Embedding Model
                  </label>
                  <select
                    value={embeddingModel}
                    onChange={(e) => setEmbeddingModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value="nomic-embed-text">nomic-embed-text (Local On-Premises / Offline)</option>
                    <option value="text-embedding-3-small">OpenAI text-embedding-3-small</option>
                    <option value="text-embedding-3-large">OpenAI text-embedding-3-large (High Dimension)</option>
                    <option value="bge-large-en-v1.5">BAAI bge-large-en-v1.5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Document Retention & Audit History
                  </label>
                  <select
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value={90}>90 Days Retention (Standard)</option>
                    <option value={365}>1 Year Retention (Enterprise)</option>
                    <option value={1095}>3 Years Retention (Regulatory Compliance)</option>
                    <option value={0}>Indefinite Retention</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Workspace Summary
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Activating <strong className="text-white">{selectedDomains.length} domains</strong> (
                    {selectedDomains.map((s) => s.toUpperCase()).join(', ')}) with isolated pgvector partition and AES-256 encrypted vaults.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={activateMutation.isPending}
                  onClick={() => activateMutation.mutate()}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-[0.99]"
                >
                  {activateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Initializing Realm...
                    </span>
                  ) : (
                    <>
                      <span>Complete Setup & Launch Realm</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActivationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">Loading Setup Wizard...</div>}>
      <ActivationWizard />
    </Suspense>
  );
}
