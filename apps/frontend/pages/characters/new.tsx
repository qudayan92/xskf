import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const roles = ['主角', '女主', '反派', '配角', '导师', '伙伴'];
const genders = ['男', '女', '未知'];

interface CharacterForm {
  name: string;
  role: string;
  age: string;
  gender: string;
  avatar: string;
  appearance: string;
  personality: string;
  background: string;
  goals: string;
  secrets: string;
  weaknesses: string;
  tags: string;
  arc: string;
  habit: string;
  skills: string;
  relationships: string;
}

export default function NewCharacter() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState<CharacterForm>({
    name: '',
    role: '主角',
    age: '',
    gender: '',
    avatar: '',
    appearance: '',
    personality: '',
    background: '',
    goals: '',
    secrets: '',
    weaknesses: '',
    tags: '',
    arc: '',
    habit: '',
    skills: '',
    relationships: '',
  });

  function handleChange(field: keyof CharacterForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleAIGenerate() {
    if (!form.name.trim()) {
      alert('请先输入角色名称');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/generate-character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          genre: '玄幻',
        }),
      });
      const data = await res.json();
      if (data.success && data.data.character) {
        const char = data.data.character;
        setForm(prev => ({
          ...prev,
          personality: char.personality || prev.personality,
          appearance: char.appearance || prev.appearance,
          background: char.background || prev.background,
          goals: char.goals || prev.goals,
          secrets: char.secrets || prev.secrets,
          weaknesses: char.weaknesses || prev.weaknesses,
          tags: char.tags || prev.tags,
          arc: char.arc || prev.arc,
          habit: char.habit || prev.habit,
        }));
      }
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('请输入角色名称');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/characters');
      } else {
        alert(data.error || '创建失败');
      }
    } catch (err) {
      console.error('Error creating character:', err);
      alert('创建失败');
    } finally {
      setLoading(false);
    }
  }

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
          <h1 style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: 18, fontWeight: 600, color: 'white' }}>创建角色</h1>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 48px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: 24, borderRadius: 12, background: '#16161c', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>基础信息</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>姓名 *</label>
                <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="角色名称" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>定位</label>
                <select value={form.role} onChange={e => handleChange('role', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>年龄</label>
                <input type="text" value={form.age} onChange={e => handleChange('age', e.target.value)} placeholder="如：28岁" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>性别</label>
                <select value={form.gender} onChange={e => handleChange('gender', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}>
                  <option value="">选择性别</option>
                  {genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>头像URL</label>
                <input type="text" value={form.avatar} onChange={e => handleChange('avatar', e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
              </div>
            </div>
          </div>

          <div style={{ padding: 24, borderRadius: 12, background: '#16161c', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>性格特征</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>性格特点</label>
                <textarea value={form.personality} onChange={e => handleChange('personality', e.target.value)} placeholder="描述角色的性格特点..." rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>言行特征/口头禅</label>
                <input type="text" value={form.habit} onChange={e => handleChange('habit', e.target.value)} placeholder="如：遇事就慌，总是说'完了完了'" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>标签（逗号分隔）</label>
                <input type="text" value={form.tags} onChange={e => handleChange('tags', e.target.value)} placeholder="如：高冷,腹黑,话痨" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>角色弧光</label>
                <textarea value={form.arc} onChange={e => handleChange('arc', e.target.value)} placeholder="角色的成长曲线..." rows={2} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>
          </div>

          <div style={{ padding: 24, borderRadius: 12, background: '#16161c', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>外貌与背景</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>外貌描述</label>
                <textarea value={form.appearance} onChange={e => handleChange('appearance', e.target.value)} placeholder="外貌描述..." rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>背景故事</label>
                <textarea value={form.background} onChange={e => handleChange('background', e.target.value)} placeholder="角色的背景故事..." rows={4} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>
          </div>

          <div style={{ padding: 24, borderRadius: 12, background: '#16161c', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>目标与秘密</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>目标动机</label>
                <textarea value={form.goals} onChange={e => handleChange('goals', e.target.value)} placeholder="角色的目标和动机..." rows={2} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>隐藏秘密</label>
                <textarea value={form.secrets} onChange={e => handleChange('secrets', e.target.value)} placeholder="角色隐藏的秘密..." rows={2} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#71717a', marginBottom: 8 }}>弱点</label>
                <textarea value={form.weaknesses} onChange={e => handleChange('weaknesses', e.target.value)} placeholder="角色的弱点..." rows={2} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <button type="button" onClick={handleAIGenerate} disabled={generating} style={{ flex: 1, padding: '16px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500, background: 'rgba(124,106,240,0.15)', color: '#7c6af0', border: '1px solid rgba(124,106,240,0.3)', cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.6 : 1 }}>
              {generating ? 'AI生成中...' : '✨ AI智能生成'}
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '16px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500, background: '#7c6af0', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? '保存中...' : '保存角色'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}