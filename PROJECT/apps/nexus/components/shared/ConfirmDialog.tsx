'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  dependencies?: string[];
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  dependencies = [],
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2.5 rounded-xl shrink-0',
                variant === 'danger' && 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
                variant === 'warning' && 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                variant === 'info' && 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              )}
            >
              {variant === 'info' ? (
                <Info className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

        {/* Dependent entities warning */}
        {dependencies.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 font-mono">
            <div className="text-slate-400 font-bold uppercase text-[10px]">
              Impacted Dependencies:
            </div>
            <ul className="list-disc pl-4 text-slate-300 space-y-0.5 text-[11px]">
              {dependencies.map((dep, idx) => (
                <li key={idx}>{dep}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-lg transition flex items-center gap-1.5',
              variant === 'danger' && 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20',
              variant === 'warning' && 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20',
              variant === 'info' && 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
            )}
          >
            {isLoading && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
