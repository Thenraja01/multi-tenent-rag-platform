import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useBilling(tenantId?: string) {
  const subscriptionQuery = useQuery({
    queryKey: ['subscription', tenantId],
    queryFn: () => api.billing.getSubscription(tenantId),
  });

  const usageQuery = useQuery({
    queryKey: ['usage', tenantId],
    queryFn: () => api.billing.getUsage({ tenant_id: tenantId }),
  });

  const checkoutMutation = useMutation({
    mutationFn: api.billing.createCheckout,
    onSuccess: (data) => {
      if (data?.checkout_url && typeof window !== 'undefined') {
        window.location.href = data.checkout_url;
      }
    },
  });

  return {
    subscription: subscriptionQuery.data,
    isLoadingSubscription: subscriptionQuery.isLoading,
    usage: usageQuery.data,
    isLoadingUsage: usageQuery.isLoading,
    createCheckout: checkoutMutation.mutateAsync,
    isCreatingCheckout: checkoutMutation.isPending,
    refetch: () => {
      subscriptionQuery.refetch();
      usageQuery.refetch();
    },
  };
}
