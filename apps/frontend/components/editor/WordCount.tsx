'use client';

interface WordCountProps {
  content: string;
  chapterCount: number;
  totalWords: number;
}

export function WordCount({ content, chapterCount, totalWords }: WordCountProps) {
  const charCount = content.length;
  const lineCount = content ? content.split('\n').length : 0;
  const readTime = Math.max(1, Math.ceil(charCount / 500));

  const stats = [
    { label: '字符', value: charCount.toLocaleString() },
    { label: '行数', value: lineCount.toLocaleString() },
    { label: '阅读', value: `${readTime} 分钟` },
    { label: '章节', value: chapterCount },
    { label: '总字数', value: totalWords.toLocaleString() },
  ];

  return (
    <div className="status-bar">
      {stats.map((stat, i) => (
        <span key={stat.label} className="flex items-center gap-1">
          {i > 0 && <span className="status-divider" />}
          <span className="text-[var(--text-muted)] text-xs">{stat.label}</span>
          <span className="text-[var(--text-secondary)] text-xs font-medium">{stat.value}</span>
        </span>
      ))}
      <style>{`
        .status-bar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 16px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--glass-border);
        }
        .status-divider {
          width: 1px;
          height: 10px;
          background: var(--glass-border);
          margin: 0 6px;
        }
      `}</style>
    </div>
  );
}
