'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Users, FileText, BookOpen, Calendar, UserPlus, MessageSquare, ArrowUpRight } from 'lucide-react';

export default function HrDomainHomePage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';

  const hrLinks = [
    { title: 'HR Policies Repository', href: `/${tenantSlug}/hr/policies`, desc: 'Workplace conduct, anti-harassment, and safety standards', icon: FileText },
    { title: 'Employee Handbook', href: `/${tenantSlug}/hr/handbook`, desc: 'Full interactive 2026 employee code & guidelines', icon: BookOpen },
    { title: 'Leave & PTO Benefits', href: `/${tenantSlug}/hr/leave`, desc: 'Parental leave, sick time, and vacation accrual rules', icon: Calendar },
    { title: 'Recruitment & Job Docs', href: `/${tenantSlug}/hr/recruitment`, desc: 'Job descriptions, interview scorecards, and hiring workflows', icon: UserPlus },
  ];

  return (
    <RoleGuard domainSlug="hr">
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/20 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
              <Users className="w-4 h-4" />
              <span>HR Department Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              People & Workplace Knowledge
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
              Dedicated AI Copilot trained on employee handbooks, leave policies, and talent acquisition guidelines.
            </p>
          </div>

          <Link
            href={`/${tenantSlug}/hr/chat`}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 transition shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Consult HR Copilot</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hrLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition shadow-xl group flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mb-4 group-hover:scale-110 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>

                <div className="mt-6 flex items-center justify-end text-xs text-rose-400 font-semibold gap-1">
                  <span>Explore Section</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </RoleGuard>
  );
}
