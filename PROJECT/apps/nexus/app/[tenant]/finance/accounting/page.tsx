'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Calculator,
  ArrowLeft,
  MessageSquare,
  BookOpen,
  Search,
  ShieldCheck,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Scale,
  BadgeCheck,
} from 'lucide-react';

export default function AccountingCompliancePage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = (params?.tenant as string) || 'supernova';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);

  const { data: policiesData, isLoading } = useQuery({
    queryKey: ['finance-compliance-policies', tenantSlug],
    queryFn: () => api.finance.getCompliancePolicies(),
  });

  const policies = policiesData?.policies || [
    {
      id: 'POL-GST-01',
      title: 'Corporate GST Invoicing & Input Tax Credit (ITC) Policy',
      category: 'GST',
      standard: 'CGST Act Section 16',
      summary: 'Guidelines for mandatory 3-way matching of Vendor GSTR-2B with ERP invoices before tax credit claim.',
      content: 'All purchase invoices exceeding ₹50,000 must include verified GSTIN, HSN/SAC codes, and electronic IRN (e-Invoice QR). Input Tax Credit (ITC) can only be availed once supplier submits GSTR-1 and invoice appears in GSTR-2B. Invoices unpaid after 180 days require reversal of claimed ITC along with 18% statutory interest.',
      effective_date: '2026-04-01',
      status: 'Active',
      doc_name: 'GST_Compliance_Manual_2026.pdf',
    },
    {
      id: 'POL-REV-02',
      title: 'Ind AS 115 / ASC 606: Revenue from Contracts with Customers',
      category: 'Ind AS / GAAP',
      standard: 'Ind AS 115',
      summary: '5-step framework for multi-year SaaS contracts, upfront setup fees, and usage-based billing recognition.',
      content: 'Revenue must be recognized when control of the promised goods or services is transferred to the customer. For SaaS subscriptions, revenue is recognized straight-line over the service term. Implementation fees with stand-alone value are recognized over the deployment period; otherwise amortized over the estimated customer life (36 months).',
      effective_date: '2026-01-01',
      status: 'Active',
      doc_name: 'IndAS115_Revenue_Recognition_Standard.pdf',
    },
    {
      id: 'POL-TAX-03',
      title: 'Corporate TDS (Tax Deducted at Source) & Withholding Matrix',
      category: 'Direct Tax',
      standard: 'Income Tax Act Sec 194C/194J/194Q',
      summary: 'Withholding tax rates for contractor payments, technical consultancy, and high-value purchase of goods.',
      content: 'TDS must be deducted at source prior to payment release or credit entry. Rates: 2% on 194C (Contracts), 10% on 194J (Professional / Tech services), and 0.1% on 194Q (Purchase of goods exceeding ₹50 Lakhs annually). Non-PAN vendor payments attract flat 20% TDS under Section 206AA.',
      effective_date: '2026-04-01',
      status: 'Active',
      doc_name: 'TDS_Withholding_Standard_Operating_Procedure.pdf',
    },
    {
      id: 'POL-EXP-04',
      title: 'Employee Travel & Entertainment Expense Governance',
      category: 'Internal Governance',
      standard: 'Internal SOP-FIN-08',
      summary: 'Thresholds, receipt submission deadlines, per-diem caps, and mandatory manager approval chains.',
      content: 'All expense claims must be filed within 30 days of spend with original tax invoices. Air travel booking is economy class; lodging per-diem capped at ₹7,500/night for Tier-1 cities. Expenses above ₹25,000 require Department Head (VP) approval in addition to direct manager sign-off.',
      effective_date: '2026-02-15',
      status: 'Active',
      doc_name: 'Corporate_Travel_Expense_Policy_2026.pdf',
    },
    {
      id: 'POL-AUD-05',
      title: 'Internal Audit & SOX 404 Internal Controls Framework',
      category: 'Audit & Compliance',
      standard: 'ICFR / SOX 404',
      summary: 'Segregation of duties for vendor master modification, payment authorizers, and journal entry postings.',
      content: 'Dual authorization required for bank disbursements over ₹10 Lakhs. System access for invoice creator and payment approver must be strictly segregated. Quarterly audit logs of vendor bank detail changes must be reviewed by the Head of Internal Audit.',
      effective_date: '2026-01-01',
      status: 'Active',
      doc_name: 'SOX_Internal_Financial_Controls_Framework.pdf',
    },
  ];

  const categories = ['ALL', 'GST', 'Ind AS / GAAP', 'Direct Tax', 'Internal Governance', 'Audit & Compliance'];

  const filteredPolicies = policies.filter((p: any) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.standard.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAskCopilot = (question: string) => {
    router.push(`/${tenantSlug}/finance/chat?prompt=${encodeURIComponent(question)}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${tenantSlug}/finance`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Finance Overview</span>
        </Link>

        <Link
          href={`/${tenantSlug}/finance/chat`}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Open Finance Copilot</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1 font-mono">
            <Scale className="w-4 h-4" />
            <span>Accounting & Statutory Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Policies, GST Rules & Accounting Standards
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Knowledge-driven compliance framework. Query company policies, tax withholding rules, and revenue recognition standards with full citation backing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAskCopilot('What is our company’s GST invoice and Input Tax Credit (ITC) policy?')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask GST / Tax Policy Question</span>
          </button>
        </div>
      </div>

      {/* Suggested Fast Queries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => handleAskCopilot('What are the TDS deduction rules for vendor software and consulting services under Sec 194J?')}
          className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition flex items-center gap-3 group"
        >
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-105 transition">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Vendor TDS Deduction Rules</p>
            <p className="text-[11px] text-slate-400 truncate">Sec 194C vs 194J rates & thresholds</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
        </div>

        <div
          onClick={() => handleAskCopilot('How do we recognize SaaS subscription revenue with upfront deployment fees under Ind AS 115?')}
          className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition flex items-center gap-3 group"
        >
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Ind AS 115 SaaS Revenue</p>
            <p className="text-[11px] text-slate-400 truncate">Multi-element contract allocation</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
        </div>

        <div
          onClick={() => handleAskCopilot('What is the approval limit and receipt policy for employee travel expenses?')}
          className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition flex items-center gap-3 group"
        >
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition">
            <BadgeCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Travel Expense & Per-Diem</p>
            <p className="text-[11px] text-slate-400 truncate">SOP-FIN-08 claim guidelines</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search policies, standards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Policies List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredPolicies.map((p: any) => (
            <div
              key={p.id}
              onClick={() => setSelectedPolicy(p)}
              className={`p-5 rounded-2xl border transition cursor-pointer ${
                selectedPolicy?.id === p.id
                  ? 'bg-slate-900 border-emerald-500/60 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {p.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {p.standard}
                    </span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-[10px] text-slate-400">Effective: {p.effective_date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{p.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.summary}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAskCopilot(`Explain the requirements and compliance steps for: ${p.title}`);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition shrink-0"
                  title="Query with Copilot"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>{p.doc_name}</span>
                </div>
                <span className="text-emerald-400 flex items-center gap-1 hover:underline">
                  View Full Policy & AI Breakdown <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}

          {filteredPolicies.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs">
              No matching compliance standards or policies found.
            </div>
          )}
        </div>

        {/* Right Col: Selected Policy Deep Dive / AI Assistant Helper */}
        <div className="space-y-4">
          {selectedPolicy ? (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl space-y-4 sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {selectedPolicy.id}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                  {selectedPolicy.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{selectedPolicy.title}</h3>
                <p className="text-[11px] text-emerald-400 font-mono mt-0.5">{selectedPolicy.standard}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Policy Excerpt
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedPolicy.content}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Attached Knowledge Source
                </h4>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-white truncate">{selectedPolicy.doc_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">pgvector Indexed</span>
                </div>
              </div>

              <button
                onClick={() =>
                  handleAskCopilot(
                    `Based on ${selectedPolicy.title} (${selectedPolicy.standard}), what are the exact statutory requirements and risk factors?`
                  )
                }
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask AI Copilot About This Policy</span>
              </button>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 text-slate-400 space-y-3">
              <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
              <h4 className="text-xs font-bold text-slate-300">Select a Standard or Policy</h4>
              <p className="text-[11px] text-slate-500">
                Click any policy on the left to inspect statutory clauses, audit compliance rules, and source documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
