import React from "react";
import { Metadata } from "next";
import {
  Building2,
  Layers,
  Users,
  ShieldCheck,
  Database,
  Lock,
  GitFork,
  CheckCircle2,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TenantIsolationDiagram } from "@/components/diagrams/TenantIsolationDiagram";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Multi-Tenancy — Enterprise Organization Isolation",
  description:
    "NexusRAG provides secure multi-tenancy: isolated schemas, tenant-specific domain selection, independent user directories, and separate vector indexes.",
};

export default function MultiTenancyPage() {
  const tenancyPillars = [
    {
      title: "Tenant Schema Isolation",
      description: "Every organization operates in a dedicated logical schema namespace with cryptographic separation.",
      icon: <Building2 className="w-5 h-5" />,
      badge: "Isolation",
    },
    {
      title: "Tenant-Specific Domains",
      description: "Tenants independently enable the business domains they require (e.g., HR + IT for Tenant A, Finance + Legal for Tenant B).",
      icon: <Layers className="w-5 h-5" />,
      badge: "Modular",
    },
    {
      title: "Tenant-Specific User Directories",
      description: "Users, roles, and administrative hierarchies are confined entirely within the tenant boundary.",
      icon: <Users className="w-5 h-5" />,
      badge: "Identity",
    },
    {
      title: "Isolated Knowledge Stores",
      description: "Vector embeddings and document chunks are partitioned at the database layer with zero shared tables.",
      icon: <Database className="w-5 h-5" />,
      badge: "Vector Data",
    },
    {
      title: "Custom Domain Combinations",
      description: "Organizations can define bespoke domain apps without impacting other tenants on the platform.",
      icon: <GitFork className="w-5 h-5" />,
      badge: "Flexibility",
    },
    {
      title: "Independent RBAC Trees",
      description: "Tenant admins retain full autonomy to configure role permissions and domain access policies.",
      icon: <Lock className="w-5 h-5" />,
      badge: "Governance",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "Multi-Tenancy" }]} />
      </div>

      <HeroSection
        badge="Multi-Tenant Architecture"
        title="One Platform."
        highlightedWord="Isolated Organizations."
        subtitle="NexusRAG empowers multiple enterprise clients to leverage shared AI infrastructure while guaranteeing strict physical and logical isolation of users, documents, permissions, and knowledge."
        primaryCtaText="Deploy Multi-Tenant RAG"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore RBAC"
        secondaryCtaHref="/rbac"
      />

      {/* Interactive Tenant Isolation Diagram */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Tenant Boundary Visualization"
            title="How Organizations Operate Independently"
            subtitle="Explore how independent customer tenants provision customized domain workspaces on top of shared platform infrastructure."
          />
          <TenantIsolationDiagram />
        </div>
      </section>

      {/* Tenancy Capabilities Grid */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Isolation Guarantees"
            title="Engineered for Enterprise Autonomy"
            subtitle="Understand the multi-tenant architectural guarantees that protect client organizations."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenancyPillars.map((feat, idx) => (
              <FeatureCard
                key={idx}
                icon={feat.icon}
                title={feat.title}
                description={feat.description}
                badge={feat.badge}
                badgeVariant="blue"
              />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Scale Multiple Organizations on a Unified AI Layer"
        subtitle="Schedule an architectural demonstration of our multi-tenant isolation engine."
      />
    </div>
  );
}
