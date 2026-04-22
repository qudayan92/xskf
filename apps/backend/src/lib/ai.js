const https = require('https');

const AI_PROVIDERS = {
  mock: {
    enabled: true,
  },
  openai: {
    enabled: false,
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4',
  },
  zhipu: {
    enabled: true,
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4',
  },
  qwen: {
    enabled: false,
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-turbo',
  },
  deepseek: {
    enabled: true,
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  },
};

function getProviderConfig(provider) {
  const config = AI_PROVIDERS[provider] || AI_PROVIDERS.mock;
  return config;
}

function callZhipuAI(messages, apiKey, model = 'glm-4') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ model, messages });
    const options = {
      hostname: 'open.bigmodel.cn',
      path: '/api/paas/v4/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function callQwenAI(messages, apiKey, model = 'qwen-turbo') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ model, messages });
    const options = {
      hostname: 'dashscope.aliyuncs.com',
      path: '/compatible-mode/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function callDeepSeekAI(messages, apiKey, model = 'deepseek-chat') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ model, messages });
    const options = {
      hostname: 'api.deepseek.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function chat(provider, apiKey, messages, model) {
  if (provider === 'zhipu') {
    return callZhipuAI(messages, apiKey, model);
  } else if (provider === 'qwen') {
    return callQwenAI(messages, apiKey, model);
  } else if (provider === 'openai' || provider === 'deepseek') {
    return callDeepSeekAI(messages, apiKey, model);
  }
  throw new Error(`Unknown provider: ${provider}`);
}

function extractContent(response) {
  if (response.choices && response.choices[0] && response.choices[0].message) {
    return response.choices[0].message.content;
  }
  if (response.data && response.data.choices && response.data.choices[0]) {
    return response.data.choices[0].text;
  }
  return null;
}

module.exports = {
  getProviderConfig,
  chat,
  extractContent,
  AI_PROVIDERS,
};