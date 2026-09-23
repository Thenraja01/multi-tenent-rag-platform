import React from "react";
import {
  Building2,
  Users,
  Clock,
  Database,
  Layers,
  FileText,
  Activity,
  HardDrive,
  Cpu,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface DashboardStatsProps {
  stats: {
    totalOrganizations: number;
    activeTenants: number;
    pendingRequests: number;
    totalUsers: number;
    activeUsers: number;
    totalDomains: number;
    totalDocuments: number;
    aiUsage: string;
    storageUsage: string;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const cards = [
    {
      title: "Total Organizations",
      value: stats.totalOrganizations,
      desc: `${stats.activeTenants} active tenants`,
      icon: Building2,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      desc: "Requires SuperAdmin review",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Active Users",
      value: stats.totalUsers,
      desc: `${stats.activeUsers} currently active`,
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Platform Domains",
      value: stats.totalDomains,
      desc: "Re-usable business domains",
      icon: Layers,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      title: "Indexed Documents",
      value: stats.totalDocuments,
      desc: "Partitioned vector chunks",
      icon: FileText,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Storage Utilization",
      value: stats.storageUsage,
      desc: "PostgreSQL + pgvector",
      icon: HardDrive,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className="p-4 border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 line-clamp-1">{c.title}</span>
              <div className={`w-7 h-7 rounded-lg ${c.bg} ${c.border} ${c.color} flex items-center justify-center border`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold text-white tracking-tight">{c.value}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block truncate">{c.desc}</span>
          </Card>
        );
      })}
    </div>
  );
};
