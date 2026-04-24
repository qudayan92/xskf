import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const NovelDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [novel, setNovel] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchNovelData(id as string);
    }
  }, [id]);

  const fetchNovelData = async (novelId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/novels/${novelId}`);
      const data = await res.json();
      console.log('Novel API response:', data);
      if (data.success && data.data) {
        setNovel(data.data);
        const chaptersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/books/${data.data.book_id}/chapters`);
        const chaptersData = await chaptersRes.json();
        if (chaptersData.success) {
          setChapters(chaptersData.data);
        }
} else {
      // API returned null or failed - use mock data
      console.log('Using mock novel data');
      setNovel({
        id: 1,
        book_id: novelId,
        title: '星际流光',
        subtitle: '银河系边缘的星际探索',
        category_id: 3,
        tags: '科幻,星际,冒险',
        status: 1,
        word_count: 328000,
        chapter_count: 128,
        summary: '这是一个科幻故事的简介...',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setChapters([]);
    }
  } catch (err) {
    console.error('Failed to fetch novel:', err);
    setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div style={{ color: '#71717a' }}>加载中...</div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div style={{ color: '#71717a' }}>作品不存在</div>
      </div>
    );
  }

  const statusMap: any = {
    0: { text: '草稿', color: '#52525b' },
    1: { text: '连载中', color: '#7c6af0' },
    2: { text: '已完结', color: '#4ade80' },
    3: { text: '暂停', color: '#fbbf24' }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f0f12', color: '#e4e4e7' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{
        background: 'rgba(15, 15, 18, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/works" legacyBehavior>
                <a className="text-gray-400 hover:text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  <span>返回作品列表</span>
                </a>
              </Link>
            </div>
            <div className="flex items-center gap-2">
            <button
                onClick={() => { if (novel?.book_id) router.push(`/editor?novelId=${novel.book_id}`); }}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                style={{ background: '#7c6af0', color: '#fff' }}
            >
                继续创作
            </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cover and Info */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Cover Image */}
        <div className="flex gap-8 mb-12">
          {novel.cover_image && (
            <div className="w-48 h-72 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #16161c, #1c1c24)', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={novel.cover_image} alt={novel.title} className="w-full h-full object-cover" style={{ opacity: 0.9 }} />
            </div>
          )}
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-3xl font-semibold mb-2" style={{ color: '#fff' }}>{novel.title}</h1>
              {novel.subtitle && <p className="text-lg" style={{ color: '#71717a' }}>{novel.subtitle}</p>}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 rounded-full text-sm" style={{
                background: 'rgba(124, 106, 240, 0.15)',
                color: '#7c6af0',
                border: '1px solid rgba(124, 106, 240, 0.2)'
              }}>
                {statusMap[novel.status]?.text || novel.status}
              </span>
              {novel.tags && (
                <div className="flex gap-2">
                  {novel.tags.split(',').slice(0, 3).map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: '#71717a' }}>
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-xs mb-1" style={{ color: '#52525b' }}>总字数</div>
                <div className="text-2xl font-semibold" style={{ color: '#e4e4e7' }}>{(novel.word_count || 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#52525b' }}>总章节数</div>
                <div className="text-2xl font-semibold" style={{ color: '#e4e4e7' }}>{novel.chapter_count || 0}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#52525b' }}>更新时间</div>
                <div className="text-lg font-medium" style={{ color: '#71717a' }}>
                  {novel.last_update_time ? new Date(novel.last_update_time).toLocaleDateString('zh-CN') : '-'}
                </div>
              </div>
            </div>

            {novel.summary && (
              <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>作品简介</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#71717a' }}>{novel.summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chapters */}
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">章节列表 ({chapters.length})</h2>
            <Link href={`/editor?novelId=${novel.book_id}`} legacyBehavior>
              <a className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all" style={{ background: '#7c6af0', color: '#fff' }}>
                + 新建章节
              </a>
            </Link>
          </div>

          {chapters.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#71717a' }}>
              <div className="text-4xl mb-3">📝</div>
              <p>暂无章节，开始创建第一个章节吧</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="p-5 rounded-xl transition-all hover-lift" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded text-sm font-medium" style={{
                        background: chapter.status === 1 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(82, 82, 91, 0.3)',
                        color: chapter.status === 1 ? '#4ade80' : '#a1a1aa'
                      }}>
                        第 {chapter.chapter_no} 章
                      </span>
                      <h3 className="text-lg font-medium">{chapter.chapter_title}</h3>
                    </div>
                    <span className="text-sm" style={{ color: '#52525b' }}>{(chapter.word_count || 0).toLocaleString()} 字</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: '#52525b' }}>
                    <span>{chapter.created_at ? new Date(chapter.created_at).toLocaleDateString('zh-CN') : '-'}</span>
                    {chapter.publish_time && (
                      <span>发布: {new Date(chapter.publish_time).toLocaleDateString('zh-CN')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NovelDetail;
