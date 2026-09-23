'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DomainNavbar } from '@/components/layout/DomainNavbar';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { useDomainStore } from '@/stores/domain-store';

export default function DomainScopeLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const domainSlug = (params?.domain as string) || 'hr';
  const { setActiveDomain } = useDomainStore();

  useEffect(() => {
    setActiveDomain({
      id: `dom-${domainSlug}`,
      name: domainSlug.toUpperCase(),
      slug: domainSlug,
      description: `${domainSlug.toUpperCase()} Knowledge Domain`,
      isActive: true,
    } as any);
  }, [domainSlug, setActiveDomain]);

  return (
    <RoleGuard domainSlug={domainSlug}>
      <div className="flex flex-col -m-6 md:-m-8">
        <DomainNavbar domainSlug={domainSlug} />
        <div className="p-6 md:p-8">
          {children}
        </div>
      </div>
    </RoleGuard>
  );
}
