'use client';

import { Sparkles, ChevronRight, Wand2, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AIPanelProps {
  aiLoading: string | null;
  aiResult: string | null;
  hasContent: boolean;
  onContinue: () => void;
  onPolish: () => void;
  onExpand: () => void;
  onAppend: () => void;
  onReplace: () => void;
  onClear: () => void;
}

export function AIPanel({
  aiLoading, aiResult, hasContent,
  onContinue, onPolish, onExpand,
  onAppend, onReplace, onClear,
}: AIPanelProps) {
  const actions = [
    { key: 'continue', label: '续写', desc: '基于当前内容继续创作', icon: BookOpen, handler: onContinue },
    { key: 'polish', label: '润色', desc: '优化文字表达与修辞', icon: Wand2, handler: onPolish, needsContent: true },
    { key: 'expand', label: '扩展', desc: '丰富场景与细节描写', icon: FileText, handler: onExpand, needsContent: true },
  ];

  return (
    <div className="p-4">
      <div className="sidebar-title">AI 写作助手</div>

      {/* AI Action Buttons */}
      <div className="flex flex-col gap-2 mb-4">
        {actions.map((action) => {
          const isLoading = aiLoading === action.key;
          const disabled = !!aiLoading || (action.needsContent && !hasContent);

          return (
            <button
              key={action.key}
              className={cn('ai-action-btn', isLoading && 'loading')}
              onClick={action.handler}
              disabled={disabled}
            >
              <action.icon size={16} />
              <div className="text-left flex-1">
                <div className="text-sm font-medium">{action.label}</div>
                <div className="text-xs text-[var(--text-muted)]">{action.desc}</div>
              </div>
              {isLoading ? (
                <div className="ai-spinner" />
              ) : (
                <ChevronRight size={14} className="text-[var(--text-muted)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* AI Result — chat bubble style */}
      {aiResult && (
        <div className="ai-bubble">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)]">
              <Sparkles size={14} />
              AI 生成结果
            </div>
            <button className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]" onClick={onClear}>
              清除
            </button>
          </div>
          <div className="ai-result-text text-sm text-[var(--text-secondary)] mb-3">
            {aiResult.slice(0, 300)}{aiResult.length > 300 ? '...' : ''}
          </div>
          <div className="flex gap-2">
            <Button variant="primary" className="flex-1 text-xs" onClick={onAppend}>
              追加到文末
            </Button>
            <Button variant="secondary" className="flex-1 text-xs" onClick={onReplace}>
              替换全文
            </Button>
          </div>
        </div>
      )}

      {!aiResult && !aiLoading && (
        <div className="text-center py-8 text-sm text-[var(--text-muted)]">
          <Sparkles size={24} className="mx-auto mb-2 opacity-40" />
          选择一个 AI 动作来辅助写作
        </div>
      )}
    </div>
  );
}
