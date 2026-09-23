export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
}

export const publicNavItems: NavItem[] = [
  {
    title: "Platform",
    href: "/platform",
    children: [
      { title: "Architecture", href: "/architecture", description: "Multi-tenant isolation & data partition design" },
      { title: "Enterprise RAG", href: "/rag", description: "Hybrid vector search, re-ranking & grounded generation" },
      { title: "Multi-Tenancy", href: "/multi-tenancy", description: "Strict logical & vector partition boundaries" },
      { title: "Domain RBAC", href: "/rbac", description: "Pre-retrieval security & role permissions" },
      { title: "Document Intelligence", href: "/knowledge", description: "Multi-format OCR, parsing & tabular chunking" },
      { title: "Enterprise Security", href: "/security", description: "Audit trails, encryption, SOC2 & ISO compliance" },
    ],
  },
  {
    title: "Solutions",
    href: "/solutions",
    children: [
      { title: "Human Resources", href: "/solutions/hr", description: "Policy Q&A, benefits, onboarding & HR assistant" },
      { title: "Finance & Accounting", href: "/solutions/finance", description: "Audit prep, financial filings & invoice analytics" },
      { title: "IT & DevOps", href: "/solutions/it", description: "Incident runbooks, architecture docs & IT helpdesk" },
      { title: "Legal & Compliance", href: "/solutions/legal", description: "Contract analysis, precedents & regulatory guidance" },
      { title: "Operations & Logistics", href: "/solutions/operations", description: "Supply chain SOPs, QA & vendor documentation" },
      { title: "Custom Domains", href: "/solutions/custom", description: "Build bespoke business domains with custom tools" },
    ],
  },
  { title: "How It Works", href: "/how-it-works" },
  { title: "Use Cases", href: "/use-cases" },
  { title: "Pricing", href: "/pricing" },
  { title: "About", href: "/about" },
];
