import React from "react";
import { Metadata } from "next";
import {
  DollarSign,
  Receipt,
  FileSpreadsheet,
  PieChart,
  BookMarked,
  Sparkles,
  GitBranch,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Finance Knowledge Solution — Intelligent Financial Knowledge",
  description:
    "Empower finance teams with secure document intelligence over invoices, financial reports, expense policies, and accounting standards.",
};

export default function FinanceDomainPage() {
  const financeFeatures = [
    {
      title: "Invoice Management",
      description: "Extract structured line items, vendor tax IDs, payment terms, and totals from diverse invoice formats.",
      icon: <Receipt className="w-5 h-5" />,
      badge: "Invoices",
    },
    {
      title: "Financial Documents RAG",
      description: "Perform semantic and numerical queries across audited disclosures, balance sheets, and audit filings.",
      icon: <FileSpreadsheet className="w-5 h-5" />,
      badge: "Disclosures",
    },
    {
      title: "Expense Policies",
      description: "Instant policy checks on per diems, travel expense thresholds, flight classes, and reimbursement workflows.",
      icon: <DollarSign className="w-5 h-5" />,
      badge: "Expenses",
    },
    {
      title: "Financial Reports",
      description: "Summarize quarterly trends, variance reports, budget vs actual comparisons, and departmental allocations.",
      icon: <PieChart className="w-5 h-5" />,
      badge: "Reports",
    },
    {
      title: "Accounting Knowledge",
      description: "Retrieve internal chart of accounts definitions, revenue recognition rules, and depreciation schedules.",
      icon: <BookMarked className="w-5 h-5" />,
      badge: "Standards",
    },
    {
      title: "Finance AI Assistant",
      description: "Specialized financial reasoning agent capable of tabular synthesis and numerical context verification.",
      icon: <Sparkles className="w-5 h-5" />,
      badge: "AI Agent",
    },
    {
      title: "Finance Workflows",
      description: "Facilitate purchase order approval checks, vendor onboarding verification, and monthly close SOP lookups.",
      icon: <GitBranch className="w-5 h-5" />,
      badge: "Workflows",
    },
    {
      title: "Audit & Ledger Security",
      description: "Role-restricted access ensures confidential financial forecasts and executive payroll remain strictly protected.",
      icon: <ShieldAlert className="w-5 h-5" />,
      badge: "Security",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb
          items={[
            { label: "Solutions", href: "/solutions" },
            { label: "Finance Knowledge" },
          ]}
        />
      </div>

      <HeroSection
        badge="Finance & Accounting Domain"
        title="Intelligent"
        highlightedWord="Financial Knowledge"
        subtitle="Unify your invoices, quarterly reports, accounting standards, and expense regulations into a secure, permission-scoped financial intelligence layer."
        primaryCtaText="Deploy Finance AI"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore Platform"
        secondaryCtaHref="/platform"
      />

      {/* Feature Grid */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Finance Capabilities"
            title="Precision-Engineered Financial RAG"
            subtitle="Explore how NexusRAG enables high-accuracy tabular parsing and document retrieval for financial analysts and accountants."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {financeFeatures.map((feat, idx) => (
              <FeatureCard
                key={idx}
                icon={feat.icon}
                title={feat.title}
                description={feat.description}
                badge={feat.badge}
                badgeVariant="emerald"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Finance Scenario Card */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8 border-emerald-500/30 bg-slate-900/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Example Finance Query & Tabular Grounding
                </h4>
                <span className="text-xs text-slate-400">
                  Domain: Finance • Role: Finance Analyst • Audit Verified
                </span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-emerald-400 font-bold">Query:</span> "What were the approved payment terms for cloud infrastructure vendor INV-9042?"
              </div>
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-slate-200 leading-relaxed">
                <div className="text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finance Assistant Response:</span>
                </div>
                For Invoice INV-9042 issued on November 14, 2025, the agreed payment term is Net 45 days. The total amount payable is $42,500.00 USD with early settlement discount of 2% if paid within 15 days.
                <div className="mt-3 pt-2 border-t border-emerald-900/40 text-[11px] text-emerald-300">
                  📚 Source Citations: [Vendor_Invoices_Q4_2025.pdf • Table Row 18]
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <CTASection
        title="Elevate Your Financial Document Intelligence"
        subtitle="Empower your accounting and finance teams with rapid, source-backed information retrieval."
      />
    </div>
  );
}
