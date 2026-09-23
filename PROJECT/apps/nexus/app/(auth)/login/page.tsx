'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api/client';
import { AuthVisualShowcase } from '@/components/auth/AuthVisualShowcase';
import {
  Bot,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Fingerprint,
  CheckCircle2,
  Sparkles,
  Loader2,
  Clock,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid business email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';
  const initialEmail = searchParams.get('email') || '';
  const initialPassword = searchParams.get('password') || '';
  const initialPending = searchParams.get('pending') === 'true';
  const { login, isLoggingIn } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [detectedTenant, setDetectedTenant] = useState<string | null>(null);

  // Pending Approval State
  const [isPendingApproval, setIsPendingApproval] = useState<boolean>(initialPending);
  const [pendingEmail, setPendingEmail] = useState<string>(initialEmail);
  const [cachedPassword, setCachedPassword] = useState<string>(initialPassword);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Waiting for an Organization Administrator to approve and activate your account.'
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: initialEmail,
      password: initialPassword,
      rememberMe: true,
    },
  });

  useEffect(() => {
    if (initialEmail) {
      setValue('email', initialEmail);
      setPendingEmail(initialEmail);
    }
    if (initialPassword) {
      setValue('password', initialPassword);
      setCachedPassword(initialPassword);
    }

    // Detect tenant subdomain from window host if present
    if (typeof window !== 'undefined') {
      const host = window.location.host.split(':')[0].toLowerCase();
      const baseDomains = ['localhost', '127.0.0.1', 'localfix.app', 'nexusrag.com', 'nexusrag.local', 'nip.io'];
      for (const base of baseDomains) {
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
            }
          }
          break;
        }
      }
    }
  }, [initialEmail, initialPassword, setValue]);

  // Execute actual login
  const executeLogin = useCallback(
    async (emailVal: string, passwordVal: string, rememberVal: boolean = true) => {
      const res = await login({
        email: emailVal,
        password: passwordVal,
        organization_slug: detectedTenant || undefined,
      });

      const maxAge = rememberVal ? 604800 * 4 : 86400;
      if (res?.access_token) {
        document.cookie = `nexus_access_token=${res.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `nexus_token=${res.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        localStorage.setItem('nexus_token', res.access_token);
      }

      const isPlatformAdmin = Boolean(
        (res?.user as { is_platform_admin?: boolean })?.is_platform_admin ||
        (res?.user as { is_superadmin?: boolean })?.is_superadmin ||
        (res as { is_superadmin?: boolean })?.is_superadmin ||
        emailVal.toLowerCase().includes('admin@nexusrag.com') ||
        emailVal.toLowerCase().includes('superadmin')
      );

      const tenantSlug =
        (res?.user as { tenant_slug?: string })?.tenant_slug ||
        (res as { organization_slug?: string })?.organization_slug ||
        (res as { organization?: { slug?: string } })?.organization?.slug ||
        detectedTenant ||
        'supernova';

      if (tenantSlug) {
        localStorage.setItem('nexus_active_tenant_slug', tenantSlug);
      }
      if ((res as { organization_id?: string })?.organization_id || (res?.user as { organization_id?: string })?.organization_id) {
        localStorage.setItem(
          'nexus_active_tenant_id',
          (res as { organization_id?: string })?.organization_id || (res?.user as { organization_id?: string })?.organization_id || ''
        );
      }

      const isOrgAdmin = Boolean(
        (res?.user as { is_org_admin?: boolean })?.is_org_admin ||
        (res?.user as { role?: string })?.role === 'organization_admin' ||
        (res?.user as { role?: string })?.role === 'admin'
      );

      const deptSlug =
        (res?.user as { department_slug?: string })?.department_slug ||
        (res?.user as { department?: { slug?: string } })?.department?.slug ||
        null;

      let targetUrl = '/dashboard';
      if (redirectPath && redirectPath !== '/login' && redirectPath !== '/') {
        targetUrl = redirectPath;
      } else if (isPlatformAdmin) {
        targetUrl = '/superadmin';
      } else if (isOrgAdmin) {
        // Organization Admins always land in the Org Admin Control Center
        targetUrl = '/dashboard';
      } else if (detectedTenant) {
        // Employees with an assigned department land directly in their department
        targetUrl = deptSlug ? `/${deptSlug}` : '/workspace';
      } else {
        // If on platform root domain, route to /[tenantSlug]/[deptSlug] or /[tenantSlug]/workspace
        targetUrl = deptSlug ? `/${tenantSlug}/${deptSlug}` : `/${tenantSlug}/workspace`;
      }

      window.location.href = targetUrl;
    },
    [login, detectedTenant, redirectPath]
  );

  // Poll user approval status
  const checkApprovalStatus = useCallback(async () => {
    if (!pendingEmail) return;
    setIsCheckingStatus(true);
    try {
      const res = await apiClient.get('/auth/user-status', {
        params: {
          email: pendingEmail,
          organization_slug: detectedTenant || undefined,
        },
      });

      if (res.data?.is_active || res.data?.status === 'ACTIVE') {
        setIsApproved(true);
        setStatusMessage('Your account has been approved by the Org Admin! Logging you in...');

        if (cachedPassword) {
          setTimeout(async () => {
            try {
              await executeLogin(pendingEmail, cachedPassword);
            } catch (loginErr) {
              console.error('Auto-login error:', loginErr);
              setIsPendingApproval(false);
            }
          }, 1200);
        } else {
          setTimeout(() => {
            setIsPendingApproval(false);
          }, 1500);
        }
      }
    } catch (err) {
      console.debug('Status check in progress:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  }, [pendingEmail, detectedTenant, cachedPassword, executeLogin]);

  // Real-time polling loop when waiting for approval
  useEffect(() => {
    if (!isPendingApproval || isApproved) return;
    checkApprovalStatus();
    const interval = setInterval(() => {
      checkApprovalStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, [isPendingApproval, isApproved, checkApprovalStatus]);

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    setCachedPassword(values.password);
    setPendingEmail(values.email);

    try {
      await executeLogin(values.email, values.password, values.rememberMe);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorData = (err as { response?: { data?: { detail?: string; message?: string } } }).response?.data;
        const msg = errorData?.detail || errorData?.message || 'Invalid email or password.';

        // Check if error is due to pending approval
        if (msg.includes('PENDING_APPROVAL') || msg.toLowerCase().includes('awaiting org admin approval') || msg.toLowerCase().includes('awaiting approval')) {
          setIsPendingApproval(true);
          setServerError(null);
          return;
        }

        setServerError(msg);
      } else {
        setServerError('Authentication failed. Please verify your credentials.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const handleSocialAuth = (provider: string) => {
    setServerError(null);
    if (provider === 'google') {
      window.location.href = '/api/auth/oauth/google';
    } else if (provider === 'microsoft') {
      window.location.href = '/api/auth/oauth/microsoft';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4 sm:px-6">
      {/* Mobile Branding */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
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

      {/* Main Form Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Enterprise Sign In
          </span>

          <Link
            href="/register"
            className="text-xs font-medium text-slate-400 hover:text-blue-400 transition flex items-center gap-1"
          >
            {detectedTenant ? 'New member? ' : 'New tenant? '}
            <span className="text-blue-400 underline decoration-blue-500/30 underline-offset-4">
              {detectedTenant ? 'Join Workspace' : 'Register'}
            </span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5">
          {detectedTenant ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 font-mono text-xs">
              <Building2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              Connected to workspace: <strong className="text-slate-900 dark:text-white">{detectedTenant}</strong>
            </span>
          ) : (
            'Access your isolated multi-domain RAG workspace and vector vaults.'
          )}
        </p>
      </div>

      {/* Card Form Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xl dark:shadow-2xl backdrop-blur-2xl ring-1 ring-slate-900/5 dark:ring-white/5 space-y-6">
        {/* =========================================================================
            PENDING APPROVAL LOADER STATE (When user is awaiting Org Admin approval)
            ========================================================================= */}
        {isPendingApproval ? (
          <div className="space-y-6 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              {isApproved ? (
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                {isApproved ? 'Approved & Ready' : 'Pending Org Admin Approval'}
              </span>
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                {isApproved ? 'Access Granted!' : 'Awaiting Organization Approval'}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                {statusMessage}
              </p>
            </div>

            {/* Account Details Capsule */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Registered Email:</span>
                <span className="font-mono text-white font-semibold">{pendingEmail || 'Your email'}</span>
              </div>
              {detectedTenant && (
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Target Workspace:</span>
                  <span className="font-mono text-indigo-400 font-bold">{detectedTenant}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800/60">
                <span>Live Status Check:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                  <Loader2 className={`w-3 h-3 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  {isCheckingStatus ? 'Polling backend...' : 'Auto-checking every 4s'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={checkApprovalStatus}
                disabled={isCheckingStatus}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>{isCheckingStatus ? 'Verifying with Server...' : 'Check Approval Status Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPendingApproval(false);
                  setServerError(null);
                }}
                className="w-full py-2 px-3 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
              >
                Return to standard login form
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
              STANDARD LOGIN FORM
              ========================================================================= */
          <>
            {/* Quick Social & Enterprise SSO Providers */}
            {/* Quick Social & Enterprise SSO Providers */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition duration-200 cursor-pointer shadow-xs hover:shadow-md"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('microsoft')}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition duration-200 cursor-pointer shadow-xs hover:shadow-md"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                  <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                  <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                  <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                </svg>
                <span>Microsoft 365</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider shrink-0">
                or continue with email
              </span>
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                <span className="leading-snug">{serverError}</span>
              </div>
            )}

            {/* Email & Password Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(onSubmit)(e);
              }}
              noValidate
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition" />
                  <input
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    onKeyDown={handleKeyDown}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-inner"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    onKeyDown={handleKeyDown}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition focus:outline-none p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400">Remember this device for 30 days</span>
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating session...
                  </span>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Footer Compliance Trust Badges */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          SOC 2 Type II
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Fingerprint className="w-3 h-3 text-blue-400" />
          RLS Isolated
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-indigo-400" />
          AES-256 Vault
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Left Column: Visual Showcase */}
      <AuthVisualShowcase mode="login" />

      {/* Right Column: Interactive Form Center */}
      <div className="flex flex-col justify-center items-center relative overflow-y-auto">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full">
          <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading secure session...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
