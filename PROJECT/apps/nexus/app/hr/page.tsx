'use client';

import React from 'react';
import { EnterpriseAppShell } from '@/components/layout/EnterpriseAppShell';
import { ModuleDashboard } from '@/components/dashboard/ModuleDashboard';
import { useAuthStore } from '@/stores/auth-store';
import { AccessScope } from '@/components/shared/DataScopeIndicator';

export default function HRModulePage() {
  const { user } = useAuthStore();

  // Resolve scope based on auth context
  let resolvedScope: AccessScope = 'ORGANIZATION';
  if (user?.is_org_admin || user?.role === 'org_admin' || user?.is_superadmin) {
    resolvedScope = 'ORGANIZATION';
  } else if (user?.role === 'department_admin') {
    resolvedScope = 'DEPARTMENT';
  } else if (user?.role === 'manager') {
    resolvedScope = 'TEAM';
  } else {
    resolvedScope = 'SELF';
  }

  const deptName = user?.department_name || 'Human Resources';

  return (
    <EnterpriseAppShell
      scope={resolvedScope}
      departmentName={deptName}
      breadcrumbItems={[
        { label: 'HR', href: '/hr' },
        { label: 'Dashboard' },
      ]}
    >
      <ModuleDashboard
        moduleName="Human Resources"
        moduleSlug="hr"
        scope={resolvedScope}
        departmentName={deptName}
      />
    </EnterpriseAppShell>
  );
}
