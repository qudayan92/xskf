import React, { useState, useCallback } from 'react';
import { callAI } from '../../lib/ai';

interface Props {
  data: { keyword: string; selectedTitle: string; genre: string; subGenre: string };
  updateData: (patch: any) => void;
  onNext: () => void;
}

const GENRES = [
  { id: '玄幻', icon: '⚔️', subs: ['系统流', '无敌流', '重生流', '穿越流', '洪荒流', '修仙流'] },
  { id: '科幻', icon: '🚀', subs: ['硬科幻', '软科幻', '太空歌剧', '赛博朋克', '时间旅行', '星际探索'] },
  { id: '都市', icon: '🏙️', subs: ['神医流', '总裁文', '重生商战', '娱乐明星', '系统都市', '悬疑都市'] },
  { id: '历史', icon: '📜', subs: ['架空历史', '穿越历史', '战国秦汉', '三国演义', '唐宋明清', '民国风云'] },
  { id: '悬疑', icon: '🔍', subs: ['本格推理', '犯罪心理', '惊悚恐怖', '密室推理', '连环案件', '间谍谍战'] },
  { id: '言情', icon: '💕', subs: ['现代言情', '古代言情', '校园青春', '职场恋情', '豪门甜宠', '虐恋情深'] },
  { id: '奇幻', icon: '🧙', subs: ['西幻', '东方奇幻', 'DND风格', '克苏鲁', '蒸汽朋克', '低魔奇幻'] },
  { id: '军事', icon: '🎖️', subs: ['现代战争', '特种作战', '抗战题材', '冷战谍战', '未来战争', '佣兵传奇'] },
  { id: '游戏', icon: '🎮', subs: ['VR游戏', '数据流', '竞技游戏', '种田建设', '策略经营', '无限流'] },
];

const StepGenre: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [names, setNames] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [corpus, setCorpus] = useState<any>(null);

  const generateNames = useCallback(async () => {
    if (!data.keyword.trim()) return;
    setGenerating(true);
    try {
      const result = await callAI('/api/v1/ai/book-names', { keyword: data.keyword, genre: data.genre });
      if (result.success) setNames(result.data.names);
    } catch (e) {
      setNames([
        `${data.keyword}纪元`, `${data.keyword}传说`, `星际${data.keyword}`,
        `${data.keyword}觉醒`, `无尽${data.keyword}`, `${data.keyword}·起源`,
        `第1${data.keyword}`, `${data.keyword}：命运`, `穿越之${data.keyword}`, `巅峰${data.keyword}`
      ]);
    }
    setGenerating(false);
  }, [data.keyword, data.genre]);

  const loadCorpus = useCallback(async (genre: string) => {
    try {
      const result = await callAI('/api/v1/ai/genre-corpus', { genre });
      if (result.success) setCorpus(result.data);
    } catch {}
  }, []);

  const handleGenreChange = (genre: string) => {
    updateData({ genre, subGenre: '', selectedTitle: '' });
    setNames([]);
    loadCorpus(genre);
  };

  const currentGenre = GENRES.find(g => g.id === data.genre);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">构思你的作品</h1>
        <p className="text-gray-500 text-sm">输入核心词，AI 为你生成符合网文趋势的书名</p>
      </div>

      {/* Book Name Generator */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          💡 输入核心词
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={data.keyword}
            onChange={e => updateData({ keyword: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && generateNames()}
            placeholder="如：星际、修仙、重生、穿越..."
            className="flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all focus:ring-2"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', '--tw-ring-color': '#7c6af0' } as React.CSSProperties}
            maxLength={20}
          />
          <button
            onClick={generateNames}
            disabled={generating || !data.keyword.trim()}
            className="px-5 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
            style={{ background: generating ? '#374151' : '#7c6af0' }}
          >
            {generating ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
            ) : '🔮'}
            AI生成书名
          </button>
        </div>

        {/* Generated Names */}
        {names.length > 0 && (
          <div className="mt-5">
            <p className="text-xs text-gray-500 mb-3">AI 推荐书名（点击选用）：</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {names.map((name, i) => (
                <button
                  key={i}
                  onClick={() => updateData({ selectedTitle: name })}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    data.selectedTitle === name ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    background: data.selectedTitle === name ? '#7c6af0' : 'rgba(255,255,255,0.04)',
                    border: data.selectedTitle === name ? '1px solid #7c6af0' : '1px solid transparent',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom title input */}
        {data.selectedTitle && (
          <div className="mt-4 p-3 rounded-lg flex items-center justify-between" style={{ background: 'rgba(124,106,240,0.08)', border: '1px solid rgba(124,106,240,0.15)' }}>
            <span className="text-sm text-gray-300">已选择：</span>
            <span className="font-medium" style={{ color: '#a78bfa' }}>{data.selectedTitle}</span>
          </div>
        )}
      </div>

      {/* Genre Selection */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          📚 作品类型与流派
        </label>

        {/* Main Genres */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
          {GENRES.map(g => (
            <button
              key={g.id}
              onClick={() => handleGenreChange(g.id)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                data.genre === g.id ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
              style={{
                background: data.genre === g.id ? '#7c6af0' : 'rgba(255,255,255,0.04)',
                border: data.genre === g.id ? '1px solid #7c6af0' : '1px solid transparent',
              }}
            >
              <span>{g.icon}</span>{g.id}
            </button>
          ))}
        </div>

        {/* Sub-genres */}
        {currentGenre && (
          <div>
            <p className="text-xs text-gray-500 mb-2">{currentGenre.id} · 流派细分</p>
            <div className="flex flex-wrap gap-2">
              {currentGenre.subs.map(sub => (
                <button
                  key={sub}
                  onClick={() => updateData({ subGenre: sub })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    data.subGenre === sub ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                  style={{
                    background: data.subGenre === sub ? 'rgba(124,106,240,0.25)' : 'rgba(255,255,255,0.04)',
                    border: data.subGenre === sub ? '1px solid rgba(124,106,240,0.3)' : '1px solid transparent',
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Corpus keywords */}
        {corpus && corpus.keywords && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs text-gray-500 mb-2">🏷️ 热门关键词（已加载{data.genre}语料库）</p>
            <div className="flex flex-wrap gap-1.5">
              {corpus.keywords.map((kw: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs text-gray-500" style={{ background: 'rgba(255,255,255,0.04)' }}>{kw}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!data.selectedTitle}
          className="px-8 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-30"
          style={{ background: '#7c6af0' }}
        >
          下一步 →
        </button>
      </div>
    </div>
  );
};

export default StepGenre;