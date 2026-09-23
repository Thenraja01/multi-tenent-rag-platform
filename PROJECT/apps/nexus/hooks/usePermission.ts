import { useAccess } from "@/lib/rbac/access-context";

export const usePermission = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, access } = useAccess();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: access?.permissions || [],
    roles: access?.roles || [],
  };
};
