'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/editor';
import { updateChapter } from '@/lib/api';
import { EditorToolbar } from './EditorToolbar';
import { WordCount } from './WordCount';

export function EditorPanel() {
  const {
    chapters, activeChapterId, focusMode, isDirty,
    updateContent, setActiveChapter, setFocusMode
  } = useEditorStore();

  const activeChapter = chapters.find((ch) => ch.id === activeChapterId);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save: debounce 1.5s then save to API
  useEffect(() => {
    if (!isDirty || !activeChapterId) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const chapter = useEditorStore.getState().chapters.find((ch) => ch.id === activeChapterId);
      if (!chapter) return;
      try {
        await updateChapter(activeChapterId, { content: chapter.content, title: chapter.title });
        useEditorStore.setState({ isDirty: false, isSaving: false });
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isDirty, activeChapterId]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl+S: manual save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (activeChapterId) {
        const chapter = useEditorStore.getState().chapters.find((ch) => ch.id === activeChapterId);
        if (chapter) {
          updateChapter(activeChapterId, { content: chapter.content, title: chapter.title })
            .then(() => useEditorStore.setState({ isDirty: false, isSaving: false }))
            .catch(console.error);
        }
      }
    }
  }, [activeChapterId]);

  const totalWords = chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0);

  if (!activeChapter) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">
        <p>选择一个章节开始写作，或创建新章节</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <EditorToolbar focusMode={focusMode} onToggleFocus={() => setFocusMode(!focusMode)} />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Chapter title */}
        <input
          className="w-full bg-transparent text-2xl font-semibold text-[var(--text-primary)] mb-6 outline-none placeholder:text-[var(--text-muted)]"
          value={activeChapter.title}
          onChange={(e) => {
            useEditorStore.getState().updateChapterTitle(activeChapter.id, e.target.value);
            useEditorStore.setState({ isDirty: true });
          }}
          placeholder="章节标题..."
        />

        {/* Editor textarea */}
        <textarea
          className="editor-textarea w-full min-h-[400px] bg-transparent text-[var(--text-primary)] resize-none outline-none placeholder:text-[var(--text-muted)]"
          value={activeChapter.content}
          onChange={(e) => updateContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="开始你的创作..."
        />
      </div>

      <WordCount
        content={activeChapter.content}
        chapterCount={chapters.length}
        totalWords={totalWords}
      />

      {/* Save indicator */}
      <div className={isDirty ? 'text-[var(--warning)]' : 'text-[var(--success)]'} style={{
        position: 'fixed', bottom: 8, right: 16, fontSize: 12,
        transition: 'color 0.3s',
      }}>
        {isDirty ? '未保存' : '已保存'}
      </div>

    </div>
  );
}
