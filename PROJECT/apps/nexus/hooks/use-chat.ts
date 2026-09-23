import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useChatStore } from '../stores/chat-store';
import { useAuthStore } from '../stores/auth-store';
import { useTenantStore } from '../stores/tenant-store';
import { useDomainStore } from '../stores/domain-store';
import { streamChatQuery } from '../lib/sse';
import { Message, SourceCitation } from '../types/database';

export function useChat(domainId?: string) {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const { tenant } = useTenantStore();
  const { activeDomain, activeSubdomain } = useDomainStore();

  const currentDomainId = domainId || activeDomain?.id;

  const {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    streamingContent,
    streamingSources,
    setConversations,
    setActiveConversationId,
    setMessages,
    appendMessage,
    setStreaming,
    setStreamingContent,
    appendStreamingChunk,
    setStreamingSources,
    clearActiveChat,
  } = useChatStore();

  const [chatError, setChatError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // TanStack Query for conversations list
  const conversationsQuery = useQuery({
    queryKey: ['conversations', currentDomainId, activeSubdomain?.slug],
    queryFn: async () => {
      const data = await api.chat.getConversations({ domain_id: currentDomainId });
      setConversations(data);
      return data;
    },
    enabled: !!currentDomainId,
  });

  // TanStack Query for active conversation messages
  const conversationDetailQuery = useQuery({
    queryKey: ['conversation', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return null;
      const data = (await api.chat.getConversationById(activeConversationId)) as any;
      if (data?.messages) {
        setMessages(data.messages);
      }
      return data;
    },
    enabled: !!activeConversationId,
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (id: string) => api.chat.deleteConversation(id),
    onSuccess: (_, deletedId) => {
      if (activeConversationId === deletedId) {
        clearActiveChat();
      }
      queryClient.invalidateQueries({ queryKey: ['conversations', currentDomainId] });
    },
  });

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreaming(false);
  }, [setStreaming]);

  const sendMessage = useCallback(
    async (queryText: string) => {
      if (!queryText.trim() || isStreaming) return;

      setChatError(null);
      stopStreaming();

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        conversation_id: activeConversationId || '',
        role: 'user',
        content: queryText.trim(),
        created_at: new Date().toISOString(),
      };

      appendMessage(userMessage);
      setStreaming(true);
      setStreamingContent('');
      setStreamingSources([]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let accumulatedAnswer = '';
      let accumulatedSources: SourceCitation[] = [];

      await streamChatQuery({
        query: queryText,
        conversationId: activeConversationId,
        domainId: currentDomainId,
        subdomainSlug: activeSubdomain?.slug,
        tenantId: tenant?.id,
        token: token || undefined,
        signal: controller.signal,
        onToken: (chunk) => {
          accumulatedAnswer += chunk;
          appendStreamingChunk(chunk);
        },
        onSources: (sources) => {
          accumulatedSources = sources;
          setStreamingSources(sources);
        },
        onDone: (data) => {
          setStreaming(false);
          const assistantMessage: Message = {
            id: data.message_id || `asst-${Date.now()}`,
            conversation_id: data.conversation_id || activeConversationId || '',
            role: 'assistant',
            content: accumulatedAnswer,
            sources: accumulatedSources,
            created_at: new Date().toISOString(),
          };
          appendMessage(assistantMessage);
          setStreamingContent('');
          setStreamingSources([]);

          if (data.conversation_id && data.conversation_id !== activeConversationId) {
            setActiveConversationId(data.conversation_id);
            queryClient.invalidateQueries({ queryKey: ['conversations', currentDomainId] });
          }
        },
        onError: (errMsg) => {
          setStreaming(false);
          setChatError(errMsg);
        },
      });
    },
    [
      activeConversationId,
      appendMessage,
      appendStreamingChunk,
      currentDomainId,
      isStreaming,
      queryClient,
      setActiveConversationId,
      setStreaming,
      setStreamingContent,
      setStreamingSources,
      stopStreaming,
      tenant?.id,
      token,
    ]
  );

  return {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    streamingContent,
    streamingSources,
    chatError,
    isLoadingConversations: conversationsQuery.isLoading,
    isLoadingMessages: conversationDetailQuery.isLoading,
    sendMessage,
    stopStreaming,
    setActiveConversationId,
    clearActiveChat,
    deleteConversation: deleteConversationMutation.mutateAsync,
  };
}
