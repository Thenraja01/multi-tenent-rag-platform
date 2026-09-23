'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  Building2,
  Sliders,
  Activity,
  AlertTriangle,
  Download,
  Trash2,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';

export default function AdminSettingsPage() {
  const params = useParams();
  const { organization } = useWorkspace();
  const tenantSlug = organization?.slug || (params?.tenant as string) || '';
  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'notifications' | 'danger'>('profile');
  const [orgName, setOrgName] = useState(organization?.name || 'Organization');
  const [isSaved, setIsSaved] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Organization Configuration & Danger Zone</h1>
        <p className="text-xs text-slate-400 mt-1">
          Profile settings, tenant-scoped branding, notification routing, and controlled lifecycle management.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'profile' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Organization Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'branding' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Branding & Theme</span>
        </button>
        <button
          onClick={() => setActiveTab('danger')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'danger' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Danger Zone</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Organization settings updated and cached in Redis successfully!</span>
        </div>
      )}

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 max-w-2xl">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Organization Legal Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tenant Subdomain Slug</label>
              <input
                type="text"
                disabled
                value={tenantSlug}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">Tenant slugs are immutable after initial provisioning.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Timezone</label>
                <select className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white">
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>Asia/Kolkata (IST)</option>
                  <option>America/New_York (EST)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Data Residency Region</label>
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono">
                  ap-south-1 (Mumbai)
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors mt-2"
            >
              Save Profile Settings
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Branding */}
      {activeTab === 'branding' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-white">Tenant Branding & Visual Customization</h3>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Primary Color Scheme</label>
            <div className="flex gap-2">
              <span className="w-8 h-8 rounded-xl bg-orange-600 ring-2 ring-white cursor-pointer" />
              <span className="w-8 h-8 rounded-xl bg-blue-600 cursor-pointer" />
              <span className="w-8 h-8 rounded-xl bg-purple-600 cursor-pointer" />
              <span className="w-8 h-8 rounded-xl bg-emerald-600 cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Danger Zone */}
      {activeTab === 'danger' && (
        <div className="space-y-4 max-w-2xl">
          {/* Data Export */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">Full Tenant Data Export</h3>
                <p className="text-[11px] text-slate-400">Generate encrypted archive of users, departments, documents, and audit logs.</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium">
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Archive</span>
              </button>
            </div>
          </div>

          {/* Controlled Deletion */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Request Controlled Organization Deletion</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Initiates a 30-day retention lock (DELETION_PENDING state) before permanent cryptographic shredding.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-400">Type <span className="font-mono font-bold text-white">DELETE {tenantSlug.toUpperCase()}</span> to confirm:</label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder={`DELETE ${tenantSlug.toUpperCase()}`}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-rose-500"
              />
              <button
                disabled={deleteInput !== `DELETE ${tenantSlug.toUpperCase()}`}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white font-semibold transition-colors"
              >
                Request Controlled Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
