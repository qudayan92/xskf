'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { callAI } from '../lib/ai';

interface Chapter {
  chapter: number;
  title: string;
  type: string;
  emotion: number;
  hook: string | null;
  summary: string;
}

interface EmotionPoint {
  chapter: number;
  emotion: number;
  type: string;
}

interface ChapterTitleGeneratorProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (chapters: Chapter[]) => void;
}

const GENRES = [
  { id: '玄幻', name: '玄幻', desc: '东方玄幻、仙侠修真' },
  { id: '都市', name: '都市', desc: '都市生活、职场商战' },
  { id: '科幻', name: '科幻', desc: '星际科幻、末世危机' },
  { id: '历史', name: '历史', desc: '历史穿越、架空历史' },
  { id: '系统', name: '系统', desc: '系统流、游戏异界' },
];

const DEFAULT_HOOKS = [
  '身份之谜', '三日之约', '神秘残片', '血脉觉醒', '系统任务',
  '远古传承', '惊天秘密', '命运之子', '灭族之仇', '身世之谜'
];

const EMOTION_BAR = {
  1: '▁',
  2: '▂',
  3: '▃',
  4: '▄',
  5: '▅',
  6: '▆',
  7: '▇',
  8: '█',
  9: '█',
  10: '█',
};

export default function ChapterTitleGenerator({ visible, onClose, onApply }: ChapterTitleGeneratorProps) {
  // 表单状态
  const [bookTitle, setBookTitle] = useState('');
  const [genre, setGenre] = useState('玄幻');
  const [chapterCount, setChapterCount] = useState(20);
  const [conflictCycle, setConflictCycle] = useState(3);
  const [climaxCycle, setClimaxCycle] = useState(10);
  const [customHooks, setCustomHooks] = useState<string[]>([]);
  const [newHook, setNewHook] = useState('');

  // 数据状态
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [emotionCurve, setEmotionCurve] = useState<EmotionPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // 生成章节标题
  const handleGenerate = async () => {
    if (!bookTitle.trim()) {
      alert('请输入书名');
      return;
    }

    setLoading(true);
    try {
      const result = await callAI('/api/v1/generate/chapter-titles', {
        bookTitle: bookTitle.trim(),
        genre,
        chapterCount,
        conflictCycle,
        climaxCycle,
        customHooks
      });

      if (result.success) {
        setChapters(result.data.chapters || []);
        setEmotionCurve(result.data.emotionCurve || []);
      } else {
        alert('生成失败: ' + (result.error || '未知错误'));
      }
    } catch (err) {
      console.error('Generate error:', err);
      alert('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 添加钩子
  const handleAddHook = () => {
    if (newHook.trim() && !customHooks.includes(newHook.trim())) {
      setCustomHooks([...customHooks, newHook.trim()]);
      setNewHook('');
    }
  };

  // 删除钩子
  const handleRemoveHook = (hook: string) => {
    setCustomHooks(customHooks.filter(h => h !== hook));
  };

  // 编辑章节标题
  const handleEditTitle = (index: number) => {
    setEditingIndex(index);
    setEditValue(chapters[index].title);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const newChapters = [...chapters];
      newChapters[editingIndex] = { ...newChapters[editingIndex], title: editValue };
      setChapters(newChapters);
      setEditingIndex(null);
      setEditValue('');
    }
  };

  // 删除章节
  const handleDeleteChapter = (index: number) => {
    const newChapters = chapters.filter((_, i) => i !== index);
    newChapters.forEach((ch, i) => { ch.chapter = i + 1; });
    setChapters(newChapters);
  };

  // 添加新章节
  const handleAddChapter = () => {
    const maxChapter = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter)) : 0;
    const newChapter: Chapter = {
      chapter: maxChapter + 1,
      title: `新章节`,
      type: '日常',
      emotion: 5,
      hook: null,
      summary: '新增章节'
    };
    setChapters([...chapters, newChapter]);
  };

  // 导出为 Markdown
  const handleExportMarkdown = async () => {
    if (chapters.length === 0) return;

    let md = `# ${bookTitle}\n\n`;
    md += `> 流派：${genre}\n\n`;
    md += `---\n\n`;

    chapters.forEach(ch => {
      md += `## 第${ch.chapter}章：${ch.title}\n\n`;
      md += `- 类型：${ch.type} | 情绪：${ch.emotion}/10`;
      if (ch.hook) md += ` | 钩子：${ch.hook}`;
      md += `\n\n`;
      md += `${ch.summary || ''}\n\n`;
    });

    // 复制到剪贴板
    try { await navigator.clipboard.writeText(md); alert('已复制到剪贴板'); } catch { alert('复制失败，请手动复制'); }
  };

  // 导出为 JSON
  const handleExportJson = async () => {
    if (chapters.length === 0) return;

    const json = JSON.stringify({
      bookTitle,
      genre,
      chapters,
      emotionCurve
    }, null, 2);

    try { await navigator.clipboard.writeText(json); alert('JSON已复制到剪贴板'); } catch { alert('复制失败'); }
  };

  // 导出为 TXT
  const handleExportTxt = async () => {
    if (chapters.length === 0) return;

    let txt = `${bookTitle}\n`;
    txt += `${'='.repeat(20)}\n\n`;

    chapters.forEach(ch => {
      txt += `第${ch.chapter}章 ${ch.title}`;
      if (ch.hook) txt += ` [${ch.hook}]`;
      txt += `\n`;
    });

    try { await navigator.clipboard.writeText(txt); alert('TXT已复制到剪贴板'); } catch { alert('复制失败'); }
  };

  // 应用到编辑器
  const handleApply = () => {
    if (onApply && chapters.length > 0) {
      onApply(chapters);
      onClose();
    }
  };

  // 渲染情绪条
  const renderEmotionBar = (emotion: number) => {
    return (
      <span style={{ color: emotion >= 8 ? '#ef4444' : emotion >= 6 ? '#f59e0b' : '#6b7280' }}>
        {EMOTION_BAR[emotion as keyof typeof EMOTION_BAR]}
      </span>
    );
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#1a1a1f',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 头部 */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ color: '#fff', fontSize: '20px', margin: 0 }}>章节标题生成器</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: '24px',
            cursor: 'pointer'
          }}>×</button>
        </div>

        {/* 内容区 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* 输入表单 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '4px' }}>书名</label>
              <input
                value={bookTitle}
                onChange={e => setBookTitle(e.target.value)}
                placeholder="输入书名"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#25252a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '4px' }}>流派</label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#25252a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              >
                {GENRES.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '4px' }}>章节数</label>
              <input
                type="number"
                value={chapterCount}
                onChange={e => setChapterCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                min={1}
                max={100}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#25252a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '4px' }}>冲突周期</label>
              <input
                type="number"
                value={conflictCycle}
                onChange={e => setConflictCycle(Math.min(10, Math.max(1, parseInt(e.target.value) || 3)))}
                min={1}
                max={10}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#25252a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </div>
          </div>

          {/* 钩子设置 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              自定义钩子 ({customHooks.length})
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {customHooks.map((hook, i) => (
                <span key={i} style={{
                  padding: '4px 12px',
                  backgroundColor: 'rgba(124,106,240,0.2)',
                  color: '#a5b4fc',
                  borderRadius: '16px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {hook}
                  <button
                    onClick={() => handleRemoveHook(hook)}
                    style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer' }}
                  >×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={newHook}
                onChange={e => setNewHook(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddHook()}
                placeholder="添加自定义钩子"
                style={{
                  flex: 1,
                  maxWidth: '200px',
                  padding: '8px 12px',
                  backgroundColor: '#25252a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <button
                onClick={handleAddHook}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                添加
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {DEFAULT_HOOKS.filter(h => !customHooks.includes(h)).map(hook => (
                <button
                  key={hook}
                  onClick={() => setCustomHooks([...customHooks, hook])}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    color: '#666',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  + {hook}
                </button>
              ))}
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={loading || !bookTitle.trim()}
            style={{
              padding: '12px 32px',
              backgroundColor: loading ? '#666' : '#7c6af0',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            {loading ? '生成中...' : '生成章节标题'}
          </button>

          {/* 情绪曲线可视化 */}
          {emotionCurve.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>情绪曲线</h3>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '4px',
                height: '60px',
                padding: '8px',
                backgroundColor: '#25252a',
                borderRadius: '8px',
                overflowX: 'auto'
              }}>
                {emotionCurve.map((point, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '20px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: `${point.emotion * 5}px`,
                      backgroundColor: point.emotion >= 8 ? '#ef4444' : point.emotion >= 6 ? '#f59e0b' : '#7c6af0',
                      borderRadius: '2px'
                    }} />
                    <span style={{ color: '#666', fontSize: '9px', marginTop: '2px' }}>{point.chapter}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 章节列表 */}
          {chapters.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>
                章节列表 ({chapters.length}章)
              </h3>
              <div style={{
                maxHeight: '300px',
                overflow: 'auto',
                backgroundColor: '#25252a',
                borderRadius: '8px'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '12px', color: '#888', fontSize: '12px', textAlign: 'left' }}>章</th>
                      <th style={{ padding: '12px', color: '#888', fontSize: '12px', textAlign: 'left' }}>标题</th>
                      <th style={{ padding: '12px', color: '#888', fontSize: '12px', textAlign: 'left' }}>类型</th>
                      <th style={{ padding: '12px', color: '#888', fontSize: '12px', textAlign: 'left' }}>情绪</th>
                      <th style={{ padding: '12px', color: '#888', fontSize: '12px', textAlign: 'left' }}>钩子</th>
                      <th style={{ padding: '12px', color: '#888', fontSize: '12px', textAlign: 'right' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chapters.map((ch, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>第{ch.chapter}章</td>
                        <td style={{ padding: '12px' }}>
                          {editingIndex === i ? (
                            <input
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit}
                              onKeyPress={e => e.key === 'Enter' && handleSaveEdit()}
                              autoFocus
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                backgroundColor: '#1a1a1f',
                                border: '1px solid #7c6af0',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '13px'
                              }}
                            />
                          ) : (
                            <span style={{ color: '#fff', fontSize: '13px', cursor: 'pointer' }}
                              onClick={() => handleEditTitle(i)}>
                              {ch.title}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: ch.type === '打脸' ? 'rgba(239,68,68,0.2)' :
                              ch.type === '高潮' ? 'rgba(245,158,11,0.2)' :
                              ch.type === '冲突' ? 'rgba(124,106,240,0.2)' :
                                'rgba(255,255,255,0.1)',
                            color: ch.type === '打脸' ? '#ef4444' :
                              ch.type === '高潮' ? '#f59e0b' :
                              ch.type === '冲突' ? '#a5b4fc' :
                                '#888',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}>
                            {ch.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>
                          {renderEmotionBar(ch.emotion)} {ch.emotion}
                        </td>
                        <td style={{ padding: '12px', color: ch.hook ? '#a5b4fc' : '#666', fontSize: '12px' }}>
                          {ch.hook || '-'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleEditTitle(i)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#888',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteChapter(i)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginLeft: '8px'
                            }}
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleAddChapter}
                style={{
                  padding: '8px 16px',
                  marginTop: '12px',
                  backgroundColor: 'transparent',
                  border: '1px dashed rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                + 添加章节
              </button>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleExportMarkdown}
              disabled={chapters.length === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
                cursor: chapters.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                opacity: chapters.length === 0 ? 0.5 : 1
              }}
            >
              导出 Markdown
            </button>
            <button
              onClick={handleExportJson}
              disabled={chapters.length === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
                cursor: chapters.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                opacity: chapters.length === 0 ? 0.5 : 1
              }}
            >
              导出 JSON
            </button>
            <button
              onClick={handleExportTxt}
              disabled={chapters.length === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
                cursor: chapters.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                opacity: chapters.length === 0 ? 0.5 : 1
              }}
            >
              导出 TXT
            </button>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              取消
            </button>
            <button
              onClick={handleApply}
              disabled={chapters.length === 0}
              style={{
                padding: '10px 24px',
                backgroundColor: chapters.length === 0 ? '#666' : '#7c6af0',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: chapters.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              应用到编辑器
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}