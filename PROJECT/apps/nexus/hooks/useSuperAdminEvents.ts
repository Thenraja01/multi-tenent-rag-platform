"use client";

import { useEffect, useRef } from "react";

export interface SuperAdminEvent {
  type: string;
  data?: any;
  message?: string;
  timestamp?: number;
}

export function useSuperAdminEvents(onEvent?: (event: SuperAdminEvent) => void) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const sseUrl = `${apiUrl}/api/superadmin/events`;

    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        try {
          const parsed: SuperAdminEvent = JSON.parse(e.data);
          if (onEvent) {
            onEvent(parsed);
          }
        } catch {
          // Ignore unparseable frames
        }
      };

      es.onerror = () => {
        // SSE reconnects automatically
      };
    } catch {
      // Graceful fallback if SSE is unavailable
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [onEvent]);
}
