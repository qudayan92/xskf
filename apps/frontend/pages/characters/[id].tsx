import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const roles = ['主角', '女主', '反派', '配角', '导师', '伙伴'];
const genders = ['男', '女', '未知'];

interface Character {
  id: number;
  name: string;
  role: string;
  age: string | null;
  gender: string | null;
  avatar: string | null;
  appearance: string | null;
  personality: string | null;
  background: string | null;
  goals: string | null;
  secrets: string | null;
  weaknesses: string | null;
  tags: string | null;
  arc: string | null;
  habit: string | null;
  skills: string | null;
  relationships: string | null;
}

export default function CharacterDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    if (id) fetchCharacter();
  }, [id]);

  async function fetchCharacter() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/characters/${id}`);
      const data = await res.json();
      if (data.success) setCharacter(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof Character, value: string) {
    if (character) setCharacter({ ...character, [field]: value });
  }

  async function handleSave() {
    if (!character) return;
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/characters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(character),
      });
      const data = await res.json();
      if (data.success) {
        alert('保存成功');
      } else {
        alert(data.error || '保存失败');
      }
    } catch (err) {
      console.error(err);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ background: '#0f0f12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>加载中...</div>;
  if (!character) return <div style={{ background: '#0f0f12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>角色不存在</div>;

  return (
    <div style={{ background: '#0f0f12', minHeight: '100vh', color: '#e4e4e7' }}>
      {/* Header without nav tabs */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 64, background: 'rgba(15,15,18,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 9999 }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', height: '100%', position: 'relative', padding: '0 24px' }}>
          <Link href="/characters" legacyBehavior>
            <span style={{ position: 'absolute', left: 24, top: 0, height: '100%', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span style={{ fontSize: 14, color: '#71717a' }}>← 返回</span>
            </span>
          </Link>
          <h1 style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: 18, fontWeight: 600, color: 'white' }}>编辑角色</h1>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 24 }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, background: '#7c6af0', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>

        <div style={{ padding: 24, borderRadius: 12, background: '#16161c', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>基础信息</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>姓名</label>
              <input type="text" value={character.name} onChange={e => handleChange('name', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>定位</label>
              <select value={character.role} onChange={e => handleChange('role', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>年龄</label>
              <input type="text" value={character.age || ''} onChange={e => handleChange('age', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>性别</label>
              <select value={character.gender || ''} onChange={e => handleChange('gender', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}>
                <option value="">选择性别</option>
                {genders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>头像URL</label>
              <input type="text" value={character.avatar || ''} onChange={e => handleChange('avatar', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
            </div>
          </div>
        </div>

        <div style={{ padding: 24, borderRadius: 12, background: '#16161c', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>性格特征</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>性格特点</label>
              <textarea value={character.personality || ''} onChange={e => handleChange('personality', e.target.value)} rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>言行特征/口头禅</label>
              <input type="text" value={character.habit || ''} onChange={e => handleChange('habit', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>标签（逗号分隔）</label>
              <input type="text" value={character.tags || ''} onChange={e => handleChange('tags', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>角色弧光</label>
              <textarea value={character.arc || ''} onChange={e => handleChange('arc', e.target.value)} rows={2} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
        </div>

        <div style={{ padding: 24, borderRadius: 12, background: '#16161c', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>外貌与背景</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>外貌描述</label>
              <textarea value={character.appearance || ''} onChange={e => handleChange('appearance', e.target.value)} rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>背景故事</label>
              <textarea value={character.background || ''} onChange={e => handleChange('background', e.target.value)} rows={4} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
        </div>

        <div style={{ padding: 24, borderRadius: 12, background: '#16161c', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>目标与秘密</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>目标动机</label>
              <textarea value={character.goals || ''} onChange={e => handleChange('goals', e.target.value)} rows={2} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>隐藏秘密</label>
              <textarea value={character.secrets || ''} onChange={e => handleChange('secrets', e.target.value)} rows={2} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>弱点</label>
              <textarea value={character.weaknesses || ''} onChange={e => handleChange('weaknesses', e.target.value)} rows={2} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}