'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Cpu,
  Building2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export function SuperAdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const notifications = [
    {
      id: '1',
      title: 'PostgreSQL Vector Extension Healthy',
      message: 'pgvector HNSW index initialized with 0.99 recall latency.',
      type: 'success',
      time: 'Just now',
      href: '/superadmin/rag',
    },
    {
      id: '2',
      title: 'Database Schema Synchronized',
      message: '18 catalog modules and 4 packs successfully loaded from seed.',
      type: 'info',
      time: '12m ago',
      href: '/superadmin/modules',
    },
    {
      id: '3',
      title: 'Zero-Trust RLS Policies Active',
      message: 'All multi-tenant transaction queries enforced with tenant context.',
      type: 'success',
      time: '1h ago',
      href: '/superadmin/security',
    },
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition shadow-xs bg-white border border-slate-200/80 relative"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900">Platform Notifications</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              3 New
            </span>
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => setIsOpen(false)}
                className="block p-2.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{n.title}</span>
                  <span className="text-[10px] text-slate-400">{n.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">{n.message}</p>
              </Link>
            ))}
          </div>

          <div className="pt-1 text-center border-t border-slate-100">
            <Link
              href="/superadmin/audit"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-blue-600 hover:underline block py-1"
            >
              View Full Audit Trail & Event Logs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
