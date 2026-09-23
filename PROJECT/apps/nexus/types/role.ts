export interface Role {
  id: string;
  tenantId?: string | null;
  domainId?: string | null;
  name: string;
  slug: string;
  description?: string;
  isSystemRole: boolean;
  status: "ACTIVE" | "DISABLED";
  permissions?: string[];
}

export interface UserRoleMapping {
  id: string;
  userId: string;
  tenantId: string;
  domainId?: string | null;
  roleId: string;
  role?: Role;
}
