import { DomainRoleType } from './database';

export interface DomainRoleClaim {
  domain_id: string;
  domain_slug: string;
  role: DomainRoleType;
}

export interface JWTPayload {
  sub: string;
  tenant_id: string;
  tenant_slug: string;
  email?: string;
  full_name?: string;
  is_platform_admin?: boolean;
  domain_roles: DomainRoleClaim[];
  exp: number;
  iat?: number;
}

export interface UserIdentity {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  status?: string;
  avatar_url?: string;
  isSuperAdmin?: boolean;
  is_platform_admin?: boolean;
}

export interface LoginCredentials {
  business_email: string;
  password: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    full_name: string;
    tenant_id: string;
    tenant_slug: string;
    is_platform_admin?: boolean;
    domain_roles?: DomainRoleClaim[];
  } | null;
  tenant?: {
    id: string;
    name: string;
    subdomain: string;
    slug?: string;
  } | null;
  accessToken?: string | null;
  access_token?: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
}
