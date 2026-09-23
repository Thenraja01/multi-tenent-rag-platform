'use client';

import React from 'react';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminHeader } from './SuperAdminHeader';

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7FAFF] text-slate-900 flex selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* 1. Canonical SuperAdmin Sidebar */}
      <SuperAdminSidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F7FAFF] overflow-x-hidden">
        {/* Canonical SuperAdmin Header */}
        <SuperAdminHeader />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
