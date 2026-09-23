import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useDomains(tenantId?: string) {
  const queryClient = useQueryClient();

  const allDomainsQuery = useQuery({
    queryKey: ['domains'],
    queryFn: api.domains.getAll,
  });

  const tenantDomainsQuery = useQuery({
    queryKey: ['tenant-domains', tenantId],
    queryFn: () => api.domains.getTenantDomains(tenantId),
  });

  const activateDomainMutation = useMutation({
    mutationFn: api.domains.activateTenantDomain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-domains'] });
    },
  });

  return {
    domains: allDomainsQuery.data || [],
    tenantDomains: tenantDomainsQuery.data || [],
    isLoading: allDomainsQuery.isLoading || tenantDomainsQuery.isLoading,
    isError: allDomainsQuery.isError || tenantDomainsQuery.isError,
    activateDomain: activateDomainMutation.mutateAsync,
    isActivating: activateDomainMutation.isPending,
    refetch: () => {
      allDomainsQuery.refetch();
      tenantDomainsQuery.refetch();
    },
  };
}
