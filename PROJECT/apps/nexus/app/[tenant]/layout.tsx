'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TenantSidebar } from '@/components/layout/TenantSidebar';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';
import { CommandPalette } from '@/components/layout/CommandPalette';

export default function TenantWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';

  if (['admin', 'superadmin', 'super-admin', 'platform', 'api'].includes(tenantSlug?.toLowerCase())) {
    return <>{children}</>;
  }

  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        <CommandPalette />
        <TenantSidebar />
        <main className="flex-1 lg:ml-64 min-h-screen flex flex-col bg-slate-950">
          <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </WorkspaceProvider>
  );
}

