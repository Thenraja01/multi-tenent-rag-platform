'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Save, ArrowRight } from 'lucide-react';
import { useFormStateContext } from './FormProvider';

export interface FormSubmitButtonProps {
  label?: string;
  submittingLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  className?: string;
}

export function FormSubmitButton({
  label = 'Save Changes',
  submittingLabel = 'Saving...',
  icon: Icon = Save,
  disabled = false,
  className = '',
}: FormSubmitButtonProps) {
  let isSubmitting = false;
  let isSuccess = false;

  try {
    const ctx = useFormStateContext();
    isSubmitting = ctx.isSubmitting;
    isSuccess = ctx.isSuccess;
  } catch {
    // Render as standard button if not in provider
  }

  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 cursor-pointer ${className}`}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{submittingLabel}</span>
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          <span>Saved!</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-3.5 h-3.5" />}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export interface FormCancelButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function FormCancelButton({
  label = 'Cancel',
  onClick,
  disabled = false,
  className = '',
}: FormCancelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer ${className}`}
    >
      {label}
    </button>
  );
}

export interface FormActionGroupProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

export function FormActionGroup({
  children,
  align = 'right',
  className = '',
}: FormActionGroupProps) {
  const alignClass =
    align === 'left'
      ? 'justify-start'
      : align === 'center'
      ? 'justify-center'
      : align === 'between'
      ? 'justify-between'
      : 'justify-end';

  return (
    <div className={`flex items-center gap-3 pt-4 border-t border-slate-800/80 ${alignClass} ${className}`}>
      {children}
    </div>
  );
}

export interface FormAlertProps {
  type?: 'error' | 'success' | 'info';
  message?: string | null;
  className?: string;
}

export function FormAlert({ type = 'error', message, className = '' }: FormAlertProps) {
  if (!message) return null;

  if (type === 'error') {
    return (
      <div className={`p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${className}`}>
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  if (type === 'success') {
    return (
      <div className={`p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${className}`}>
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${className}`}>
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
