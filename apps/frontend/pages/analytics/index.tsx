'use client';

import React, { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Novel {
  id: number;
  book_id: string;
  title: string;
  word_count: number;
  chapter_count: number;
  status: number;
  last_update_time: string;
}

interface Chapter {
  id: number;
  title: string;
  content: string;
  word_count: number;
}

const Analytics: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/novels`);
      const data = await res.json();
      if (data.success) {
        setNovels(data.data || []);
        if (data.data?.length > 0) {
          setSelectedNovel(data.data[0]);
          fetchChapters(data.data[0].book_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch novels:', err);
    }
  };

  const fetchChapters = async (bookId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/books/${bookId}/chapters`);
      const data = await res.json();
      if (data.success) {
        setChapters(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch chapters:', err);
    }
  };

  const handleNovelChange = (novel: Novel) => {
    setSelectedNovel(novel);
    fetchChapters(novel.book_id);
  };

  const totalWords = chapters.reduce((sum, ch) => sum + (ch.content?.replace(/\s/g, '').length || 0), 0);
  const avgWordsPerChapter = chapters.length > 0 ? Math.round(totalWords / chapters.length) : 0;
  
  const simulateData = {
    views: Math.floor(Math.random() * 50000) + 10000,
    reads: Math.floor(Math.random() * 10000) + 1000,
    likes: Math.floor(Math.random() * 2000) + 100,
    comments: Math.floor(Math.random() * 500) + 20,
    revenue: (Math.random() * 500 + 50).toFixed(2),
  };

  const dailyStats = Array.from({ length: 7 }, (_, i) => ({
    day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
    views: Math.floor(Math.random() * 2000) + 500,
    words: Math.floor(Math.random() * 2000) + 500,
  }));

  const topChapters = [...chapters]
    .map(ch => ({ id: ch.id, title: ch.title, words: ch.content?.replace(/\s/g, '').length || 0 }))
    .sort((a, b) => b.words - a.words)
    .slice(0, 5);

  return (
    <div className="min-h-screen" style={{ background: '#0f0f12', color: '#e4e4e7' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">📊 数据统计</h1>
        <p className="text-sm mb-6" style={{ color: '#71717a' }}>作品数据分析与收益统计</p>

        {/* Novel Selection */}
        <div className="mb-6">
          <select
            value={selectedNovel?.id || ''}
            onChange={(e) => {
              const novel = novels.find(n => n.id === Number(e.target.value));
              if (novel) handleNovelChange(novel);
            }}
            className="w-full p-3 rounded-lg"
            style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7' }}
          >
            {novels.map(novel => (
              <option key={novel.id} value={novel.id}>{novel.title}</option>
            ))}
          </select>
        </div>

        {selectedNovel && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs mb-2" style={{ color: '#71717a' }}>总字数</div>
                <div className="text-xl font-bold" style={{ color: '#7c6af0' }}>{totalWords.toLocaleString()}</div>
                <div className="text-xs mt-1" style={{ color: '#52525b' }}>字</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs mb-2" style={{ color: '#71717a' }}>章节数</div>
                <div className="text-xl font-bold" style={{ color: '#22c55e' }}>{chapters.length}</div>
                <div className="text-xs mt-1" style={{ color: '#52525b' }}>章</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs mb-2" style={{ color: '#71717a' }}>阅读量</div>
                <div className="text-xl font-bold" style={{ color: '#f59e0b' }}>{(parseInt(simulateData.views) / 1000).toFixed(1)}k</div>
                <div className="text-xs mt-1" style={{ color: '#52525b' }}>人次</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs mb-2" style={{ color: '#71717a' }}>预估收益</div>
                <div className="text-xl font-bold" style={{ color: '#ef4444' }}>¥{simulateData.revenue}</div>
                <div className="text-xs mt-1" style={{ color: '#52525b' }}>今日</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Writing Stats */}
              <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-sm font-medium mb-4">写作趋势</h3>
                <div className="space-y-3">
                  {dailyStats.map((day, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs w-8" style={{ color: '#52525b' }}>{day.day}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(day.words / 2500) * 100}%`, background: '#7c6af0' }} />
                      </div>
                      <span className="text-xs w-12 text-right" style={{ color: '#71717a' }}>{day.words}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement */}
              <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-sm font-medium mb-4">互动数据</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(124,106,240,0.1)' }}>
                    <div className="text-xl font-bold" style={{ color: '#a78bfa' }}>{simulateData.likes}</div>
                    <div className="text-xs" style={{ color: '#52525b' }}>点赞</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <div className="text-xl font-bold" style={{ color: '#22c55e' }}>{simulateData.comments}</div>
                    <div className="text-xs" style={{ color: '#52525b' }}>评论</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <div className="text-xl font-bold" style={{ color: '#f59e0b' }}>{simulateData.reads}</div>
                    <div className="text-xs" style={{ color: '#52525b' }}>阅读</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.1)' }}>
                    <div className="text-xl font-bold" style={{ color: '#3b82f6' }}>{simulateData.views}</div>
                    <div className="text-xs" style={{ color: '#52525b' }}>浏览</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter Rankings */}
            <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-medium mb-4">章节字数排行</h3>
              <div className="space-y-3">
                {topChapters.map((ch, i) => (
                  <div key={ch.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.05)', color: i < 3 ? '#000' : '#71717a' }}>
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm truncate">{ch.title}</span>
                    <span className="text-xs" style={{ color: '#71717a' }}>{ch.words.toLocaleString()} 字</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;