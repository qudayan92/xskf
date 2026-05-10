'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useEditorStore } from '@/store/editor';
import { getChapters, createChapter, deleteChapter, aiContinue, aiPolish, aiExpand } from '@/lib/api';
import { ChapterList } from '@/components/editor/ChapterList';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { AIPanel } from '@/components/editor/AIPanel';

export default function EditorPage() {
  const params = useParams();
  const projectId = Number(params.id);

  const {
    chapters, activeChapterId, focusMode,
    aiLoading, aiResult,
    setChapters, addChapter, removeChapter,
    setAiLoading, setAiResult,
    updateContent,
    getActiveChapter,
  } = useEditorStore();

  // Load chapters on mount
  useEffect(() => {
    loadChapters();
  }, [projectId]);

  const loadChapters = async () => {
    try {
      const res = await getChapters(projectId);
      const data = res.data.data || [];
      setChapters(data);
    } catch (err) {
      console.error('Failed to load chapters:', err);
    }
  };

  const handleAddChapter = async () => {
    const chapterNo = chapters.length + 1;
    try {
      const res = await createChapter(projectId, {
        title: `第${chapterNo}章：新章节`,
        content: '',
      });
      addChapter(res.data.data);
    } catch (err) {
      console.error('Failed to create chapter:', err);
    }
  };

  const handleDeleteChapter = async (id: number) => {
    if (!confirm('确定要删除这个章节吗？')) return;
    try {
      await deleteChapter(id);
      removeChapter(id);
    } catch (err) {
      console.error('Failed to delete chapter:', err);
    }
  };

  // AI Actions
  const runAiAction = async (action: string, fn: typeof aiContinue) => {
    const chapter = getActiveChapter();
    const text = chapter?.content || '';
    setAiLoading(action);
    setAiResult(null);
    try {
      const res = await fn({ text });
      setAiResult(res.data.data.content);
    } catch (err) {
      console.error('AI action failed:', err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleAppend = () => {
    if (!aiResult) return;
    const chapter = getActiveChapter();
    const newContent = (chapter?.content || '') + '\n\n' + aiResult;
    updateContent(newContent);
    setAiResult(null);
  };

  const handleReplace = () => {
    if (!aiResult) return;
    updateContent(aiResult);
    setAiResult(null);
  };

  return (
    <div className={focusMode ? 'focus-mode' : 'three-column-layout'}>
      {!focusMode && (
        <>
          <ChapterList
            chapters={chapters}
            activeChapterId={activeChapterId}
            onSelect={(id) => useEditorStore.getState().setActiveChapter(id)}
            onAdd={handleAddChapter}
            onDelete={handleDeleteChapter}
          />
          <EditorPanel />
          <AIPanel
            aiLoading={aiLoading}
            aiResult={aiResult}
            hasContent={!!getActiveChapter()?.content}
            onContinue={() => runAiAction('continue', aiContinue)}
            onPolish={() => runAiAction('polish', aiPolish)}
            onExpand={() => runAiAction('expand', aiExpand)}
            onAppend={handleAppend}
            onReplace={handleReplace}
            onClear={() => setAiResult(null)}
          />
        </>
      )}

      {focusMode && (
        <EditorPanel />
      )}
    </div>
  );
}
