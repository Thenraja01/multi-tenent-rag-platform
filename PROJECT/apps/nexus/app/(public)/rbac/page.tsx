import React from "react";
import { Metadata } from "next";
import {
  ShieldCheck,
  Key,
  Lock,
  UserCheck,
  Layers,
  CheckCircle2,
  Sliders,
  Eye,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RBACTreeDiagram } from "@/components/diagrams/RBACTreeDiagram";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Domain-Level RBAC — Granular Role-Based Access Control",
  description:
    "Explore NexusRAG domain-level role hierarchies: Tenant Admin, HR roles, Finance roles, IT roles, and permission-aware retrieval filters.",
};

export default function RBACPage() {
  const rbacPrinciples = [
    {
      title: "Domain-Scoped Authority",
      description: "Permissions granted in the HR domain do not automatically grant privileges in the Finance or IT domains.",
      icon: <Layers className="w-5 h-5" />,
      badge: "Domain Scope",
    },
    {
      title: "Pre-Retrieval Policy Enforcement",
      description: "Access control lists (ACLs) are applied to vector search queries before retrieval to eliminate data leakage.",
      icon: <Lock className="w-5 h-5" />,
      badge: "Pre-Query",
    },
    {
      title: "Hierarchical Role Delegation",
      description: "Tenant Admins delegate domain administration to Department Admins without relinquishing root tenant control.",
      icon: <Key className="w-5 h-5" />,
      badge: "Delegation",
    },
    {
      title: "Document-Level Security Tags",
      description: "Documents can be tagged with confidential classification levels that restrict chunk retrieval to approved roles.",
      icon: <Eye className="w-5 h-5" />,
      badge: "Classification",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "Domain-Level RBAC" }]} />
      </div>

      <HeroSection
        badge="Access Governance"
        title="Permissions That"
        highlightedWord="Follow the Knowledge"
        subtitle="NexusRAG enforces fine-grained, domain-specific role-based access control (RBAC). Employees only retrieve documents and generate answers authorized for their specific organizational role."
        primaryCtaText="Explore RAG Flow"
        primaryCtaHref="/rag"
        secondaryCtaText="View Security"
        secondaryCtaHref="/security"
      />

      {/* Role Hierarchy Visualizer */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Hierarchical Role Structure"
            title="Domain-Specific Role Trees"
            subtitle="Explore how administrative and query permissions cascade from Tenant Admin to domain-specific operators and users."
          />
          <RBACTreeDiagram />
        </div>
      </section>

      {/* Governance Principles */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="RBAC Mechanics"
            title="How RBAC Protects Knowledge"
            subtitle="Review the core principles governing access verification across our retrieval pipelines."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rbacPrinciples.map((feat, idx) => (
              <FeatureCard
                key={idx}
                icon={feat.icon}
                title={feat.title}
                description={feat.description}
                badge={feat.badge}
                badgeVariant="purple"
              />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Implement Granular Access Governance Today"
        subtitle="Ensure every AI response is strictly compliant with your organization's internal access policies."
      />
    </div>
  );
}
