export interface HREmployee {
  id: string;
  tenant_id: string;
  domain_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  position?: string;
  status: string;
  salary_band?: string;
  created_at?: string;
}

export interface FinanceInvoice {
  id: string;
  tenant_id: string;
  domain_id: string;
  invoice_number: string;
  vendor_name: string;
  amount: number;
  currency: string;
  status: string;
  notes?: string;
  created_at?: string;
}

export interface ITIncident {
  id: string;
  tenant_id: string;
  domain_id: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  assigned_to?: string;
  created_at?: string;
}

export interface DomainProgress {
  domain_id: string;
  name: string;
  slug: string;
  icon: string;
  progress: number;
  users: number;
  documents: number;
  knowledge_items: number;
  ai_queries: number;
}

export interface ManagementDashboardSummary {
  tenant_id: string;
  average_progress: number;
  total_domains: number;
  total_users: number;
  total_documents: number;
  total_ai_queries: number;
  domains: DomainProgress[];
}
