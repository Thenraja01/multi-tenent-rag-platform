'use client';

import React from 'react';
import { DashboardEngine } from '@/components/dashboard/DashboardEngine';

export default function TenantDashboardPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <DashboardEngine />
    </div>
  );
}
