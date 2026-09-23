import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: unknown) => {
        // Do not retry 401 or 403 or 404 errors
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const res = (error as { response?: { status?: number } }).response;
          if (res?.status === 401 || res?.status === 403 || res?.status === 404) {
            return false;
          }
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});
