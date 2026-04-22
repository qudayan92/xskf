import React, { useState, useCallback } from 'react';

interface AIConfig {
  provider: 'openai' | 'qwen' | 'zhipu' | 'deepseek' | 'mock';
  apiKey: string;
  endpoint: string;
  model: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (config: AIConfig) => void;
}

const DEFAULT_CONFIG: AIConfig = {
  provider: 'mock',
  apiKey: '',
  endpoint: '',
  model: 'gpt-4',
};

const AIConfigModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const [config, setConfig] = useState<AIConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ai_config');
        return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const handleSave = useCallback(() => {
    localStorage.setItem('ai_config', JSON.stringify(config));
    onSave(config);
    onClose();
  }, [config, onSave, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden" style={{
        background: '#14141c',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <span className="font-semibold text-white">AI 配置</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-sm">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Provider */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">AI 提供商</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'mock', label: '🤖 Mock', desc: '模拟数据' },
                { id: 'openai', label: '🌐 OpenAI', desc: 'GPT-4/3.5' },
                { id: 'qwen', label: '☁️ 通义千问', desc: '阿里云' },
                { id: 'zhipu', label: '🔮 智谱AI', desc: 'GLM-4' },
                { id: 'deepseek', label: '🔭 DeepSeek', desc: 'DeepSeek' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setConfig(c => ({ ...c, provider: p.id as AIConfig['provider'] }))}
                  className={`p-3 rounded-xl text-center transition-all ${
                    config.provider === p.id ? 'border-2' : ''
                  }`}
                  style={{
                    background: config.provider === p.id ? 'rgba(124,106,240,0.1)' : 'rgba(255,255,255,0.03)',
                    border: config.provider === p.id ? '2px solid #7c6af0' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="text-sm font-medium" style={{ color: config.provider === p.id ? '#a78bfa' : '#a1a1aa' }}>
                    {p.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#71717a' }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          {config.provider !== 'mock' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                API Key <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={e => setConfig(c => ({ ...c, apiKey: e.target.value }))}
                placeholder={config.provider === 'zhipu' ? '6位Token或已授权token' : config.provider === 'deepseek' ? 'sk-...' : 'sk-...'}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <p className="text-xs mt-1.5" style={{ color: '#71717a' }}>
                {config.provider === 'openai' ? '从 OpenAI Platform 获取' : config.provider === 'qwen' ? '从阿里云百炼平台获取' : config.provider === 'zhipu' ? '从智谱AI开放平台获取' : config.provider === 'deepseek' ? '从 DeepSeek Platform 获取' : ''}
              </p>
            </div>
          )}

          {/* Endpoint */}
          {config.provider === 'openai' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">API Endpoint</label>
              <input
                type="text"
                value={config.endpoint}
                onChange={e => setConfig(c => ({ ...c, endpoint: e.target.value }))}
                placeholder="https://api.openai.com/v1"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          )}

          {/* Model */}
          {config.provider !== 'mock' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">模型</label>
              <select
                value={config.model}
                onChange={e => setConfig(c => ({ ...c, model: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {config.provider === 'openai' ? (
                  <>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </>
                ) : config.provider === 'qwen' ? (
                  <>
                    <option value="qwen-turbo">通义千问 Turbo</option>
                    <option value="qwen-plus">通义千问 Plus</option>
                    <option value="qwen-max">通义千问 Max</option>
                  </>
                ) : config.provider === 'deepseek' ? (
                  <>
                    <option value="deepseek-chat">DeepSeek Chat</option>
                    <option value="deepseek-coder">DeepSeek Coder</option>
                  </>
                ) : (
                  <>
                    <option value="glm-4">GLM-4</option>
                    <option value="glm-4-plus">GLM-4 Plus</option>
                    <option value="glm-4v">GLM-4V (视觉)</option>
                    <option value="glm-3-turbo">GLM-3 Turbo</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Current status */}
          <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: config.provider === 'mock' ? '#f59e0b' : '#22c55e' }}>●</span>
            <span className="text-xs" style={{ color: '#71717a' }}>
              当前模式：{config.provider === 'mock' ? 'Mock 模拟（使用预设数据）' : 
                config.provider === 'openai' ? `OpenAI · ${config.model}` :
                config.provider === 'qwen' ? `通义千问 · ${config.model}` :
                config.provider === 'deepseek' ? `DeepSeek · ${config.model}` :
                `智谱AI · ${config.model}`}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#a1a1aa' }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={config.provider !== 'mock' && !config.apiKey}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{ background: '#7c6af0' }}
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConfigModal;

export function getAIConfig(): AIConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const saved = localStorage.getItem('ai_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function isMockMode(): boolean {
  return getAIConfig().provider === 'mock';
}