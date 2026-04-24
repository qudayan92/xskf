import React, { useState, useCallback, useEffect } from 'react';
import { callAI } from '../lib/ai';
import ChapterTitleGenerator from './ChapterTitleGenerator';

interface Props {
  visible: boolean;
  novelId?: number;
  onClose: () => void;
  onChaptersApply?: (chapters: any[]) => void;
  onSave?: (data: { title: string; genre: string; outline: Outline; chapters?: any[] }) => void;
}

interface Outline {
  structure?: { act1?: string; act2?: string; act3?: string };
  plotPoints?: Array<{ chapter: number; title: string; description: string }>;
  chapterCount?: number;
  mainConflict?: string;
  setup?: string;
  climax?: string;
}

const OutlineGenerator: React.FC<Props> = ({ visible, onClose, onChaptersApply, onSave }) => {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('科幻');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'structure' | 'plot' | 'details'>('structure');
  const [showChapterTitles, setShowChapterTitles] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateOutline = useCallback(async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const result = await callAI('/api/v1/ai/generate-outline', { title, genre, summary });
      if (result.success) {
        setOutline(result.data.outline);
      }
    } catch (err) {
      setOutline({
        structure: {
          act1: '建立世界，主角出场，冲突初现',
          act2: '冲突升级，主角成长，重大转折',
          act3: '高潮对决，解决问题，完美收官'
        },
        plotPoints: [
          { chapter: 1, title: '开端', description: '介绍主角和世界观' },
          { chapter: 5, title: '第一次冲突', description: '主角面临第一个挑战' },
          { chapter: 10, title: '转折点', description: '真相大白，局势逆转' },
          { chapter: 15, title: '高潮', description: '最终对决' },
          { chapter: 20, title: '结局', description: '完美收官' }
        ],
        chapterCount: 20,
        mainConflict: '主角与反派的终极对决',
        setup: '多处伏笔呼应',
        climax: '最终章的激烈对决'
      });
    }
    setLoading(false);
  }, [title, genre, summary]);

  const handleSave = useCallback(() => {
    if (onSave && outline) {
      onSave({ title, genre, outline, chapters });
      setSaved(true);
    }
  }, [title, genre, outline, chapters, onSave]);

  const handleCancel = useCallback(() => {
    setTitle('');
    setGenre('科幻');
    setSummary('');
    setOutline(null);
    setChapters([]);
    setSaved(false);
    onClose();
  }, [onClose]);

  if (!visible || !mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-3xl mx-4 rounded-2xl overflow-hidden" style={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <span className="font-semibold text-white">智能大纲</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-sm">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">作品标题</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="星际流光"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">类型</label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
              >
                <style>{`select option { background: #1a1a24; color: white; }`}</style>
                <option value="玄幻">玄幻</option>
                <option value="科幻">科幻</option>
                <option value="都市">都市</option>
                <option value="历史">历史</option>
                <option value="悬疑">悬疑</option>
                <option value="言情">言情</option>
                <option value="奇幻">奇幻</option>
                <option value="军事">军事</option>
                <option value="游戏">游戏</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">简介（可选）</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="简单描述你的故事核心..."
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', height: 80 }}
            />
          </div>

          <button
            onClick={generateOutline}
            disabled={loading || !title}
            className="w-full px-6 py-3 rounded-xl text-white font-medium transition-all disabled:opacity-40"
            style={{ background: '#7c6af0' }}
          >
            {loading ? '生成中...' : '生成大纲'}
          </button>

          {outline && (
            <button
              onClick={() => setShowChapterTitles(true)}
              className="w-full mt-3 px-6 py-3 rounded-xl text-white font-medium transition-all"
              style={{ background: 'rgba(124,106,240,0.3)', border: '1px solid rgba(124,106,240,0.5)' }}
            >
              生成章节标题
            </button>
          )}

          {outline && (
            <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-2 mb-4">
                {['structure', 'plot', 'details'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === tab ? 'text-white' : 'text-gray-400'
                    }`}
                    style={activeTab === tab ? { background: 'rgba(124,106,240,0.2)' } : {}}
                  >
                    {tab === 'structure' ? '故事结构' : tab === 'plot' ? '情节点' : '详细信息'}
                  </button>
                ))}
              </div>

              {activeTab === 'structure' && outline.structure && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(124,106,240,0.1)' }}>
                    <div className="text-xs" style={{ color: '#7c6af0' }}>第一幕</div>
                    <div className="text-sm text-gray-200">{outline.structure.act1}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(124,106,240,0.1)' }}>
                    <div className="text-xs" style={{ color: '#7c6af0' }}>第二幕</div>
                    <div className="text-sm text-gray-200">{outline.structure.act2}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(124,106,240,0.1)' }}>
                    <div className="text-xs" style={{ color: '#7c6af0' }}>第三幕</div>
                    <div className="text-sm text-gray-200">{outline.structure.act3}</div>
                  </div>
                </div>
              )}

              {activeTab === 'plot' && outline.plotPoints && (
                <div className="space-y-2">
                  {outline.plotPoints.map((point, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <span className="text-sm font-medium" style={{ color: '#7c6af0', minWidth: 40 }}>第{point.chapter}章</span>
                      <div>
                        <div className="text-sm text-white">{point.title}</div>
                        <div className="text-xs" style={{ color: '#71717a' }}>{point.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-xs" style={{ color: '#71717a' }}>建议章节数</div>
                    <div className="text-lg text-white">{outline.chapterCount}章</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-xs" style={{ color: '#71717a' }}>核心冲突</div>
                    <div className="text-sm text-white">{outline.mainConflict}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-xs" style={{ color: '#71717a' }}>伏笔设置</div>
                    <div className="text-sm text-white">{outline.setup}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-xs" style={{ color: '#71717a' }}>高潮安排</div>
                    <div className="text-sm text-white">{outline.climax}</div>
                  </div>
                </div>
              )}

              {/* Saved Chapters */}
              {chapters.length > 0 && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xs font-medium mb-2" style={{ color: '#7c6af0' }}>已生成章节标题 ({chapters.length})</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {chapters.slice(0, 10).map((ch, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#a1a1aa' }}>
                        <span style={{ color: '#7c6af0' }}>第{ch.chapter}章</span>
                        <span>{ch.title}</span>
                        {ch.hook && <span className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(124,106,240,0.2)', color: '#a5b4fc' }}>{ch.hook}</span>}
                      </div>
                    ))}
                    {chapters.length > 10 && (
                      <div className="text-xs" style={{ color: '#71717a' }}>...还有 {chapters.length - 10} 章</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {outline && (
            <div className="flex gap-3 mt-6 px-6 pb-6">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: '#7c6af0', color: '#fff' }}
              >
                保存大纲
              </button>
            </div>
          )}
        </div>

        {/* 章节标题生成器 */}
        {showChapterTitles && (
          <ChapterTitleGenerator
            visible={showChapterTitles}
            onClose={() => setShowChapterTitles(false)}
            onApply={(newChapters) => {
              console.log('应用章节标题:', newChapters);
              setChapters(newChapters);
              if (onChaptersApply) {
                onChaptersApply(newChapters);
              }
              setShowChapterTitles(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default OutlineGenerator;