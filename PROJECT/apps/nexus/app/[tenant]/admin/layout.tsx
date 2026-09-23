'use client';

import React from 'react';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CommandPalette } from '@/components/layout/CommandPalette';

export default function OrganizationAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        <CommandPalette />
        <AdminSidebar />
        <div className="flex-1 lg:ml-64 min-h-screen flex flex-col bg-slate-950">
          <AdminHeader />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
