import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { membershipsApi } from "@/lib/api/memberships";
import { TenantMembership, DomainMembership } from "@/types/permission";

export const useTenantMembershipsQuery = (tenantId?: string) => {
  return useQuery<TenantMembership[]>({
    queryKey: ["memberships", "tenant", { tenantId }],
    queryFn: () => (tenantId ? membershipsApi.listTenantMemberships(tenantId) : Promise.resolve([])),
    enabled: Boolean(tenantId),
    staleTime: 30 * 1000,
  });
};

export const useAssignTenantMembershipMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { tenantId: string; user_id: string; role_id: string; status?: string }>({
    mutationFn: ({ tenantId, ...data }) => membershipsApi.assignTenantMembership(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["permissions", "access"] });
    },
  });
};

export const useDomainMembershipsQuery = (domainId?: string) => {
  return useQuery<DomainMembership[]>({
    queryKey: ["memberships", "domain", { domainId }],
    queryFn: () => (domainId ? membershipsApi.listDomainMemberships(domainId) : Promise.resolve([])),
    enabled: Boolean(domainId),
    staleTime: 30 * 1000,
  });
};

export const useAssignDomainMembershipMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { domainId: string; user_id: string; tenant_id?: string; role_id: string; status?: string }>({
    mutationFn: ({ domainId, ...data }) => membershipsApi.assignDomainMembership(domainId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["permissions", "access"] });
    },
  });
};
