import React, { useState, useCallback } from 'react';
import { callAI } from '../../lib/ai';

interface Props {
  visible: boolean;
  context: string;
  onSelect: (branch: any) => void;
  onClose: () => void;
}

const BranchPanel: React.FC<Props> = ({ visible, context, onSelect, onClose }) => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adopting, setAdopting] = useState<string | null>(null);

  const riskColors: Record<string, string> = {
    '高': '#ef4444', '中': '#f59e0b', '低': '#22c55e',
  };

  const fallbackBranches = [
    { id: 'A', title: '直接行动', description: '主角决定不再犹豫，主动出击，探索未知的真相。', consequence: '可能暴露自身位置，引来敌人的注意，但也能获得关键线索。', riskLevel: '高' },
    { id: 'B', title: '暗中调查', description: '主角选择隐藏意图，在暗中收集更多信息，寻找更好的时机。', consequence: '获得更多信息，但可能错过最佳时机，让对方先发制人。', riskLevel: '中' },
    { id: 'C', title: '求助盟友', description: '主角决定向可信的同伴求助，共同面对当前的困境。', consequence: '增强实力，但可能泄露秘密，或者被出卖。', riskLevel: '低' },
  ];

  const generateBranches = useCallback(async () => {
    setLoading(true);
    try {
      const result = await callAI('/api/v1/ai/branch-plot', { context, chapterTitle: '' });
      setBranches(result.success && result.data.branches ? result.data.branches : fallbackBranches);
    } catch {
      setBranches(fallbackBranches);
    }
    setLoading(false);
  }, [context]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden" style={{
        background: '#14141c',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎭</span>
            <span className="font-semibold text-white">剧情推演</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-sm">✕</button>
        </div>

        {/* Context */}
        <div className="px-6 py-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-xs text-gray-500 mb-1">当前卡文点：</p>
          <p className="text-sm text-gray-300 line-clamp-2">{context || '请输入当前卡文的段落...'}</p>
        </div>

        {/* Generate button */}
        {!branches.length && (
          <div className="px-6 py-6 text-center">
            <button
              onClick={generateBranches}
              disabled={loading}
              className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all"
              style={{ background: loading ? '#374151' : 'linear-gradient(135deg, #7c6af0, #a78bfa)' }}
            >
              {loading ? (
                <><svg className="animate-spin w-4 h-4 inline mr-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3"/></svg>AI 推演中...</>
              ) : '🔮 AI 推演 3 个走向'}
            </button>
          </div>
        )}

        {/* Branch options */}
        {branches.length > 0 && (
          <div className="px-6 py-4 space-y-3">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="p-4 rounded-xl transition-all hover:scale-[1.01]"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${adopting === branch.id ? 'rgba(124,106,240,0.4)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Option badge */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${riskColors[branch.riskLevel]}30, ${riskColors[branch.riskLevel]}10)`, color: riskColors[branch.riskLevel] }}
                  >
                    方案{branch.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white text-sm">{branch.title}</h4>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{
                        background: `${riskColors[branch.riskLevel]}15`,
                        color: riskColors[branch.riskLevel],
                      }}>
                        风险:{branch.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">📍 {branch.description}</p>
                    <div className="flex items-start gap-1.5 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <span className="text-xs" style={{ color: '#f59e0b' }}>→ 后果：</span>
                      <span className="text-xs" style={{ color: '#71717a' }}>{branch.consequence}</span>
                    </div>

                    <button
                      onClick={() => { setAdopting(branch.id); onSelect(branch); }}
                      disabled={!!adopting}
                      className="mt-2 w-full py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                      style={{
                        background: adopting === branch.id ? '#22c55e' : 'rgba(124,106,240,0.15)',
                        color: adopting === branch.id ? '#fff' : '#a78bfa',
                        border: `1px solid ${adopting === branch.id ? '#22c55e' : 'rgba(124,106,240,0.2)'}`,
                      }}
                    >
                      {adopting === branch.id ? '✓ 已采用' : '采用此方案'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Regenerate */}
            <button
              onClick={() => { setBranches([]); setAdopting(null); }}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              🔄 重新推演
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchPanel;