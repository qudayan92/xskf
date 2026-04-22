import React from 'react';
import Link from 'next/link';

const Analytics: React.FC = () => {
  const stats = [
    { label: '总字数', value: '573K', change: '+12%' },
    { label: '作品数', value: '4', change: '+1' },
    { label: '章节数', value: '216', change: '+8' },
    { label: '角色数', value: '12', change: '+3' },
  ];

  const writingActivity = [
    { day: '周一', words: 3200 },
    { day: '周二', words: 4500 },
    { day: '周三', words: 2800 },
    { day: '周四', words: 5200 },
    { day: '周五', words: 3800 },
    { day: '周六', words: 6100 },
    { day: '周日', words: 4900 },
  ];

  const aiUsage = [
    { name: 'AI 续写', count: 128, percent: 35 },
    { name: 'AI 润色', count: 86, percent: 24 },
    { name: 'AI 摘要', count: 52, percent: 14 },
    { name: 'AI 对话', count: 99, percent: 27 },
  ];

  const quality = [
    { label: '语句通顺度', score: 92 },
    { label: '情节连贯性', score: 88 },
    { label: '人物塑造', score: 85 },
    { label: '风格一致性', score: 95 },
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
              { name: '智能体', href: '/agents' },
              { name: '世界观', href: '/world' },
              { name: '数据', href: '/analytics', active: true },
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
          <h1 className="text-2xl font-semibold">智能数据</h1>
          <select className="input w-40">
            <option>全部作品</option>
            <option>星际流光</option>
            <option>长安夜话</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="p-5 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="stat-number mb-1">{stat.value}</div>
              <div className="flex items-center justify-between">
                <div className="stat-label">{stat.label}</div>
                <span className="text-xs" style={{ color: '#4ade80' }}>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Writing Activity */}
          <div className="p-6 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h2 className="text-base font-medium mb-6">📊 写作活跃度</h2>
            <div className="flex items-end justify-between h-32 gap-2">
              {writingActivity.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${(day.words / 7000) * 100}%`,
                      minHeight: '8px',
                      background: 'rgba(124, 106, 240, 0.3)'
                    }}
                  />
                  <span className="text-xs" style={{ color: '#52525b' }}>{day.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xs" style={{ color: '#71717a' }}>本周创作：30,500 字</span>
              <span className="text-xs" style={{ color: '#4ade80' }}>↑ 15%</span>
            </div>
          </div>

          {/* AI Usage */}
          <div className="p-6 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h2 className="text-base font-medium mb-6">🤖 AI 功能使用</h2>
            <div className="space-y-4">
              {aiUsage.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm" style={{ color: '#a1a1aa' }}>{item.name}</span>
                    <span className="text-xs" style={{ color: '#71717a' }}>{item.count} 次</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 text-sm" style={{ color: '#71717a', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              AI 协助创作占比：38%
            </div>
          </div>

          {/* Quality */}
          <div className="p-6 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h2 className="text-base font-medium mb-6">✨ 创作质量</h2>
            <div className="grid grid-cols-2 gap-4">
              {quality.map((item, i) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: '#1c1c24' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold" style={{ color: item.score >= 90 ? '#4ade80' : '#fbbf24' }}>
                      {item.score}%
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: '#71717a' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(124,106,240,0.08), rgba(107,92,231,0.04))', border: '1px solid rgba(124,106,240,0.2)' }}>
            <h2 className="text-base font-medium mb-4">💡 AI 创作建议</h2>
            <div className="space-y-2">
              {[
                '当前章节对话较多，建议增加环境描写',
                '主角在近 5 章中较少出现',
                '建议在下一章引入新的冲突元素',
                '当前节奏偏慢，可以加快情节推进',
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-amber-400 mt-0.5">•</span>
                  <p className="text-sm" style={{ color: '#a1a1aa' }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;