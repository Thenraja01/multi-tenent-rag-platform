import { SourceCitation } from '../types/database';
import { API_BASE_URL } from './api';

export interface SSEEvent {
  type: 'token' | 'sources' | 'done' | 'error';
  content?: string;
  sources?: SourceCitation[];
  conversation_id?: string;
  message_id?: string;
  message?: string;
}

export interface StreamChatParams {
  query: string;
  conversationId?: string | null;
  domainId?: string;
  subdomainSlug?: string;
  tenantId?: string;
  token?: string;
  onToken: (token: string) => void;
  onSources: (sources: SourceCitation[]) => void;
  onDone: (data: { conversation_id?: string; message_id?: string }) => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

export async function streamChatQuery({
  query,
  conversationId,
  domainId,
  subdomainSlug,
  tenantId,
  token,
  onToken,
  onSources,
  onDone,
  onError,
  signal,
}: StreamChatParams): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId;
  }
  if (domainId) {
    headers['X-Domain-ID'] = domainId;
    headers['X-Domain-Slug'] = domainId;
  }
  if (subdomainSlug) {
    headers['X-Subdomain-Slug'] = subdomainSlug;
  }

  try {
    // 1. Try unified AI RAG /ai/chat endpoint first
    const aiResponse = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        domain_slug: domainId,
        subdomain_slug: subdomainSlug,
        session_id: conversationId || undefined,
        top_k: 5,
      }),
      signal,
    });

    if (aiResponse.ok) {
      const data = await aiResponse.json();
      const answer = data.answer || '';
      const citations: SourceCitation[] = (data.citations || []).map((c: any) => ({
        doc_id: c.document_id,
        filename: c.document_name,
        chunk: c.citation || '',
        page: c.page,
      }));

      if (citations.length > 0) {
        onSources(citations);
      }

      // Stream words for smooth typing effect
      const words = answer.split(' ');
      for (let i = 0; i < words.length; i++) {
        onToken((i === 0 ? '' : ' ') + words[i]);
        await new Promise((r) => setTimeout(r, 20));
      }

      onDone({
        conversation_id: data.session_id || conversationId || `conv-${Date.now()}`,
        message_id: `msg-${Date.now()}`,
      });
      return;
    }

    // 2. Fallback to SSE stream endpoint /chat/query
    const response = await fetch(`${API_BASE_URL}/chat/query`, {
      method: 'POST',
      headers: { ...headers, Accept: 'text/event-stream' },
      body: JSON.stringify({
        query,
        conversation_id: conversationId || undefined,
        domain_id: domainId,
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMessage = `HTTP error ${response.status}`;
      try {
        const jsonErr = JSON.parse(errorText);
        parsedMessage = jsonErr.detail || jsonErr.message || parsedMessage;
      } catch {
        if (errorText) parsedMessage = errorText;
      }
      onError(parsedMessage);
      return;
    }

    if (!response.body) {
      onError('ReadableStream not supported on this browser/environment');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const rawData = trimmed.replace(/^data:\s*/, '');
        if (rawData === '[DONE]') {
          onDone({});
          continue;
        }

        try {
          const event: SSEEvent = JSON.parse(rawData);
          switch (event.type) {
            case 'token':
              if (event.content) {
                onToken(event.content);
              }
              break;
            case 'sources':
              if (event.sources) {
                onSources(event.sources);
              }
              break;
            case 'done':
              onDone({
                conversation_id: event.conversation_id,
                message_id: event.message_id,
              });
              break;
            case 'error':
              onError(event.message || 'An error occurred during generation');
              break;
          }
        } catch {
          if (rawData) {
            onToken(rawData);
          }
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return;
    }
    const message = err instanceof Error ? err.message : 'Unknown streaming error';
    onError(message);
  }
}
