import React from 'react';

interface Props {
  data: { 
    worldName: string;
    worldBackground: string;
    worldRules: string;
  };
  updateData: (patch: any) => void;
  onNext: () => void;
}

const BACKGROUNDS = [
  { id: 'ancient', label: '古代', icon: '🏯', desc: '王朝、江湖、侠客' },
  { id: 'modern', label: '现代', icon: '🏙️', desc: '都市、职场、校园' },
  { id: 'future', label: '未来', icon: '🚀', desc: '星际、赛博、末世' },
  { id: 'fantasy', label: '架空', icon: '🧙', desc: '魔法、异世界、修仙' },
];

const RULE_SYSTEMS = [
  { id: 'cultivation', label: '修炼体系', desc: '灵石、功法、境界' },
  { id: 'magic', label: '魔法系统', desc: '元素、法则、咒语' },
  { id: 'tech', label: '科技水平', desc: 'AI、基因、太空' },
  { id: 'skill', label: '技能系统', desc: '系统流、升级流' },
];

const StepWorld: React.FC<Props> = ({ data, updateData, onNext }) => {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">构建世界观</h1>
        <p className="text-gray-500 text-sm">设定故事发生的时代和规则体系</p>
      </div>

      {/* World Name */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          🌍 世界名称
        </label>
        <input
          type="text"
          value={data.worldName}
          onChange={e => updateData({ worldName: e.target.value })}
          placeholder="如：星河联邦、九州大陆、赛博都市..."
          className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* Background */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          ⏰ 时代背景
        </label>
        <div className="grid grid-cols-4 gap-3">
          {BACKGROUNDS.map(b => (
            <button
              key={b.id}
              onClick={() => updateData({ worldBackground: b.id })}
              className="p-3 rounded-xl text-center transition-all"
              style={{
                background: data.worldBackground === b.id ? 'rgba(124,106,240,0.15)' : 'rgba(255,255,255,0.04)',
                border: data.worldBackground === b.id ? '1px solid rgba(124,106,240,0.3)' : '1px solid transparent',
              }}
            >
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-sm font-medium" style={{ color: data.worldBackground === b.id ? '#a78bfa' : '#e4e4e7' }}>
                {b.label}
              </div>
              <div className="text-xs mt-1" style={{ color: '#71717a' }}>{b.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Rule System */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          ⚡ 规则体系（可选）
        </label>
        <div className="grid grid-cols-4 gap-3">
          {RULE_SYSTEMS.map(r => (
            <button
              key={r.id}
              onClick={() => updateData({ worldRules: data.worldRules === r.id ? '' : r.id })}
              className="p-3 rounded-xl text-center transition-all"
              style={{
                background: data.worldRules === r.id ? 'rgba(124,106,240,0.15)' : 'rgba(255,255,255,0.04)',
                border: data.worldRules === r.id ? '1px solid rgba(124,106,240,0.3)' : '1px solid transparent',
              }}
            >
              <div className="text-sm font-medium" style={{ color: data.worldRules === r.id ? '#a78bfa' : '#e4e4e7' }}>
                {r.label}
              </div>
              <div className="text-xs mt-1" style={{ color: '#71717a' }}>{r.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onNext}
          disabled={!data.worldName.trim()}
          className="px-10 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 disabled:opacity-30"
          style={{ background: data.worldName.trim() ? '#7c6af0' : '#374151' }}
        >
          下一步：确认创建 →
        </button>
      </div>
    </div>
  );
};

export default StepWorld;