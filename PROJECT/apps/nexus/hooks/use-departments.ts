import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi, Department, TenantDepartmentTogglePayload } from '../lib/api/departments';

export function useDepartments(tenantId?: string) {
  const queryClient = useQueryClient();

  const departmentsQuery = useQuery({
    queryKey: ['departments', tenantId],
    queryFn: () => departmentsApi.listDepartments(tenantId),
  });

  const toggleMutation = useMutation({
    mutationFn: (payload: TenantDepartmentTogglePayload) =>
      departmentsApi.toggleTenantDepartment({ ...payload, tenant_id: tenantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-domains', tenantId] });
    },
  });

  const createMutation = useMutation({
    mutationFn: departmentsApi.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const departments = departmentsQuery.data || [];
  const enabledDepartments = departments.filter((d) => d.is_enabled !== false);

  return {
    departments,
    enabledDepartments,
    isLoading: departmentsQuery.isLoading,
    isError: departmentsQuery.isError,
    toggleDepartment: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
    createDepartment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    refetch: departmentsQuery.refetch,
  };
}
