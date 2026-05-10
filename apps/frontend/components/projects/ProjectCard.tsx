'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' }> = {
  draft: { label: '草稿', variant: 'default' },
  writing: { label: '连载中', variant: 'warning' },
  completed: { label: '已完成', variant: 'success' },
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const status = statusMap[project.status] || statusMap.draft;
  const updatedAt = new Date(project.updated_at).toLocaleDateString('zh-CN');

  return (
    <Card className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-[var(--text-primary)] text-lg truncate flex-1 mr-3">
          {project.name}
        </h3>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {project.genre && (
        <Badge variant="accent" className="mb-3">{project.genre}</Badge>
      )}

      {project.summary && (
        <p className="text-sm text-[var(--text-tertiary)] mb-4 line-clamp-2 leading-relaxed">
          {project.summary}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{project.word_count?.toLocaleString() || 0} 字</span>
        <span>{updatedAt}</span>
      </div>
    </Card>
  );
}
