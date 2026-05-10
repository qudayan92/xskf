'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { WorldItem } from '@/types';

interface WorldElementCardProps {
  item: WorldItem;
  onClick: () => void;
}

const typeIcons: Record<string, string> = {
  location: '🌍',
  faction: '🚀',
  technology: '💫',
  history: '📜',
  race: '👽',
};

const typeLabels: Record<string, string> = {
  location: '地点',
  faction: '势力',
  technology: '科技',
  history: '历史',
  race: '种族',
};

export function WorldElementCard({ item, onClick }: WorldElementCardProps) {
  const icon = item.icon || typeIcons[item.type] || '📦';
  const label = typeLabels[item.type] || item.type;

  return (
    <Card className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-[var(--text-primary)]">{item.name}</h3>
            <Badge>{label}</Badge>
          </div>
          {item.description && (
            <p className="text-sm text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
