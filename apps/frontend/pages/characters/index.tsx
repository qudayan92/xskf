import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Character {
  id: number;
  name: string;
  role: string;
  age: string | null;
  gender: string | null;
  avatar: string | null;
  personality: string | null;
  tags: string | null;
}

const roleColors: Record<string, { bg: string; text: string }> = {
  '主角': { bg: 'rgba(124,106,240,0.15)', text: '#7c6af0' },
  '女主': { bg: 'rgba(236,72,153,0.15)', text: '#ec4899' },
  '反派': { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  '配角': { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
  '导师': { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  '伙伴': { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
};

export default function CharactersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchCharacters();
  }, []);

  async function fetchCharacters() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/characters`);
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/characters/${id}`, { method: 'DELETE' });
      setCharacters(characters.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const list = filter ? characters.filter(c => c.role === filter) : characters;
  const roles = ['主角', '女主', '反派', '配角', '导师', '伙伴'];

  if (!mounted) return null;

  return (
    <div style={{ background: '#0f0f12', minHeight: '100vh', color: '#e4e4e7' }}>
      {/* Header without nav tabs */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 64, background: 'rgba(15,15,18,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 9999 }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', height: '100%', position: 'relative', padding: '0 24px' }}>
          <Link href="/" legacyBehavior>
            <span style={{ position: 'absolute', left: 24, top: 0, height: '100%', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span style={{ fontSize: 14, color: '#71717a' }}>← 返回</span>
            </span>
          </Link>
          <h1 style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: 18, fontWeight: 600, color: 'white' }}>角色建模</h1>
        </div>
      </header>

      <main style={{ maxWidth: 1152, margin: '0 auto', padding: '80px 24px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: '#71717a' }}>创建和管理你的故事角色</p>
          <Link href="/characters/new" legacyBehavior>
            <span style={{ padding: '10px 20px', borderRadius: 8, background: '#7c6af0', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>+ 创建角色</span>
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setFilter('')} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: 'none', ...(filter === '' ? { background: 'rgba(124,106,240,0.15)', color: '#7c6af0' } : { background: '#1c1c24', color: '#a1a1aa' }) }}>全部</button>
          {roles.map(r => (
            <button key={r} onClick={() => setFilter(r)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: 'none', ...(filter === r ? { background: roleColors[r]?.bg, color: roleColors[r]?.text } : { background: '#1c1c24', color: '#a1a1aa' }) }}>{r}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#71717a' }}>加载中...</div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#71717a' }}>暂无角色，点击上方按钮创建第一个角色</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {list.map(c => (
              <div key={c.id} style={{ padding: 24, borderRadius: 12, background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: c.avatar ? `url(${c.avatar}) center/cover` : 'linear-gradient(135deg, #7c6af0, #6b5ce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white' }}>
                    {!c.avatar && c.name[0]}
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
                  <Link href={`/characters/${c.id}`} legacyBehavior>
                    <span style={{ flex: 1, padding: '8px 12px', borderRadius: 8, textAlign: 'center', fontSize: 14, background: '#1c1c24', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>编辑</span>
                  </Link>
                  <button onClick={() => deleteChar(c.id)} style={{ padding: '8px 12px', borderRadius: 8, fontSize: 14, background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', border: 'none' }}>删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}