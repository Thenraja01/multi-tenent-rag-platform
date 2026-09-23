import React from 'react';
import { SuperAdminLayout } from '@/components/admin/SuperAdminLayout';

export default function SuperAdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
