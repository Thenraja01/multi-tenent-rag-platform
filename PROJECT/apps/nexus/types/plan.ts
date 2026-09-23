export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  billingInterval: "monthly" | "yearly";
  currency: string;
  maxUsers: number;
  maxDomains: number;
  maxStorage: number;
  maxDocuments: number;
  aiUsageLimit: number;
  features: string[];
  isActive: boolean;
}
