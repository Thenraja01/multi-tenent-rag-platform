"use client";

import React, { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initTheme = useUiStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <>{children}</>;
}
