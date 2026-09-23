import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/auth-store';
import { useTenantStore } from '../stores/tenant-store';
import { useDomainStore } from '../stores/domain-store';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, setUser, setToken, clearUser } = useAuthStore();
  const { clearTenant } = useTenantStore();
  const { setActiveDomain } = useDomainStore();

  const loginMutation = useMutation({
    mutationFn: api.auth.login,
    onSuccess: (data) => {
      setToken(data.access_token);
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.full_name,
          tenant_id: data.user.tenant_id || (data.user as any).organization_id || '',
          tenant_slug: (data.user as { tenant_slug?: string }).tenant_slug || 'default',
          is_platform_admin: (data.user as { is_platform_admin?: boolean }).is_platform_admin,
          is_superadmin: (data.user as { is_superadmin?: boolean }).is_superadmin ?? (data.user as { is_platform_admin?: boolean }).is_platform_admin,
          domain_roles: data.user.domain_roles?.map((dr) => ({
            domain_id: dr.domain_id,
            domain_slug: dr.domain_slug || '',
            role: dr.role,
          })),
        });
      }
      queryClient.invalidateQueries();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSettled: () => {
      clearUser();
      clearTenant();
      setActiveDomain(null);
      queryClient.clear();
      router.push('/login');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: api.auth.forgotPassword,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: api.auth.resetPassword,
  });

  const acceptInviteMutation = useMutation({
    mutationFn: api.auth.acceptInvite,
    onSuccess: (data) => {
      setToken(data.access_token);
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.full_name,
          tenant_id: data.user.tenant_id || (data.user as any).organization_id || '',
          tenant_slug: (data.user as { tenant_slug?: string }).tenant_slug || 'default',
        });
      }
    },
  });

  return {
    user,
    token,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    acceptInvite: acceptInviteMutation.mutateAsync,
    isAcceptingInvite: acceptInviteMutation.isPending,
  };
}
