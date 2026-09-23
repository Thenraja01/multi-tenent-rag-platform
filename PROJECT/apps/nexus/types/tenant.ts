export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: "pending" | "approved" | "suspended" | "rejected";
  orgEmail?: string;
  adminName?: string;
  adminEmail?: string;
  planId?: string;
  plan?: {
    id: string;
    name: string;
    slug: string;
    maxUsers: number;
    maxDomains: number;
    features: string[];
  };
  settings?: Record<string, any>;
  createdAt: string;
  approvedAt?: string;
}
