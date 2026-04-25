import React, { useState, useCallback } from 'react';
import { callAI } from '../../lib/ai';

interface Props {
  data: { 
    outline: string; 
    outlineStructure: string;
    genre: string; 
    title: string 
  };
  updateData: (patch: any) => void;
  onNext: () => void;
}

const STRUCTURES = [
  { id: 'single', label: '单幕式', desc: '线性叙事，一个核心冲突' },
  { id: 'dual', label: '双幕式', desc: '建置+对抗，经典三段式' },
  { id: 'three', label: '三幕式', desc: '开头-中段-结尾，好莱坞经典' },
  { id: 'five', label: '五幕式', desc: '起承转合，亚洲常用结构' },
];

const StepOutline: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [expanding, setExpanding] = useState(false);

  const expandOutline = useCallback(async () => {
    if (!data.outline.trim()) return;
    setExpanding(true);
    try {
      const result = await callAI('/api/v1/ai/book-outline', { 
        outline: data.outline, 
        genre: data.genre,
        title: data.title,
        structure: data.outlineStructure,
      });
      if (result.success) {
        updateData({ summary: result.data.outline });
      }
    } catch {
      const fallback = `第一幕：主角${data.outline}，遇到转折点\n第二幕：面对挑战，逐步成长\n第三幕：最终对决，解决问题`;
      updateData({ summary: fallback });
    }
    setExpanding(false);
  }, [data.outline, data.genre, data.title, data.outlineStructure, updateData]);

  const quickOutlines = [
    '穿越星际寻找人类新家园',
    '获得系统逆袭之路',
    '重生改变家族命运',
    '卷入宫廷权谋争斗',
    '觉醒能力守护世界',
    '探索未知文明真相',
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">规划故事大纲</h1>
        <p className="text-gray-500 text-sm">设计故事主线和情节结构</p>
      </div>

      {/* Outline Structure */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          📐 选择叙事结构
        </label>
        <div className="grid grid-cols-4 gap-3">
          {STRUCTURES.map(s => (
            <button
              key={s.id}
              onClick={() => updateData({ outlineStructure: s.id })}
              className="p-3 rounded-xl text-left transition-all"
              style={{
                background: data.outlineStructure === s.id ? 'rgba(124,106,240,0.15)' : 'rgba(255,255,255,0.04)',
                border: data.outlineStructure === s.id ? '1px solid rgba(124,106,240,0.3)' : '1px solid transparent',
              }}
            >
              <div className="text-sm font-medium" style={{ color: data.outlineStructure === s.id ? '#a78bfa' : '#e4e4e7' }}>
                {s.label}
              </div>
              <div className="text-xs mt-1" style={{ color: '#71717a' }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Outline */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">📋 主线剧情（≤30字）</label>
          <span className={`text-xs ${data.outline.length > 30 ? 'text-red-400' : 'text-gray-500'}`}>
            {data.outline.length}/30
          </span>
        </div>

        <textarea
          value={data.outline}
          onChange={e => updateData({ outline: e.target.value })}
          placeholder="如：穿越星际发现未知文明，带领人类寻找新家园..."
          className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all resize-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 100 }}
          maxLength={30}
        />

        {/* Quick pick */}
        <div className="mt-3 flex flex-wrap gap-2">
          {quickOutlines.map((o, i) => (
            <button
              key={i}
              onClick={() => updateData({ outline: o })}
              className="px-3 py-1 rounded-full text-xs transition-all"
              style={{
                color: data.outline === o ? '#a78bfa' : '#71717a',
                background: data.outline === o ? 'rgba(124,106,240,0.15)' : 'rgba(255,255,255,0.04)',
                border: data.outline === o ? '1px solid rgba(124,106,240,0.25)' : '1px solid transparent',
              }}
            >
              + {o.slice(0, 12)}...
            </button>
          ))}
        </div>
      </div>

      {/* AI Expand Button */}
      <div className="flex justify-center">
        <button
          onClick={expandOutline}
          disabled={!data.outline.trim() || expanding}
          className="px-8 py-3.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-30 flex items-center gap-2"
          style={{ background: expanding ? '#374151' : 'linear-gradient(135deg, #7c6af0, #a78bfa)' }}
        >
          {expanding ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
              AI 正在生成大纲...
            </>
          ) : (
            <>✨ AI 生成详细大纲</>
          )}
        </button>
      </div>

      {/* Next Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onNext}
          disabled={!data.outline.trim()}
          className="px-10 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 disabled:opacity-30"
          style={{ background: data.outline.trim() ? '#7c6af0' : '#374151' }}
        >
          下一步：创建角色 →
        </button>
      </div>
    </div>
  );
};

export default StepOutline;