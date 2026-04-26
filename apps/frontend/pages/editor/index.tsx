'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import RightPanelComposite from '../../components/RightPanelComposite';
import SelectionToolbar from '../../components/editor/SelectionToolbar';
import BranchPanel from '../../components/editor/BranchPanel';
import LogicChecker from '../../components/editor/LogicChecker';
import OutlineGenerator from '../../components/OutlineGenerator';
import CharacterPanel from '../../components/editor/CharacterPanel';
import WordCountModal from '../../components/editor/WordCountModal';
import AIConfigModal, { getAIConfig, isMockMode } from '../../components/AIConfigModal';
import { useStore } from '../../store';

interface NovelInfo {
  id: number;
  book_id: string;
  title: string;
  subtitle: string | null;
}

interface Chapter {
  id: number;
  title: string;
  content: string;
  active: boolean;
}

const CHAPTERS_KEY = 'editor_chapters';

const defaultChapters: Chapter[] = [
  { id: 1, title: '第一章：星际迷途', content: '飞船穿越星际尘埃带，林远航注视着舷窗外无尽的星海。这是他离开地球的第三百七十二天，也是他成为星际探索员的第一个年头。\n\n突然，通讯器传来一阵刺耳的杂音，紧接着是一个陌生的声音——\n\n"探索员林远航，这里是未知文明信号，请注意接收..."', active: true },
  { id: 2, title: '第二章：未知信号', content: '', active: false },
  { id: 3, title: '第三章：紧急救援', content: '', active: false },
];

const outline = [
  { id: 1, title: '第一幕：启程', children: ['1.1 主角登场', '1.2 任务接受', '1.3 出发'] },
  { id: 2, title: '第二幕：遭遇', children: ['2.1 异常信号', '2.2 神秘文明', '2.3 抉择'] },
];

