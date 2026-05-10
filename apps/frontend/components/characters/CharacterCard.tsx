'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Character } from '@/types';

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

const roleColors: Record<string, 'accent' | 'success' | 'warning' | 'error' | 'default'> = {
  '主角': 'accent',
  '配角': 'default',
  '反派': 'error',
  '导师': 'success',
  '路人': 'default',
};

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  const badgeVariant = roleColors[character.role] || 'default';
  const initial = character.name.charAt(0);

  return (
    <Card className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className="avatar flex-shrink-0">{initial}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-[var(--text-primary)]">{character.name}</h3>
            <Badge variant={badgeVariant}>{character.role}</Badge>
            {character.gender && <span className="text-xs text-[var(--text-muted)]">{character.gender}</span>}
          </div>
          {character.personality && (
            <p className="text-sm text-[var(--text-tertiary)] line-clamp-2 mb-2">{character.personality}</p>
          )}
          {character.tags && (
            <div className="flex flex-wrap gap-1">
              {character.tags.split(',').filter(Boolean).map((tag) => (
                <span key={tag} className="tag text-xs">{tag.trim()}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #fff;
          font-size: 16px;
        }
        .tag {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 20px;
          background: var(--bg-elevated);
          color: var(--text-secondary);
        }
      `}</style>
    </Card>
  );
}
