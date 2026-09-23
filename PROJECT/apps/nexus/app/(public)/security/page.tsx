import React from "react";
import { Metadata } from "next";
import {
  ShieldCheck,
  Building,
  Layers,
  Users,
  Lock,
  Search,
  ClipboardList,
  Sparkles,
  KeyRound,
  FileCheck2,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SecurityCard } from "@/components/ui/SecurityCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Security & Trust — Multi-Tenant & Domain-Isolated AI Architecture",
  description:
    "Explore NexusRAG security architecture: tenant schema isolation, domain knowledge boundaries, role-based access control, and complete query auditability.",
};

export default function SecurityPage() {
  const securityPillars = [
    {
      title: "Multi-Tenant Isolation",
      description: "Organizations operate with strict cryptographic and schema-level isolation. No client data can ever interact across tenant boundaries.",
      boundaryLevel: "Tenant Level",
      points: [
        "Dedicated tenant schema namespaces",
        "Tenant-scoped API tokens & session validation",
        "Isolated document repositories & vector tables",
      ],
    },
    {
      title: "Domain Isolation",
      description: "Within each tenant, business domains (HR, Finance, IT, etc.) maintain independent knowledge boundaries, business logic, and databases.",
      boundaryLevel: "Domain Level",
      points: [
        "Partitioned vector collections per domain",
        "Decoupled micro-application architecture",
        "Domain-specific AI prompt & tool sandboxing",
      ],
    },
    {
      title: "Domain-Level RBAC",
      description: "Users receive access permissions tailored specifically to their domain roles, ensuring principle of least privilege.",
      boundaryLevel: "Access Control",
      points: [
        "Hierarchical role definitions (Admin, Manager, User)",
        "Document-level classification & tag restrictions",
        "Dynamic permission verification prior to query execution",
      ],
    },
    {
      title: "Permission-Aware Retrieval",
      description: "Retrieval filters evaluate user role ACLs before vector search execution, preventing unauthorized context from reaching the LLM.",
      boundaryLevel: "Query Time",
      points: [
        "Pre-query security filtering in database",
        "Zero unauthorized chunk exposure to LLM",
        "Source citation verification on generated outputs",
      ],
    },
    {
      title: "Platform Auditability & Logs",
      description: "Every document upload, role modification, query execution, and agent response is recorded in an immutable audit log.",
      boundaryLevel: "Audit Trail",
      points: [
        "Immutable query and prompt audit trails",
        "Resource consumption & telemetry tracking",
        "Traceable source document attribution",
      ],
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "Security & Trust" }]} />
      </div>

      <HeroSection
        badge="Zero-Trust Architecture"
        title="Secure Knowledge Access"
        highlightedWord="by Design"
        subtitle="In enterprise AI, security cannot be an afterthought. NexusRAG integrates cryptographic tenant partitioning, domain-isolated vector indexes, and role-based retrieval at the core architectural layer."
        primaryCtaText="Review Architecture"
        primaryCtaHref="/architecture"
        secondaryCtaText="Explore Multi-Tenancy"
        secondaryCtaHref="/multi-tenancy"
      />

      {/* Visual Hierarchy: Tenant -> Domain -> Role -> Permission -> Knowledge -> AI */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-3">
            Security Enforcement Flow
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Multi-Layered Defense-in-Depth Model
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Tenant", icon: Building, desc: "Schema Isolation" },
              { name: "Domain", icon: Layers, desc: "Service Boundary" },
              { name: "Role", icon: Users, desc: "Domain RBAC" },
              { name: "Permission", icon: KeyRound, desc: "ACL Verification" },
              { name: "Knowledge", icon: Search, desc: "Scoped Index" },
              { name: "AI Agent", icon: Sparkles, desc: "Grounded Output" },
            ].map((node, i) => {
              const Icon = node.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col items-center text-center"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white mb-0.5">
                    {node.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {node.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Pillars Cards */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Security Architecture"
            title="Core Platform Security Guarantees"
            subtitle="Built strictly according to isolated multi-tenant systems and zero-leakage enterprise retrieval standards."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityPillars.slice(0, 3).map((item, idx) => (
              <SecurityCard
                key={idx}
                title={item.title}
                description={item.description}
                boundaryLevel={item.boundaryLevel}
                points={item.points}
              />
            ))}
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {securityPillars.slice(3).map((item, idx) => (
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

      <CTASection
        title="Protect Your Enterprise Knowledge from Day One"
        subtitle="Request a technical security overview with our enterprise solutions architecture team."
      />
    </div>
  );
}
