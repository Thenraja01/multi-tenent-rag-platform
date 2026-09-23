import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { LoginCredentials, UserIdentity, AuthSession } from "@/types/auth";

export const useCurrentUser = () => {
  return useQuery<UserIdentity>({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.getMe(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthSession, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["permissions", "access"] });
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useActivateWorkspaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (token: string) => authApi.activateWorkspace(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["permissions", "access"] });
    },
  });
};
