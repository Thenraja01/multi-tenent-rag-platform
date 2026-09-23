import { DomainRoleType } from '../types/database';

export const ROLE_HIERARCHY: Record<DomainRoleType, number> = {
  'platform-admin': 100,
  'tenant-admin': 90,

  // HR
  'hr-admin': 80,
  'hr-manager': 70,
  'hr-knowledge-manager': 60,
  'hr-user': 50,

  // Finance
  'finance-admin': 80,
  'finance-manager': 70,
  'finance-analyst': 60,
  'finance-user': 50,

  // IT
  'it-admin': 80,
  'it-manager': 70,
  'it-engineer': 60,
  'it-user': 50,

  // Legal
  'legal-admin': 80,
  'legal-counsel': 70,
  'legal-user': 50,

  // Operations
  'ops-admin': 80,
  'ops-manager': 70,
  'ops-user': 50,

  'user': 10,
};

export const DOMAIN_PREFIXES: Record<string, string[]> = {
  hr: ['hr-admin', 'hr-manager', 'hr-knowledge-manager', 'hr-user'],
  finance: ['finance-admin', 'finance-manager', 'finance-analyst', 'finance-user'],
  it: ['it-admin', 'it-manager', 'it-engineer', 'it-user'],
  legal: ['legal-admin', 'legal-counsel', 'legal-user'],
  operations: ['ops-admin', 'ops-manager', 'ops-user'],
};

export function hasDomainAccess(
  domainSlug: string,
  userRoles: { domain_slug?: string; role: DomainRoleType }[] = [],
  isPlatformAdmin = false
): boolean {
  if (isPlatformAdmin) return true;

  // Tenant admins have access across all domains in their tenant
  const isTenantAdmin = userRoles.some((r) => r.role === 'tenant-admin' || r.role === 'platform-admin');
  if (isTenantAdmin) return true;

  const validRoles = DOMAIN_PREFIXES[domainSlug.toLowerCase()] || [];
  return userRoles.some(
    (r) =>
      (r.domain_slug?.toLowerCase() === domainSlug.toLowerCase() || validRoles.includes(r.role)) &&
      validRoles.includes(r.role)
  );
}

export function hasMinimumRole(
  userRole: DomainRoleType,
  requiredRole: DomainRoleType
): boolean {
  const userRank = ROLE_HIERARCHY[userRole] || 0;
  const requiredRank = ROLE_HIERARCHY[requiredRole] || 0;
  return userRank >= requiredRank;
}

export function canManageDocuments(role?: DomainRoleType): boolean {
  if (!role) return false;
  return (
    role === 'platform-admin' ||
    role === 'tenant-admin' ||
    role.endsWith('-admin') ||
    role.endsWith('-manager') ||
    role.includes('knowledge-manager') ||
    role === 'it-engineer' ||
    role === 'finance-analyst' ||
    role === 'legal-counsel'
  );
}

export function canManageDomainUsers(role?: DomainRoleType): boolean {
  if (!role) return false;
  return role === 'platform-admin' || role === 'tenant-admin' || role.endsWith('-admin') || role.endsWith('-manager');
}
