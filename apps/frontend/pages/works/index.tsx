'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Novel {
  id: number;
  book_id: string;
  title: string;
  subtitle: string | null;
  cover_image: string | null;
  category_id: number;
  tags: string | null;
  status: number;
  word_count: number;
  chapter_count: number;
  last_update_time: string | null;
  created_at: string;
}

const Works: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('all');

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/novels');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setNovels(data.data);
      } else {
        setNovels(getMockNovels());
      }
    } catch (err) {
      console.error('Failed to fetch novels:', err);
      setNovels(getMockNovels());
    } finally {
      setLoading(false);
    }
  };

  const getMockNovels = (): Novel[] => [
    { id: 1, book_id: 'BK001', title: '星际流光', subtitle: '银河系边缘的星际探索', cover_image: null, category_id: 3, tags: '科幻,星际,冒险', status: 1, word_count: 328000, chapter_count: 128, last_update_time: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: 2, book_id: 'BK002', title: '长安夜话', subtitle: '大唐盛世下的悬疑谜案', cover_image: null, category_id: 5, tags: '历史,悬疑,推理', status: 1, word_count: 156000, chapter_count: 56, last_update_time: new Date(Date.now() - 86400000).toISOString(), created_at: new Date().toISOString() },
    { id: 3, book_id: 'BK003', title: '迷雾之塔', subtitle: '古老魔法世界的冒险', cover_image: null, category_id: 8, tags: '奇幻,魔法,冒险', status: 2, word_count: 89000, chapter_count: 32, last_update_time: new Date(Date.now() - 172800000).toISOString(), created_at: new Date().toISOString() },
    { id: 4, book_id: 'BK004', title: '深海回声', subtitle: '深海深处的秘密', cover_image: null, category_id: 6, tags: '悬疑,科幻,探险', status: 0, word_count: 0, chapter_count: 0, last_update_time: null, created_at: new Date().toISOString() },
    { id: 5, book_id: 'BK005', title: '暗夜传说', subtitle: '不为人知的秘密', cover_image: null, category_id: 2, tags: '都市,奇幻,冒险', status: 1, word_count: 210000, chapter_count: 89, last_update_time: new Date(Date.now() - 432000000).toISOString(), created_at: new Date().toISOString() },
    { id: 6, book_id: 'BK006', title: '时光旅行者', subtitle: '穿越时空的爱恋', cover_image: null, category_id: 4, tags: '言情,科幻,时空', status: 1, word_count: 450000, chapter_count: 156, last_update_time: new Date(Date.now() - 604800000).toISOString(), created_at: new Date().toISOString() },
  ];

  const filteredNovels = filter === 'all' ? novels : novels.filter(n => n.status === (filter === 'ongoing' ? 1 : 2));

  const statusMap: any = {
    0: { text: '草稿', color: '#52525b' },
    1: { text: '连载中', color: '#7c6af0' },
    2: { text: '已完结', color: '#4ade80' },
    3: { text: '暂停', color: '#fbbf24' }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f0f12', color: '#e4e4e7' }}>
      <header style={{ 
        width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999,
        background: 'rgba(15, 15, 18, 0.9)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: 64
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', height: '100%', position: 'relative', padding: '0 24px' }}>
          <div className="flex items-center gap-3" style={{ position: 'absolute', left: 24, top: 0, height: '100%' }}>
            <Link href="/" legacyBehavior>
              <a className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c6af0, #6b5ce7)' }}>
                  <span className="text-white font-bold text-sm">睿</span>
                </div>
                <span className="font-medium text-white">明睿创作</span>
              </a>
            </Link>
          </div>
          <nav className="flex items-center gap-1" style={{ position: 'absolute', left: '50%', top: 0, height: '100%', transform: 'translateX(-50%)' }}>
            {[
              { name: '首页', href: '/' },
              { name: '作品', href: '/works', active: true },
              { name: '创作', href: '/editor' },
              { name: '智能体', href: '/agents' },
              { name: '世界观', href: '/world' },
              { name: '数据', href: '/analytics' },
            ].map((tab) => (
              <Link key={tab.name} href={tab.href} legacyBehavior>
                <a className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  tab.active ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
                style={tab.active ? { background: 'rgba(124,106,240,0.15)' } : {}}>
                  {tab.name}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12" style={{ paddingTop: 80 }}>
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-semibold mb-1">我的作品</h1>
            <p className="text-sm" style={{ color: '#71717a' }}>管理你的创作项目</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/create" legacyBehavior>
              <a className="px-5 py-2.5 text-sm font-medium rounded-lg inline-flex items-center justify-center" style={{ background: '#7c6af0', color: '#fff' }}>
                + 新建作品
              </a>
            </Link>
            <button
              onClick={async () => {
                const pname = prompt('统一创建入口：项目名称');
                if (!pname) return;
                const genre = prompt('统一创建入口：项目类型', '科幻') || '科幻';
                const summary = prompt('统一创建入口：项目简介', '') || '';
                const title = prompt('统一创建入口：小说标题', pname) || pname;
                const authorInput = prompt('统一创建入口：作者ID (留空使用默认管理员)', '1');
                const author_id = authorInput ? Number(authorInput) : undefined;
                try {
                  const res = await axios.post('/api/v1/create-composite', {
                    project: { name: pname, genre, summary },
                    novel: { title, author_id }
                  });
                  if (res.data?.data) {
                    fetchNovels();
                    alert('统一创建成功');
                  } else {
                    alert('统一创建失败：无返回数据');
                  }
                } catch (e: any) {
                  console.error('Unified create error:', e);
                  alert('统一创建失败: ' + (e.response?.data?.error || e.message));
                }
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg" style={{ background: '#1f1f24', color: '#e5e7eb' }}
            >
              统一创建入口
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {[
            { id: 'all', label: '全部' },
            { id: 'ongoing', label: '连载中' },
            { id: 'completed', label: '已完结' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{
                background: filter === tab.id ? '#7c6af0' : 'rgba(255,255,255,0.05)',
                color: filter === tab.id ? '#fff' : '#71717a'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-12">
          <div className="p-5 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-2xl font-semibold mb-1">{novels.length}</div>
            <div className="text-xs" style={{ color: '#71717a' }}>总作品数</div>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-2xl font-semibold mb-1">{novels.filter(n => n.status === 1).length}</div>
            <div className="text-xs" style={{ color: '#71717a' }}>连载中</div>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-2xl font-semibold mb-1">{novels.filter(n => n.status === 2).length}</div>
            <div className="text-xs" style={{ color: '#71717a' }}>已完结</div>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-2xl font-semibold mb-1">{(novels.reduce((sum, n) => sum + (n.word_count || 0), 0) / 1000).toFixed(0)}K</div>
            <div className="text-xs" style={{ color: '#71717a' }}>总字数</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#71717a', padding: '48px' }}>加载中...</div>
        ) : filteredNovels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#71717a' }}>
            <div className="text-4xl mb-3">📚</div>
            <p>暂无作品，开始创作第一个故事吧</p>
            <Link href="/editor" legacyBehavior>
              <a className="mt-4 inline-block px-6 py-2 rounded-lg" style={{ background: '#7c6af0', color: '#fff' }}>
                创建作品
              </a>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {filteredNovels.map((novel) => (
              novel ? (
                <Link key={novel.id} href={`/works/${novel.id}`} legacyBehavior>
                  <a className="block p-6 rounded-xl cursor-pointer transition-all hover-lift" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-1 line-clamp-1">{novel.title}</h3>
                        {novel.subtitle && <p className="text-sm mb-2" style={{ color: '#71717a' }}>{novel.subtitle}</p>}
                        <span className="px-2 py-0.5 text-xs rounded-full" style={{
                          background: 'rgba(124,106,240,0.15)',
                          color: '#7c6af0'
                        }}>
                          {statusMap[novel.status]?.text || novel.status}
                        </span>
                      </div>
                      {novel.cover_image && (
                        <div className="w-16 h-20 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                          <img src={novel.cover_image} alt={novel.title} className="w-full h-full object-cover" style={{ opacity: 0.8 }} />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4 px-2">
                      <div className="flex gap-4 text-xs">
                        <span style={{ color: '#a1a1aa' }}>{(novel.word_count || 0).toLocaleString()} 字</span>
                        <span style={{ color: '#a1a1aa' }}>{novel.chapter_count || 0} 章</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs" style={{ color: '#52525b' }}>
                      <span>更新于 {novel.last_update_time ? new Date(novel.last_update_time).toLocaleDateString('zh-CN') : '-'}</span>
                      {novel.tags && (
                        <div className="flex gap-1">
                          {novel.tags.split(',').slice(0, 2).map((tag: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#71717a' }}>
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </a>
                </Link>
              ) : null
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Works;