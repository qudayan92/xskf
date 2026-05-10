'use client';

import { Bold, Italic, Underline, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  focusMode: boolean;
  onToggleFocus: () => void;
}

export function EditorToolbar({ focusMode, onToggleFocus }: EditorToolbarProps) {
  return (
    <div className="toolbar">
      <button className="toolbar-btn" title="粗体 (Ctrl+B)">
        <Bold size={16} />
      </button>
      <button className="toolbar-btn" title="斜体 (Ctrl+I)">
        <Italic size={16} />
      </button>
      <button className="toolbar-btn" title="下划线 (Ctrl+U)">
        <Underline size={16} />
      </button>

      <div className="toolbar-divider" />

      <button
        className={cn('toolbar-btn', focusMode && 'active')}
        onClick={onToggleFocus}
        title="专注模式"
      >
        {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
    </div>
  );
}