function loadChapters(novelId: string): Chapter[] {
  if (typeof window === 'undefined') return defaultChapters;
  try {
    const raw = localStorage.getItem(`${CHAPTERS_KEY}_${novelId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultChapters;
}

function saveChapters(novelId: string, chapters: Chapter[]) {
  try { localStorage.setItem(`${CHAPTERS_KEY}_${novelId}`, JSON.stringify(chapters)); } catch {}
}

const Editor: React.FC = () => {
  const router = useRouter();
  const { novelId } = router.query;
  const [novelInfo, setNovelInfo] = useState<NovelInfo | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>(defaultChapters);
  const [activeChapterId, setActiveChapterId] = useState(1);
  const [focusMode, setFocusMode] = useState(false);
  const [focusTransition, setFocusTransition] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(320);
  const [dragging, setDragging] = useState<null | 'left' | 'right'>(null);
  const [saved, setSaved] = useState(true);
  const [saveTime, setSaveTime] = useState<string>('');
  const [history, setHistory] = useState<string[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Selection toolbar state
  const [selectionVisible, setSelectionVisible] = useState(false);
  const [selectionPos, setSelectionPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [clientOnly, setClientOnly] = useState(false);

  // AI Config modal
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiConfig, setAIConfig] = useState(getAIConfig);

  // Branch & Logic panels
  const [showBranch, setShowBranch] = useState(false);
  const [showLogic, setShowLogic] = useState(false);
  const [logicIssues, setLogicIssues] = useState(0);

  // Outline Generator
  const [showOutline, setShowOutline] = useState(false);
  const [savedOutline, setSavedOutline] = useState<any>(null);

  // World data for AI context
  const [worldElements, setWorldElements] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);

  // Chapter expand/collapse
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  const fetchWorldData = async (pid: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/worlds?project_id=${pid}`);
      const data = await res.json();
      if (data.success) {
        setWorldElements(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch world data:', err);
    }
  };

  const fetchCharacterData = async (pid: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/characters?project_id=${pid}`);
      const data = await res.json();
      if (data.success) {
        setCharacters(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch character data:', err);
    }
  };

  const getWorldContext = () => {
    if (worldElements.length === 0) return '';
    return `\n\n【世界观设定】\n${worldElements.map(w => `${w.icon} ${w.name}: ${w.description}`).join('\n')}`;
  };

  const getCharacterContext = () => {
    if (characters.length === 0) return '';
    const charList = characters.map(c => {
      const traits = c.traits || [];
      return `【${c.name}】${c.role || '角色'}: ${c.description || ''}\n性格: ${traits.join(', ')}`;
    }).join('\n');
    return `\n\n【角色设定】\n${charList}`;
  };

  const getContext = () => getWorldContext() + getCharacterContext();

  const handleDeleteChapter = (id: number, title: string) => {
    if (confirm(`确定要删除「${title}」吗？此操作不可恢复。`)) {
      if (chapters.length === 1) {
        alert('至少需要保留一个章节');
        return;
      }
      setChapters(prev => prev.filter(c => c.id !== id));
      if (activeChapterId === id) {
        setActiveChapterId(chapters.find(c => c.id !== id)?.id || 1);
      }
    }
  };

  // Character Panel
  const [showCharacters, setShowCharacters] = useState(false);

  // Word Count Modal
  const [showWordCount, setShowWordCount] = useState(false);

  // AI Assistant result
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiResultAction, setAiResultAction] = useState<string | null>(null);

  const startX = useRef<number>(0);
  const startLeft = useRef<number>(260);
  const startRight = useRef<number>(320);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchAgents = useStore(s => s.fetchAgents);
  const fetchComments = useStore(s => s.fetchComments);

  useEffect(() => {
    if (focusMode) {
      const t = setTimeout(() => setFocusTransition(true), 50);
      return () => clearTimeout(t);
    } else {
      setFocusTransition(false);
    }
  }, [focusMode]);

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];
  const wordCount = activeChapter.content.replace(/\s/g, '').length;
  const charCount = activeChapter.content.length;
  const lineCount = activeChapter.content.split('\n').length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

// Fetch novel info and chapters when novelId changes
  useEffect(() => {
    if (novelId && typeof novelId === 'string') {
      fetchNovelInfo(novelId);
      fetchNovelChapters(novelId);
      fetchWorldData(novelId);
      fetchCharacterData(novelId);
    } else {
      // No novelId, just set clientOnly to true and load defaults
      setClientOnly(true);
      fetchAgents();
      fetchComments();
      const saved = loadChapters('default');
      setChapters(saved);
      setActiveChapterId(saved.find(c => c.active)?.id || saved[0].id);
    }
  }, [novelId]);

  const fetchNovelInfo = async (bid: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/novels/${bid}`);
      const data = await res.json();
      if (data.success && data.data) {
        setNovelInfo({
          id: data.data.id,
          book_id: data.data.book_id,
          title: data.data.title,
          subtitle: data.data.subtitle
        });
      }
    } catch (err) {
      console.error('Failed to fetch novel info:', err);
    }
  };

  const fetchNovelChapters = async (bid: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/books/${bid}/chapters`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const loadedChapters: Chapter[] = data.data.map((ch: any, idx: number) => ({
          id: ch.id || idx + 1,
          title: ch.chapter_title || ch.title || `第${idx + 1}章`,
          content: ch.content || '',
          active: idx === 0
        }));
        setChapters(loadedChapters);
        setActiveChapterId(loadedChapters[0]?.id || 1);
      } else {
        const saved = loadChapters(bid);
        setChapters(saved);
        setActiveChapterId(saved.find(c => c.active)?.id || saved[0].id);
      }
      setClientOnly(true);
    } catch (err) {
      console.error('Failed to fetch chapters:', err);
      const saved = loadChapters(bid);
      setChapters(saved);
      setActiveChapterId(saved.find(c => c.active)?.id || saved[0].id);
    }
  };

  useEffect(() => {
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (novelId && typeof novelId === 'string') {
        saveToStorage(novelId);
      }
      setSaved(true);
      setSaveTime(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
    }, 1500);
    setSaved(false);
  }, [activeChapter.content, novelId]);

  const saveToStorage = useCallback((bid: string) => {
    saveChapters(bid, chapters);
  }, [chapters]);

  const saveChaptersToServer = async (bid: string) => {
    // Save chapters to server
    try {
      for (const ch of chapters) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/chapters/${ch.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book_id: bid,
            chapter_title: ch.title,
            content: ch.content,
            word_count: ch.content.replace(/\s/g, '').length
          })
        });
      }
    } catch (err) {
      console.error('Failed to save chapters to server:', err);
    }
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX.current;
      if (dragging === 'left') {
        setLeftWidth(Math.max(180, Math.min(600, startLeft.current + dx)));
      } else {
        setRightWidth(Math.max(260, Math.min(900, startRight.current - dx)));
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  const updateContent = useCallback((newContent: string) => {
    setChapters(prev => prev.map(c =>
      c.id === activeChapterId ? { ...c, content: newContent } : c
    ));
  }, [activeChapterId]);

  const switchChapter = useCallback((id: number) => {
    setChapters(prev => prev.map(c => ({ ...c, active: c.id === id })));
    setActiveChapterId(id);
    if (novelId && typeof novelId === 'string') {
      saveToStorage(novelId);
    }
  }, [saveToStorage, novelId]);

  const handleSave = useCallback(() => {
    if (novelId && typeof novelId === 'string') {
      saveToStorage(novelId);
      saveChaptersToServer(novelId);
    }
    setSaved(true);
    setSaveTime(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
  }, [saveToStorage, novelId]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const contents = history[newIndex];
      setChapters(prev => prev.map((c, i) => ({ ...c, content: contents[i] || '' })));
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const contents = history[newIndex];
      setChapters(prev => prev.map((c, i) => ({ ...c, content: contents[i] || '' })));
    }
  }, [history, historyIndex]);

  const insertFormat = useCallback((before: string, after: string = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = activeChapter.content.substring(start, end);
    const newContent = activeChapter.content.slice(0, start) + before + selected + after + activeChapter.content.slice(end);
    updateContent(newContent);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }, [activeChapter.content, updateContent]);

  // ===== Selection Toolbar =====
  const handleTextSelect = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const sel = window.getSelection();
    const text = sel?.toString() || ta.value.substring(ta.selectionStart, ta.selectionEnd);
    if (!text || text.trim().length < 2) {
      setSelectionVisible(false);
      return;
    }
    setSelectedText(text);
    const rect = ta.getBoundingClientRect();
    const start = ta.selectionStart;
    const linesBefore = ta.value.substring(0, start).split('\n').length;
    const lineHeight = 32; // approx line-height * font-size
    setSelectionPos({
      x: rect.left + rect.width / 2 - 150,
      y: rect.top + linesBefore * lineHeight - ta.scrollTop,
    });
    setSelectionVisible(true);
  }, []);

  const handleSelectionAction = useCallback((result: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) return;
    const newContent = activeChapter.content.slice(0, start) + result + activeChapter.content.slice(end);
    updateContent(newContent);
    setSelectionVisible(false);
  }, [activeChapter.content, updateContent]);

  const handleAIAction = useCallback(async (action: string) => {
    const text = activeChapter.content;
    if (!text || text.trim().length === 0) {
      alert('请先输入内容');
      return;
    }
    setAiLoading(action);
    setAiResult(null);
    setAiResultAction(action);
    const aiContext = getContext();
    try {
      const config = getAIConfig();
      let endpoint = '/api/v1/ai/polish';
      let payload: Record<string, any> = { text, action, style: '', provider: config.provider, apiKey: config.apiKey, model: config.model, worldContext: aiContext };

      if (action === 'continue') {
        endpoint = '/api/v1/ai/continue';
        payload = { text, provider: config.provider, apiKey: config.apiKey, model: config.model, worldContext: aiContext };
      } else if (action === 'summary') {
        endpoint = '/api/v1/ai/summary';
        payload = { text, provider: config.provider, apiKey: config.apiKey, model: config.model, worldContext: aiContext };
      } else if (action === 'dehumanize') {
        endpoint = '/api/v1/ai/dehumanize';
        payload = { text, level: 'normal', provider: config.provider, apiKey: config.apiKey, model: config.model, worldContext: aiContext };
      } else if (action === 'dialogue_style') {
        endpoint = '/api/v1/ai/dialogue-style';
        payload = { text, provider: config.provider, apiKey: config.apiKey, model: config.model, worldContext: aiContext };
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiResult(data.data.result || data.data.content || data.data.summary || '');
      } else {
        // Fallback mock results
        const mockResults: Record<string, string> = {
          continue: text + '\n\n忽然间，一股莫名的力量涌上心头，他握紧了拳头，目光变得坚定起来。这一刻，他知道自己不能再犹豫了。\n\n"我决定了。"他的声音沉稳而有力，回荡在空旷的房间中。',
          polish: text.replace(/\s+/g, '。').replace(/。+/g, '。') + '。\n\n（已润色优化）',
          summary: `本章摘要：\n${text.slice(0, 100)}...\n\n核心事件：主角面临重大抉择\n情感基调：紧张悬疑\n关键转折：${text.slice(50, 100)}...`,
          expand: text + '\n\n那种感觉如同潮水般涌来，令人无法忽视。阳光透过窗帘洒在桌面上，尘埃在光柱中缓缓飘舞，一切都显得那样不真实，却又无比真切。',
          dehumanize: text + '\n\n（已去除AI写作痕迹）',
        };
        setAiResult(mockResults[action] || text);
      }
    } catch (err) {
      console.error('AI action failed:', err);
      const mockResults: Record<string, string> = {
        continue: text + '\n\n忽然间，一股莫名的力量涌上心头。他握紧了拳头，目光变得坚定起来。',
        polish: text + '\n\n（已润色）',
        summary: `本章摘要：${text.slice(0, 100)}...`,
        expand: text + '\n\n细节描写在此展开，周围的一切都在静静地诉说着故事。',
        dehumanize: text + '\n\n（已去除AI痕迹）',
      };
      setAiResult(mockResults[action] || text);
    }
    setAiLoading(null);
  }, [activeChapter.content]);

  const handleAIInsert = useCallback(() => {
    if (!aiResult) return;
    updateContent(activeChapter.content + '\n\n' + aiResult);
    setAiResult(null);
    setAiResultAction(null);
  }, [aiResult, activeChapter.content, updateContent]);

  const handleAIReplace = useCallback(() => {
    if (!aiResult) return;
    updateContent(aiResult);
    setAiResult(null);
    setAiResultAction(null);
  }, [aiResult, updateContent]);

  const handleBranchSelect = useCallback((branch: any) => {
    const addition = `\n\n【${branch.title}】${branch.description}\n\n`;
    updateContent(activeChapter.content + addition);
    setShowBranch(false);
  }, [activeChapter.content, updateContent]);

  const onLeftMouseDown = (e: React.MouseEvent) => {
    setDragging('left');
    startX.current = e.clientX;
    startLeft.current = leftWidth;
  };

  const onRightMouseDown = (e: React.MouseEvent) => {
    setDragging('right');
    startX.current = e.clientX;
    startRight.current = rightWidth;
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: focusMode ? '#08080c' : '#0f0f12', color: '#e4e4e7', transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-14 flex-shrink-0" style={{ background: focusMode ? 'rgba(8,8,12,0.98)' : '#16161c', borderBottom: focusMode ? '1px solid rgba(124,106,240,0.06)' : '1px solid rgba(255,255,255,0.06)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <div className="flex items-center gap-4">
          <div style={{ opacity: focusMode ? 0 : 1, maxWidth: focusMode ? 0 : 400, overflow: 'hidden', transition: 'opacity 0.3s ease, max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/" legacyBehavior>
              <a className="flex items-center gap-2 cursor-pointer">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c6af0, #6b5ce7)' }}>
                  <span className="text-white font-bold text-xs">睿</span>
                </div>
                <span className="text-sm font-medium text-white">明睿创作</span>
              </a>
            </Link>
            <span style={{ color: '#52525b' }}>|</span>
            <span className="text-sm" style={{ color: '#71717a' }}>{novelInfo?.title || '星际流光'}</span>
          </div>
          <span className="text-sm font-medium" style={{ color: '#a1a1aa', opacity: focusMode ? 1 : 0, maxWidth: focusMode ? 300 : 0, overflow: 'hidden', transition: 'opacity 0.4s ease 0.2s, max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap' }}>
            {novelInfo?.title || '星际流光'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div style={{ opacity: focusMode ? 0 : 1, maxWidth: focusMode ? 0 : 200, overflow: 'hidden', transition: 'opacity 0.3s ease, max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={handleUndo} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: '#71717a' }} title="撤销">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
            </button>
            <button onClick={handleRedo} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: '#71717a' }} title="重做">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"/></svg>
            </button>
            <button
              onClick={() => { setAIConfig(getAIConfig()); setShowAIConfig(true); }}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: isMockMode() ? '#f59e0b' : '#22c55e' }}
              title="AI配置"
            >
              {isMockMode() ? '🤖' : '🌐'}
            </button>
          </div>
          <div style={{ opacity: focusMode ? 0.6 : 1, transition: 'opacity 0.4s ease' }}>
            <button onClick={handleSave} className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all" style={{ background: saved ? '#22c55e' : '#7c6af0', color: '#fff' }}>
              {saved ? `已保存 ${saveTime}` : '保存中...'}
            </button>
          </div>
          <button
            onClick={() => setFocusMode(!focusMode)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: focusMode ? 'rgba(124,106,240,0.15)' : 'transparent',
              color: focusMode ? '#a78bfa' : '#71717a',
              border: '1px solid ' + (focusMode ? 'rgba(124,106,240,0.3)' : 'rgba(255,255,255,0.1)'),
              boxShadow: focusMode ? '0 0 12px rgba(124,106,240,0.15)' : 'none',
            }}
          >
            {focusMode ? '✕ 退出专注' : '🔒 专注'}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 min-h-0" style={{ position: 'relative', display: 'grid', gridTemplateColumns: focusMode ? '0px 1fr 0px' : `${leftWidth}px 1fr ${rightWidth}px`, transition: 'grid-template-columns 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {/* Left Sidebar */}
        <aside className="overflow-y-auto overflow-x-hidden" style={{ background: '#16161c', borderRight: '1px solid rgba(255,255,255,0.06)', width: leftWidth, opacity: focusMode ? 0 : 1, transition: 'opacity 0.3s ease', pointerEvents: focusMode ? 'none' : 'auto' }}>
            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">章节</div>
              <button onClick={() => setExpandedChapters(prev => prev.size > 0 ? new Set() : new Set(chapters.map(c => c.id)))} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#71717a' }}>{expandedChapters.size > 0 ? '收起' : '展开'}</button>
            </div>
            <div>
              {chapters.map((ch) => (
                <div key={ch.id} className="mb-1">
                  <div className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all" style={{ background: ch.id === activeChapterId ? 'rgba(124,106,240,0.12)' : 'transparent', border: ch.id === activeChapterId ? '1px solid rgba(124,106,240,0.2)' : '1px solid transparent' }}>
                    <button onClick={(e) => { e.stopPropagation(); setExpandedChapters(prev => { const next = new Set(prev); if (next.has(ch.id)) next.delete(ch.id); else next.add(ch.id); return next; }); }} className="w-4 h-4 flex items-center justify-center" style={{ color: '#52525b' }}>
                      <svg className="w-3 h-3 transition-transform" style={{ transform: expandedChapters.has(ch.id) ? 'rotate(90deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0" onClick={() => switchChapter(ch.id)}>
                      <div className="text-sm truncate" style={{ color: ch.id === activeChapterId ? '#e4e4e7' : '#71717a' }}>{ch.title}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteChapter(ch.id, ch.title); }} className="p-1 rounded hover:bg-red-500/20" style={{ color: '#71717a' }} title="删除章节">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newId = Math.max(...chapters.map(c => c.id)) + 1;
                  setChapters(prev => [...prev, { id: newId, title: `第${newId}章：新章节`, content: '', active: false }]);
                }}
                className="w-full mt-2 p-2 text-xs rounded-lg border border-dashed transition-colors hover:border-purple-500/30 hover:text-purple-400"
                style={{ color: '#71717a', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                + 新建章节
              </button>
            </div>

            <div className="p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">大纲</div>
              {savedOutline ? (
                <div className="space-y-2">
                  {savedOutline.structure && (
                    <>
                      <div className="text-xs" style={{ color: '#7c6af0' }}>第一幕</div>
                      <div className="text-xs pl-2" style={{ color: '#a1a1aa' }}>{savedOutline.structure.act1}</div>
                      <div className="text-xs mt-2" style={{ color: '#7c6af0' }}>第二幕</div>
                      <div className="text-xs pl-2" style={{ color: '#a1a1aa' }}>{savedOutline.structure.act2}</div>
                      <div className="text-xs mt-2" style={{ color: '#7c6af0' }}>第三幕</div>
                      <div className="text-xs pl-2" style={{ color: '#a1a1aa' }}>{savedOutline.structure.act3}</div>
                    </>
                  )}
                  {savedOutline.plotPoints && savedOutline.plotPoints.length > 0 && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-xs mb-2" style={{ color: '#71717a' }}>情节点</div>
                      {savedOutline.plotPoints.slice(0, 5).map((p: any, i: number) => (
                        <div key={i} className="text-xs py-1" style={{ color: '#a1a1aa' }}>
                          <span style={{ color: '#7c6af0' }}>第{p.chapter}章</span> {p.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                outline.map((section) => (
                  <div key={section.id} className="mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                      {section.title}
                    </div>
                    {section.children.map((child, i) => (
                      <div key={i} className="pl-6 py-1 text-xs" style={{ color: '#71717a' }}>{child}</div>
                    ))}
                  </div>
                ))
              )}
        </div>
        </aside>

        {/* Editor Area */}
        <main className="flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-6 py-2 flex-shrink-0" style={{ background: '#16161c', borderBottom: '1px solid rgba(255,255,255,0.06)', maxHeight: focusMode ? 0 : 40, opacity: focusMode ? 0 : 1, overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease' }}>
              <button onClick={() => insertFormat('**', '**')} className="px-2 py-1 rounded text-xs font-bold hover:bg-white/5 transition-colors" style={{ color: '#a1a1aa' }} title="加粗">B</button>
              <button onClick={() => insertFormat('*', '*')} className="px-2 py-1 rounded text-xs italic hover:bg-white/5 transition-colors" style={{ color: '#a1a1aa' }} title="斜体">I</button>
              <button onClick={() => insertFormat('__', '__')} className="px-2 py-1 rounded text-xs underline hover:bg-white/5 transition-colors" style={{ color: '#a1a1aa' }} title="下划线">U</button>
              <div className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <button onClick={() => insertFormat('# ', '')} className="px-2 py-1 rounded text-xs font-bold hover:bg-white/5 transition-colors" style={{ color: '#a1a1aa' }}>H1</button>
              <button onClick={() => insertFormat('## ', '')} className="px-2 py-1 rounded text-xs font-bold hover:bg-white/5 transition-colors" style={{ color: '#a1a1aa' }}>H2</button>
              <button onClick={() => insertFormat('### ', '')} className="px-2 py-1 rounded text-xs font-bold hover:bg-white/5 transition-colors" style={{ color: '#a1a1aa' }}>H3</button>
              <div className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

              {/* AI Feature Buttons */}
              <button
                onClick={() => setShowBranch(true)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: 'rgba(124,106,240,0.12)', color: '#a78bfa', border: '1px solid rgba(124,106,240,0.2)' }}
                title="剧情推演"
              >
                🎭 推演
              </button>
              <button
                onClick={() => setShowLogic(true)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: logicIssues > 0 ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)', color: logicIssues > 0 ? '#f59e0b' : '#22c55e', border: `1px solid ${logicIssues > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)'}` }}
                title="逻辑检测"
              >
                {logicIssues > 0 ? `⚠️ ${logicIssues}问题` : '✅ 逻辑'}
              </button>
              <button
                onClick={() => setShowOutline(true)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}
                title="智能大纲"
              >
                📋 大纲
              </button>
              <button
                onClick={() => setShowCharacters(true)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
                title="角色库"
              >
                👤 角色
              </button>
              <button
                onClick={() => setShowWordCount(true)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
                title="字数统计"
              >
                📊 统计
              </button>

              <div className="flex-1" />
              <span className="text-xs" style={{ color: '#7c6af0' }}>第 {activeChapterId} 章</span>
              <span className="mx-2" style={{ color: '#52525b' }}>|</span>
          <span className="text-xs" style={{ color: '#a1a1aa' }}>{wordCount.toLocaleString()} 字</span>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto relative" onClick={() => setSelectionVisible(false)} style={{ padding: focusMode ? '64px 32px' : '48px 64px', transition: 'padding 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div className="min-h-full" style={{ maxWidth: focusMode ? 640 : 900, margin: '0 auto', transition: 'max-width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <textarea
                ref={textareaRef}
                value={activeChapter.content}
                onChange={(e) => updateContent(e.target.value)}
                onSelect={handleTextSelect}
                onMouseUp={handleTextSelect}
                onKeyDown={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    if (e.key === 'b') { e.preventDefault(); insertFormat('**', '**'); }
                    else if (e.key === 'i') { e.preventDefault(); insertFormat('*', '*'); }
                    else if (e.key === 'u') { e.preventDefault(); insertFormat('__', '__'); }
                    else if (e.key === 's') { e.preventDefault(); handleSave(); }
                  }
                  if (focusMode && e.key === 'Escape') { setFocusMode(false); }
                }}
          className="w-full h-full min-h-[calc(100vh-200px)] resize-none outline-none bg-transparent"
            style={{
              fontFamily: focusMode ? "'Source Serif Pro', Georgia, serif" : "'Source Serif Pro', Georgia, serif",
              fontSize: focusMode ? 21 : 18,
              lineHeight: focusMode ? 2.5 : 2.2,
              color: focusMode ? '#c8c8cd' : '#d4d4d8',
              letterSpacing: focusMode ? '0.5px' : '0.35px',
              transition: 'font-size 0.6s cubic-bezier(0.4, 0, 0.2, 1), line-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), color 0.6s ease, letter-spacing 0.6s ease',
            }}
                placeholder="开始你的创作... 选中文字可使用AI润色"
              />
            </div>

            {!saved && (
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs animate-pulse" style={{ background: 'rgba(124,106,240,0.15)', color: '#7c6af0', border: '1px solid rgba(124,106,240,0.2)' }}>
                自动保存中...
              </div>
            )}
          </div>

          {/* Bottom Status Bar */}
          <div className="flex items-center justify-between px-6 flex-shrink-0 text-xs relative" style={{ background: focusMode ? 'rgba(8,8,12,0.95)' : '#12121a', borderTop: focusMode ? '1px solid rgba(124,106,240,0.06)' : '1px solid rgba(255,255,255,0.04)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <div className="flex items-center gap-3" style={{ opacity: focusMode ? 0 : 1, maxHeight: focusMode ? 0 : 24, transition: 'opacity 0.3s ease, max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden' }}>
              <span style={{ color: logicIssues > 0 ? '#f59e0b' : '#22c55e' }}>
                {logicIssues > 0 ? `⚠️ ${logicIssues}个问题` : '✅ 逻辑自洽'}
              </span>
              <span style={{ color: '#52525b' }}>|</span>
              <span style={{ color: '#52525b' }}>{wordCount.toLocaleString()} 字</span>
              <span style={{ color: '#52525b' }}>|</span>
              <span style={{ color: '#52525b' }}>{lineCount} 行</span>
              <span style={{ color: '#52525b' }}>|</span>
              <span style={{ color: '#52525b' }}>约 {readingTime} 分钟</span>
              <span style={{ color: '#52525b' }}>|</span>
              <span style={{ color: '#52525b' }}>{chapters.length} 章</span>
            </div>
            <div className="flex items-center gap-2" style={{ opacity: focusMode ? 0 : 1, maxHeight: focusMode ? 0 : 24, transition: 'opacity 0.3s ease, max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden' }}>
              <button onClick={() => setShowBranch(true)} className="hover:text-white transition-colors" style={{ color: '#52525b' }}>
                🎭 剧情推演
              </button>
              <button onClick={() => setShowLogic(true)} className="hover:text-white transition-colors" style={{ color: '#52525b' }}>
                🔍 逻辑检测
              </button>
            </div>
            <div className="absolute left-0 right-0 flex items-center justify-center" style={{ opacity: focusMode ? 1 : 0, transition: 'opacity 0.4s ease 0.2s', pointerEvents: focusMode ? 'auto' : 'none' }}>
              <div className="flex items-center gap-3 py-2">
                <span style={{ color: '#52525b', fontVariantNumeric: 'tabular-nums' }}>{wordCount.toLocaleString()} 字</span>
                <span style={{ color: 'rgba(124,106,240,0.3)' }}>·</span>
                <span style={{ color: '#52525b' }}>{lineCount} 行</span>
                <span style={{ color: 'rgba(124,106,240,0.3)' }}>·</span>
                <span style={{ color: '#52525b' }}>第 {activeChapterId} 章</span>
                <span style={{ color: 'rgba(124,106,240,0.3)' }}>·</span>
                <span className="px-2 py-0.5 rounded" style={{ color: 'rgba(124,106,240,0.5)', background: 'rgba(124,106,240,0.08)', border: '1px solid rgba(124,106,240,0.1)' }}>Esc 退出</span>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="overflow-y-auto overflow-x-hidden" style={{ background: '#16161c', borderLeft: '1px solid rgba(255,255,255,0.06)', width: rightWidth, opacity: focusMode ? 0 : 1, transition: 'opacity 0.3s ease', pointerEvents: focusMode ? 'none' : 'auto' }}>
            {showAIPanel && (
              <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI 助手</div>
                  <button onClick={() => setShowAIPanel(false)} className="text-gray-600 hover:text-white transition-colors text-xs">✕</button>
                </div>

<div className="space-y-2">
                {[
                  { icon: '✍️', title: '续写', desc: '基于当前内容续写下一段', action: 'continue' },
                  { icon: '✨', title: '润色', desc: '优化文字表达与风格', action: 'polish' },
                  { icon: '📋', title: '摘要', desc: '生成当前章节概要', action: 'summary' },
                  { icon: '📐', title: '扩展', desc: '扩展当前情节细节', action: 'expand' },
                  { icon: '🎯', title: '去除AI味', desc: '去除AI写作痕迹，更像人类写作', action: 'dehumanize' },
                  { icon: '💬', title: '对风格化', desc: '根据角色性格调整对话', action: 'dialogue_style' },
                ].map((item) => (
                  <button
                    key={item.action}
                    onClick={() => handleAIAction(item.action)}
                    disabled={!!aiLoading}
                    className="w-full text-left p-3 rounded-lg transition-all hover:scale-[1.01] disabled:opacity-40"
                    style={{ background: aiLoading === item.action ? 'rgba(124,106,240,0.15)' : '#1c1c24', border: aiLoading === item.action ? '1px solid rgba(124,106,240,0.3)' : '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{aiLoading === item.action ? '⏳' : item.icon}</span>
                      <span className="text-sm font-medium text-white">{item.title}</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#71717a' }}>{aiLoading === item.action ? 'AI处理中...' : item.desc}</div>
                  </button>
                ))}

                {/* AI Result Preview */}
                {aiResult && (
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(124,106,240,0.08)', border: '1px solid rgba(124,106,240,0.2)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>AI 结果</span>
                      <button onClick={() => { setAiResult(null); setAiResultAction(null); }} className="text-xs" style={{ color: '#71717a', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div className="text-xs whitespace-pre-wrap max-h-48 overflow-auto" style={{ color: '#d4d4d8', lineHeight: 1.6 }}>
                      {aiResult}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleAIInsert}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg"
                        style={{ background: 'rgba(124,106,240,0.2)', color: '#a78bfa', border: '1px solid rgba(124,106,240,0.3)', cursor: 'pointer' }}
                      >
                        追加到文末
                      </button>
                      <button
                        onClick={handleAIReplace}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg"
                        style={{ background: '#7c6af0', color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        替换全文
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Suggestion */}
                <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(124,106,240,0.1)', border: '1px solid rgba(124,106,240,0.2)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs">💡</span>
                      <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>AI 建议</span>
                    </div>
                    <p className="text-xs" style={{ color: '#a1a1aa', lineHeight: 1.7 }}>
                      {activeChapter.content.length === 0
                        ? '当前章节还没有内容，点击"续写"开始AI创作。'
                        : activeChapter.content.length < 100
                          ? '内容较少，建议先手动写一段再使用AI续写，效果更好。'
                          : activeChapter.content.length < 500
                            ? '当前段落可以适当扩展细节，试试"扩展"功能增加描写。'
                            : '内容较丰富，可以尝试"润色"优化表达，或"摘要"生成概要。'}
                    </p>
                  </div>
                </div>
              </div>
              </div>
            )}

          <RightPanelComposite />
        </aside>
      </div>

      {/* Selection Toolbar - only render on client */}
      {clientOnly && (
        <SelectionToolbar
          selectedText={selectedText}
          position={selectionPos}
          visible={selectionVisible}
          onAction={handleSelectionAction}
          onClose={() => setSelectionVisible(false)}
        />
      )}

      {/* Branch Panel - only render on client */}
      {clientOnly && (
        <BranchPanel
          visible={showBranch}
          context={activeChapter.content.slice(-200)}
          onSelect={handleBranchSelect}
          onClose={() => setShowBranch(false)}
        />
      )}

      {/* Logic Checker - only render on client */}
      {clientOnly && (
        <LogicChecker
          chapters={chapters.map(c => ({ id: c.id, title: c.title, content: c.content }))}
          currentChapterId={activeChapterId}
          visible={showLogic}
          onClose={() => setShowLogic(false)}
          onNavigate={(chapterId) => {
            setShowLogic(false);
            setActiveChapterId(chapterId);
          }}
        />
      )}

      {/* Outline Generator - only render on client */}
      {clientOnly && (
        <OutlineGenerator
          visible={showOutline}
          onClose={() => setShowOutline(false)}
          onChaptersApply={(newChapters) => {
            const formattedChapters: Chapter[] = newChapters.map((ch, idx) => ({
              id: Math.max(...chapters.map(c => c.id), 0) + idx + 1,
              title: `第${ch.chapter}章：${ch.title}`,
              content: '',
              active: false
            }));
            if (formattedChapters.length > 0) {
              setChapters(prev => [...prev, ...formattedChapters]);
            }
          }}
          onSave={(data) => {
            console.log('保存大纲:', data);
            setSavedOutline(data.outline);
            setShowOutline(false);
          }}
        />
      )}

      {/* Character Panel */}
      <CharacterPanel
        visible={showCharacters}
        onClose={() => setShowCharacters(false)}
        onSelect={(char) => {
          insertFormat(`【${char.name}】`, '');
          setShowCharacters(false);
        }}
      />

      {/* Word Count Modal */}
      <WordCountModal
        visible={showWordCount}
        onClose={() => setShowWordCount(false)}
        chapters={chapters}
      />

      {/* AI Config Modal - only render on client */}
      {clientOnly && (
        <AIConfigModal
          visible={showAIConfig}
          onClose={() => setShowAIConfig(false)}
          onSave={(config) => { setAIConfig(config); }}
        />
      )}

      {/* Drag handles */}
      <div
        onMouseDown={onLeftMouseDown}
        className="absolute top-14 bottom-0 w-1 cursor-col-resize hover:bg-purple-500/20 transition-colors"
        style={{ left: leftWidth - 1, opacity: focusMode ? 0 : 1, pointerEvents: focusMode ? 'none' : 'auto', transition: 'opacity 0.3s ease' }}
      />
      <div
        onMouseDown={onRightMouseDown}
        className="absolute top-14 bottom-0 w-1 cursor-col-resize hover:bg-purple-500/20 transition-colors"
        style={{ right: rightWidth - 1, opacity: focusMode ? 0 : 1, pointerEvents: focusMode ? 'none' : 'auto', transition: 'opacity 0.3s ease' }}
      />
    </div>
  );
};

export default Editor;