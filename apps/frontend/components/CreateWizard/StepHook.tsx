import React, { useState, useCallback } from 'react';
import { callAI } from '../../lib/ai';

interface Props {
  data: { hook: string; summary: string; genre: string; title: string };
  updateData: (patch: any) => void;
  onNext: () => void;
}

const StepHook: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [expanding, setExpanding] = useState(false);

  const expandHook = useCallback(async () => {
    if (!data.hook.trim()) return;
    setExpanding(true);
    try {
      const result = await callAI('/api/v1/ai/expand-hook', { hook: data.hook, genre: data.genre, title: data.title });
      if (result.success) {
        updateData({ summary: result.data.summary });
      }
    } catch {
      const fallback = `在${data.genre}的世界里，${data.hook}。这是一个关于勇气、成长与抉择的故事。主角将面临前所未有的挑战，在困境中寻找希望，在黑暗中追寻光明。随着剧情的推进，隐藏的真相逐渐浮出水面，而每一个选择都将影响最终的命运……`;
      updateData({ summary: fallback });
    }
    setExpanding(false);
  }, [data.hook, data.genre, data.title, updateData]);

  const hooks = [
    '穿越星际发现未知文明信号',
    '重生回到十年前改变命运',
    '获得神秘系统开启逆袭之路',
    '意外卷入宫廷权谋漩涡',
    '在末世中建立最后避难所',
    '觉醒超能力却被组织追捕',
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">核心看点</h1>
        <p className="text-gray-500 text-sm">用一句话概括你作品最吸引人的钩子</p>
      </div>

      {/* Hook Input */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">🎯 核心看点（≤20字）</label>
          <span className={`text-xs ${data.hook.length > 20 ? 'text-red-400' : 'text-gray-500'}`}>
            {data.hook.length}/20
          </span>
        </div>

        <input
          type="text"
          value={data.hook}
          onChange={e => updateData({ hook: e.target.value })}
          placeholder="如：穿越星际发现未知文明信号..."
          className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all focus:ring-2"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', '--tw-ring-color': '#7c6af0' } as React.CSSProperties}
          maxLength={20}
        />

        {/* Quick pick hooks */}
        <div className="mt-3 flex flex-wrap gap-2">
          {hooks.map((h, i) => (
            <button
              key={i}
              onClick={() => updateData({ hook: h })}
              className="px-3 py-1 rounded-full text-xs transition-all"
              style={{
                color: data.hook === h ? '#a78bfa' : '#71717a',
                background: data.hook === h ? 'rgba(124,106,240,0.15)' : 'rgba(255,255,255,0.04)',
                border: data.hook === h ? '1px solid rgba(124,106,240,0.25)' : '1px solid transparent',
              }}
            >
              + {h.slice(0, 12)}...
            </button>
          ))}
        </div>
      </div>

      {/* AI Expand Button */}
      <div className="flex justify-center">
        <button
          onClick={expandHook}
          disabled={!data.hook.trim() || expanding}
          className="px-8 py-3.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-30 flex items-center gap-2"
          style={{ background: expanding ? '#374151' : 'linear-gradient(135deg, #7c6af0, #a78bfa)' }}
        >
          {expanding ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
              AI 正在扩写...
            </>
          ) : (
            <>✨ AI 扩写为300字简介</>
          )}
        </button>
      </div>

      {/* Summary Preview / Editor */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">📝 作品简介</label>
          {data.summary && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>
              {data.summary.length} 字
            </span>
          )}
        </div>

        {!data.summary ? (
          <div className="text-center py-10" style={{ color: '#3f3f46' }}>
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm">输入核心看点后点击「AI扩写」自动生成简介</p>
            <p className="text-xs mt-1" style={{ color: '#27272a' }}>或直接在此处手动编写</p>
          </div>
        ) : (
          <textarea
            value={data.summary}
            onChange={e => updateData({ summary: e.target.value })}
            rows={8}
            className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none resize-none leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', '--tw-ring-color': '#7c6af0' } as React.CSSProperties}
            placeholder="AI生成的简介，您可以手动编辑调整..."
          />
        )}

        {/* Manual input fallback when no AI expansion yet */}
        {!data.summary && data.hook && (
          <textarea
            value={data.summary}
            onChange={e => updateData({ summary: e.target.value })}
            rows={5}
            placeholder="或者直接在此手动编写简介..."
            className="w-full mt-3 px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none resize-none leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        )}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '💡', title: '制造悬念', desc: '开篇留下未解之谜' },
          { icon: '⚡', title: '冲突前置', desc: '第一章就展现核心矛盾' },
          { icon: '❤️', title: '情感共鸣', desc: '让读者代入主角视角' },
        ].map((tip, i) => (
          <div key={i} className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-lg mb-1">{tip.icon}</div>
            <div className="text-xs font-medium text-gray-300">{tip.title}</div>
            <div className="text-xs mt-0.5" style={{ color: '#3f3f46' }}>{tip.desc}</div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!data.hook.trim()}
          className="px-8 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-30"
          style={{ background: '#7c6af0' }}
        >
          下一步 →
        </button>
      </div>
    </div>
  );
};

export default StepHook;