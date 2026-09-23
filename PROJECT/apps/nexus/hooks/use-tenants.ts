import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Tenant } from '../types/database';

export function useTenants() {
  const queryClient = useQueryClient();

  const tenantsQuery = useQuery({
    queryKey: ['tenants'],
    queryFn: api.tenants.getAll,
  });

  const createTenantMutation = useMutation({
    mutationFn: api.tenants.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  return {
    tenants: tenantsQuery.data || [],
    isLoading: tenantsQuery.isLoading,
    isError: tenantsQuery.isError,
    error: tenantsQuery.error,
    refetch: tenantsQuery.refetch,
    createTenant: createTenantMutation.mutateAsync,
    isCreating: createTenantMutation.isPending,
  };
}

export function useTenant(id: string) {
  const queryClient = useQueryClient();

  const tenantQuery = useQuery({
    queryKey: ['tenants', id],
    queryFn: () => api.tenants.getById(id),
    enabled: !!id,
  });

  const updateTenantMutation = useMutation({
    mutationFn: (data: Partial<Tenant>) => api.tenants.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants', id] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  return {
    tenant: tenantQuery.data,
    isLoading: tenantQuery.isLoading,
    isError: tenantQuery.isError,
    error: tenantQuery.error,
    updateTenant: updateTenantMutation.mutateAsync,
    isUpdating: updateTenantMutation.isPending,
  };
}
