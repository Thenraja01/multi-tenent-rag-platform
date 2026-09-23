'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AuthVisualShowcase } from '@/components/auth/AuthVisualShowcase';
import {
  Bot,
  Building2,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  UserPlus,
  ExternalLink,
} from 'lucide-react';

// Schema for Organization Registration (Root Domain: localhost:3000/register)
const orgRegisterSchema = z.object({
  organization_name: z.string().min(2, 'Organization name must be at least 2 characters'),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(50, 'Subdomain cannot exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Alphanumeric and dashes only'),
  industry: z.string().optional(),
  plan_slug: z.string(),
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid business email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms of service'),
});

// Schema for Member/User Registration (Tenant Subdomain: [tenant].localhost:3000/register)
const memberRegisterSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms of service'),
});

type OrgRegisterFormValues = z.infer<typeof orgRegisterSchema>;
type MemberRegisterFormValues = z.infer<typeof memberRegisterSchema>;

const INDUSTRIES = [
  'Enterprise SaaS & Tech',
  'Healthcare & Life Sciences',
  'Banking & Financial Services',
  'Legal & Compliance',
  'Manufacturing & Logistics',
  'Government & Public Sector',
  'Other',
];

import { Suspense } from 'react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [provisioningStep, setProvisioningStep] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [baseDomain, setBaseDomain] = useState<string>('localfix.app');
  const [detectedTenant, setDetectedTenant] = useState<string | null>(null);
  const [detectedDomain, setDetectedDomain] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.host.split(':')[0].toLowerCase();
      setBaseDomain(host.includes('localhost') ? 'localhost:3000' : host);

      const recognizedBases = ['localhost', '127.0.0.1', 'localfix.app', 'nexusrag.com', 'nexusrag.local', 'nip.io'];
      for (const base of recognizedBases) {
        if (host.endsWith(`.${base}`)) {
          const subPart = host.slice(0, -(base.length + 1));
          const parts = subPart.split('.').filter(Boolean);
          if (parts.length === 1) {
            if (!['platform', 'admin', 'superadmin', 'api', 'www', 'app', 'login', 'register'].includes(parts[0])) {
              setDetectedTenant(parts[0]);
            }
          } else if (parts.length >= 2) {
            if (!['platform', 'admin', 'superadmin', 'api', 'www', 'app'].includes(parts[1])) {
              setDetectedTenant(parts[1]);
              setDetectedDomain(parts[0]);
            }
          }
          break;
        }
      }
    }
  }, []);

  // Form for Org Registration (Root)
  const orgForm = useForm<OrgRegisterFormValues>({
    resolver: zodResolver(orgRegisterSchema),
    defaultValues: {
      plan_slug: 'starter',
      industry: 'Enterprise SaaS & Tech',
      acceptTerms: true,
    },
  });

  // Form for Member Registration (Tenant Subdomain)
  const memberForm = useForm<MemberRegisterFormValues>({
    resolver: zodResolver(memberRegisterSchema),
    defaultValues: {
      acceptTerms: true,
    },
  });

  const orgName = orgForm.watch('organization_name');
  const subdomain = orgForm.watch('subdomain') || '';
  const password = (detectedTenant ? memberForm.watch('password') : orgForm.watch('password')) || '';

  // Password strength calculation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  // Mutation for Org Registration
  const orgRegisterMutation = useMutation({
    mutationFn: async (values: OrgRegisterFormValues) => {
      setProvisioningStep(1);
      const res = await api.auth.register({
        organization_name: values.organization_name,
        organization_slug: values.subdomain.toLowerCase(),
        email: values.email,
        full_name: values.full_name,
        password: values.password,
        plan_slug: values.plan_slug,
      });
      return { res, values, slug: values.subdomain.toLowerCase() };
    },
    onSuccess: ({ res, values, slug }) => {
      setProvisioningStep(2);
      setTimeout(() => {
        setProvisioningStep(3);
        setTimeout(() => {
          window.location.href = `/pending-approval?org=${encodeURIComponent(values.organization_name)}&email=${encodeURIComponent(values.email)}`;
        }, 1000);
      }, 900);
    },
    onError: (err: any) => {
      setProvisioningStep(0);
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to submit organization registration.';
      setServerError(msg);
    },
  });

  // Mutation for Member Registration (Join Tenant)
  const memberRegisterMutation = useMutation({
    mutationFn: async (values: MemberRegisterFormValues) => {
      setProvisioningStep(1);
      const res = await api.auth.registerUser({
        organization_slug: detectedTenant || '',
        email: values.email,
        full_name: values.full_name,
        password: values.password,
      });
      return { res, values, slug: detectedTenant };
    },
    onSuccess: ({ res, values, slug }) => {
      setProvisioningStep(2);
      setTimeout(() => {
        setProvisioningStep(3);
        setTimeout(() => {
          window.location.href = `/login?pending=true&email=${encodeURIComponent(values.email)}&org=${encodeURIComponent(slug || '')}`;
        }, 800);
      }, 700);
    },
    onError: (err: any) => {
      setProvisioningStep(0);
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to join organization workspace.';
      setServerError(msg);
    },
  });

  const onOrgSubmit = (values: OrgRegisterFormValues) => {
    setServerError(null);
    orgRegisterMutation.mutate(values);
  };

  const onMemberSubmit = (values: MemberRegisterFormValues) => {
    setServerError(null);
    memberRegisterMutation.mutate(values);
  };

  const isMemberMode = Boolean(detectedTenant);
  const rootOrgRegisterUrl = 'http://localhost:3000/register';

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950">
      {/* Left Column: Visual Showcase */}
      <AuthVisualShowcase mode="register" />

      {/* Right Column: Registration Form Container */}
      <div className="flex flex-col justify-center items-center py-10 px-4 sm:px-8 relative overflow-y-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl my-auto">
          {/* Mobile Branding */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 shadow-lg shadow-blue-500/25">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">NexusRAG</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  v2.4
                </span>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {isMemberMode ? (
                  <>
                    <UserPlus className="w-3 h-3 text-blue-400" />
                    <span>Workspace Member Join</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span>Instant Tenant Deployment</span>
                  </>
                )}
              </span>

              <Link
                href="/login"
                className="text-xs font-medium text-slate-400 hover:text-blue-400 transition flex items-center gap-1"
              >
                Already registered?{' '}
                <span className="text-blue-400 underline decoration-blue-500/30 underline-offset-4">Sign In</span>
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isMemberMode ? (
                <>
                  Join <span className="text-sky-400">{detectedTenant}</span> Workspace
                </>
              ) : (
                'Create Enterprise Workspace'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              {isMemberMode ? (
                <>
                  Create your personal member account under the <strong className="text-slate-200">{detectedTenant}</strong> organization.
                  {detectedDomain && <span className="text-indigo-400"> (Domain: {detectedDomain.toUpperCase()})</span>}
                </>
              ) : (
                'Get an isolated PostgreSQL vector database, multi-domain cognitive routing, and enterprise RLS.'
              )}
            </p>
          </div>

          {/* Form Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
            {provisioningStep > 0 ? (
              <div className="text-center py-12 space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-blue-400 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {provisioningStep === 1 && (isMemberMode ? 'Registering Workspace Account...' : 'Creating Secure Tenant Realm...')}
                    {provisioningStep === 2 && (isMemberMode ? 'Authorizing Member Roles & Scopes...' : 'Configuring Approval Submission...')}
                    {provisioningStep === 3 && (isMemberMode ? 'Account Ready! Redirecting...' : 'Registration Submitted!')}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {isMemberMode
                      ? 'Setting up your employee directory identity and domain knowledge permissions.'
                      : 'Notifying Platform Governance for approval and signing onboarding tokens.'}
                  </p>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/80 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full transition-all duration-700 ease-out"
                    style={{
                      width: provisioningStep === 1 ? '40%' : provisioningStep === 2 ? '85%' : '100%',
                    }}
                  />
                </div>
              </div>
            ) : isMemberMode ? (
              /* =========================================================
                 MEMBER REGISTRATION FORM (On Tenant Subdomains)
                 ========================================================= */
              <form onSubmit={memberForm.handleSubmit(onMemberSubmit)} className="space-y-5">
                {serverError && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Tenant Workspace Indicator Badge */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-400" />
                    <span className="text-slate-300">Target Organization:</span>
                    <strong className="text-white font-mono">{detectedTenant}</strong>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ACTIVE REALM
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Your Full Name *</label>
                    <div className="relative">
                      <input
                        {...memberForm.register('full_name')}
                        placeholder="Sarah Jenkins"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
                      />
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    </div>
                    {memberForm.formState.errors.full_name && (
                      <p className="text-[11px] text-rose-400">{memberForm.formState.errors.full_name.message}</p>
                    )}
                  </div>

                  {/* Work Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Work Email *</label>
                    <div className="relative">
                      <input
                        type="email"
                        {...memberForm.register('email')}
                        placeholder="s.jenkins@company.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    </div>
                    {memberForm.formState.errors.email && (
                      <p className="text-[11px] text-rose-400">{memberForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Create Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...memberForm.register('password')}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {memberForm.formState.errors.password && (
                      <p className="text-[11px] text-rose-400">{memberForm.formState.errors.password.message}</p>
                    )}

                    {/* Password Strength */}
                    {password && (
                      <div className="space-y-1 pt-1">
                        <div className="grid grid-cols-4 gap-1.5">
                          {[1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className={`h-1 rounded-full transition-all duration-300 ${
                                strengthScore >= bar
                                  ? strengthScore <= 2
                                    ? 'bg-amber-400'
                                    : strengthScore === 3
                                    ? 'bg-blue-500'
                                    : 'bg-emerald-500'
                                  : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-400 select-none">
                  <input
                    type="checkbox"
                    {...memberForm.register('acceptTerms')}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>
                    I agree to the <span className="text-blue-400">Terms of Service</span> and{' '}
                    <span className="text-blue-400">Privacy Policy</span>.
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={memberRegisterMutation.isPending}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {memberRegisterMutation.isPending ? (
                    <span>Joining Workspace...</span>
                  ) : (
                    <>
                      <span>Join {detectedTenant} Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Link to Root Org Registration */}
                <div className="pt-3 border-t border-slate-800/80 text-center">
                  <p className="text-xs text-slate-400">
                    Need to create a brand new organization instead?{' '}
                    <a
                      href={rootOrgRegisterUrl}
                      className="text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Register Organization</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </form>
            ) : (
              /* =========================================================
                 ORGANIZATION REGISTRATION FORM (On Root Domain: localhost:3000)
                 ========================================================= */
              <form onSubmit={orgForm.handleSubmit(onOrgSubmit)} className="space-y-5">
                {serverError && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Organization Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Company / Organization Name *</label>
                    <div className="relative">
                      <input
                        {...orgForm.register('organization_name')}
                        onChange={(e) => {
                          orgForm.setValue('organization_name', e.target.value);
                          if (!orgForm.watch('subdomain')) {
                            const autoSlug = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
                            orgForm.setValue('subdomain', autoSlug);
                          }
                        }}
                        placeholder="Slater Lang Co"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
                      />
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    </div>
                    {orgForm.formState.errors.organization_name && (
                      <p className="text-[11px] text-rose-400">{orgForm.formState.errors.organization_name.message}</p>
                    )}
                  </div>

                  {/* Subdomain Slug */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Tenant Subdomain Realm *</label>
                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <input
                          {...orgForm.register('subdomain')}
                          placeholder="slater-lang-co"
                          className="w-full pl-10 pr-4 py-2.5 rounded-l-xl bg-slate-950 border border-r-0 border-slate-800 text-sky-400 font-mono text-xs focus:outline-none focus:border-blue-500 transition"
                        />
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      </div>
                      <span className="px-3 py-2.5 rounded-r-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 select-none">
                        .{baseDomain}
                      </span>
                    </div>
                    {orgForm.formState.errors.subdomain && (
                      <p className="text-[11px] text-rose-400">{orgForm.formState.errors.subdomain.message}</p>
                    )}
                  </div>

                  {/* Admin Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Admin Full Name *</label>
                      <div className="relative">
                        <input
                          {...orgForm.register('full_name')}
                          placeholder="Thomas Slater"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
                        />
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      </div>
                      {orgForm.formState.errors.full_name && (
                        <p className="text-[11px] text-rose-400">{orgForm.formState.errors.full_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Work Email *</label>
                      <div className="relative">
                        <input
                          type="email"
                          {...orgForm.register('email')}
                          placeholder="admin@slaterlang.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
                        />
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      </div>
                      {orgForm.formState.errors.email && (
                        <p className="text-[11px] text-rose-400">{orgForm.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Master Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Admin Master Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...orgForm.register('password')}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {orgForm.formState.errors.password && (
                      <p className="text-[11px] text-rose-400">{orgForm.formState.errors.password.message}</p>
                    )}
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-400 select-none">
                  <input
                    type="checkbox"
                    {...orgForm.register('acceptTerms')}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>
                    I agree to the <span className="text-blue-400">Terms of Service</span> and{' '}
                    <span className="text-blue-400">Privacy Policy</span>.
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={orgRegisterMutation.isPending}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {orgRegisterMutation.isPending ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit Organization for Approval</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

