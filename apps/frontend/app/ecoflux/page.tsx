'use client';

import { Droplets, Thermometer, Shield, RotateCw, Leaf, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const specs = [
  { icon: Droplets, label: '容量', value: '500ml / 750ml' },
  { icon: Thermometer, label: '保温', value: '12h 热 · 24h 冷' },
  { icon: Shield, label: '材质', value: '304 不锈钢 + 再生海洋塑料' },
  { icon: RotateCw, label: '替代', value: '10,000+ 一次性塑料瓶' },
];

const colors = [
  { name: '深林绿', hex: '#2d6a4f', ring: true },
  { name: '岩石灰', hex: '#6c757d' },
  { name: '冰川白', hex: '#e9ecef' },
];

export default function EcoFluxPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d6a4f20] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-10 pt-20 pb-12 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2d6a4f20] text-[#4ade80] text-sm mb-8">
            <Leaf size={14} />
            B-Corp 认证 · 碳中和
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
            EcoFlux
          </h1>
          <p className="text-xl text-[var(--text-secondary)] mb-3 leading-relaxed">
            可持续随行杯
          </p>
          <p className="text-base text-[var(--text-tertiary)] mb-10 max-w-xl mx-auto leading-relaxed">
            每天 100 万个塑料瓶被丢弃。你的一小步，就是地球的一大步。
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="primary" className="text-base px-8 py-3 bg-[#2d6a4f] hover:bg-[#1b4332] border-[#2d6a4f]">
              立即购买 ¥249
            </Button>
            <Button variant="secondary" className="text-base px-8 py-3">
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="section-divider" />
      <section className="max-w-5xl mx-auto px-10 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {specs.map((spec) => (
            <div key={spec.label} className="text-center p-6 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
              <spec.icon size={22} className="text-[#4ade80] mx-auto mb-3" />
              <div className="stat-number">{spec.value}</div>
              <div className="stat-label">{spec.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <div className="section-divider" />
      <section className="max-w-5xl mx-auto px-10 py-16">
        <h2 className="text-2xl font-semibold text-center mb-12">每一口都安心</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: '医疗级内壁',
              desc: '电解研磨工艺处理，不残留异味、不滋生细菌，每一口都是纯粹滋味。',
            },
            {
              icon: Thermometer,
              title: '双层真空',
              desc: '18/8 食品级不锈钢杯体，保温 12 小时、保冷 24 小时，四季皆宜。',
            },
            {
              icon: Leaf,
              title: '再生外壳',
              desc: '30% 回收海洋塑料制成杯身外壳，轻至 220g，每一道纹理都独一无二。',
            },
          ].map((f) => (
            <div key={f.title} className="text-center p-6 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] border border-[var(--glass-border)] hover:border-[#2d6a4f40] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#2d6a4f20] flex items-center justify-center mx-auto mb-4">
                <f.icon size={22} className="text-[#4ade80]" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* One bottle = 10,000 */}
      <div className="section-divider" />
      <section className="max-w-5xl mx-auto px-10 py-16">
        <div className="rounded-[var(--radius-lg)] bg-gradient-to-br from-[#2d6a4f15] to-[#1b433215] border border-[#2d6a4f20] p-10 text-center">
          <RotateCw size={40} className="text-[#4ade80] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            一瓶换千瓶
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-lg mx-auto leading-relaxed">
            设计寿命超过 10 年。每购买一个 EcoFlux，我们通过 Plastic Bank
            回收等量海洋塑料，双重抵消你的塑料足迹。
          </p>
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
            <Award size={18} className="text-[#4ade80]" />
            <span className="text-sm text-[var(--text-secondary)]">终身质保 · 碳中和认证 · B-Corp 认证</span>
          </div>
        </div>
      </section>

      {/* Colors + CTA */}
      <div className="section-divider" />
      <section className="max-w-5xl mx-auto px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-4">选择你的颜色</h2>
            <div className="flex gap-4 mb-6">
              {colors.map((c) => (
                <button key={c.name} className="flex flex-col items-center gap-2 group">
                  <div
                    className={`w-10 h-10 rounded-full border-2 transition-all ${c.ring ? 'border-[#4ade80] ring-2 ring-[#4ade8040]' : 'border-[var(--glass-border)] group-hover:border-[var(--text-secondary)]'}`}
                    style={{ background: c.hex }}
                  />
                  <span className="text-xs text-[var(--text-muted)]">{c.name}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mb-6">购买即赠定制激光刻字服务</p>
            <Button variant="primary" className="text-base px-8 py-3 bg-[#2d6a4f] hover:bg-[#1b4332] border-[#2d6a4f]">
              立即购买 ¥249
            </Button>
          </div>
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#2d6a4f30] to-[#1b433230] border border-[#2d6a4f20] flex items-center justify-center">
            <Droplets size={80} className="text-[#4ade8040]" />
          </div>
        </div>
      </section>

      <footer className="border-t border-[rgba(0,0,0,0.05)] py-8 text-center text-sm text-[var(--text-muted)]">
        EcoFlux — 不只是喝水，是选择一种态度
      </footer>
    </div>
  );
}
