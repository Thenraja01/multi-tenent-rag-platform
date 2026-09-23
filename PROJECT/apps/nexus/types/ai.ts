export interface AIChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  domain?: string;
  sources?: Array<{
    documentName: string;
    chunkId: string;
    score?: number;
    snippet: string;
  }>;
  createdAt: string;
}

export interface AIRAGQuery {
  query: string;
  domain: string;
  topK?: number;
  hybridRerank?: boolean;
}
