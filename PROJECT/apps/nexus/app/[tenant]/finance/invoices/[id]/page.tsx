'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Receipt, MessageSquare, DollarSign, CheckCircle2 } from 'lucide-react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const invoiceId = (params?.id as string) || '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href={`/${tenantSlug}/finance/invoices`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Invoices</span>
      </Link>

      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Invoice #{invoiceId}</h1>
              <p className="text-xs text-slate-400">OCR Parsed Line Items</p>
            </div>
          </div>

          <Link
            href={`/${tenantSlug}/finance/chat`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Audit Line Items with AI</span>
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
          <p className="font-semibold text-white">Vendor Details & PO Matching:</p>
          <p>Matched with Master Purchase Order #PO-2026-118. Payment terms: Net 30 days. No contractual anomalies detected.</p>
        </div>
      </div>
    </div>
  );
}
