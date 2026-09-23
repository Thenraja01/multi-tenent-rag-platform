export interface Permission {
  id: string;
  key?: string;
  name: string;
  resource: string;
  action: string;
  scope: "PLATFORM" | "TENANT" | "DOMAIN" | string;
  description?: string;
  permissionCode?: string;
}

export interface FeatureItem {
  id?: string;
  key: string;
  name: string;
  description?: string;
  route?: string;
  icon?: string;
  type?: "CORE" | "DOMAIN" | string;
  is_active?: boolean;
  permissions?: string[];
}

export interface DomainTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  status: string;
  feature_keys: string[];
  default_roles: Array<{
    name: string;
    slug: string;
    permissions: string[];
  }>;
  created_at?: string;
}

export interface TenantMembership {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role_id: string;
  role_name: string;
  role_scope: string;
  status: string;
  created_at?: string;
}

export interface DomainMembership {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  domain_id: string;
  domain_slug: string;
  role_id: string;
  role_name: string;
  status: string;
  created_at?: string;
}

export interface UserAccessContext {
  userId: string;
  fullName: string;
  email: string;
  isSuperAdmin: boolean;
  role?: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
    subdomain?: string;
    status: string;
    plan?: {
      id: string;
      name: string;
      slug: string;
      maxUsers: number;
      maxDomains: number;
      features: string[];
    };
    settings?: Record<string, any>;
  } | null;
  domain?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon: string;
  } | null;
  availableDomains?: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string;
  }>;
  domains: Array<{
    domainId: string;
    name: string;
    slug: string;
    description?: string;
    icon: string;
    roles: string[];
    permissions: string[];
  }>;
  roles: string[];
  permissions: string[];
  features: FeatureItem[] | string[];
}
