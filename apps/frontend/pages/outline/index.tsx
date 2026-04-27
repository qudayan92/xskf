'use client';

import React, { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Novel {
  id: number;
  book_id: string;
  title: string;
}

interface Chapter {
  id: number;
  title: string;
  content: string;
}

interface PlotLine {
  id: number;
  name: string;
  type: 'main' | 'sub' | 'char';
  color: string;
  chapters: number[];
}

interface Foreshadow {
  id: number;
  hint: string;
  resolve: string;
  hintChapter: number;
  resolveChapter: number;
}

const OutlinePage: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeTab, setActiveTab] = useState<'tree' | 'plotlines' | 'foreshadow'>('tree');
  const [plotlines, setPlotlines] = useState<PlotLine[]>([]);
  const [foreshadows, setForeshadows] = useState<Foreshadow[]>([]);
  const [newPlotline, setNewPlotline] = useState({ name: '', type: 'main' as const });
  const [newForeshadow, setNewForeshadow] = useState({ hint: '', resolve: '', hintChapter: 1, resolveChapter: 1 });

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/novels`);
      const data = await res.json();
      if (data.success) {
        setNovels(data.data || []);
        if (data.data?.length > 0) {
          setSelectedNovel(data.data[0]);
          fetchChapters(data.data[0].book_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch novels:', err);
    }
  };

  const fetchChapters = async (bookId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/books/${bookId}/chapters`);
      const data = await res.json();
      if (data.success) {
        setChapters(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch chapters:', err);
    }
  };

  const handleNovelChange = (novel: Novel) => {
    setSelectedNovel(novel);
    fetchChapters(novel.book_id);
  };

  const addPlotline = () => {
    if (!newPlotline.name) return;
    const colors = { main: '#7c6af0', sub: '#22c55e', char: '#f59e0b' };
    setPlotlines([...plotlines, {
      id: Date.now(),
      name: newPlotline.name,
      type: newPlotline.type,
      color: colors[newPlotline.type],
      chapters: []
    }]);
    setNewPlotline({ name: '', type: 'main' });
  };

  const removePlotline = (id: number) => {
    setPlotlines(plotlines.filter(p => p.id !== id));
  };

  const addForeshadow = () => {
    if (!newForeshadow.hint || !newForeshadow.resolve) return;
    setForeshadows([...foreshadows, {
      id: Date.now(),
      hint: newForeshadow.hint,
      resolve: newForeshadow.resolve,
      hintChapter: newForeshadow.hintChapter,
      resolveChapter: newForeshadow.resolveChapter
    }]);
    setNewForeshadow({ hint: '', resolve: '', hintChapter: 1, resolveChapter: 1 });
  };

  const removeForeshadow = (id: number) => {
    setForeshadows(foreshadows.filter(f => f.id !== id));
  };

  const getChapterTitle = (id: number) => {
    const ch = chapters.find(c => c.id === id);
    return ch?.title || `第${id}章`;
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f0f12', color: '#e4e4e7' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">📋 大纲管理</h1>
        <p className="text-sm mb-6" style={{ color: '#71717a' }}>章节树状图、剧情线、伏笔追踪</p>

        {/* Novel Selection */}
        <div className="mb-6">
          <select
            value={selectedNovel?.id || ''}
            onChange={(e) => {
              const novel = novels.find(n => n.id === Number(e.target.value));
              if (novel) handleNovelChange(novel);
            }}
            className="p-3 rounded-lg"
            style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7', width: '100%' }}
          >
            {novels.map(novel => (
              <option key={novel.id} value={novel.id}>{novel.title}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'tree', label: '🌳 章节树' },
            { id: 'plotlines', label: '🎬 剧情线' },
            { id: 'foreshadow', label: '🔮 伏笔' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? '#7c6af0' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#fff' : '#71717a'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'tree' && selectedNovel && (
          <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-lg font-medium mb-4">章节结构</h2>
            <div className="space-y-1">
              {chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-gray-500 text-xs w-8">{idx + 1}</span>
                  <span style={{ color: '#7c6af0' }}>├</span>
                  <span className="text-sm" style={{ color: '#e4e4e7' }}>{ch.title}</span>
                  <span className="text-xs" style={{ color: '#52525b' }}>{ch.content.replace(/\s/g, '').length} 字</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'plotlines' && (
          <div className="space-y-4">
            {/* Add Plotline */}
            <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-medium mb-3">添加剧情线</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="剧情线名称"
                  value={newPlotline.name}
                  onChange={(e) => setNewPlotline({ ...newPlotline, name: e.target.value })}
                  className="flex-1 p-2 rounded-lg text-sm"
                  style={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7' }}
                />
                <select
                  value={newPlotline.type}
                  onChange={(e) => setNewPlotline({ ...newPlotline, type: e.target.value as any })}
                  className="p-2 rounded-lg text-sm"
                  style={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7' }}
                >
                  <option value="main">主线</option>
                  <option value="sub">支线</option>
                  <option value="char">人物线</option>
                </select>
                <button
                  onClick={addPlotline}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: '#7c6af0', color: '#fff' }}
                >
                  添加
                </button>
              </div>
            </div>

            {/* Plotlines List */}
            <div className="grid grid-cols-3 gap-4">
              {plotlines.map(pl => (
                <div
                  key={pl.id}
                  className="p-4 rounded-xl"
                  style={{ background: '#1c1c24', border: `2px solid ${pl.color}40` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-medium" style={{ color: pl.color }}>{pl.name}</span>
                      <span className="text-xs ml-2 px-2 py-0.5 rounded" style={{ background: `${pl.color}20`, color: pl.color }}>
                        {pl.type === 'main' ? '主线' : pl.type === 'sub' ? '支线' : '人物'}
                      </span>
                    </div>
                    <button onClick={() => removePlotline(pl.id)} className="text-gray-500 hover:text-red-400">✕</button>
                  </div>
                  <div className="text-xs" style={{ color: '#71717a' }}>
                    涉及章节: {pl.chapters.length > 0 ? pl.chapters.map(id => getChapterTitle(id)).join(', ') : '暂无'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'foreshadow' && (
          <div className="space-y-4">
            {/* Add Foreshadow */}
            <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-medium mb-3">添加伏笔</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="伏笔内容"
                  value={newForeshadow.hint}
                  onChange={(e) => setNewForeshadow({ ...newForeshadow, hint: e.target.value })}
                  className="p-2 rounded-lg text-sm"
                  style={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7' }}
                />
                <input
                  type="text"
                  placeholder="回收内容"
                  value={newForeshadow.resolve}
                  onChange={(e) => setNewForeshadow({ ...newForeshadow, resolve: e.target.value })}
                  className="p-2 rounded-lg text-sm"
                  style={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7' }}
                />
                <select
                  value={newForeshadow.hintChapter}
                  onChange={(e) => setNewForeshadow({ ...newForeshadow, hintChapter: Number(e.target.value) })}
                  className="p-2 rounded-lg text-sm"
                  style={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7' }}
                >
                  {chapters.map((ch, idx) => (
                    <option key={ch.id} value={idx + 1}>伏笔章节: {ch.title}</option>
                  ))}
                </select>
                <select
                  value={newForeshadow.resolveChapter}
                  onChange={(e) => setNewForeshadow({ ...newForeshadow, resolveChapter: Number(e.target.value) })}
                  className="p-2 rounded-lg text-sm"
                  style={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7' }}
                >
                  {chapters.map((ch, idx) => (
                    <option key={ch.id} value={idx + 1}>回收章节: {ch.title}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addForeshadow}
                className="mt-3 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: '#7c6af0', color: '#fff' }}
              >
                添加伏笔
              </button>
            </div>

            {/* Foreshadows List */}
            <div className="space-y-3">
              {foreshadows.map(fs => (
                <div
                  key={fs.id}
                  className="p-4 rounded-xl"
                  style={{ background: '#1c1c24', border: '1px solid rgba(124,106,240,0.2)' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(124,106,240,0.2)', color: '#a78bfa' }}>
                          🔮 伏笔
                        </span>
                        <span className="text-xs" style={{ color: '#52525b' }}>{getChapterTitle(fs.hintChapter)}</span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#a1a1aa' }}>{fs.hint}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>
                          ✅ 回收
                        </span>
                        <span className="text-xs" style={{ color: '#52525b' }}>{getChapterTitle(fs.resolveChapter)}</span>
                      </div>
                      <p className="text-sm" style={{ color: '#a1a1aa' }}>{fs.resolve}</p>
                    </div>
                    <button onClick={() => removeForeshadow(fs.id)} className="text-gray-500 hover:text-red-400 ml-2">✕</button>
                  </div>
                </div>
              ))}
              {foreshadows.length === 0 && (
                <div className="text-center py-10" style={{ color: '#52525b' }}>
                  <p>暂无伏笔记录</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlinePage;