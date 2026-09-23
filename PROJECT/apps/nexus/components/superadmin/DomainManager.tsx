"use client";

import React, { useState } from "react";
import { Layers, Plus, Edit2, Check, X, Shield, Power } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";

export interface DomainItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  status: string;
  isActive: boolean;
}

export interface DomainManagerProps {
  domains: DomainItem[];
  loading?: boolean;
  onCreateDomain: (data: { name: string; slug: string; description: string; icon: string }) => Promise<void>;
  onToggleStatus: (id: string, currentStatus: string) => Promise<void>;
}

export const DomainManager: React.FC<DomainManagerProps> = ({
  domains,
  loading = false,
  onCreateDomain,
  onToggleStatus,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Layers");
  const [actionLoading, setActionLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await onCreateDomain({ name, slug, description, icon });
      setModalOpen(false);
      setName("");
      setSlug("");
      setDescription("");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Platform Domain Catalog</h2>
          <p className="text-xs text-slate-400">Manage business domains available for tenant provisioning.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
          New Domain
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {domains.map((dom) => (
          <Card key={dom.id} className="p-5 border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-900 uppercase">
                  {dom.slug}
                </span>
                <Badge variant={dom.status === "ACTIVE" ? "emerald" : "outline"}>{dom.status}</Badge>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{dom.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{dom.description}</p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">Reusable across tenants</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleStatus(dom.id, dom.status)}
              >
                {dom.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Platform Business Domain"
        description="Add a new business domain template available across all multi-tenant organizations."
      >
        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Domain Name *
            </label>
            <Input
              required
              placeholder="e.g. Procurement & Supply"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Slug Identifier *
            </label>
            <Input
              required
              placeholder="e.g. procurement"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <Input
              placeholder="e.g. Vendor contracts, purchase orders, and supplier RFPs."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={actionLoading}>
              {actionLoading ? "Creating..." : "Save Domain"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
