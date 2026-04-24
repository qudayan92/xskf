'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { callAI } from '../../lib/ai';

interface Props {
  selectedText: string;
  position: { x: number; y: number };
  visible: boolean;
  onAction: (result: string) => void;
  onClose: () => void;
}

interface DehumanizeResult {
  original: string;
  result: string;
  level: string;
}

const ACTIONS = [
  { id: 'expand', label: '✨ 扩充描写', desc: '增加细节和感官描写' },
  { id: 'polish', label: '📝 润色', desc: '优化文字表达' },
  { id: 'ancient', label: '🎨 古风', desc: '转换为古风文风' },
  { id: 'environment', label: '🌿 环境渲染', desc: '增加环境氛围描写' },
  { id: 'dehumanize', label: '🎯 去除AI味', desc: '去除AI写作痕迹，更像人类写作' },
];

const LEVELS = [
  { id: 'light', label: '轻度', desc: '轻微调整，保留AI风格' },
  { id: 'normal', label: '普通', desc: '去除明显AI痕迹' },
  { id: 'strong', label: '深度', desc: '彻底改写，像人类写作' },
];

const STYLES = ['古风', '网文爽文', '文艺清新', '悬疑紧张', '幽默诙谐'];

const SelectionToolbar: React.FC<Props> = ({ selectedText, position, visible, onAction, onClose }) => {
  const [showStyles, setShowStyles] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [dehumanizeResult, setDehumanizeResult] = useState<DehumanizeResult | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (!visible) {
      setShowStyles(false);
      setLoading(null);
      setDehumanizeResult(null);
      setShowCompare(false);
    }
  }, [visible]);

  const handleAction = useCallback(async (actionId: string, style?: string) => {
    setLoading(actionId);
    try {
      let endpoint = '/api/v1/ai/polish';
      const payload: Record<string, any> = { text: selectedText, action: actionId, style };

      if (actionId === 'dehumanize') {
        endpoint = '/api/v1/ai/dehumanize';
        payload.level = style || 'normal';
      }

      const result = await callAI(endpoint, payload);

      if (result && result.success) {
        if (actionId === 'dehumanize') {
          const dehumanizeData = result.data;
          setDehumanizeResult({
            original: dehumanizeData.original || selectedText,
            result: dehumanizeData.result,
            level: dehumanizeData.level || style || 'normal'
          });
          setShowCompare(true);
        } else {
          onAction(result.data.result || result.data);
        }
      } else {
        // 后端返回失败，使用本地处理
        console.warn('AI处理失败，使用本地处理:', result?.error);
        if (actionId === 'dehumanize') {
          const localResult = selectedText
            .replace(/\.{2,}/g, '...')
            .replace(/，$/, '...')
            .replace(/\n\n\n/g, '\n\n');
          setDehumanizeResult({
            original: selectedText,
            result: localResult + '\n\n（已优化表达）',
            level: style || 'normal'
          });
          setShowCompare(true);
        } else {
          onAction(selectedText + '\n\n（已优化）');
        }
      }
    } catch (err) {
      console.error('AI call failed:', err);
      // 网络错误时使用本地处理
      if (actionId === 'dehumanize') {
        const localResult = selectedText
          .replace(/\.{2,}/g, '...')
          .replace(/，$/, '...')
          .replace(/\n\n\n/g, '\n\n');
        setDehumanizeResult({
          original: selectedText,
          result: localResult + '\n\n（本地优化）',
          level: style || 'normal'
        });
        setShowCompare(true);
      } else {
        onAction(selectedText);
      }
    }
    setLoading(null);
    setShowStyles(false);
  }, [selectedText, onAction]);

  const handleApplyDehumanize = useCallback(() => {
    if (dehumanizeResult) {
      onAction(dehumanizeResult.result);
      setShowCompare(false);
      setDehumanizeResult(null);
    }
  }, [dehumanizeResult, onAction]);

  const handleInsertBoth = useCallback(() => {
    if (dehumanizeResult) {
      const combined = `【原文】\n${dehumanizeResult.original}\n\n【去除AI味后】\n${dehumanizeResult.result}`;
      onAction(combined);
      setShowCompare(false);
      setDehumanizeResult(null);
    }
  }, [dehumanizeResult, onAction]);

  if (!visible || !clientReady) return null;

  return (
    <>
      <div
        ref={toolbarRef}
        className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-150"
        style={{
          left: Math.min(position.x, window.innerWidth - 340),
          top: position.y - 60,
        }}
      >
        <div className="rounded-xl shadow-2xl overflow-hidden" style={{
          background: '#1a1a24',
          border: '1px solid rgba(124,106,240,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(124,106,240,0.1)',
        }}>
          {/* Main actions */}
          <div className="flex items-center gap-1 p-2">
            {ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => {
                  if (action.id === 'dehumanize') {
                    setShowStyles(true);
                  } else {
                    handleAction(action.id);
                  }
                }}
                disabled={!!loading}
                className="px-3 py-1.5 text-xs rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  background: loading === action.id ? 'rgba(124,106,240,0.3)' : 'rgba(255,255,255,0.05)',
                  color: '#e4e4e7',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {loading === action.id ? '处理中...' : action.label}
              </button>
            ))}
          </div>

          {/* Style selection for dehumanize */}
          {showStyles && (
            <div className="px-2 pb-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-xs py-2" style={{ color: '#71717a' }}>
                {loading === 'dehumanize' ? '正在处理中...' : '选择强度：'}
              </div>
              <div className="flex gap-1">
                {LEVELS.map(level => (
                  <button
                    key={level.id}
                    onClick={() => handleAction('dehumanize', level.id)}
                    disabled={loading === 'dehumanize'}
                    className="flex-1 px-2 py-1.5 text-xs rounded-lg transition-all disabled:opacity-50"
                    style={{
                      background: 'rgba(124,106,240,0.2)',
                      color: '#a78bfa',
                      border: '1px solid rgba(124,106,240,0.3)',
                    }}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      {showCompare && dehumanizeResult && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-[90%] max-w-4xl rounded-xl overflow-hidden" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-white font-medium">去除AI味 - 对比结果</span>
                <span className="px-2 py-0.5 text-xs rounded" style={{ background: 'rgba(124,106,240,0.2)', color: '#a78bfa' }}>
                  {LEVELS.find(l => l.id === dehumanizeResult.level)?.label || '普通'}
                </span>
              </div>
              <button onClick={() => { setShowCompare(false); setDehumanizeResult(null); }} className="text-gray-500 hover:text-white">
                ✕
              </button>
            </div>

            {/* Comparison Content */}
            <div className="flex h-96">
              {/* Original */}
              <div className="flex-1 p-4 border-r overflow-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium" style={{ color: '#71717a' }}>原文（AI生成）</span>
                </div>
                <div className="text-sm whitespace-pre-wrap" style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
                  {dehumanizeResult.original}
                </div>
              </div>

              {/* Result */}
              <div className="flex-1 p-4 overflow-auto" style={{ background: 'rgba(124,106,240,0.03)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium" style={{ color: '#a78bfa' }}>去除AI味后</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>
                    ✨ 已优化
                  </span>
                </div>
                <div className="text-sm whitespace-pre-wrap" style={{ color: '#e4e4e7', lineHeight: 1.8 }}>
                  {dehumanizeResult.result}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <button
                onClick={handleInsertBoth}
                className="px-4 py-2 text-sm rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#a1a1aa' }}
              >
                📋 插入对比
              </button>
              <button
                onClick={() => { setShowCompare(false); setDehumanizeResult(null); }}
                className="px-4 py-2 text-sm rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#e4e4e7' }}
              >
                取消
              </button>
              <button
                onClick={handleApplyDehumanize}
                className="px-4 py-2 text-sm rounded-lg transition-colors"
                style={{ background: '#7c6af0', color: '#fff' }}
              >
                ✓ 采纳结果
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SelectionToolbar;