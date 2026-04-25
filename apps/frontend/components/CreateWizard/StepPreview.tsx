import React from 'react';

interface Props {
  data: {
    keyword: string;
    selectedTitle: string;
    genre: string;
    subGenre: string;
    hook: string;
    summary: string;
    targetWords?: number;
    // Outline
    outline: string;
    outlineStructure: string;
    // Characters
    characters: { name: string; role: string; desc: string }[];
    // World
    worldName: string;
    worldBackground: string;
    worldRules: string;
  };
  onCreate: () => void;
  loading: boolean;
}

const genreColors: Record<string, string> = {
  '玄幻': '#f59e0b', '科幻': '#3b82f6', '都市': '#10b981',
  '历史': '#ef4444', '悬疑': '#8b5cf6', '言情': '#ec4899',
  '奇幻': '#06b6d4', '军事': '#6b7280', '游戏': '#22c55e',
};

const structureLabels: Record<string, string> = {
  'single': '单幕式', 'dual': '双幕式', 'three': '三幕式', 'five': '五幕式',
};

const backgroundLabels: Record<string, string> = {
  'ancient': '古代', 'modern': '现代', 'future': '未来', 'fantasy': '架空',
};

const ruleLabels: Record<string, string> = {
  'cultivation': '修炼体系', 'magic': '魔法系统', 'tech': '科技水平', 'skill': '技能系统',
};

const roleLabels: Record<string, string> = {
  'protagonist': '主角', 'mentor': '导师', 'antagonist': '反派', 'ally': '盟友', 'love': '爱人', 'sidekick': '跟班',
};

const StepPreview: React.FC<Props> = ({ data, onCreate, loading }) => {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">确认作品信息</h1>
        <p className="text-gray-500 text-sm">检查以下信息，确认后即可开始创作</p>
      </div>

      {/* Preview Card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Cover area */}
        <div className="relative h-48 flex items-center justify-center" style={{
          background: `linear-gradient(135deg, ${genreColors[data.genre] || '#7c6af0'}15, ${genreColors[data.genre] || '#7c6af0'}05)`,
        }}>
          <div className="text-center">
            <div className="text-5xl mb-2">📖</div>
            <div className="text-lg font-bold text-white">{data.selectedTitle || data.keyword + '传说'}</div>
          </div>
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: `${genreColors[data.genre] || '#7c6af0'}20`, color: genreColors[data.genre] || '#a78bfa' }}
          >
            {data.genre} · {data.subGenre || '未分类'}
          </div>
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          {/* World Info */}
          {data.worldName && (
            <div className="p-3 rounded-xl" style={{ background: 'rgba(124,106,240,0.06)', border: '1px solid rgba(124,106,240,0.1)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🌍</span>
                <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>世界观</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(124,106,240,0.15)', color: '#a78bfa' }}>
                  {data.worldName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#71717a' }}>
                <span>{backgroundLabels[data.worldBackground] || '未设定'}</span>
                {data.worldRules && (
                  <>
                    <span>·</span>
                    <span>{ruleLabels[data.worldRules] || ''}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Outline Info */}
          {data.outline && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">📋 大纲</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                  {structureLabels[data.outlineStructure] || '双幕式'}
                </span>
              </div>
              <div className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>
                {data.outline}
              </div>
            </div>
          )}

          {/* Characters */}
          {data.characters && data.characters.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">👤 角色（{data.characters.length}人）</div>
              <div className="flex flex-wrap gap-2">
                {data.characters.map((char, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: '#a1a1aa' }}>
                    {char.name} · {roleLabels[char.role] || char.role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hook */}
          <div>
            <div className="text-xs text-gray-500 mb-1">🎯 核心看点</div>
            <div className="text-sm text-gray-200" style={{ lineHeight: 1.6 }}>「{data.hook || '未填写'}」</div>
          </div>

          {/* Summary */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">作品简介</span>
              {data.summary && (
                <span className="text-xs px-1.5 rounded" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
                  {data.summary.length}字
                </span>
              )}
            </div>
            <div className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>
              {data.summary || (
                <span style={{ color: '#3f3f46' }}>暂无简介</span>
              )}
            </div>
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: `${genreColors[data.genre] || '#7c6af0'}15`, color: genreColors[data.genre] || '#a78bfa' }}>
              #{data.genre}
            </span>
            {data.subGenre && (
              <span className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: '#a1a1aa' }}>
                #{data.subGenre}
              </span>
            )}
            {data.keyword && (
              <span className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: '#a1a1aa' }}>
                #{data.keyword}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Preview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '目标字数', value: '100万字', icon: '📊' },
          { label: '预计章节', value: '300-500章', icon: '📑' },
          { label: '当前状态', value: '草稿', icon: '📝' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
            <div className="text-sm font-semibold text-white mt-0.5">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* What's next */}
      <div className="p-5 rounded-xl" style={{ background: 'rgba(124,106,240,0.06)', border: '1px solid rgba(124,106,240,0.12)' }}>
        <div className="flex items-start gap-3">
          <span className="text-lg">✨</span>
          <div>
            <div className="text-sm font-medium" style={{ color: '#a78bfa' }}>创建后将自动进入编辑器</div>
            <div className="text-xs mt-1" style={{ color: '#6b7280' }}>
              你可以开始撰写第一章，或使用 AI 辅助生成大纲、角色和世界观
            </div>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onCreate}
          disabled={loading || !data.selectedTitle}
          className="px-12 py-4 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 disabled:opacity-30 shadow-lg flex items-center gap-2"
          style={{
            background: loading ? '#374151' : 'linear-gradient(135deg, #7c6af0, #a78bfa)',
            boxShadow: loading ? 'none' : '0 8px 32px rgba(124,106,240,0.3)',
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
              创建中...
            </>
          ) : (
            <>🚀 创建作品，开始创作</>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepPreview;