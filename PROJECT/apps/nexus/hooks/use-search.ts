import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useSearch(query: string, domainId?: string) {
  const searchQuery = useQuery({
    queryKey: ['search', query, domainId],
    queryFn: () => api.search.query(query, domainId),
    enabled: !!query.trim() && query.trim().length >= 2,
  });

  return {
    results: searchQuery.data || [],
    isLoading: searchQuery.isLoading,
    isFetching: searchQuery.isFetching,
    isError: searchQuery.isError,
    error: searchQuery.error,
  };
}
