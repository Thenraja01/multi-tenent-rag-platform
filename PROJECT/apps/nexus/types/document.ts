export interface DocumentItem {
  id: string;
  tenantId: string;
  domainId?: string | null;
  uploadedBy?: string;
  title: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  status: "indexed" | "processing" | "failed";
  visibility: "domain" | "role_restricted" | "public";
  createdAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  textContent: string;
  visibility: string;
  allowedRoles?: string[];
  score?: number;
}
