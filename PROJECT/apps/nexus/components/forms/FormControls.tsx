'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, Dices, LucideIcon } from 'lucide-react';

/* ==========================================================================
   FormInput
   ========================================================================== */
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  rightElement?: React.ReactNode;
  hasError?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ icon: Icon, rightElement, hasError, className = '', ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          {...props}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 transition focus:outline-none ${
            Icon ? 'pl-10' : ''
          } ${rightElement ? 'pr-10' : ''} ${
            hasError
              ? 'border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
              : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
          } ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';

/* ==========================================================================
   FormPassword
   ========================================================================== */
export interface FormPasswordProps extends Omit<FormInputProps, 'type' | 'rightElement'> {
  showStrengthMeter?: boolean;
  allowGenerate?: boolean;
  onGenerate?: (pwd: string) => void;
}

export const FormPassword = forwardRef<HTMLInputElement, FormPasswordProps>(
  ({ showStrengthMeter = false, allowGenerate = false, onGenerate, value, hasError, className = '', ...props }, ref) => {
    const [show, setShow] = useState(false);
    const pwdValue = String(value || props.defaultValue || '');

    // Strength computation
    const hasMinLength = pwdValue.length >= 8;
    const hasUpper = /[A-Z]/.test(pwdValue);
    const hasNumber = /[0-9]/.test(pwdValue);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwdValue);
    const strengthScore = [hasMinLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    const handleRandomGen = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
      let pwd = '';
      for (let i = 0; i < 14; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setShow(true);
      if (onGenerate) onGenerate(pwd);
    };

    return (
      <div className="space-y-1.5">
        {allowGenerate && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRandomGen}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Dices className="w-3 h-3" />
              <span>Generate Password</span>
            </button>
          </div>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            type={show ? 'text' : 'password'}
            value={value}
            {...props}
            className={`w-full px-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 font-mono transition focus:outline-none ${
              hasError
                ? 'border-rose-500/50 focus:border-rose-500'
                : 'border-slate-800 focus:border-indigo-500'
            } ${className}`}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {showStrengthMeter && pwdValue && (
          <div className="grid grid-cols-4 gap-1.5 pt-1">
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
        )}
      </div>
    );
  }
);
FormPassword.displayName = 'FormPassword';

/* ==========================================================================
   FormTextarea
   ========================================================================== */
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ hasError, className = '', rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        {...props}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 transition focus:outline-none ${
          hasError
            ? 'border-rose-500/50 focus:border-rose-500'
            : 'border-slate-800 focus:border-indigo-500'
        } ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      />
    );
  }
);
FormTextarea.displayName = 'FormTextarea';

/* ==========================================================================
   FormSelect
   ========================================================================== */
export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ hasError, options, children, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        {...props}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-xs text-white focus:outline-none transition cursor-pointer ${
          hasError
            ? 'border-rose-500/50 focus:border-rose-500'
            : 'border-slate-800 focus:border-indigo-500'
        } ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
    );
  }
);
FormSelect.displayName = 'FormSelect';

/* ==========================================================================
   FormSwitch & FormCheckbox
   ========================================================================== */
export interface FormSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function FormSwitch({ label, description, checked, onChange, disabled = false }: FormSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
      <div>
        <span className="text-xs font-semibold text-slate-200 block">{label}</span>
        {description && <span className="text-[11px] text-slate-400 block mt-0.5">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-indigo-600' : 'bg-slate-800'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
        <input
          ref={ref}
          type="checkbox"
          {...props}
          className={`w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer ${className}`}
        />
        <span>{label}</span>
      </label>
    );
  }
);
FormCheckbox.displayName = 'FormCheckbox';
