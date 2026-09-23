'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Bot, User, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const inviteSchema = z
  .object({
    full_name: z.string().min(2, 'Full name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type InviteFormValues = z.infer<typeof inviteSchema>;

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = (params?.token as string) || '';
  const { acceptInvite, isAcceptingInvite } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const onSubmit = async (values: InviteFormValues) => {
    setError(null);
    try {
      const res = await acceptInvite({
        token,
        full_name: values.full_name,
        password: values.password,
      });
      setSuccess(true);
      const tenantSlug = (res?.user as { tenant_slug?: string })?.tenant_slug || 'default';
      setTimeout(() => router.push(`/${tenantSlug}/dashboard`), 2000);
    } catch {
      setError('Invalid or expired invitation token. Please contact your administrator.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-xl">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Accept Workspace Invitation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete your profile to access your assigned enterprise domains
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl">
          {success ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-semibold text-white">Welcome to NexusRAG!</h3>
              <p className="text-xs text-slate-400">
                Invitation accepted. Loading your tenant workspace...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    {...register('full_name')}
                    placeholder="Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {errors.full_name && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Choose Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isAcceptingInvite}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold shadow-lg transition"
              >
                <span>{isAcceptingInvite ? 'Verifying...' : 'Join Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Token Exchange & PostgreSQL RLS Enforcement</span>
          </div>
        </div>
      </div>
    </div>
  );
}
