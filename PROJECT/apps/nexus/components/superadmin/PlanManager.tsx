"use client";

import React, { useState } from "react";
import { CreditCard, Plus, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";

export interface PlanItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  maxUsers: number;
  maxDomains: number;
  maxStorage: number;
  features: string[];
  isActive: boolean;
}

export interface PlanManagerProps {
  plans: PlanItem[];
  onCreatePlan: (plan: any) => Promise<void>;
}

export const PlanManager: React.FC<PlanManagerProps> = ({ plans, onCreatePlan }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState(499);
  const [maxUsers, setMaxUsers] = useState(50);
  const [maxDomains, setMaxDomains] = useState(2);
  const [maxStorage, setMaxStorage] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreatePlan({
        name,
        slug,
        price: Number(price),
        max_users: Number(maxUsers),
        max_domains: Number(maxDomains),
        max_storage: Number(maxStorage),
        features: ["Standard OCR", "Domain RBAC", "pgvector Isolation"],
      });
      setModalOpen(false);
      setName("");
      setSlug("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Database-Driven Pricing Plans</h2>
          <p className="text-xs text-slate-400">Configure resource limits and pricing tiers for tenant provisioning.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
          New Plan Tier
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {plans.map((p) => (
          <Card key={p.id} className="p-5 border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-mono text-emerald-400 font-bold">Active</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{p.name}</h3>
              <div className="text-xl font-extrabold text-blue-400 mb-3">${p.price}<span className="text-xs text-slate-400 font-normal">/mo</span></div>
              <div className="text-xs font-mono text-slate-300 space-y-1.5 border-t border-slate-800/80 pt-3">
                <div>• Max Users: <span className="text-emerald-400 font-bold">{p.maxUsers}</span></div>
                <div>• Max Domains: <span className="text-blue-400 font-bold">{p.maxDomains}</span></div>
                <div>• Vector Storage: <span className="text-white font-bold">{p.maxStorage} GB</span></div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Pricing Plan"
        description="Add a new subscription tier with custom limits."
      >
        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Plan Name *
            </label>
            <Input
              required
              placeholder="e.g. Growth Scale"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Monthly Price (USD) *
            </label>
            <Input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Max Users
              </label>
              <Input
                type="number"
                value={maxUsers}
                onChange={(e) => setMaxUsers(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Max Domains
              </label>
              <Input
                type="number"
                value={maxDomains}
                onChange={(e) => setMaxDomains(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Storage (GB)
              </label>
              <Input
                type="number"
                value={maxStorage}
                onChange={(e) => setMaxStorage(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Save Plan"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
