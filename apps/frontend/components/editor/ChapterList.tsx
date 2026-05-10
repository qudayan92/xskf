'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Chapter } from '@/types';

interface ChapterListProps {
  chapters: Chapter[];
  activeChapterId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
}

export function ChapterList({ chapters, activeChapterId, onSelect, onAdd, onDelete }: ChapterListProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="sidebar-title">章节列表</div>
        <button className="icon-btn" onClick={onAdd} title="新建章节">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {chapters.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-8">
            暂无章节，点击 + 创建
          </p>
        ) : (
          chapters.map((chapter) => (
            <div
              key={chapter.id}
              className={cn('chapter-item', chapter.id === activeChapterId && 'active')}
              onClick={() => onSelect(chapter.id)}
            >
              <GripVertical size={14} className="text-[var(--text-muted)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm truncate">{chapter.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--text-muted)]">{chapter.word_count} 字</span>
                </div>
              </div>
              <button
                className="chapter-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chapter.id);
                }}
                title="删除章节"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
