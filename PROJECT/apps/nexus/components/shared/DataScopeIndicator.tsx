'use client';

import React from 'react';
import { Globe, Building2, Users, User, ShieldAlert } from 'lucide-react';

export type AccessScope = 'ORGANIZATION' | 'DEPARTMENT' | 'TEAM' | 'SELF';

interface DataScopeIndicatorProps {
  scope?: AccessScope | string;
  departmentName?: string;
  teamName?: string;
  className?: string;
}

export function DataScopeIndicator({
  scope = 'ORGANIZATION',
  departmentName = 'Human Resources',
  teamName = 'Engineering Team',
  className = '',
}: DataScopeIndicatorProps) {
  const normalizedScope = (scope || 'ORGANIZATION').toUpperCase() as AccessScope;

  switch (normalizedScope) {
    case 'ORGANIZATION':
      return (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs ${className}`}
          title="You have full organizational visibility across all departments"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>Showing: Entire Organization</span>
        </div>
      );

    case 'DEPARTMENT':
      return (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs ${className}`}
          title={`Data is scoped to the ${departmentName} department`}
        >
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          <span>Showing: {departmentName || 'Department'}</span>
        </div>
      );

    case 'TEAM':
      return (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs ${className}`}
          title={`Data is scoped to your team (${teamName})`}
        >
          <Users className="w-3.5 h-3.5 text-amber-600" />
          <span>Showing: {teamName ? `My Team (${teamName})` : 'My Team'}</span>
        </div>
      );

    case 'SELF':
    default:
      return (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs ${className}`}
          title="Data is scoped to your personal employee record"
        >
          <User className="w-3.5 h-3.5 text-emerald-600" />
          <span>Showing: My Information</span>
        </div>
      );
  }
}
