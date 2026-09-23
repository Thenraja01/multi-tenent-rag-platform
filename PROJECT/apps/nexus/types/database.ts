export type PlanType = 'starter' | 'professional' | 'enterprise';
export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type DocumentStatus = 'queued' | 'processing' | 'extracting' | 'embedding' | 'done' | 'failed' | 'UPLOADING' | 'PROCESSING' | 'PUBLISHED' | 'FAILED' | 'DELETED';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  plan?: PlanType;
  status: TenantStatus;
  created_at: string;
}

export interface Pack {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  default_config?: Record<string, unknown>;
  created_at: string;
}

export interface Module {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface Domain {
  id: string;
  organization_id?: string;
  name: string;
  slug: string;
  subdomain?: string;
  description?: string;
  pack_id?: string;
  status?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface TenantDomain {
  tenant_id: string;
  domain_id: string;
  domain?: Domain;
  config: {
    system_prompt?: string;
    model?: string;
    temperature?: number;
    max_tokens?: number;
    chunk_size?: number;
    similarity_top_k?: number;
    [key: string]: unknown;
  };
  activated_at: string;
}

export interface User {
  id: string;
  organization_id?: string;
  tenant_id?: string;
  email: string;
  full_name: string;
  is_superadmin?: boolean;
  status?: 'active' | 'invited' | 'disabled';
  created_at: string;
  roles?: Array<string | { name?: string; key?: string; role_name?: string }>;
  domain_roles?: UserDomainRole[];
  role_count?: number;
}

export type DomainRoleType =
  // HR
  | 'hr-admin'
  | 'hr-manager'
  | 'hr-knowledge-manager'
  | 'hr-user'
  // Finance
  | 'finance-admin'
  | 'finance-manager'
  | 'finance-analyst'
  | 'finance-user'
  // IT
  | 'it-admin'
  | 'it-manager'
  | 'it-engineer'
  | 'it-user'
  // Legal
  | 'legal-admin'
  | 'legal-counsel'
  | 'legal-user'
  // Operations
  | 'ops-admin'
  | 'ops-manager'
  | 'ops-user'
  // General Platform / Tenant roles
  | 'platform-admin'
  | 'tenant-admin'
  | 'user';

export interface UserDomainRole {
  id?: string;
  user_id: string;
  domain_id: string;
  domain_slug?: string;
  role: DomainRoleType;
  granted_by?: string;
  granted_at: string;
}

export interface InviteToken {
  id: string;
  tenant_id: string;
  email: string;
  domain_roles: {
    domain_id: string;
    domain_slug?: string;
    role: DomainRoleType;
  }[];
  expires_at: string;
  used_at?: string | null;
}

export interface Document {
  id: string;
  organization_id?: string;
  tenant_id?: string;
  domain_id?: string;
  collection_id?: string;
  folder_id?: string;
  user_id?: string;
  name?: string;
  filename: string;
  original_filename?: string;
  mime_type?: string;
  file_size?: number;
  version_number?: number;
  status: DocumentStatus;
  visibility?: string;
  description?: string;
  page_count?: number;
  uploaded_by?: string;
  created_at: string;
  updated_at?: string;
  error_message?: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  organization_id?: string;
  tenant_id?: string;
  domain_id?: string;
  chunk_index: number;
  content: string;
  page_number?: number;
  section_title?: string;
  token_count?: number;
  embedding?: number[];
  metadata?: {
    page?: number;
    filename?: string;
    section?: string;
    [key: string]: unknown;
  };
}

export interface CitationItem {
  source_index: number;
  document_id: string;
  document_name: string;
  version: number;
  page?: number;
  section?: string;
  citation: string;
}

export interface RAGChatResponse {
  answer: string;
  citations: CitationItem[];
  session_id?: string;
  chunks_used: number;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  domain_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at?: string;
  messages_count?: number;
}

export interface SourceCitation {
  doc_id?: string;
  document_id?: string;
  chunk_id?: string;
  filename?: string;
  chunk?: string;
  content?: string;
  excerpt?: string;
  matched_text?: string;
  label?: string;
  page?: number;
  page_number?: number;
  score?: number;
  similarity_score?: number;
  relevance_score?: number;
  match_score_pct?: number;
  file_size?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SourceCitation[];
  citations?: CitationItem[];
  token_count?: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  stripe_customer_id: string;
  plan: PlanType;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  max_domains: number;
  max_users: number;
  token_limit_monthly: number;
  current_period_end?: string;
}

export interface UsageRecord {
  tenant_id: string;
  domain_id?: string;
  domain_slug?: string;
  period_start: string;
  period_end: string;
  tokens_used: number;
  api_calls: number;
  storage_bytes: number;
}

export interface AuditEvent {
  id: string;
  tenant_id: string;
  domain_id?: string;
  user_id: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address?: string;
  created_at: string;
  details?: Record<string, unknown>;
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  document_name?: string;
  filename?: string;
  domain_id?: string;
  content: string;
  page?: number;
  score: number;
  citation?: string;
  metadata?: Record<string, unknown>;
}

export interface DocumentUploadStatus {
  status: DocumentStatus;
  stage: 'queued' | 'processing' | 'extracting' | 'embedding' | 'done' | 'failed';
  progress: number;
  message?: string;
}
