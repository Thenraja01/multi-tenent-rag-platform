'use client';

import React from 'react';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({ permission, fallback, children }: PermissionGuardProps) {
  const { can, isLoading } = useWorkspace();
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
        <span className="text-xs font-mono">Verifying authorization...</span>
      </div>
    );
  }

  if (!can(permission)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto my-12 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Access Restricted</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Your account does not have the required permission <code className="px-1.5 py-0.5 rounded bg-slate-800 text-rose-300 font-mono text-[11px]">{permission}</code> to view this section.
        </p>
        <Link
          href={`/${tenantSlug}/dashboard`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
