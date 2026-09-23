"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, initTheme } = useUiStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initTheme();
    setMounted(true);
  }, [initTheme]);

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-400",
          className
        )}
      >
        <div className="w-4 h-4" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      className={cn(
        "group relative flex items-center gap-2 p-2 rounded-xl transition-all duration-200",
        "border border-slate-200 dark:border-slate-800",
        "bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800",
        "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
        "shadow-xs hover:shadow-md",
        className
      )}
    >
      <div className="relative w-4 h-4">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
