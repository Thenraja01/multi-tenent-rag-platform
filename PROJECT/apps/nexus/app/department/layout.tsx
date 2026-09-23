'use client';

import React from 'react';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';
import { DepartmentSidebar } from '@/components/department/DepartmentSidebar';
import { DepartmentHeader } from '@/components/department/DepartmentHeader';
import { CommandPalette } from '@/components/layout/CommandPalette';

export default function DepartmentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        <CommandPalette />
        <DepartmentSidebar />
        <div className="flex-1 lg:ml-64 min-h-screen flex flex-col bg-slate-950">
          <DepartmentHeader />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
