import React from "react";
import { Metadata } from "next";
import {
  Scale,
  FileCheck2,
  BookOpenCheck,
  Search,
  Lock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Legal Knowledge Solution — Permission-Aware Legal & Policy RAG",
  description:
    "Enable secure search and retrieval across internal policies, contractual precedents, and regulatory documentation without automated legal advice risks.",
};

export default function LegalDomainPage() {
  const legalFeatures = [
    {
      title: "Internal Legal Knowledge",
      description: "Search internal standard operating guidelines, governance rules, and legal team memorandums.",
      icon: <Scale className="w-5 h-5" />,
      badge: "Knowledge",
    },
    {
      title: "Policy & Clause Retrieval",
      description: "Locate specific standard indemnity clauses, limitation of liability templates, and governing law precedents.",
      icon: <FileCheck2 className="w-5 h-5" />,
      badge: "Precedents",
    },
    {
      title: "Document Knowledge Base",
      description: "Structure complex agreements, bylaws, non-disclosure agreements, and compliance manuals into searchable vector indexes.",
      icon: <BookOpenCheck className="w-5 h-5" />,
      badge: "Contracts",
    },
    {
      title: "Semantic & Boolean Search",
      description: "Combine vector semantic similarity with precise keyword matching to surface relevant legal documentation.",
      icon: <Search className="w-5 h-5" />,
      badge: "Search",
    },
    {
      title: "Permission-Aware Access",
      description: "Strict RBAC ensures sensitive litigation memos or draft acquisition docs are visible only to authorized counsel.",
      icon: <Lock className="w-5 h-5" />,
      badge: "Confidential",
    },
    {
      title: "Legal Knowledge Assistant",
      description: "Assist legal researchers by extracting and summarizing passages strictly with direct source citations.",
      icon: <Sparkles className="w-5 h-5" />,
      badge: "Assistant",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb
          items={[
            { label: "Solutions", href: "/solutions" },
            { label: "Legal Knowledge" },
          ]}
        />
      </div>

      <HeroSection
        badge="Legal & Policy Domain"
        title="Permission-Aware"
        highlightedWord="Legal Knowledge RAG"
        subtitle="Search, retrieve, and synthesize internal policies, contractual precedents, and governance documentation with absolute source citation fidelity and zero data cross-pollination."
        primaryCtaText="Deploy Legal Domain"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore Security"
        secondaryCtaHref="/security"
      />

      {/* Safety & Compliance Notice Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 font-semibold block mb-0.5">
              Strict Domain Boundary & Information Retrieval Focus:
            </strong>
            NexusRAG Legal Domain is designed exclusively for document retrieval, semantic search, and internal policy lookup. It does not provide legal advice, legal compliance guarantees, or automated legal determinations.
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Legal Capabilities"
            title="Grounded Retrieval for Legal Teams"
            subtitle="Streamline internal policy exploration and contractual research without compromising confidentiality."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {legalFeatures.map((feat, idx) => (
              <FeatureCard
                key={idx}
                icon={feat.icon}
                title={feat.title}
                description={feat.description}
                badge={feat.badge}
                badgeVariant="amber"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Scenario Card */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8 border-amber-500/30 bg-slate-900/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Example Legal Policy Query & Citation Grounding
                </h4>
                <span className="text-xs text-slate-400">
                  Domain: Legal • Role: Legal Counsel • Permission Verified
                </span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-amber-400 font-bold">Query:</span> "What is the standard fallback language for mutual confidentiality duration in vendor NDAs?"
              </div>
              <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/50 text-slate-200 leading-relaxed">
                <div className="text-amber-400 font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Legal Assistant Response:</span>
                </div>
                According to the Internal Contract Playbook (Clause Library Rev 4.1, Section 8: Confidentiality Term), standard company language specifies a duration of 3 years from disclosure date. If rejected by vendor, approved fallback language allows 2 years with perpetual protection for trade secrets.
                <div className="mt-3 pt-2 border-t border-amber-900/40 text-[11px] text-amber-300">
                  📚 Source Citations: [Contract_Playbook_2026.pdf • Section 8.3, Page 22]
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <CTASection
        title="Modernize Internal Legal Document Intelligence"
        subtitle="Empower your legal and corporate policy teams with precision search and verified citations."
      />
    </div>
  );
}
