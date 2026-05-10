import { create } from 'zustand';
import type { Chapter } from '@/types';

interface EditorState {
  chapters: Chapter[];
  activeChapterId: number | null;
  isDirty: boolean;
  isSaving: boolean;
  focusMode: boolean;
  aiLoading: string | null;
  aiResult: string | null;

  setChapters: (chapters: Chapter[]) => void;
  setActiveChapter: (id: number) => void;
  updateContent: (content: string) => void;
  addChapter: (chapter: Chapter) => void;
  removeChapter: (id: number) => void;
  updateChapterTitle: (id: number, title: string) => void;
  setFocusMode: (mode: boolean) => void;
  setAiLoading: (action: string | null) => void;
  setAiResult: (result: string | null) => void;
  getActiveChapter: () => Chapter | undefined;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  chapters: [],
  activeChapterId: null,
  isDirty: false,
  isSaving: false,
  focusMode: false,
  aiLoading: null,
  aiResult: null,

  setChapters: (chapters) => {
    set({ chapters });
    // Auto-select first chapter if none active
    const { activeChapterId } = get();
    if (!activeChapterId && chapters.length > 0) {
      set({ activeChapterId: chapters[0].id });
    }
  },

  setActiveChapter: (id) => set({ activeChapterId: id }),

  updateContent: (content) => {
    const { activeChapterId, chapters } = get();
    if (!activeChapterId) return;
    set({
      chapters: chapters.map((ch) =>
        ch.id === activeChapterId ? { ...ch, content, word_count: content.length } : ch
      ),
      isDirty: true,
    });
  },

  addChapter: (chapter) => {
    set((state) => ({
      chapters: [...state.chapters, chapter],
      activeChapterId: chapter.id,
    }));
  },

  removeChapter: (id) => {
    set((state) => {
      const newChapters = state.chapters.filter((ch) => ch.id !== id);
      const newActiveId =
        state.activeChapterId === id
          ? newChapters[0]?.id || null
          : state.activeChapterId;
      return { chapters: newChapters, activeChapterId: newActiveId };
    });
  },

  updateChapterTitle: (id, title) => {
    set((state) => ({
      chapters: state.chapters.map((ch) =>
        ch.id === id ? { ...ch, title } : ch
      ),
    }));
  },

  setFocusMode: (mode) => set({ focusMode: mode }),

  setAiLoading: (action) => set({ aiLoading: action }),

  setAiResult: (result) => set({ aiResult: result }),

  getActiveChapter: () => {
    const { chapters, activeChapterId } = get();
    return chapters.find((ch) => ch.id === activeChapterId);
  },
}));
