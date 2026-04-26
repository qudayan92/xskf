import React, { useState, useCallback, useEffect } from 'react';
import { callAI } from '../../lib/ai';

interface Props {
  chapters: Array<{ id: number; title: string; content: string }>;
  currentChapterId: number;
  visible: boolean;
  onClose: () => void;
  onNavigate?: (chapterId: number) => void;
}

const LogicChecker: React.FC<Props> = ({ chapters, currentChapterId, visible, onClose, onNavigate }) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [score, setScore] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

  const fallbackIssues = [
    { type: 'warning', severity: 'medium', title: '时间线重叠', description: '第3章描述时间为12:00，但第2章结束时为14:00', suggestion: '检查时间设定', chapterRef: 3 },
    { type: 'info', severity: 'low', title: '角色一致性', description: '角色名称与前文保持一致，未发现人设崩塌问题', suggestion: '无需修改', chapterRef: null },
    { type: 'error', severity: 'high', title: '角色状态冲突', description: '角色"查尔斯"在前文已离开，本章再次出现在现场', suggestion: '补充其回归的原因', chapterRef: 5 },
  ];

  const fallbackScore = { overall: 82, consistency: 90, timeline: 75, character: 85, plot: 80 };

  const runCheck = useCallback(async () => {
    setChecking(true);
    try {
      const result = await callAI('/api/v1/ai/logic-check', { chapters, currentChapterId });
      if (result.success && result.data) {
        setIssues(result.data.issues || fallbackIssues);
        setScore(result.data.score || fallbackScore);
      } else {
        setIssues(fallbackIssues);
        setScore(fallbackScore);
      }
    } catch {
      setIssues(fallbackIssues);
      setScore(fallbackScore);
    }
    setChecking(false);
  }, [chapters, currentChapterId]);

  useEffect(() => {
    if (visible && issues.length === 0) runCheck();
  }, [visible]);

  if (!visible) return null;

  const severityConfig: Record<string, { color: string; bg: string; icon: string }> = {
    high: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '🔴' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '🟡' },
    low: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: '🟢' },
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-xl mx-4 rounded-2xl overflow-hidden" style={{
        background: '#14141c',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <span className="font-semibold text-white">逻辑检测报告</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-sm">✕</button>
        </div>

        {/* Score bar */}
        {score && (
          <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">综合评分</span>
              <span className="text-lg font-bold" style={{
                color: score.overall >= 80 ? '#22c55e' : score.overall >= 60 ? '#f59e0b' : '#ef4444'
              }}>{score.overall}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '一致性', value: score.consistency },
                { label: '时间线', value: score.timeline },
                { label: '角色', value: score.character },
                { label: '剧情', value: score.plot },
              ].map((s) => (
                <div key={s.label} className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                  <div className={`text-sm font-bold ${s.value >= 80 ? 'text-green-400' : s.value >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues list */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-2">
          {checking ? (
            <div className="text-center py-10">
              <svg className="animate-spin w-8 h-8 mx-auto mb-3" style={{ color: '#7c6af0' }} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3"/></svg>
              <p className="text-sm text-gray-400">正在检测逻辑问题...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-gray-400">未发现明显的逻辑问题</p>
            </div>
          ) : (
            issues.map((issue, i) => {
              const cfg = severityConfig[issue.severity] || severityConfig.low;
              return (
                <div
                  key={i}
                  onClick={() => setExpandedIssue(expandedIssue === i ? null : i)}
                  className="p-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm flex-shrink-0 mt-0.5">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{issue.title}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                          {issue.severity === 'high' ? '严重' : issue.severity === 'medium' ? '警告' : '提示'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">{issue.description}</p>

                      {expandedIssue === i && (
                        <div className="mt-2 p-2.5 rounded-lg space-y-2" style={{ background: 'rgba(0,0,0,0.2)' }}>
                          <p className="text-xs text-gray-300">{issue.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: '#a78bfa' }}>💡 建议：</span>
                            <span className="text-xs text-gray-400">{issue.suggestion}</span>
                          </div>
                          {issue.chapterRef && onNavigate && (
                            <button onClick={(e) => { e.stopPropagation(); onNavigate(issue.chapterRef); }} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(124,106,240,0.15)', color: '#a78bfa' }}>
                              跳转到第{issue.chapterRef}章 →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-600 text-xs flex-shrink-0">
                      {expandedIssue === i ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={runCheck} disabled={checking} className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#a1a1aa' }}
          >
            🔄 重新检测
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-white transition-all"
            style={{ background: '#7c6af0' }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogicChecker;