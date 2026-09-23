'use client';

import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

export interface FormFieldProps {
  label?: string;
  name?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  tooltip?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  name,
  required = false,
  optional = false,
  hint,
  tooltip,
  error,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={name}
            className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 select-none"
          >
            <span>{label}</span>
            {required && <span className="text-rose-400 font-bold">*</span>}
            {optional && (
              <span className="text-[10px] font-normal text-slate-500 font-mono">
                (optional)
              </span>
            )}
            {tooltip && (
              <span className="group relative cursor-help inline-flex items-center text-slate-500 hover:text-slate-300">
                <HelpCircle className="w-3 h-3" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-200 shadow-xl z-20 pointer-events-none">
                  {tooltip}
                </span>
              </span>
            )}
          </label>

          {hint && <span className="text-[10px] font-mono text-slate-500">{hint}</span>}
        </div>
      )}

      {children}

      {error && (
        <div className="flex items-center gap-1.5 text-rose-400 text-[11px] pt-0.5 animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
