import React from 'react';

interface Props {
  data: { characters: { name: string; role: string; desc: string }[] };
  updateData: (patch: any) => void;
  onNext: () => void;
}

const ROLE_OPTIONS = [
  { id: 'protagonist', label: '主角', icon: '⭐' },
  { id: 'mentor', label: '导师', icon: '🧙' },
  { id: 'antagonist', label: '反派', icon: '💀' },
  { id: 'ally', label: '盟友', icon: '🤝' },
  { id: 'love', label: '爱人', icon: '💕' },
  { id: 'sidekick', label: '跟班', icon: '🐕' },
];

const PRESET_CHARACTERS = [
  { name: '林远航', role: 'protagonist', desc: '勇敢的星际探索员' },
  { name: '神秘导师', role: 'mentor', desc: '智慧的长者' },
  { name: '暗影女王', role: 'antagonist', desc: '神秘势力首领' },
  { name: '艾莉娜', role: 'ally', desc: '飞船驾驶员' },
];

const StepCharacters: React.FC<Props> = ({ data, updateData, onNext }) => {
  const characters = data.characters || [];
  const maxChars = 5;

  const addCharacter = (preset?: { name: string; role: string; desc: string }) => {
    if (characters.length >= maxChars) return;
    const newChar = preset || { name: '', role: 'protagonist', desc: '' };
    updateData({ characters: [...characters, newChar] });
  };

  const updateCharacter = (index: number, field: string, value: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ characters: updated });
  };

  const removeCharacter = (index: number) => {
    updateData({ characters: characters.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">创建核心角色</h1>
        <p className="text-gray-500 text-sm">添加主要人物，塑造故事灵魂（{characters.length}/{maxChars}）</p>
      </div>

      {/* Character Cards */}
      <div className="space-y-4">
        {characters.map((char, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: '#a78bfa' }}>角色 {i + 1}</span>
              <button
                onClick={() => removeCharacter(i)}
                className="text-xs text-gray-500 hover:text-red-400"
              >
                删除
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={char.name}
                onChange={e => updateCharacter(i, 'name', e.target.value)}
                placeholder="姓名"
                className="px-3 py-2 rounded-lg text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <select
                value={char.role}
                onChange={e => updateCharacter(i, 'role', e.target.value)}
                className="px-3 py-2 rounded-lg text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {ROLE_OPTIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.icon} {r.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={char.desc}
                onChange={e => updateCharacter(i, 'desc', e.target.value)}
                placeholder="一句话描述"
                className="px-3 py-2 rounded-lg text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
        ))}

        {/* Add Button */}
        {characters.length < maxChars && (
          <button
            onClick={() => addCharacter()}
            className="w-full p-4 rounded-xl border-2 border-dashed text-center transition-all hover:border-purple-500/30"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#71717a' }}
          >
            <span className="text-2xl">+</span>
            <div className="text-sm mt-1">添加角色</div>
          </button>
        )}
      </div>

      {/* Preset Characters */}
      <div className="p-4 rounded-xl" style={{ background: 'rgba(124,106,240,0.06)', border: '1px solid rgba(124,106,240,0.12)' }}>
        <div className="text-xs mb-3" style={{ color: '#a78bfa' }}>快速添加（点击添加）</div>
        <div className="flex flex-wrap gap-2">
          {PRESET_CHARACTERS.map((preset, i) => (
            <button
              key={i}
              onClick={() => {
                // Check if already exists
                if (!characters.find(c => c.name === preset.name)) {
                  addCharacter(preset);
                }
              }}
              disabled={characters.length >= maxChars || characters.some(c => c.name === preset.name)}
              className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-30"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#e4e4e7',
              }}
            >
              {preset.name} ({ROLE_OPTIONS.find(r => r.id === preset.role)?.label})
            </button>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onNext}
          disabled={characters.length === 0}
          className="px-10 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 disabled:opacity-30"
          style={{ background: characters.length > 0 ? '#7c6af0' : '#374151' }}
        >
          下一步：构建世界观 →
        </button>
      </div>
    </div>
  );
};

export default StepCharacters;