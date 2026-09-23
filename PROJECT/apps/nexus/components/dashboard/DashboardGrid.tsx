'use client';

import React from 'react';
import { DASHBOARD_REGISTRY } from '@/config/dashboard-registry';

interface DashboardGridProps {
  cards: Array<{
    id: string;
    title: string;
    module: string;
    required_permission: string;
    size: 'small' | 'medium' | 'large';
    position: number;
    data_scope: string;
  }>;
}

export function DashboardGrid({ cards }: DashboardGridProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {cards.map((card) => {
        const cardDef = DASHBOARD_REGISTRY[card.id];
        if (!cardDef) return null;

        const CardComponent = cardDef.component;
        const isLarge = card.size === 'large';

        return (
          <div
            key={card.id}
            className={isLarge ? 'lg:col-span-2' : 'lg:col-span-1'}
          >
            <CardComponent dataScope={card.data_scope} />
          </div>
        );
      })}
    </div>
  );
}
