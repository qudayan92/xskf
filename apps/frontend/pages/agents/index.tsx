import React from 'react';
import Link from 'next/link';

const Agents: React.FC = () => {
  const agents = [
    { id: 1, name: '林远航', role: '主角', age: '28岁', personality: '冷静果断，善于思考，对未知充满好奇', avatar: '👨‍🚀' },
    { id: 2, name: '苏瑶', role: '女主', age: '26岁', personality: '聪慧机敏，外交官背景，善于沟通', avatar: '👩‍💼' },
    { id: 3, name: '神秘向导', role: '导师', age: '未知', personality: '古老文明的守护者，神秘莫测', avatar: '🧙' },
    { id: 4, name: '艾伦·科尔特', role: '反派', age: '45岁', personality: '野心勃勃，权谋深沉，不择手段', avatar: '🦹' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0f0f12', color: '#e4e4e7' }}>
      {/* Header */}
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
              { name: '智能体', href: '/agents', active: true },
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-1">智能体</h1>
            <p className="text-sm" style={{ color: '#71717a' }}>创建和管理你的故事角色</p>
          </div>
          <button className="px-5 py-2.5 text-sm font-medium rounded-lg" style={{ background: '#7c6af0', color: '#fff' }}>
            + 创建智能体
          </button>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          {agents.map((agent) => (
            <div key={agent.id} className="p-6 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #7c6af0, #6b5ce7)' }}>
                  {agent.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white">{agent.name}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full" style={{ 
                      background: agent.role === '主角' ? 'rgba(124,106,240,0.15)' : 
                                   agent.role === '女主' ? 'rgba(236,72,153,0.15)' :
                                   agent.role === '反派' ? 'rgba(248,113,113,0.15)' :
                                   'rgba(124,106,240,0.15)',
                      color: agent.role === '主角' ? '#7c6af0' : 
                             agent.role === '女主' ? '#ec4899' :
                             agent.role === '反派' ? '#f87171' :
                             '#7c6af0'
                    }}>
                      {agent.role}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#71717a' }}>{agent.age}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs mb-1.5" style={{ color: '#52525b' }}>性格特点</div>
                <p className="text-sm" style={{ color: '#a1a1aa', lineHeight: 1.6 }}>{agent.personality}</p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 text-sm rounded-lg" style={{ background: '#1c1c24', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.06)' }}>
                  编辑
                </button>
                <button className="flex-1 px-3 py-2 text-sm rounded-lg" style={{ background: 'rgba(124,106,240,0.15)', color: '#7c6af0' }}>
                  AI 对话
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* AI Generate */}
        <div className="p-6 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
          <h2 className="text-lg font-medium mb-4">AI 角色生成</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="描述你想要的角色..."
              className="input flex-1"
            />
            <select className="input w-32">
              <option>主角</option>
              <option>女主</option>
              <option>配角</option>
              <option>反派</option>
              <option>导师</option>
            </select>
            <button className="px-6 py-3 font-medium rounded-lg" style={{ background: '#7c6af0', color: '#fff' }}>
              AI 生成
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Agents;