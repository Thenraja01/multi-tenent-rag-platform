import React from "react";
import { Metadata } from "next";
import {
  Users,
  DollarSign,
  Terminal,
  Scale,
  Cog,
  Wrench,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DomainCard } from "@/components/ui/DomainCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Solutions — Domain-Specific AI Knowledge Applications",
  description:
    "Explore NexusRAG domain applications: HR Knowledge, Finance Intelligence, IT Support, Legal Document RAG, Operations SOPs, and Custom Domains.",
};

export default function SolutionsPage() {
  const domains = [
    {
      title: "HR Knowledge",
      description:
        "Centralize employee handbooks, onboarding guides, leave policies, and HR workflows with domain-scoped AI assistance.",
      icon: <Users className="w-6 h-6" />,
      tag: "Human Resources",
      href: "/solutions/hr",
      capabilities: [
        "Employee Knowledge Base & Handbooks",
        "Leave & Attendance Policy Inquiries",
        "HR AI Assistant for Onboarding",
        "Department-Specific Guidelines RAG",
      ],
    },
    {
      title: "Finance Knowledge",
      description:
        "Extract insights from invoices, financial disclosures, accounting policies, and expense regulations securely.",
      icon: <DollarSign className="w-6 h-6" />,
      tag: "Finance & Accounting",
      href: "/solutions/finance",
      capabilities: [
        "Invoice & Expense Report RAG",
        "Financial Disclosures & Statements",
        "Accounting Standards Retrieval",
        "Audit-Ready Financial Reasoning",
      ],
    },
    {
      title: "IT Support",
      description:
        "Accelerate technical troubleshooting, server runbook lookups, API documentation search, and incident post-mortems.",
      icon: <Terminal className="w-6 h-6" />,
      tag: "IT & Engineering",
      href: "/solutions/it",
      capabilities: [
        "Server Runbooks & Architecture Docs",
        "API & SDK Technical Knowledge",
        "Incident Troubleshooting AI Assistant",
        "Helpdesk Tier-1/2 Knowledge Resolution",
      ],
    },
    {
      title: "Legal Knowledge",
      description:
        "Permission-aware retrieval over internal regulatory policies, contractual precedents, and compliance guidelines.",
      icon: <Scale className="w-6 h-6" />,
      tag: "Legal & Policy",
      href: "/solutions/legal",
      capabilities: [
        "Internal Policy & Precedent Search",
        "Contract Clause & Template Retrieval",
        "Granular Permission Boundary Check",
        "Strict Source-Grounding (No Legal Advice)",
      ],
    },
    {
      title: "Operations Knowledge",
      description:
        "Empower field teams and operations managers with instant access to SOPs, vendor manuals, and logistics protocols.",
      icon: <Cog className="w-6 h-6" />,
      tag: "Operations & Logistics",
      href: "/solutions/operations",
      capabilities: [
        "Standard Operating Procedures (SOPs)",
        "Logistics & Supply Chain Manuals",
        "Process Optimization Q&A",
        "Operational Field AI Assistant",
      ],
    },
    {
      title: "Custom Domains",
      description:
        "Your business doesn't fit into a template. Build custom domain applications with independent databases, logic, and agents.",
      icon: <Wrench className="w-6 h-6" />,
      tag: "Extensible Architecture",
      href: "/solutions/custom",
      capabilities: [
        "Isolated Custom Databases & Schemas",
        "Custom Prompt Engineering & Tools",
        "Specialized Embedding & Chunking Pipelines",
        "Autonomous Domain Workflows",
      ],
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "Solutions" }]} />
      </div>

      <HeroSection
        badge="Modular Business Solutions"
        title="One Platform."
        highlightedWord="Every Business Domain."
        subtitle="Organizations can provision only the domains they require. Each domain runs with independent business logic, databases, knowledge bases, and AI assistants."
        primaryCtaText="Get Started"
        primaryCtaHref="/contact"
        secondaryCtaText="View Architecture"
        secondaryCtaHref="/architecture"
      />

      {/* Solutions Grid */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Tailored Knowledge Layers"
            title="Choose Your Domain Workspaces"
            subtitle="Explore how NexusRAG isolates data and provides specialized AI agents for each department."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((dom, idx) => (
              <DomainCard
                key={idx}
                icon={dom.icon}
                title={dom.title}
                description={dom.description}
                capabilities={dom.capabilities}
                href={dom.href}
                tag={dom.tag}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Tenant Customization Callout */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/50 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto rounded-2xl border border-blue-500/20 bg-slate-900/60 p-8 text-center backdrop-blur-sm">
          <Layers className="w-10 h-10 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Flexible Domain Combinations per Tenant
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
            Tenant A can enable HR and IT; Tenant B can enable Finance and Legal. Each tenant’s users and knowledge bases stay completely isolated.
          </p>
          <div className="flex justify-center">
            <span className="text-xs font-mono text-blue-400 bg-blue-950/80 px-3 py-1.5 rounded-lg border border-blue-900">
              Zero cross-tenant or cross-domain bleed
            </span>
          </div>
        </div>
      </section>

      <CTASection
        title="Deploy Domain-Aware AI in Your Organization"
        subtitle="Schedule a consultation to see how your specific business domains can be configured in NexusRAG."
      />
    </div>
  );
}
