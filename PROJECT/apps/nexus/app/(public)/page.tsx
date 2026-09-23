import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Layers,
  Sparkles,
  Users,
  DollarSign,
  Terminal,
  Scale,
  Cog,
  Wrench,
  Search,
  Lock,
  Database,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Server,
  FileText,
  Key,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DomainCard } from "@/components/ui/DomainCard";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SecurityCard } from "@/components/ui/SecurityCard";
import { StatsSection } from "@/components/ui/StatsSection";
import { LogoCloud } from "@/components/ui/LogoCloud";
import { CTASection } from "@/components/ui/CTASection";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";
import { RAGPipeline } from "@/components/diagrams/RAGPipeline";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const domainsList = [
    {
      title: "HR Knowledge",
      description: "Automate policy queries, onboarding walkthroughs, handbook lookups, and leave tracking workflows.",
      icon: <Users className="w-6 h-6" />,
      tag: "Domain App",
      href: "/solutions/hr",
      capabilities: [
        "Employee Handbook & Policy RAG",
        "Leave & Attendance Inquiries",
        "Domain-Scoped HR Assistant",
        "Departmental Onboarding Knowledge",
      ],
    },
    {
      title: "Finance Knowledge",
      description: "Query invoice histories, accounting frameworks, expense regulations, and financial disclosures safely.",
      icon: <DollarSign className="w-6 h-6" />,
      tag: "Domain App",
      href: "/solutions/finance",
      capabilities: [
        "Invoice & Expense Document RAG",
        "Accounting Policy Retrieval",
        "Financial Disclosures Analysis",
        "Audited Financial Reasoning",
      ],
    },
    {
      title: "IT Support",
      description: "Accelerate incident resolution, server runbook queries, API documentation search, and helpdesk diagnostics.",
      icon: <Terminal className="w-6 h-6" />,
      tag: "Domain App",
      href: "/solutions/it",
      capabilities: [
        "Server & API Runbook Indexing",
        "Incident Troubleshooting Engine",
        "Technical Architecture Retrieval",
        "Helpdesk Tier-1/2 AI Assistant",
      ],
    },
    {
      title: "Legal Knowledge",
      description: "Permission-aware retrieval over internal regulatory policies, compliance guidelines, and contractual precedents.",
      icon: <Scale className="w-6 h-6" />,
      tag: "Domain App",
      href: "/solutions/legal",
      capabilities: [
        "Internal Policy & Precedent Search",
        "Contract & Clause Retrieval",
        "Granular Permission Boundary Check",
        "Zero Automated Decision Risk",
      ],
    },
    {
      title: "Operations Knowledge",
      description: "Empower ground teams with standard operating procedures (SOPs), supply chain docs, and workflow knowledge.",
      icon: <Cog className="w-6 h-6" />,
      tag: "Domain App",
      href: "/solutions/operations",
      capabilities: [
        "Standard Operating Procedures (SOPs)",
        "Logistics & Vendor Guidelines",
        "Process Efficiency RAG Queries",
        "Operations Field Assistant",
      ],
    },
    {
      title: "Custom Domains",
      description: "Deploy purpose-built domain applications with dedicated databases, business logic, prompts, and knowledge bases.",
      icon: <Wrench className="w-6 h-6" />,
      tag: "Extensible",
      href: "/solutions/custom",
      capabilities: [
        "Isolated Custom Databases",
        "Tailored Domain Retrieval Strategies",
        "Autonomous Domain AI Agents",
        "Custom Workflow Triggers",
      ],
    },
  ];

  const securityFeatures = [
    {
      title: "Multi-Tenant Isolation",
      description: "Logical and schema-level partitioning ensures organizations operate with zero cross-tenant data contamination.",
      boundaryLevel: "Tenant Level",
      points: [
        "Dedicated tenant schema namespaces",
        "Tenant-scoped API tokens & sessions",
        "Isolated document repositories",
      ],
    },
    {
      title: "Domain Isolation",
      description: "Each business domain maintains its own knowledge boundaries, business logic, and scoped vector collections.",
      boundaryLevel: "Domain Level",
      points: [
        "Independent domain vector indexes",
        "Decoupled microservice architecture",
        "Domain-specific prompt sandboxes",
      ],
    },
    {
      title: "Domain-Level RBAC",
      description: "Fine-grained permissions enforce user access by role across tenant and individual domain boundaries.",
      boundaryLevel: "Access Control",
      points: [
        "Role-scoped document visibility",
        "Domain admin & manager hierarchies",
        "Dynamic permission verification",
      ],
    },
    {
      title: "Permission-Aware Retrieval",
      description: "Retrieval filters evaluate user role ACLs before executing vector search or returning source citations.",
      boundaryLevel: "Query Time",
      points: [
        "Pre-query security filtering",
        "Citation permission verification",
        "Zero unauthorized chunk exposure",
      ],
    },
    {
      title: "Audit & Usage Logging",
      description: "Comprehensive telemetry records every document ingestion, vector query, and agent response.",
      boundaryLevel: "Audit Trail",
      points: [
        "Immutable query audit logs",
        "Tenant usage monitoring",
        "Traceable source citations",
      ],
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <HeroSection
        badge="Enterprise AI Knowledge Infrastructure"
        title="Enterprise Knowledge. Intelligent AI."
        highlightedWord="Secure by Architecture."
        subtitle="Build secure, domain-aware AI experiences over your organization's knowledge with multi-tenant isolation, permission-aware retrieval, and enterprise RAG."
        primaryCtaText="Get Started"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore Architecture"
        secondaryCtaHref="/architecture"
        stats={[
          { label: "Architecture", value: "Multi-Tenant" },
          { label: "Isolation", value: "Domain-Level" },
          { label: "Retrieval", value: "Hybrid + RBAC" },
          { label: "AI Execution", value: "Source-Backed" },
        ]}
      >
        {/* Subtle Hero Flow Visualizer */}
        <div className="max-w-4xl mx-auto mt-4 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center mb-3">
            Secure Knowledge Execution Flow
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-medium">
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
              Organization
            </span>
            <span className="text-blue-500 font-bold">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
              Domain
            </span>
            <span className="text-blue-500 font-bold">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
              Knowledge Base
            </span>
            <span className="text-blue-500 font-bold">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-mono">
              Enterprise RAG
            </span>
            <span className="text-blue-500 font-bold">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300">
              Domain AI Agent
            </span>
            <span className="text-emerald-500 font-bold">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300">
              Answer + Sources
            </span>
          </div>
        </div>
      </HeroSection>

      {/* Integration Logos */}
      <LogoCloud />

      {/* Platform Architecture Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800/60 relative">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Modular Ecosystem"
            badgeVariant="blue"
            title="One Core Platform. Multiple Business Domains."
            subtitle="NexusRAG provides shared platform infrastructure while allowing independent business domains to maintain their own business logic, workflows, knowledge bases and AI capabilities."
          />
          <ArchitectureDiagram />
        </div>
      </section>

      {/* Domains Grid Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800/60 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Domain Applications"
            badgeVariant="emerald"
            title="AI Built Around Your Business Domains"
            subtitle="Equip every department with an intelligent assistant grounded in strictly scoped internal documents and role-specific permissions."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domainsList.map((dom, idx) => (
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

      {/* Enterprise RAG Pipeline Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800/60 relative">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Precision Retrieval"
            badgeVariant="purple"
            title="Answers Grounded in the Right Knowledge"
            subtitle="Traditional RAG only searches text. NexusRAG verifies the tenant, domain, user role, and document ACLs before executing hybrid vector retrieval and re-ranking."
          />
          <RAGPipeline />
        </div>
      </section>

      {/* Security Architecture Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800/60 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Security by Design"
            badgeVariant="emerald"
            title="Security Isn't an Add-On. It's the Architecture."
            subtitle="Built from the ground up for strict organizational partitioning, fine-grained access control, and comprehensive auditability."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.slice(0, 3).map((item, idx) => (
              <SecurityCard
                key={idx}
                title={item.title}
                description={item.description}
                boundaryLevel={item.boundaryLevel}
                points={item.points}
              />
            ))}
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {securityFeatures.slice(3).map((item, idx) => (
                <SecurityCard
                  key={idx}
                  title={item.title}
                  description={item.description}
                  boundaryLevel={item.boundaryLevel}
                  points={item.points}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global CTA */}
      <CTASection
        title="Bring Your Enterprise Knowledge Into the AI Era."
        subtitle="Deploy secure, domain-aware RAG across your organization with multi-tenant isolation and verified source citations."
        primaryCtaText="Get Started"
        primaryCtaHref="/contact"
        secondaryCtaText="Request Demo"
        secondaryCtaHref="/contact"
      />
    </div>
  );
}
