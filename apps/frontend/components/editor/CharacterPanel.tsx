import React, { useState, useEffect, useRef } from 'react';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect?: (character: any) => void;
}

interface Character {
  id: number;
  name: string;
  role: string;
  personality: string | null;
  age: string | null;
}

const roleColors: Record<string, { bg: string; text: string }> = {
  '主角': { bg: 'rgba(124,106,240,0.15)', text: '#7c6af0' },
  '女主': { bg: 'rgba(236,72,153,0.15)', text: '#ec4899' },
  '反派': { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  '配角': { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
  '导师': { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  '伙伴': { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
};

const CharacterPanel: React.FC<Props> = ({ visible, onClose, onSelect }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible) fetchCharacters();
  }, [visible]);

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/characters`);
      const data = await res.json();
      if (data.success) setCharacters(data.data);
    } catch {} 
    finally { setLoading(false); }
  };

  const list = characters.filter(c => 
    search ? c.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        width: '90%', maxWidth: 600, maxHeight: '80vh', overflow: 'auto',
        background: '#16161c', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>👤</span>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>角色库</span>
            <span style={{ color: '#71717a', fontSize: 13 }}>({characters.length}人)</span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#71717a', cursor: 'pointer',
            fontSize: 20
          }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索角色..."
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
              background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)',
              color: 'white', outline: 'none'
            }}
          />
        </div>

        {/* Character List */}
        <div style={{ padding: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#71717a' }}>加载中...</div>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#71717a' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
              <p style={{ cursor: 'pointer', color: '#7c6af0' }} onClick={() => window.location.href = '/characters/new'}>暂无角色，点击创建</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {list.map(char => (
                <div key={char.id} onClick={() => onSelect && onSelect(char)}
                  style={{
                    padding: 14, borderRadius: 10, cursor: onSelect ? 'pointer' : 'default',
                    background: '#1c1c24', border: '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.2s'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7c6af0, #6b5ce7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 14, fontWeight: 500
                    }}>
                      {char.name?.[0] || '?'}
                    </div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 500, fontSize: 14 }}>{char.name}</div>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 11,
                        background: roleColors[char.role]?.bg || 'rgba(255,255,255,0.06)',
                        color: roleColors[char.role]?.text || '#71717a'
                      }}>
                        {char.role}
                      </span>
                    </div>
                  </div>
                  {char.personality && (
                    <p style={{
                      color: '#71717a', fontSize: 12, lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>
                      {char.personality}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterPanel;