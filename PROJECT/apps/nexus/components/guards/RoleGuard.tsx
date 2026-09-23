'use client';

import React from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { useWorkspace } from '../../providers/WorkspaceProvider';
import { hasDomainAccess, hasMinimumRole } from '../../lib/rbac';
import { DomainRoleType } from '../../types/database';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  domainSlug?: string;
  requiredRole?: DomainRoleType;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  domainSlug,
  requiredRole,
  fallback,
}: RoleGuardProps) {
  const { user: authUser } = useAuthStore();
  const { user: wsUser, permissions, can } = useWorkspace();

  const user = wsUser || authUser;

  // 1. Platform Admin / SuperAdmin Bypass
  const isPlatformAdmin = Boolean(
    user?.is_superadmin ||
    authUser?.is_platform_admin ||
    authUser?.is_superadmin ||
    authUser?.email?.toLowerCase().includes('admin@nexusrag.com')
  );

  // 2. Org Admin Bypass (Org Admins have access across all tenant domains & departments)
  const isOrgAdmin = Boolean(
    user?.is_org_admin ||
    authUser?.is_org_admin ||
    user?.role === 'Org Admin' ||
    user?.role === 'org_admin' ||
    authUser?.role === 'Org Admin' ||
    authUser?.role === 'org_admin'
  );

  if (isPlatformAdmin || isOrgAdmin) {
    return <>{children}</>;
  }

  // 3. Global / Wildcard Permissions Bypass
  if (permissions?.includes('*') || permissions?.includes('admin.*')) {
    return <>{children}</>;
  }

  // 4. Department Alignment Bypass (If user is assigned to this department from backend)
  const userDeptSlug =
    (user as any)?.department?.slug?.toLowerCase() ||
    (user as any)?.department_slug?.toLowerCase() ||
    authUser?.department_slug?.toLowerCase() ||
    authUser?.department?.slug?.toLowerCase() ||
    (user as any)?.department?.name?.toLowerCase() ||
    '';

  if (domainSlug && userDeptSlug) {
    const cleanDomain = domainSlug.toLowerCase();
    if (
      userDeptSlug === cleanDomain ||
      userDeptSlug.includes(cleanDomain) ||
      cleanDomain.includes(userDeptSlug)
    ) {
      return <>{children}</>;
    }
  }

  // 5. Specific Domain Permissions Bypass
  if (domainSlug) {
    const cleanDomain = domainSlug.toLowerCase();
    if (
      can(`${cleanDomain}:*`) ||
      can(`${cleanDomain}:view`) ||
      can(`${cleanDomain}:query`) ||
      can(`${cleanDomain}:read`) ||
      can('rag:query')
    ) {
      return <>{children}</>;
    }
  }

  // 6. Domain Roles Hierarchy Check
  const userRoles =
    authUser?.domain_roles?.map((r) => ({
      domain_slug: r.domain_slug,
      role: r.role as DomainRoleType,
    })) || [];

  if (domainSlug) {
    const hasAccess = hasDomainAccess(domainSlug, userRoles, isPlatformAdmin);
    if (!hasAccess) {
      if (fallback) return <>{fallback}</>;

      return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            Access Restricted (Domain RBAC)
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            You do not hold active permissions for the{' '}
            <span className="text-white font-medium uppercase font-mono">{domainSlug}</span>{' '}
            domain. Contact your tenant administrator to request role assignment.
          </p>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Return to Dashboard
          </Link>
        </div>
      );
    }
  }

  if (requiredRole) {
    const matchingRole = userRoles.find((r) =>
      domainSlug ? r.domain_slug === domainSlug : true
    );
    const hasRole = matchingRole && hasMinimumRole(matchingRole.role, requiredRole);
    if (!hasRole) {
      if (fallback) return <>{fallback}</>;
      return (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          Role {requiredRole} is required to access this action.
        </div>
      );
    }
  }

  return <>{children}</>;
}
