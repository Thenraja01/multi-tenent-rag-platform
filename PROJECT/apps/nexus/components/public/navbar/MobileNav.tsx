"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { NavItem } from "@/config/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export interface MobileNavProps {
  items: NavItem[];
  pathname: string;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ items, pathname, onClose }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="space-y-1">
        {items.map((item) => {
          if (item.children && item.children.length > 0) {
            const isExpanded = expanded === item.title;
            return (
              <div key={item.title} className="border-b border-slate-900 pb-1">
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.title)}
                  className="w-full flex items-center justify-between py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <span>{item.title}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                </button>
                {isExpanded && (
                  <div className="pl-3 space-y-1 pb-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className="block py-1.5 text-xs text-slate-400 hover:text-blue-400"
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={onClose}
              className="block py-2.5 text-xs font-semibold text-slate-300 hover:text-white border-b border-slate-900"
            >
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="pt-4 space-y-2">
        <Button href="/login" variant="outline" size="sm" className="w-full" onClick={onClose}>
          Sign In
        </Button>
        <Button
          href="/register"
          variant="primary"
          size="sm"
          className="w-full"
          onClick={onClose}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Start Organization
        </Button>
      </div>
    </div>
  );
};
