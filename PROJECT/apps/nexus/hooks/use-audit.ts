import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAudit(params?: { tenant_id?: string; domain_id?: string; limit?: number }) {
  const auditQuery = useQuery({
    queryKey: ['audit', params?.tenant_id, params?.domain_id, params?.limit],
    queryFn: () => api.audit.getEvents(params),
  });

  return {
    events: auditQuery.data || [],
    isLoading: auditQuery.isLoading,
    isError: auditQuery.isError,
    error: auditQuery.error,
    refetch: auditQuery.refetch,
  };
}
