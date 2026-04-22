import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface WorldElement {
  id: number;
  type: string;
  name: string;
  description: string;
  icon: string;
}

const worldTypes = ['全部', '星球', '势力', '科技', '历史', '种族'];

const icons: Record<string, string> = {
  '星球': '🌍',
  '势力': '🚀',
  '科技': '💫',
  '历史': '📜',
  '种族': '👽',
};

const World: React.FC = () => {
  const [elements, setElements] = useState<WorldElement[]>([]);
  const [filter, setFilter] = useState('全部');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newElement, setNewElement] = useState({ type: '星球', name: '', description: '' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchWorlds();
  }, [filter]);

  const fetchWorlds = async () => {
    try {
      setLoading(true);
      const query = filter === '全部' ? '' : `?type=${filter}`;
      const res = await axios.get(`${API_URL}/api/v1/worlds${query}`);
      setElements(res.data.data || []);
    } catch (err) {
      console.error('Error fetching worlds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddElement = async () => {
    if (!newElement.name) return;
    try {
      const icon = icons[newElement.type] || '📌';
      await axios.post(`${API_URL}/api/v1/worlds`, {
        ...newElement,
        icon,
      });
      setShowModal(false);
      setNewElement({ type: '星球', name: '', description: '' });
      fetchWorlds();
    } catch (err) {
      console.error('Error adding world:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/v1/worlds/${id}`);
      fetchWorlds();
    } catch (err) {
      console.error('Error deleting world:', err);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setAiLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/v1/ai/generate-world`, {
        prompt: aiPrompt,
      });
      if (res.data.data) {
        const worlds = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        for (const world of worlds) {
          await axios.post(`${API_URL}/api/v1/worlds`, {
            type: world.type,
            name: world.name,
            description: world.description,
            icon: world.icon || icons[world.type] || '📌',
          });
        }
        fetchWorlds();
        setAiPrompt('');
      }
    } catch (err) {
      console.error('Error generating world:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f0f12', color: '#e4e4e7' }}>
      <header style={{ 
        width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999,
        background: 'rgba(15, 15, 18, 0.85)', 
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
              { name: '作品', href: '/works' },
              { name: '创作', href: '/editor' },
              { name: '智能体', href: '/agents' },
              { name: '世界观', href: '/world', active: true },
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-1">世界观</h1>
            <p className="text-sm" style={{ color: '#71717a' }}>构建你的故事世界</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 text-sm font-medium rounded-lg" 
            style={{ background: '#7c6af0', color: '#fff' }}
          >
            + 添加设定
          </button>
        </div>

        <div className="mb-8 p-8 rounded-xl text-center" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm" style={{ color: '#71717a' }}>可视化关系图 - 拖拽创建元素关联</p>
        </div>

        <div className="flex gap-2 mb-6">
          {worldTypes.map((f, i) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 text-sm rounded-lg transition-colors"
              style={filter === f ? { background: '#7c6af0', color: '#fff' } : { background: '#1c1c24', color: '#71717a' }}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: '#71717a' }}>加载中...</div>
        ) : elements.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#71717a' }}>暂无世界观设定</div>
        ) : (
          <div className="grid grid-cols-3 gap-6 mb-12">
            {elements.map((el) => (
              <div key={el.id} className="p-5 rounded-xl transition-all hover-lift" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: 'rgba(124,106,240,0.15)' }}>
                    {el.icon || '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1c1c24', color: '#71717a' }}>
                      {el.type}
                    </span>
                    <h3 className="font-medium text-white mt-1">{el.name}</h3>
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#71717a', lineHeight: 1.6 }}>{el.description}</p>
                <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button 
                    onClick={() => handleDelete(el.id)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg" 
                    style={{ background: '#1c1c24', color: '#a1a1aa' }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(124,106,240,0.08), rgba(107,92,231,0.04))', border: '1px solid rgba(124,106,240,0.2)' }}>
          <h2 className="text-lg font-medium mb-4">🎲 AI 世界观生成</h2>
          <div className="flex gap-4">
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="描述你想要的世界设定..."
              className="input flex-1 h-20 resize-none"
              style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', color: '#e4e4e7' }}
            />
            <button 
              onClick={handleAiGenerate}
              disabled={aiLoading}
              className="px-6 py-3 font-medium rounded-lg self-center disabled:opacity-50"
              style={{ background: '#7c6af0', color: '#fff' }}
            >
              {aiLoading ? '生成中...' : 'AI 生成'}
            </button>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="p-6 rounded-xl w-96" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 className="text-lg font-medium mb-4">添加世界观设定</h2>
            <div className="mb-4">
              <label className="block text-sm mb-2" style={{ color: '#71717a' }}>类型</label>
              <select
                value={newElement.type}
                onChange={(e) => setNewElement({ ...newElement, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7' }}
              >
                {worldTypes.filter(t => t !== '全部').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2" style={{ color: '#71717a' }}>名称</label>
              <input
                value={newElement.name}
                onChange={(e) => setNewElement({ ...newElement, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7' }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2" style={{ color: '#71717a' }}>描述</label>
              <textarea
                value={newElement.description}
                onChange={(e) => setNewElement({ ...newElement, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg h-24 resize-none"
                style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-lg"
                style={{ background: '#1c1c24', color: '#a1a1aa' }}
              >
                取消
              </button>
              <button
                onClick={handleAddElement}
                className="flex-1 px-4 py-2 rounded-lg"
                style={{ background: '#7c6af0', color: '#fff' }}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default World;