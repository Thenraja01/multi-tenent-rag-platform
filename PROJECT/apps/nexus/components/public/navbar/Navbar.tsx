"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { publicNavItems } from "@/config/navigation";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
            :⚡
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
            Nexus<span className="text-blue-600 dark:text-blue-400">RAG</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav items={publicNavItems} pathname={pathname} />

        {/* Right CTA / Auth Links */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <Button href="/login" variant="ghost" size="sm">
            Sign In
          </Button>
          <Button href="/register" variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
            Start Organization
          </Button>
        </div>

        {/* Mobile Hamburger Toggle & Theme */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <MobileNav
          items={publicNavItems}
          pathname={pathname}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </header>
  );
};
