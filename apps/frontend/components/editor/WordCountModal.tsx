import React, { useMemo } from 'react';

interface Props {
  visible: boolean;
  onClose: () => void;
  chapters?: { id: number; title: string; content: string }[];
}

interface Stats {
  words: number;
  chars: number;
  charsNoSpace: number;
  paragraphs: number;
  lines: number;
  sentences: number;
}

const WordCountModal: React.FC<Props> = ({ visible, onClose, chapters = [] }) => {
  const stats = useMemo(() => {
    const allContent = chapters.map(c => c.content).join('\n');
    
    const charsNoSpace = allContent.replace(/\s/g, '').length;
    const chars = allContent.length;
    const paragraphs = allContent.split(/\n\s*\n/).filter(p => p.trim()).length;
    const lines = allContent.split('\n').length;
    const sentences = (allContent.match(/[.!?。！？]+/g) || []).length;
    const words = allContent.split(/\s+/).filter(w => w.length > 0).length;
    
    return { words, chars, charsNoSpace, paragraphs, lines, sentences };
  }, [chapters]);

  const chapterStats = useMemo(() => {
    return chapters.map(ch => {
      const content = ch.content;
      return {
        id: ch.id,
        title: ch.title,
        words: content.split(/\s+/).filter(w => w.length > 0).length,
        chars: content.length,
      };
    });
  }, [chapters]);

  const readingTime = Math.max(1, Math.ceil(stats.words / 200));

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        width: 520, maxHeight: '80vh', overflow: 'auto',
        background: '#16161c', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>📊</span>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>字数统计</span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#71717a', cursor: 'pointer',
            fontSize: 20
          }}>✕</button>
        </div>

        {/* Overall Stats */}
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 16, borderRadius: 12, background: '#1c1c24', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#7c6af0' }}>{stats.words.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>总词数</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, background: '#1c1c24', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#22c55e' }}>{stats.charsNoSpace.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>字符数</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, background: '#1c1c24', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#3b82f6' }}>{stats.paragraphs}</div>
              <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>段落数</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, background: '#1c1c24', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#f59e0b' }}>{readingTime}</div>
              <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>阅读分钟</div>
            </div>
          </div>

          {/* Detail Stats */}
          <div style={{ padding: 16, borderRadius: 12, background: '#1c1c24', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#71717a', fontSize: 13 }}>详细统计</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#71717a' }}>总字符（含空格）</span>
                <span style={{ color: '#e4e4e7' }}>{stats.chars.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#71717a' }}>总行数</span>
                <span style={{ color: '#e4e4e7' }}>{stats.lines.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#71717a' }}>总句子</span>
                <span style={{ color: '#e4e4e7' }}>{stats.sentences.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#71717a' }}>章节数</span>
                <span style={{ color: '#e4e4e7' }}>{chapters.length}</span>
              </div>
            </div>
          </div>

          {/* Chapter Breakdown */}
          {chapterStats.length > 0 && (
            <div style={{ padding: 16, borderRadius: 12, background: '#1c1c24' }}>
              <div style={{ fontSize: 13, color: '#71717a', marginBottom: 12 }}>各章统计</div>
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                {chapterStats.map(ch => (
                  <div key={ch.id} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13
                  }}>
                    <span style={{ color: '#e4e4e7', flex: 1 }}>{ch.title}</span>
                    <span style={{ color: '#71717a', marginLeft: 16 }}>{ch.words.toLocaleString()} 词</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordCountModal;