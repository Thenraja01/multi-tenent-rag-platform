'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Globe,
  Building2,
  Layers,
  ChevronDown,
  Check,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAdminContextStore } from '@/stores/admin-context-store';
import { superadminApi } from '@/lib/api/superadmin';

export function ContextSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    type,
    organizationId,
    organizationName,
    domainId,
    domainName,
    setGlobalContext,
    setOrganizationContext,
    setDomainContext,
    setContextFromPath,
  } = useAdminContextStore();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [orgs, setOrgs] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync context with current route
  useEffect(() => {
    setContextFromPath(pathname);
  }, [pathname, setContextFromPath]);

  // Load organizations and domains for the selector
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [orgsData, domainsData] = await Promise.all([
          superadminApi.getOrganizations(),
          superadminApi.getCatalogDomains(),
        ]);
        setOrgs(Array.isArray(orgsData) ? orgsData : []);
        setDomains(Array.isArray(domainsData) ? domainsData : []);
      } catch (err) {
        console.error('Failed to load context options:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectGlobal = () => {
    setGlobalContext();
    setIsOpen(false);
    router.push('/superadmin/dashboard');
  };

  const handleSelectOrg = (org: any) => {
    setOrganizationContext({ id: org.id, name: org.name, slug: org.slug });
    setIsOpen(false);
    router.push(`/superadmin/organizations/${org.id}`);
  };

  const handleSelectDomain = (org: any, dom: any) => {
    setDomainContext(
      { id: org.id, name: org.name, slug: org.slug },
      { id: dom.id || dom.slug, name: dom.name || dom.slug, slug: dom.slug }
    );
    setIsOpen(false);
    router.push(`/superadmin/organizations/${org.id}/domains/${dom.slug || dom.id}`);
  };

  const filteredOrgs = orgs.filter((o) =>
    (o.name || o.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-800 transition shadow-xs group"
      >
        {type === 'GLOBAL' ? (
          <>
            <div className="w-5 h-5 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-medium block leading-none">Current Context</span>
              <span className="font-bold text-slate-900 leading-tight">Global Platform</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-left max-w-[180px] truncate">
              <span className="text-[10px] text-slate-400 font-medium block leading-none">Context</span>
              <span className="font-bold text-indigo-950 truncate block leading-tight">
                {organizationName || organizationId}
                {domainName ? ` / ${domainName}` : ''}
              </span>
            </div>
          </>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search organizations & domains..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="py-2 max-h-72 overflow-y-auto space-y-1 custom-scrollbar">
            {/* Global Context Option */}
            <button
              onClick={handleSelectGlobal}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition ${
                type === 'GLOBAL' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-bold">Global Platform</p>
                  <p className="text-[10px] text-slate-400 font-normal">All organizations & system telemetry</p>
                </div>
              </div>
              {type === 'GLOBAL' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            {/* Organizations Header */}
            <div className="pt-2 px-3 pb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Organizations & Domains
              </span>
            </div>

            {filteredOrgs.length === 0 ? (
              <p className="text-xs text-slate-400 px-3 py-2 italic">No organizations found</p>
            ) : (
              filteredOrgs.map((org) => {
                const isOrgActive = organizationId === org.id;
                return (
                  <div key={org.id} className="space-y-0.5">
                    <button
                      onClick={() => handleSelectOrg(org)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left transition ${
                        isOrgActive && !domainId
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-800 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{org.name}</span>
                      </div>
                      {isOrgActive && !domainId && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>

                    {/* Nested Domains under this Org */}
                    <div className="pl-6 pr-1 space-y-0.5">
                      {domains.slice(0, 4).map((dom) => {
                        const isDomainActive = isOrgActive && domainId === (dom.slug || dom.id);
                        return (
                          <button
                            key={dom.id || dom.slug}
                            onClick={() => handleSelectDomain(org, dom)}
                            className={`w-full flex items-center justify-between px-2.5 py-1 rounded-md text-[11px] text-left transition ${
                              isDomainActive
                                ? 'bg-blue-50 text-blue-700 font-bold'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{dom.name || dom.slug}</span>
                            </div>
                            {isDomainActive && <Check className="w-3 h-3 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
