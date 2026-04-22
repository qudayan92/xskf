import React from 'react';
import Link from 'next/link';

const DocsIndex: React.FC = () => {
  const sections = [
    {
      title: 'Getting Started',
      items: [
        { name: 'Overview', href: '/docs/overview', desc: '文档治理总览与目标' },
        { name: 'Architecture', href: '/docs/architecture', desc: '系统架构与模块设计' },
      ]
    },
    {
      title: 'API Reference',
      items: [
        { name: 'API v1', href: '/docs/api/v1', desc: 'REST API 端点文档' },
      ]
    },
    {
      title: 'Developer Guides',
      items: [
        { name: '快速开始', href: '/docs/quickstart', desc: '5分钟快速上手' },
        { name: '项目结构', href: '/docs/structure', desc: '代码组织与目录结构' },
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-black font-bold text-sm">睿</span>
              </div>
              <span className="font-display font-semibold text-lg text-white">明睿文档</span>
            </div>
            <nav className="flex items-center gap-1">
              <Link href="/" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-zinc-800/50">返回首页</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl font-bold mb-2">文档中心</h1>
        <p className="text-gray-400 mb-8">开放文档治理与开发指南，确保本地与云端的一致性</p>

        <div className="grid md:grid-cols-3 gap-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <h2 className="font-display text-lg font-semibold mb-4 text-white">{section.title}</h2>
              <div className="space-y-3">
                {section.items.map((item, j) => (
                  <Link key={j} href={item.href} legacyBehavior>
                    <a className="block p-3 rounded-lg border border-zinc-700/50 hover:border-amber-500/50 hover:bg-zinc-800/50 transition-all duration-200 cursor-pointer">
                      <h3 className="font-medium text-amber-400 text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <section className="mt-12 bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
          <h2 className="font-display text-lg font-semibold mb-4">Oh My OpenCodet 集成状态</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: '文档一致性检查', status: '已配置', ready: true },
              { name: '风格指南校验', status: '开发中', ready: false },
              { name: '跨链接检查', status: '计划中', ready: false },
            ].map((feature, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <span className="text-sm text-gray-200">{feature.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  feature.ready ? 'bg-green-600/20 text-green-400' : 'bg-zinc-700/50 text-gray-500'
                }`}>
                  {feature.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DocsIndex;