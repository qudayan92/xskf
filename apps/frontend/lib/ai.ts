import { getAIConfig, isMockMode } from '../components/AIConfigModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function callAI(endpoint: string, data: Record<string, any>): Promise<any> {
  const config = getAIConfig();

  const requestData = {
    ...data,
    provider: config.provider,
    apiKey: config.apiKey,
    model: config.model,
  };

try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }
      return await res.json();
    } catch (error) {
    console.error('AI API call failed:', error);
    throw error;
  }
}

export function getAIProviderLabel(): string {
  const config = getAIConfig();
  if (config.provider === 'mock') return '🤖 Mock';
  if (config.provider === 'openai') return `🌐 OpenAI ${config.model}`;
  if (config.provider === 'qwen') return `☁️ 通义千问 ${config.model}`;
  if (config.provider === 'zhipu') return `🔮 智谱AI ${config.model}`;
  return '🤖 Mock';
}

export function getAIConfigData() {
  return getAIConfig();
}