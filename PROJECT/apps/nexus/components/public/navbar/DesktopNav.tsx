"use client";

import React from "react";
import Link from "next/link";
import { NavItem } from "@/config/navigation";
import { NavDropdown } from "./NavDropdown";
import { cn } from "@/lib/utils/cn";

export interface DesktopNavProps {
  items: NavItem[];
  pathname: string;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ items, pathname }) => {
  return (
    <nav className="hidden lg:flex items-center gap-1">
      {items.map((item) => {
        if (item.children && item.children.length > 0) {
          return <NavDropdown key={item.title} item={item} pathname={pathname} />;
        }

        const isActive = pathname === item.href;
        return (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors",
              isActive
                ? "text-blue-400 bg-blue-950/40"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
};
