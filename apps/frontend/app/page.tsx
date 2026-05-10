'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Globe, Sparkles, ArrowRight, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getProjects } from '@/lib/api';
import type { Project } from '@/types';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects()
      .then((res) => setProjects(res.data.data || []))
      .catch(() => {});
  }, []);

  const totalWords = projects.reduce((sum, p) => sum + (p.word_count || 0), 0);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-10 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-glow)] text-[var(--accent-primary)] text-sm mb-8">
          <Sparkles size={14} />
          AI 赋能创作
        </div>
        <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
          明睿创作
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto leading-relaxed">
          AI 驱动的小说创作平台。从构思到成稿，智能辅助每一步创作流程。
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/projects">
            <Button variant="primary" className="text-base px-8 py-3">
              <PenLine size={18} />
              开始创作
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="secondary" className="text-base px-8 py-3">
              我的项目
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      {projects.length > 0 && (
        <section className="max-w-5xl mx-auto px-10 py-12">
          <div className="glass-panel py-12 px-8 flex items-center justify-around">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center">
                <BookOpen size={24} className="text-[var(--accent-primary)]" />
              </div>
              <div>
                <div className="stat-number">{projects.length}</div>
                <div className="stat-label">创作项目</div>
              </div>
            </div>
            <div className="w-px h-16 bg-[var(--glass-border)]" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center">
                <PenLine size={24} className="text-[var(--accent-primary)]" />
              </div>
              <div>
                <div className="stat-number">{totalWords.toLocaleString()}</div>
                <div className="stat-label">总字数</div>
              </div>
            </div>
            <div className="w-px h-16 bg-[var(--glass-border)]" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
                <Sparkles size={22} className="text-[var(--success)]" />
              </div>
              <div>
                <div className="stat-number">{projects.filter((p) => p.status === 'completed').length}</div>
                <div className="stat-label">已完成</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
<section className="max-w-5xl mx-auto px-10 py-16">
        <h2 className="text-2xl font-semibold mb-12">创作流程</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, title: '项目管理', desc: '创建和管理你的小说项目，设定目标与风格' },
            { icon: PenLine, title: '智能编辑', desc: '沉浸式写作体验，AI 辅助续写、润色与扩展' },
            { icon: Users, title: '角色塑造', desc: '构建丰富的角色体系，管理人物关系与成长弧' },
            { icon: Globe, title: '世界观', desc: '打造独特的虚构世界，管理地点、势力与历史' },
          ].map((feature) => (
            <Card key={feature.title} hover={true}>
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center mb-4">
                <feature.icon size={24} className="text-[var(--accent-primary)]" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-10 py-16">
        <div className="relative rounded-[24px] text-center text-white overflow-hidden py-[60px] px-10"
          style={{
            background: [
              'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 40%)',
              'linear-gradient(135deg, #a166ff 0%, #804dee 100%)',
            ].join(', '),
            boxShadow: '0 20px 40px rgba(128,77,238,0.2)',
          }}
        >
          <h2 className="text-[32px] font-bold mb-4">准备好开始你的创作了吗？</h2>
          <p className="text-base opacity-90 leading-relaxed mb-8 max-w-lg mx-auto">
            加入 AI 智能写作平台，在更短时间内创作出更优质的内容。现在就开始，释放你的创作潜力。
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <Link href="/projects">
              <button className="px-8 py-3 bg-white text-[#804dee] font-semibold rounded-[12px] hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300">
                开始创作
              </button>
            </Link>
            <Link href="/projects">
              <button className="px-8 py-3 bg-white/10 text-white font-medium rounded-[12px] border border-white/30 hover:bg-white/20 transition-all duration-300"
                style={{ backdropFilter: 'blur(5px)' }}>
                浏览项目
              </button>
            </Link>
          </div>
          <div className="flex justify-center gap-5 text-[13px] opacity-70">
            <span>AI 智能辅助</span>
            <span>免费开始使用</span>
            <span>随时随地创作</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(0,0,0,0.05)] py-8 text-center text-sm text-[var(--text-muted)]">
        明睿创作 — AI 小说创作平台
      </footer>
    </div>
  );
}
