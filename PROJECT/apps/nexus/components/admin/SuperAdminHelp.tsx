'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  HelpCircle,
  X,
  BookOpen,
  Cpu,
  Shield,
  Layers,
  FileCheck2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export function SuperAdminHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const getContextualHelp = () => {
    if (pathname.includes('/rag')) {
      return {
        title: 'RAG Infrastructure & Vector Memory',
        description:
          'Configure PostgreSQL pgvector embeddings, index dimensions, chunking strategies, and neural search similarity thresholds.',
        tips: [
          'Embedding dimension: 1536 (text-embedding-3-small) / 3072 (text-embedding-3-large)',
          'Hybrid search combines full-text BM25 with dense cosine similarity vectors',
          'Document chunks are stored with tenant-isolated Row-Level Security compound keys',
        ],
      };
    }
    if (pathname.includes('/knowledge') || pathname.includes('/documents')) {
      return {
        title: 'Knowledge Lifecycle & Default Nexus',
        description:
          'Documents are uploaded, stored in S3/MinIO, validated, parsed into chunks, embedded, and published before Default Nexus can search them.',
        tips: [
          'Uploading a file stores it securely without immediately executing AI indexing',
          'Click "Make AI Knowledge" to trigger asynchronous Celery/worker embedding',
          'Default Nexus only queries published vector chunks belonging to the authorized domain',
        ],
      };
    }
    if (pathname.includes('/organizations')) {
      return {
        title: 'Multi-Tenant Isolation & Provisioning',
        description:
          'Manage enterprise organizations, custom subdomains, subscription packs, department assignments, and administrator accounts.',
        tips: [
          'Each organization is provisioned with an isolated tenant ID and database schema/RLS context',
          'Packs bundle multiple departments and domain templates for rapid onboarding',
          'Organization status (ACTIVE, PENDING_APPROVAL, SUSPENDED) immediately affects API access',
        ],
      };
    }
    return {
      title: 'NEXUS Super Admin Platform Guide',
      description:
        'You have global authority over all platform infrastructure, tenants, packs, domains, neural RAG pipelines, and security policies.',
      tips: [
        'Use the Context Selector in the top bar to inspect specific organizations without switching roles',
        'Command Palette (Ctrl + K) provides instant search across all database entities',
        'Zero-trust Row-Level Security ensures strict multi-tenant boundaries across all API endpoints',
      ],
    };
  };

  const help = getContextualHelp();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition shadow-xs bg-white border border-slate-200/80"
        title="Super Admin Help & Documentation"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl shadow-slate-900/20 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{help.title}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">Super Admin Architecture Help</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {help.description}
            </p>

            {/* Tips / Architecture Rules */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Key Architectural Guidelines
              </span>
              <ul className="space-y-2">
                {help.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
