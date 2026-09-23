'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Bot, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Enter your registered business email'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword, isForgotPasswordLoading } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setError(null);
    try {
      await forgotPassword(values);
      setSuccess(true);
    } catch {
      setError('Unable to send reset instructions. Verify the email address.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-xl">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Password Recovery</h1>
          <p className="text-xs text-slate-400 mt-1">
            Receive password reset instructions for your account
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl">
          {success ? (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-semibold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account exists with that email, instructions to reset your password have been sent.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition mt-2 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to login</span>
              </Link>
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
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="user@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isForgotPasswordLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold shadow-lg transition"
              >
                <span>{isForgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
