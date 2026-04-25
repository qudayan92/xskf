'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Character {
  id: number;
  name: string;
  role: string;
  age: string | null;
  gender: string | null;
  avatar: string | null;
  personality: string | null;
  tags: string | null;
  appearance: string | null;
  background: string | null;
  goals: string | null;
  secrets: string | null;
  weaknesses: string | null;
  arc: string | null;
  habit: string | null;
}

const roleColors: Record<string, { bg: string; text: string }> = {
  '主角': { bg: 'rgba(124,106,240,0.15)', text: '#7c6af0' },
  '女主': { bg: 'rgba(236,72,153,0.15)', text: '#ec4899' },
  '反派': { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  '配角': { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
  '导师': { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  '伙伴': { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
};

const roles = ['主角', '女主', '反派', '配角', '导师', '伙伴'];
const genders = ['男', '女', '未知'];

export default function CharactersPage() {
  const [mounted, setMounted] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCharacters();
  }, []);

  async function fetchCharacters() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/characters`);
      const data = await res.json();
      if (data.success) setCharacters(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

async function deleteChar(id: number) {
    if (!confirm('确定要删除这个角色吗？')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/characters/${id}`, { method: 'DELETE' });
      setCharacters(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    } catch (err) {
      console.error(err);
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  function toggleSelectAll() {
    if (selectedIds.length === list.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map(c => c.id));
    }
  }

  async function batchDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`确定删除选中的 ${selectedIds.length} 个角色吗？此操作不可恢复。`)) return;
    try {
      const deletePromises = selectedIds.map(id => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/characters/${id}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      setCharacters(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  }

  const list = characters
    .filter(c => filter ? c.role === filter : true)
    .filter(c => search ? c.name.toLowerCase().includes(search.toLowerCase()) || (c.tags && c.tags.toLowerCase().includes(search.toLowerCase())) : true);

  if (!mounted) return null;

  return (
    <div style={{ background: '#0f0f12', minHeight: '100vh', color: '#e4e4e7' }}>
      {/* Header */}
      <header style={{
        width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999,
        background: 'rgba(15, 15, 18, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: 64
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', height: '100%', position: 'relative', padding: '0 24px' }}>
          <div style={{ position: 'absolute', left: 24, top: 0, height: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
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
              { name: '作品', href: '/works' },
              { name: '创作', href: '/editor' },
              { name: '角色', href: '/characters', active: true },
              { name: '世界观', href: '/world' },
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

      <main style={{ maxWidth: 1152, margin: '0 auto', padding: '80px 24px 48px' }}>
        {/* Title Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: 'white' }}>角色建模</h1>
            <p style={{ fontSize: 14, color: '#71717a' }}>构建立体人物档案</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="搜索角色..." 
                style={{ width: 160, padding: '10px 12px 10px 36px', borderRadius: 8, fontSize: 14, background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} 
              />
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#71717a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            {selectedIds.length > 0 && (
              <button onClick={batchDelete} style={{ padding: '10px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', border: 'none' }}>
                删除选中 ({selectedIds.length})
              </button>
            )}
            <Link href="/characters/new">
              <a style={{ padding: '10px 20px', borderRadius: 8, background: '#7c6af0', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>+ 创建角色</a>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setFilter('')} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: 'none', ...(filter === '' ? { background: 'rgba(124,106,240,0.15)', color: '#7c6af0' } : { background: '#1c1c24', color: '#a1a1aa' }) }}>全部</button>
          {roles.map(r => (
            <button key={r} onClick={() => setFilter(r)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: 'none', ...(filter === r ? { background: roleColors[r]?.bg, color: roleColors[r]?.text } : { background: '#1c1c24', color: '#a1a1aa' }) }}>{r}</button>
          ))}
        </div>

        {/* Characters Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#71717a' }}>加载中...</div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#71717a' }}>暂无角色，点击上方按钮创建第一个角色</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {list.map(c => (
              <div key={c.id} style={{ padding: 24, borderRadius: 12, background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(c.id)}
                    onChange={() => toggleSelect(c.id)}
                    style={{ width: 20, height: 20, accentColor: '#7c6af0', cursor: 'pointer' }}
                  />
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: c.avatar ? `url(${c.avatar}) center/cover` : 'linear-gradient(135deg, #7c6af0, #6b5ce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white' }}>
                    {!c.avatar && (c.name?.[0] || '?')}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 500, color: 'white' }}>{c.name}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: roleColors[c.role]?.bg, color: roleColors[c.role]?.text }}>{c.role}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#71717a' }}>{c.age || '年龄未知'} · {c.gender || '性别未知'}</p>
                  </div>
                </div>
                {c.personality && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#52525b', marginBottom: 6 }}>性格特点</div>
                    <p style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.6 }}>{c.personality.length > 80 ? c.personality.slice(0, 80) + '...' : c.personality}</p>
                  </div>
                )}
                {c.tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                    {c.tags.split(',').slice(0, 4).map((t, i) => (
                      <span key={i} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: 'rgba(255,255,255,0.06)', color: '#71717a' }}>{t.trim()}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={(e) => handleEdit(c, e)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, textAlign: 'center', fontSize: 14, background: '#1c1c24', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>编辑</button>
                  <button onClick={() => deleteChar(c.id)} style={{ padding: '8px 12px', borderRadius: 8, fontSize: 14, background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', border: 'none' }}>删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingChar && (
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
          onClick={() => setEditingChar(null)}
        >
          <div
            className="rounded-xl p-6 w-full max-w-2xl"
            style={{ background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'white' }}>编辑角色</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>姓名</label>
                <input type="text" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, background: '#25252a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>定位</label>
                <select value={editForm.role || ''} onChange={e => setEditForm({ ...editForm, role: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, background: '#25252a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>年龄</label>
                <input type="text" value={editForm.age || ''} onChange={e => setEditForm({ ...editForm, age: e.target.value })} placeholder="如：28岁" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, background: '#25252a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>性别</label>
                <select value={editForm.gender || ''} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, background: '#25252a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}>
                  <option value="">选择性别</option>
                  {genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>性格特点</label>
              <textarea value={editForm.personality || ''} onChange={e => setEditForm({ ...editForm, personality: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, background: '#25252a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>目标动机</label>
                <textarea value={editForm.goals || ''} onChange={e => setEditForm({ ...editForm, goals: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, background: '#25252a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>隐藏秘密</label>
                <textarea value={editForm.secrets || ''} onChange={e => setEditForm({ ...editForm, secrets: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, background: '#25252a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setEditingChar(null)}
                style={{ flex: 1, padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500, background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                style={{ flex: 1, padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500, background: '#7c6af0', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

