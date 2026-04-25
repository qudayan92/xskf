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
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [editForm, setEditForm] = useState({ title: '', subtitle: '', status: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/novels`);
      const data = await res.json();
      if (data.success && data.data) {
        setNovels(data.data);
      } else {
        setNovels([]);
      }
    } catch (err) {
      console.error('Failed to fetch novels:', err);
      setNovels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (novel: Novel, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`确定删除《${novel.title}》吗？此操作不可恢复。`)) return;

    setDeletingId(novel.book_id);
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/novels/${novel.id}`);
      if (res.data.success) {
        setNovels(prev => prev.filter(n => n.id !== novel.id));
      } else {
        alert('删除失败: ' + (res.data.error || '未知错误'));
      }
    } catch (err: any) {
      alert('删除失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (novel: Novel, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingNovel(novel);
    setEditForm({
      title: novel.title,
      subtitle: novel.subtitle || '',
      status: novel.status
    });
  };

  const handleSaveEdit = async () => {
    if (!editingNovel) return;

    try {
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/novels/${editingNovel.id}`, {
        title: editForm.title,
        subtitle: editForm.subtitle,
        status: editForm.status
      });
      if (res.data.success) {
        setNovels(prev => prev.map(n => n.id === editingNovel.id ? { ...n, ...editForm } : n));
        setEditingNovel(null);
      } else {
        alert('保存失败: ' + (res.data.error || '未知错误'));
      }
    } catch (err: any) {
      alert('保存失败: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreate = async () => {
    const pname = prompt('统一创建入口：项目名称');
    if (!pname) return;
    const genre = prompt('统一创建入口：项目类型', '科幻') || '科幻';
    const summary = prompt('统一创建入口：项目简介', '') || '';
    const title = prompt('统一创建入口：小说标题', pname) || pname;
    const authorInput = prompt('统一创建入口：作者ID (留空使用默认管理员)', '1');
    const author_id = authorInput && !isNaN(Number(authorInput)) ? Number(authorInput) : 1;

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/create-composite`, {
        project: { name: pname, genre, summary },
        novel: { title, author_id }
      });
      if (res.data?.success && res.data?.data) {
        fetchNovels();
        alert('统一创建成功');
      } else {
        alert('统一创建失败: ' + (res.data?.error || '无返回数据'));
      }
    } catch (err: any) {
      alert('统一创建失败: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredNovels = novels
  .filter(n => filter === 'all' ? true : n.status === (filter === 'ongoing' ? 1 : 2))
  .filter(n => search ? n.title.toLowerCase().includes(search.toLowerCase()) || (n.tags && n.tags.toLowerCase().includes(search.toLowerCase())) : true);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNovels.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNovels.map(n => n.id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`确定删除选中的 ${selectedIds.length} 部作品吗？此操作不可恢复。`)) return;

    setDeletingId('batch');
    try {
      const deletePromises = selectedIds.map(id => 
        axios.delete(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/novels/${id}`)
      );
      await Promise.all(deletePromises);
      setNovels(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
    } catch (err) {
      alert('批量删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBatchUpdateStatus = async (status: number) => {
    if (selectedIds.length === 0) return;

    try {
      const updatePromises = selectedIds.map(id => 
        axios.patch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/novels/${id}`, { status })
      );
      await Promise.all(updatePromises);
      setNovels(prev => prev.map(n => selectedIds.includes(n.id) ? { ...n, status } : n));
      setSelectedIds([]);
    } catch (err) {
      alert('批量更新状态失败');
    }
  };

  const statusMap: any = {
    0: { text: '草稿', color: '#52525b' },
    1: { text: '连载中', color: '#7c6af0' },
    2: { text: '已完结', color: '#4ade80' },
    3: { text: '暂停', color: '#fbbf24' }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f0f12', color: '#e4e4e7' }}>
      {/* Header */}
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
        {/* Title Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-1">我的作品</h1>
            <p className="text-sm" style={{ color: '#71717a' }}>管理你的创作项目</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索作品..."
                className="w-48 px-4 py-2 text-sm rounded-lg pl-10"
                style={{ background: '#1f1f24', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#71717a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-sm font-medium rounded-lg"
              style={{ background: '#1f1f24', color: '#e5e7eb' }}
            >
              统一创建入口
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {[
              { id: 'all', label: `全部 (${novels.length})` },
              { id: 'ongoing', label: `连载中 (${novels.filter(n => n.status === 1).length})` },
              { id: 'completed', label: `已完结 (${novels.filter(n => n.status === 2).length})` },
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

          {/* Batch Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: '#a78bfa' }}>已选中 {selectedIds.length} 项</span>
              <button
                onClick={() => handleBatchUpdateStatus(1)}
                className="px-3 py-1.5 text-xs rounded-lg"
                style={{ background: 'rgba(124,106,240,0.15)', color: '#a78bfa' }}
              >
                设为连载
              </button>
              <button
                onClick={() => handleBatchUpdateStatus(2)}
                className="px-3 py-1.5 text-xs rounded-lg"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
              >
                设为完结
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={deletingId === 'batch'}
                className="px-3 py-1.5 text-xs rounded-lg"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
              >
                {deletingId === 'batch' ? '删除中...' : '批量删除'}
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-2xl font-semibold">{novels.length}</div>
            <div className="text-xs" style={{ color: '#71717a' }}>总作品数</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-2xl font-semibold">{novels.filter(n => n.status === 1).length}</div>
            <div className="text-xs" style={{ color: '#71717a' }}>连载中</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-2xl font-semibold">{novels.filter(n => n.status === 2).length}</div>
            <div className="text-xs" style={{ color: '#71717a' }}>已完结</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-2xl font-semibold">{(novels.reduce((sum, n) => sum + (n.word_count || 0), 0) / 1000).toFixed(0)}K</div>
            <div className="text-xs" style={{ color: '#71717a' }}>总字数</div>
          </div>
        </div>

        {/* Novels Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#71717a', padding: '48px' }}>加载中...</div>
        ) : filteredNovels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#71717a' }}>
            <div className="text-4xl mb-3">📚</div>
            <p>暂无作品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNovels.map((novel) => (
              <div
                key={novel.id}
                className="p-5 rounded-xl cursor-pointer transition-all hover:border-purple-500/30"
                style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(novel.id)}
                    onChange={() => toggleSelect(novel.id)}
                    className="w-4 h-4 mt-1 rounded"
                    style={{ accentColor: '#7c6af0' }}
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <Link href={`/works/${novel.book_id}`} legacyBehavior>
                      <a className="block">
                        <h3 className="text-lg font-medium text-white mb-1 truncate">{novel.title}</h3>
                        {novel.subtitle && (
                          <p className="text-sm truncate" style={{ color: '#71717a' }}>{novel.subtitle}</p>
                        )}
                      </a>
                    </Link>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="px-2 py-0.5 text-xs rounded-full"
                      style={{
                        background: 'rgba(124,106,240,0.15)',
                        color: statusMap[novel.status]?.color || '#7c6af0'
                      }}
                    >
                      {statusMap[novel.status]?.text || '草稿'}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs mb-3" style={{ color: '#71717a' }}>
                  <div className="flex gap-4">
                    <span>{(novel.word_count || 0).toLocaleString()} 字</span>
                    <span>{novel.chapter_count || 0} 章</span>
                  </div>
                  <span>更新于 {novel.last_update_time ? new Date(novel.last_update_time).toLocaleDateString('zh-CN') : '-'}</span>
                </div>

                {/* Tags */}
                {novel.tags && (
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {novel.tags.split(',').slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs rounded"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#71717a' }}
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <Link href={`/works/${novel.book_id}`} legacyBehavior>
                    <a
                      className="flex-1 px-3 py-1.5 text-xs text-center rounded-lg"
                      style={{ background: 'rgba(124,106,240,0.2)', color: '#a5b4fc' }}
                    >
                      打开
                    </a>
                  </Link>
                  <button
                    onClick={(e) => handleEdit(novel, e)}
                    className="px-3 py-1.5 text-xs rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#888' }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={(e) => handleDelete(novel, e)}
                    disabled={deletingId === novel.book_id}
                    className="px-3 py-1.5 text-xs rounded-lg"
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444',
                      opacity: deletingId === novel.book_id ? 0.5 : 1
                    }}
                  >
                    {deletingId === novel.book_id ? '删除中...' : '删除'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingNovel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setEditingNovel(null)}
        >
          <div
            className="rounded-xl p-6 w-full max-w-md"
            style={{ background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-medium text-white mb-4">编辑作品</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#888' }}>标题</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: '#25252a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#888' }}>简介</label>
                <textarea
                  value={editForm.subtitle}
                  onChange={e => setEditForm({ ...editForm, subtitle: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                  style={{ background: '#25252a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#888' }}>状态</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: '#25252a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  <option value={0}>草稿</option>
                  <option value={1}>连载中</option>
                  <option value={2}>已完结</option>
                  <option value={3}>暂停</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditingNovel(null)}
                className="flex-1 px-4 py-2 text-sm rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#888' }}
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg"
                style={{ background: '#7c6af0', color: '#fff' }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Works;