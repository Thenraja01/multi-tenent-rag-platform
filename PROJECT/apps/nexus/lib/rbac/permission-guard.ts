/**
 * Permission Guard Utilities
 * Frontend helper functions for evaluating backend-provided access control state.
 *
 * NOTE: Frontend checks are strictly for UI presentation (showing/hiding buttons, links).
 * The FastAPI backend enforces authoritative authorization on every API call.
 */

export interface AccessContextData {
  organization?: {
    id: string;
    name: string;
    slug?: string;
  };
  pack?: {
    id: string;
    name: string;
  };
  domains?: Array<{
    id: string;
    name: string;
    slug: string;
    modules: Array<{
      key: string;
      enabled: boolean;
    }>;
  }>;
  permissions?: string[];
  is_superadmin?: boolean;
}

/**
 * Checks if the user has a specific permission string (e.g., 'documents.read', 'rag.query')
 */
export function hasPermission(
  permission: string,
  userPermissions: string[] = [],
  isSuperAdmin: boolean = false
): boolean {
  if (isSuperAdmin) return true;
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return userPermissions.includes(permission) || userPermissions.includes('*');
}

/**
 * Checks if a specific module key is enabled within the active domain context
 */
export function canAccessModule(
  moduleKey: string,
  domains: AccessContextData['domains'] = [],
  activeDomainSlug?: string,
  isSuperAdmin: boolean = false
): boolean {
  if (isSuperAdmin) return true;
  if (!domains || !Array.isArray(domains)) return false;

  for (const domain of domains) {
    if (!activeDomainSlug || domain.slug === activeDomainSlug) {
      const match = domain.modules?.find((m) => m.key === moduleKey && m.enabled);
      if (match) return true;
    }
  }
  return false;
}

/**
 * Checks if a specific domain is accessible
 */
export function canAccessDomain(
  domainSlug: string,
  domains: AccessContextData['domains'] = [],
  isSuperAdmin: boolean = false
): boolean {
  if (isSuperAdmin) return true;
  if (!domains || !Array.isArray(domains)) return false;
  return domains.some((d) => d.slug === domainSlug);
}
