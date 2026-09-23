'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileDropzone } from '@/components/knowledge/FileDropzone';
import { ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';

export default function DocumentUploadPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = (params?.tenant as string) || 'default';
  const domainSlug = (params?.domain as string) || 'hr';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href={`/${tenantSlug}/${domainSlug}/knowledge`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {domainSlug.toUpperCase()} Knowledge Base</span>
      </Link>

      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Domain Partitioned Vector Pipeline</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Upload Knowledge Assets ({domainSlug.toUpperCase()})
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Ingested files are automatically converted, chunked with semantic overlap, and embedded into pgvector.
        </p>
      </div>

      <FileDropzone
        domainId={domainSlug}
        onSuccess={() => {
          // Keep dropzone active to display pipeline progress
        }}
      />
    </div>
  );
}
