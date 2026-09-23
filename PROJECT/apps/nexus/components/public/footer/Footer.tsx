import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                ◈
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                Nexus<span className="text-blue-600 dark:text-blue-400">RAG</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Multi-tenant, domain-based enterprise RAG platform with logical isolation, granular RBAC, and partitioned vector intelligence.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SOC2 Type II & ISO 27001 Ready</span>
            </div>
          </div>

          {/* Architecture */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              <li><Link href="/platform" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Overview</Link></li>
              <li><Link href="/architecture" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Architecture</Link></li>
              <li><Link href="/rag" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Hybrid RAG</Link></li>
              <li><Link href="/multi-tenancy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Multi-Tenancy</Link></li>
              <li><Link href="/rbac" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Domain RBAC</Link></li>
              <li><Link href="/security" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Domains
            </h4>
            <ul className="space-y-2">
              <li><Link href="/solutions/hr" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Human Resources</Link></li>
              <li><Link href="/solutions/finance" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Finance & Audit</Link></li>
              <li><Link href="/solutions/it" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">IT & DevOps</Link></li>
              <li><Link href="/solutions/legal" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Legal Knowledge</Link></li>
              <li><Link href="/solutions/operations" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Operations</Link></li>
              <li><Link href="/solutions/custom" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Custom Domains</Link></li>
            </ul>
          </div>

          {/* Resources & Portal */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Workspaces
            </h4>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing & Plans</Link></li>
              <li><Link href="/how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</Link></li>
              <li><Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Sales</Link></li>
              <li><Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Tenant Login</Link></li>
              <li><Link href="/superadmin/organization-requests" className="text-indigo-600 dark:text-indigo-400 hover:underline">SuperAdmin</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} NexusRAG Systems Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/security" className="hover:text-slate-700 dark:hover:text-slate-400">Security Policy</Link>
            <Link href="/faq" className="hover:text-slate-700 dark:hover:text-slate-400">FAQ</Link>
            <Link href="/contact" className="hover:text-slate-700 dark:hover:text-slate-400">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
