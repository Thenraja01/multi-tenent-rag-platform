'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Building2, Layers, BookOpen, ShieldCheck } from 'lucide-react';
import { useAdminContextStore } from '@/stores/admin-context-store';

export function ContextBreadcrumb() {
  const pathname = usePathname();
  const { type, organizationId, organizationName, domainId, domainName } = useAdminContextStore();

  const segments = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);

  if (segments.length === 0 || pathname === '/superadmin' || pathname === '/superadmin/dashboard') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium py-1">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          Super Admin
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-500">Platform Dashboard</span>
      </div>
    );
  }

  // Parse path items into friendly breadcrumb tokens
  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: 'Super Admin', href: '/superadmin/dashboard' },
  ];

  let currentPath = '/superadmin';

  segments.forEach((seg, index) => {
    currentPath += `/${seg}`;
    const isLast = index === segments.length - 1;

    // Formatting segment label
    let label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');

    if (seg === 'organizations' && organizationName && index === 1) {
      label = organizationName;
    } else if (seg === organizationId && organizationName) {
      label = organizationName;
    } else if (seg === domainId && domainName) {
      label = domainName;
    }

    breadcrumbItems.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium py-1 overflow-x-auto whitespace-nowrap">
      {breadcrumbItems.map((item, idx) => {
        const isLast = idx === breadcrumbItems.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-blue-600 hover:underline transition-colors text-slate-600"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-bold text-slate-900' : 'text-slate-600'}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
