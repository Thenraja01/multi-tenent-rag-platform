import React from "react";
import { Badge } from "@/components/ui/Badge";

export interface TenantStatusBadgeProps {
  status: string;
}

export const TenantStatusBadge: React.FC<TenantStatusBadgeProps> = ({ status }) => {
  const norm = (status || "").toLowerCase();
  if (norm === "approved" || norm === "active") {
    return <Badge variant="emerald">ACTIVE</Badge>;
  }
  if (norm === "suspended") {
    return <Badge variant="amber">SUSPENDED</Badge>;
  }
  if (norm === "rejected") {
    return <Badge variant="outline">REJECTED</Badge>;
  }
  return <Badge variant="blue">PENDING</Badge>;
};
