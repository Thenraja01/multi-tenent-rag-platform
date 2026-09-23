'use client';

import React from 'react';
import { TenantSidebar } from '@/components/layout/TenantSidebar';
import { Header } from '@/components/layout/Header';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
        <TenantSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-64">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
