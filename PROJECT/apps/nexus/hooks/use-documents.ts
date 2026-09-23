import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useDocuments(domainId?: string) {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['documents', domainId],
    queryFn: () => api.documents.getAll({ domain_id: domainId }),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.documents.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', domainId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.documents.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', domainId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,
    refetch: documentsQuery.refetch,
    uploadDocument: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    deleteDocument: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useDocumentStatus(documentId: string | null, enabled = true) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['document-status', documentId],
    queryFn: () => (documentId ? api.documents.getStatus(documentId) : null),
    enabled: !!documentId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'done' || data?.status === 'failed') {
        // Refresh knowledge list when processing completes
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        return false;
      }
      return 3000; // Poll every 3 seconds while processing
    },
  });
}
