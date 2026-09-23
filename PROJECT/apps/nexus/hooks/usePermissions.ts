import { useAccess } from "@/lib/rbac/access-context";

export function usePermissions() {
  const { access, can, loading } = useAccess();
  return {
    permissions: access?.permissions || [],
    can,
    loading,
  };
}
