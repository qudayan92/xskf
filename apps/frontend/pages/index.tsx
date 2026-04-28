import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Novel {
  id: number;
  book_id: string;
  title: string;
  subtitle: string | null;
  status: number;
  word_count: number;
  chapter_count: number;
  cover_image: string | null;
  last_update_time: string | null;
}

const Home: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);

  useEffect(() => {
    setNovels(getMockNovels());
  }, []);

  const getMockNovels = (): Novel[] => [
    { id: 1, book_id: 'BK001', title: '星际流光', subtitle: '银河系边缘的星际探索', status: 1, word_count: 328000, chapter_count: 128, cover_image: null, last_update_time: new Date().toISOString() },
    { id: 2, book_id: 'BK002', title: '长安夜话', subtitle: '大唐盛世下的悬疑谜案', status: 1, word_count: 156000, chapter_count: 56, cover_image: null, last_update_time: new Date(Date.now() - 86400000).toISOString() },
  ];

  const steps = [
    { title: '构思', desc: '设定主题与方向', icon: '💡' },
    { title: '大纲', desc: 'AI 生成故事结构', icon: '📋' },
    { title: '角色', desc: '创建人物档案', icon: '👤' },
    { title: '世界观', desc: '完善背景设定', icon: '🌍' },
    { title: '创作', desc: '智能编辑协作', icon: '✍️' },
  ];

  const features = [
    { icon: '💡', title: '智能大纲', desc: 'AI 分析故事结构，生成逻辑清晰的情节脉络' },
    { icon: '👤', title: '角色建模', desc: '构建立体人物档案，性格、动机、外貌全方位刻画' },
    { icon: '🌍', title: '世界观构建', desc: '创建完整世界设定，历史、地理、文化一脉相承' },
    { icon: '✍️', title: '智能编辑', desc: '续写、润色、摘要，AI 与你共同创作' },
    { icon: '📋', title: '版本管理', desc: '多版本对比，历史追溯，协作更高效' },
    { icon: '📄', title: '多格式导出', desc: 'PDF、EPUB、Word，适配各类阅读与出版需求' },
  ];

  const upcoming = [
    { title: '语音创作', desc: '语音输入，AI 即时转文字' },
    { title: '智能校对', desc: '语法、标点、逻辑全面检测' },
    { title: '版权检测', desc: '原创性分析与相似度比对' },
    { title: '社区互动', desc: '读者反馈与创作交流' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', color: '#e4e4e7' }}>
      {/* Header */}
      <header style={{
        width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999,
        background: 'rgba(10, 10, 15, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', height: 64, position: 'relative', padding: '0 24px' }}>
          <div className="flex items-center gap-3" style={{ position: 'absolute', left: 24, top: 0, height: '100%' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c6af0, #6b5ce7)' }}>
              <span className="text-white font-bold text-sm">睿</span>
            </div>
            <span className="font-medium text-white">明睿创作</span>
          </div>
          <nav className="flex items-center gap-1" style={{ position: 'absolute', left: '50%', top: 0, height: '100%', transform: 'translateX(-50%)' }}>
            {[
              { name: '首页', href: '/', active: true },
              { name: '作品', href: '/works' },
              { name: '创作', href: '/editor' },
              { name: '世界观', href: '/world' },
              { name: '智能体', href: '/agents' },
              { name: '数据', href: '/analytics' },
            ].map((tab) => (
              <Link key={tab.name} href={tab.href} legacyBehavior>
                <a className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab.active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                style={tab.active ? { background: 'rgba(124,106,240,0.15)' } : {}}>
                  {tab.name}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 relative z-10" style={{ paddingTop: 80 }}>
        {/* Hero Section */}
        <section className="text-center mb-24" style={{ marginTop: 10 }}>
          <h1 className="text-5xl font-semibold mb-6" style={{ letterSpacing: '-0.02em' }}>
            <span style={{ color: '#7c6af0' }}>AI 赋能</span>的创作平台
          </h1>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
            智能大纲 · 角色建模 · 世界观构建，<br />
            让创作更高效，让故事更精彩。
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/create" legacyBehavior>
              <a className="px-8 py-4 text-white font-medium rounded-xl transition-all hover:shadow-lg" style={{
                background: 'linear-gradient(135deg, #7c6af0, #6b5ce7)',
                boxShadow: '0 4px 20px rgba(124,106,240,0.3)'
              }}>
                开始创作
              </a>
            </Link>
            <a href="#features" className="px-8 py-4 text-gray-300 font-medium rounded-xl transition-colors" style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              了解更多
            </a>
          </div>
        </section>

        {/* Steps Section */}
        <section className="mb-24">
          <h2 className="text-2xl font-semibold text-center mb-12">创作流程</h2>
          <div className="flex items-center justify-center gap-4">
            {[
              { title: '构思', desc: '设定主题与方向', icon: '💡', href: '/create' },
              { title: '大纲', desc: 'AI 生成故事结构', icon: '📋', href: '/editor' },
              { title: '角色', desc: '创建人物档案', icon: '👤', href: '/characters' },
              { title: '世界观', desc: '完善背景设定', icon: '🌍', href: '/world' },
              { title: '创作', desc: '智能编辑协作', icon: '✍️', href: '/editor' },
            ].map((step, i) => (
              <React.Fragment key={step.title}>
                <Link href={step.href} legacyBehavior>
                  <a className="block p-5 rounded-xl text-center cursor-pointer hover:scale-105 transition-all" style={{ width: 160, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="text-3xl mb-3">{step.icon}</div>
                    <h3 className="font-medium text-white mb-1">{step.title}</h3>
                    <p className="text-xs" style={{ color: '#71717a' }}>{step.desc}</p>
                  </a>
                </Link>
                {i < 4 && <div className="text-2xl" style={{ color: '#7c6af0' }}>→</div>}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mb-24">
          <h2 className="text-2xl font-semibold text-center mb-12">核心功能</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: '📚', title: '作品管理', desc: '管理所有作品', href: '/works', children: [
                { name: '角色库', href: '/characters' },
                { name: '版本历史', href: '/version-history' },
              ]},
              { icon: '✍️', title: 'AI编辑器', desc: '续写润色、AI增强，9大AI功能', href: '/editor', children: [
                { name: '大纲管理', href: '/outline' },
                { name: '工具集', href: '/tools' },
              ]},
              { icon: '🌍', title: '世界观', desc: '完善世界设定', href: '/world' },
              { icon: '🎭', title: '智能体', desc: 'AI创作助手', href: '/agents' },
              { icon: '📊', title: '数据统计', desc: '收益分析+趋势', href: '/analytics' },
              { icon: '💡', title: '开始创作', desc: 'AI驱动的创作流程', href: '/create' },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Link href={feature.href} legacyBehavior>
                  <a className="block cursor-pointer transition-all hover:scale-[1.02]">
                    <div className="text-3xl mb-4">{feature.icon}</div>
                    <h3 className="font-medium text-white mb-2">{feature.title}</h3>
                    <p className="text-sm mb-3" style={{ color: '#71717a', lineHeight: 1.7 }}>{feature.desc}</p>
                  </a>
                </Link>
                {feature.children && (
                  <div className="flex flex-wrap gap-2 mt-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    {feature.children.map((child, j) => (
                      <Link key={j} href={child.href} legacyBehavior>
                        <a className="text-xs px-2 py-1 rounded-md transition-colors hover:text-white" style={{ color: '#a78bfa', background: 'rgba(124,106,240,0.1)' }}>
                          {child.name} →
                        </a>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Section */}
        <section className="mb-24">
          <h2 className="text-lg font-medium mb-8" style={{ color: '#71717a' }}>即将推出</h2>
          <div className="grid grid-cols-4 gap-4">
            {upcoming.map((item, i) => (
              <div key={i} className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#71717a' }}>即将上线</span>
                <h3 className="font-medium text-gray-300 mt-2 mb-1">{item.title}</h3>
                <p className="text-xs" style={{ color: '#52525b' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-24">
          <div className="p-8 rounded-2xl flex flex-col items-center justify-center" style={{
            background: 'linear-gradient(135deg, rgba(124,106,240,0.1), rgba(107,92,231,0.05))',
            border: '1px solid rgba(124,106,240,0.2)',
            height: 174
          }}>
            <h2 className="text-xl font-semibold text-white mb-3">准备好开始你的创作了吗？</h2>
            <p className="text-sm mb-6" style={{ color: '#71717a' }}>立即体验 AI 智能创作，让你的故事与众不同</p>
            <Link href="/create" legacyBehavior>
              <a className="px-8 py-4 text-white font-medium rounded-xl" style={{
                background: 'linear-gradient(135deg, #7c6af0, #6b5ce7)',
                boxShadow: '0 4px 20px rgba(124,106,240,0.3)'
              }}>
                立即开始 ✍️
              </a>
            </Link>
          </div>
        </section>

        {/* Recent Works */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">最近创作</h2>
            <Link href="/works" legacyBehavior>
              <a className="text-sm" style={{ color: '#7c6af0' }}>查看全部 →</a>
            </Link>
          </div>
          {novels.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#71717a' }}>
              <div className="text-4xl mb-3">📖</div>
              <p>还没有作品，开始你的创作之旅吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {novels.map((novel) => (
                <Link key={novel.id} href={`/works/${novel.id}`} legacyBehavior>
                  <a className="block p-6 rounded-xl" style={{ background: '#16161c', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <h3 className="text-lg font-medium text-white mb-2">{novel.title}</h3>
                    <p className="text-sm" style={{ color: '#71717a' }}>{novel.subtitle}</p>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm" style={{ color: '#52525b' }}>© 2024 明睿创作 - 让创作更高效，让故事更精彩</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
