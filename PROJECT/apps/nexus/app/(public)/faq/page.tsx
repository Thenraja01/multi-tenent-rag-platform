import React from "react";
import { Metadata } from "next";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FAQAccordion, FAQItem } from "@/components/ui/FAQAccordion";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Enterprise Architecture FAQ",
  description:
    "Common technical and architectural questions about NexusRAG: multi-tenancy, domain isolation, permission-aware retrieval, document formats, and RBAC.",
};

export default function FAQPage() {
  const faqItems: FAQItem[] = [
    {
      question: "What is NexusRAG?",
      answer:
        "NexusRAG is a multi-tenant, domain-based enterprise RAG (Retrieval-Augmented Generation) platform. It provides a secure, shared AI infrastructure where multiple organizations can run autonomous, domain-specific AI experiences (HR, Finance, IT, Legal, Operations, and Custom Domains) while strictly isolating users, documents, permissions, and knowledge bases.",
    },
    {
      question: "What is multi-tenancy in NexusRAG?",
      answer:
        "Multi-tenancy allows multiple client organizations to share the same underlying core platform infrastructure (such as authentication gateways, OCR processors, and ingestion pipelines) while maintaining strict cryptographic, schema-level, and access boundary isolation. Tenant A can never query or access Tenant B's data.",
    },
    {
      question: "What are business domains?",
      answer:
        "Domains are independent business functional units within an organization — such as Human Resources, Finance, IT Support, Legal, or Operations. In NexusRAG, each domain can operate as a decoupled micro-application with its own business logic, database schema, knowledge base, system prompts, and AI assistant.",
    },
    {
      question: "How does enterprise RAG work in NexusRAG?",
      answer:
        "Unlike naive semantic search which queries an open vector database, NexusRAG evaluates five verification gates before retrieving information: Tenant ID, Domain Scope, User Identity, Role RBAC permissions, and Document Access Control Lists (ACLs). Only authorized chunks are retrieved and passed to the domain-tailored AI agent for source-backed synthesis.",
    },
    {
      question: "How is tenant and domain data isolated?",
      answer:
        "Isolation is enforced at multiple architectural layers: logical schema partitioning in PostgreSQL, segregated pgvector collection namespaces, token-scoped API authentication, and pre-query permission filters that block unauthorized chunks from ever entering vector similarity computations.",
    },
    {
      question: "Can different domains have different AI agents?",
      answer:
        "Yes. Each domain deploys a purpose-built AI agent with its own persona, system prompt instructions, specialized retrieval strategies, and tool integrations. For instance, the Finance AI is tuned for tabular accounting and invoice extraction, while the IT AI understands terminal commands and server runbooks.",
    },
    {
      question: "Can organizations select their own domain combinations?",
      answer:
        "Absolutely. Tenants have full autonomy to provision only the domains they require. One organization might enable only HR and IT, while another enables Finance, Legal, and a custom proprietary engineering domain.",
    },
    {
      question: "How does role-based access control (RBAC) work?",
      answer:
        "NexusRAG implements domain-specific role hierarchies. Permissions are evaluated hierarchically from Tenant Admins down to domain-specific roles (e.g., HR Admin, HR Manager, HR Employee). When a user submits a query, only documents matching their specific role level are retrieved.",
    },
    {
      question: "What type of documents can be processed?",
      answer:
        "NexusRAG supports multi-format enterprise document ingestion, including multi-page PDFs (both digital and scanned via OCR), Microsoft Word (.docx), Excel spreadsheets (.xlsx), CSV data, and plain text/Markdown files (.txt, .md). Tables, structural headers, and multi-column layouts are preserved during chunking.",
    },
    {
      question: "Can domains have independent workflows and databases?",
      answer:
        "Yes. Because domains are architected as decoupled micro-applications, they can maintain dedicated database tables, custom workflow triggers (e.g., ticketing integrations, invoice status checks), and independent business logic without affecting the core platform.",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "FAQ" }]} />
      </div>

      <HeroSection
        badge="Knowledge Center"
        title="Frequently Asked"
        highlightedWord="Architectural Questions"
        subtitle="Explore detailed answers regarding multi-tenant security, domain boundaries, document processing, and permission-aware RAG retrieval."
        primaryCtaText="Request Demo"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore RAG Flow"
        secondaryCtaHref="/rag"
      />

      {/* FAQ Accordion Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            badge="Platform Q&A"
            title="Enterprise Architecture FAQ"
            subtitle="Clear explanations on how NexusRAG manages tenant boundaries, domain AI agents, and secure retrieval."
          />

          <FAQAccordion items={faqItems} defaultOpenIndex={0} />
        </div>
      </section>

      <CTASection
        title="Have a Question Not Answered Here?"
        subtitle="Our solutions architecture team is available to discuss your specific technical requirements."
      />
    </div>
  );
}
