export interface Subdomain {
  id: string;
  domainId?: string;
  organizationId?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  status?: "active" | "disabled" | "ACTIVE" | "DISABLED";
  isActive?: boolean;
  settings?: Record<string, any>;
}

export interface Domain {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  status: "ACTIVE" | "DISABLED" | "active" | "disabled";
  isActive?: boolean;
  configuration?: Record<string, any>;
  modules?: Array<{
    id?: string;
    key: string;
    name: string;
    category?: string;
    enabled: boolean;
    config?: Record<string, any>;
  }>;
  subdomains?: Subdomain[];
  roles?: string[];
  permissions?: string[];
}

export interface TenantDomainAssignment {
  id: string;
  tenantId: string;
  domainId: string;
  status: "ACTIVE" | "DISABLED";
  settings?: Record<string, any>;
  domain?: Domain;
}
