'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  BookOpen,
  ArrowLeft,
  UploadCloud,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  Layers,
  Database,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

export default function FinanceKnowledgePage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = (params?.tenant as string) || 'supernova';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Use documents query with finance domain scope
  const { data: docsData, isLoading, refetch } = useQuery({
    queryKey: ['finance-knowledge-docs', tenantSlug],
    queryFn: async () => {
      try {
        const res = await api.documents.getAll();
        return res;
      } catch (e) {
        return [];
      }
    },
  });

  const categories = [
    { id: 'ALL', label: 'All Documents', count: 12 },
    { id: 'POLICIES', label: 'Finance Policies', count: 4 },
    { id: 'STANDARDS', label: 'Accounting Standards', count: 2 },
    { id: 'GST_TAX', label: 'GST & Tax Circulars', count: 3 },
    { id: 'REPORTS', label: 'Financial Reports', count: 2 },
    { id: 'CONTRACTS', label: 'Vendor Contracts', count: 1 },
  ];
  const sampleFinanceDocs = [
    {
      id: 'doc-fin-001',
      title: 'Corporate Travel & Expense Reimbursement Policy 2026',
      category: 'POLICIES',
      file_name: 'Corporate_Travel_Expense_Policy_2026.pdf',
      file_size: '2.4 MB',
      chunks_count: 38,
      status: 'INDEXED',
      updated_at: '2026-09-10',
      description: 'Employee per-diem limits, travel approval workflows, and hotel caps.',
    },
    {
      id: 'doc-fin-002',
      title: 'GST Input Tax Credit & E-Invoicing Rules Manual',
      category: 'GST_TAX',
      file_name: 'GST_Compliance_Manual_2026.pdf',
      file_size: '4.8 MB',
      chunks_count: 64,
      status: 'INDEXED',
      updated_at: '2026-09-08',
      description: 'GSTR-2B reconciliation guidelines and e-way bill threshold criteria.',
    },
    {
      id: 'doc-fin-003',
      title: 'Ind AS 115 Revenue Recognition & SaaS Subscriptions',
      category: 'STANDARDS',
      file_name: 'IndAS115_Revenue_Recognition_Standard.pdf',
      file_size: '3.1 MB',
      chunks_count: 52,
      status: 'INDEXED',
      updated_at: '2026-09-01',
      description: 'Performance obligations and contract asset/liability accounting.',
    },
    {
      id: 'doc-fin-004',
      title: 'Q1 FY2026 Audited Financial Statements & Executive P&L',
      category: 'REPORTS',
      file_name: 'Q1_FY2026_Financial_Statements.pdf',
      file_size: '8.2 MB',
      chunks_count: 112,
      status: 'INDEXED',
      updated_at: '2026-07-20',
      description: 'Consolidated balance sheet, cash flows, and departmental EBIT margins.',
    },
    {
      id: 'doc-fin-005',
      title: 'CloudScale Infra Master Services Agreement (MSA)',
      category: 'CONTRACTS',
      file_name: 'CloudScale_MSA_Contract_2026.pdf',
      file_size: '1.9 MB',
      chunks_count: 26,
      status: 'INDEXED',
      updated_at: '2026-08-15',
      description: 'Commercial terms: Net-30, tiered SLA credit matrix, annual discount.',
    },
    {
      id: 'doc-fin-006',
      title: 'Direct Tax TDS Withholding SOP (Sec 194C / 194J / 194Q)',
      category: 'GST_TAX',
      file_name: 'TDS_Withholding_SOP_2026.pdf',
      file_size: '1.5 MB',
      chunks_count: 22,
      status: 'INDEXED',
      updated_at: '2026-09-04',
      description: 'TDS deduction percentages, challan remittance deadlines, and 26AS verification.',
    },
  ];

  const filteredDocs = sampleFinanceDocs.filter((doc) => {
    const matchesCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadSuccess(false);

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    }, 1800);
  };

  const handleAskAboutDoc = (docTitle: string) => {
    router.push(`/${tenantSlug}/finance/chat?prompt=${encodeURIComponent(`Summarize and extract key financial rules from: ${docTitle}`)}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb */}
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
          <span>Ask Finance Copilot</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1 font-mono">
            <Database className="w-4 h-4" />
            <span>PostgreSQL + pgvector Indexed Domain Corpus</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Finance Knowledge Repository
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Centralized document ingestion for Finance: Policies, Accounting Standards, GST Circulars, Quarterly Reports, and Vendor Contracts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 transition">
            <UploadCloud className="w-4 h-4" />
            <span>{isUploading ? 'Extracting & Embedding...' : 'Upload Finance Document'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.xlsx,.txt"
              className="hidden"
              disabled={isUploading}
              onChange={handleSimulateUpload}
            />
          </label>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Document ingested, text extracted, and vectorized successfully into Finance partition.</span>
          </div>
          <button
            onClick={() => handleAskAboutDoc('recently uploaded finance document')}
            className="text-xs font-bold text-white underline hover:no-underline"
          >
            Query Document with AI →
          </button>
        </div>
      )}

      {/* RAG Ingestion Pipeline Indicator */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono">1</div>
          <div>
            <p className="font-semibold text-white">Extract & OCR</p>
            <p className="text-[11px] text-slate-400">PDF, Excel & scanned invoices</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold font-mono">2</div>
          <div>
            <p className="font-semibold text-white">Semantic Chunking</p>
            <p className="text-[11px] text-slate-400">512 token overlapping chunks</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold font-mono">3</div>
          <div>
            <p className="font-semibold text-white">Vector Embeddings</p>
            <p className="text-[11px] text-slate-400">Text-embedding-3 / BGE models</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono">4</div>
          <div>
            <p className="font-semibold text-white">pgvector Citations</p>
            <p className="text-[11px] text-slate-400">Accurate page & clause references</p>
          </div>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search finance documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-emerald-400 group-hover:scale-105 transition">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {doc.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                {doc.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {doc.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{doc.file_size}</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Layers className="w-3 h-3" />
                  {doc.chunks_count} Vector Chunks
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAskAboutDoc(doc.title)}
                  className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Copilot</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
