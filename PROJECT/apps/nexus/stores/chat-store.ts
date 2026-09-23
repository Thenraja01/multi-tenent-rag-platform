import { create } from 'zustand';
import { Conversation, Message, SourceCitation } from '../types/database';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  streamingSources: SourceCitation[];
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  appendMessage: (message: Message) => void;
  setStreaming: (isStreaming: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingChunk: (chunk: string) => void;
  setStreamingSources: (sources: SourceCitation[]) => void;
  clearActiveChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  streamingSources: [],
  setConversations: (conversations) => set({ conversations }),
  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamingContent: (streamingContent) => set({ streamingContent }),
  appendStreamingChunk: (chunk) =>
    set((state) => ({
      streamingContent: state.streamingContent + chunk,
    })),
  setStreamingSources: (streamingSources) => set({ streamingSources }),
  clearActiveChat: () =>
    set({
      activeConversationId: null,
      messages: [],
      isStreaming: false,
      streamingContent: '',
      streamingSources: [],
    }),
}));
