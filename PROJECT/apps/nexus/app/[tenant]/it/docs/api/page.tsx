'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Code, ArrowLeft, MessageSquare, ExternalLink } from 'lucide-react';

export default function ItApiDocsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';

  const apis = [
    { title: 'FastAPI Backend REST Specification (v1)', endpoints: 42, format: 'OpenAPI 3.1 JSON' },
    { title: 'Vector Ingestion gRPC Streaming Service', endpoints: 8, format: 'Protobuf v3' },
    { title: 'Tenant Webhook Event Payloads & Signatures', endpoints: 14, format: 'HMAC-SHA256' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        href={`/${tenantSlug}/it/docs`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to System Docs</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">API Contracts & Specifications</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal microservice schemas, authentication headers, and webhook specifications
          </p>
        </div>

        <Link
          href={`/${tenantSlug}/it/chat`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask API Copilot</span>
        </Link>
      </div>

      <div className="space-y-3">
        {apis.map((api, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{api.title}</h4>
                <p className="text-xs text-slate-400 font-mono">{api.endpoints} endpoints • {api.format}</p>
              </div>
            </div>

            <Link
              href={`/${tenantSlug}/it/chat`}
              className="text-xs text-blue-400 hover:underline"
            >
              Query Payload Schemas →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
