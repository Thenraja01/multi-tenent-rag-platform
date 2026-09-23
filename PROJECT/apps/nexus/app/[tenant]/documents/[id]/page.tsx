'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { DocumentViewerWithHighlight } from '@/components/documents/DocumentViewerWithHighlight';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = (params?.id as string) || '';
  const tenantSlug = (params?.tenant as string) || 'globex';

  return (
    <div className="w-full max-w-7xl mx-auto py-2">
      <DocumentViewerWithHighlight
        documentId={documentId}
        tenantSlug={tenantSlug}
      />
    </div>
  );
}
