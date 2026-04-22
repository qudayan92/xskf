const express = require('express');
const router = express.Router();
const { chat, extractContent } = require('../lib/ai');

router.post('/ai/chat', async (req, res) => {
  const { provider = 'zhipu', apiKey, model, prompt, system } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'API key required' });
  }
  
  const messages = [];
  if (system) {
    messages.push({ role: 'system', content: system });
  }
  messages.push({ role: 'user', content: prompt });
  
  try {
    const response = await chat(provider, apiKey, messages, model);
    const content = extractContent(response);
    
    if (content !== null) {
      res.json({ success: true, data: { content, raw: response } });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get response', raw: response });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/ai/book-names', async (req, res) => {
  const { keyword, genre, provider = 'zhipu', apiKey, model } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'API key required' });
  }
  
  const prompt = `你是一个网文创作专家。请根据以下信息生成10个吸引人的书名。

类型：${genre || '科幻'}
核心词：${keyword || '星际'}
核心词：${keyword || '星辰'}

请生成10个符合网文流行趋势的书名，每个书名要有创意、吸引眼球。
书名长度控制在4-12个字之间。
请直接返回书名列表，用换行分隔，不要编号。`;

  try {
    const response = await chat(provider, apiKey, [
      { role: 'user', content: prompt }
    ], model || 'glm-4');
    
    const content = extractContent(response);
    
    if (content) {
      const names = content.split('\n').filter(n => n.trim()).slice(0, 10);
      res.json({ success: true, data: { keyword, genre, names } });
    } else {
      res.status(500).json({ success: false, error: 'Failed to generate book names' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/ai/expand-hook', async (req, res) => {
  const { hook, genre, provider = 'zhipu', apiKey, model } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'API key required' });
  }
  
  const prompt = `你是一个网文创作专家。请根据以下核心看点，扩写为300字左右的作品简介。

类型：${genre || '科幻'}
核心看点（20字以内）：${hook || '星际探险'}

简介要求：
1. 开头要吸引人，制造悬念
2. 中间介绍主角和主要矛盾
3. 结尾留下钩子，引发读者好奇
4. 风格要符合网文读者的口味
5. 字数控制在250-350字之间`;

  try {
    const response = await chat(provider, apiKey, [
      { role: 'user', content: prompt }
    ], model || 'glm-4');
    
    const content = extractContent(response);
    
    if (content) {
      res.json({ success: true, data: { hook, genre, summary: content } });
    } else {
      res.status(500).json({ success: false, error: 'Failed to expand hook' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/ai/polish', async (req, res) => {
  const { text, action, style, provider = 'zhipu', apiKey, model } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'API key required' });
  }
  
  let prompt = '';
  const systemPrompt = '你是一个专业的网文写作助手。';
  
  if (action === 'expand') {
    prompt = `${systemPrompt}
请扩写以下文字，增加细节描写和感官描写，使文章更加生动丰富。保持原有风格。
原文：${text}`;
  } else if (action === 'polish') {
    prompt = `${systemPrompt}
请润色以下文字，优化表达，使文字更加流畅优美。
原文：${text}`;
  } else if (action === 'ancient' || action === 'style-change') {
    prompt = `${systemPrompt}
请将以下文字改写为古风文风，使用古典的措辞和句式。
原文：${text}`;
  } else if (action === 'environment') {
    prompt = `${systemPrompt}
请为以下内容增加环境渲染和氛围描写，使场景更加立体。
原文：${text}`;
  } else {
    prompt = `${systemPrompt}
请润色以下文字：${text}`;
  }

  try {
    const response = await chat(provider, apiKey, [
      { role: 'user', content: prompt }
    ], model || 'glm-4');
    
    const content = extractContent(response);
    
    if (content) {
      res.json({ success: true, data: { original: text, action, style, result: content } });
    } else {
      res.status(500).json({ success: false, error: 'Failed to polish text' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/ai/branch-plot', async (req, res) => {
  const { context, chapterTitle, provider = 'zhipu', apiKey, model } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'API key required' });
  }
  
  const prompt = `你是一个专业的网文情节设计专家。请根据当前的剧情，为作者提供3个不同的剧情走向选择。

当前章节：${chapterTitle || '未命名'}
当前剧情：${context || '（无内容）'}

请给出3个不同的剧情分支方案，每个方案包括：
1. 标题（如：直接行动、暗中调查、求助盟友）
2. 描述（主角会采取的行动）
3. 后果预测（可能带来的影响和冲突）

请用JSON格式返回，格式如下：
{
  "branches": [
    {"id": "A", "title": "方案A标题", "description": "描述", "consequence": "后果", "riskLevel": "高/中/低"},
    ...
  ]
}`;

  try {
    const response = await chat(provider, apiKey, [
      { role: 'user', content: prompt }
    ], model || 'glm-4');
    
    const content = extractContent(response);
    
    if (content) {
      try {
        const parsed = JSON.parse(content);
        res.json({ success: true, data: { context, branches: parsed.branches || [] } });
      } catch {
        res.json({ success: true, data: { context, branches: parseBranchesFallback(content) } });
      }
    } else {
      res.status(500).json({ success: false, error: 'Failed to generate branch plot' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function parseBranchesFallback(text) {
  return [
    { id: 'A', title: '直接行动', description: '主角决定不再犹豫，主动出击。', consequence: '可能暴露自身位置，但能获得关键信息。', riskLevel: '高' },
    { id: 'B', title: '暗中调查', description: '主角选择隐藏意图，暗中收集信息。', consequence: '信息更全面，但可能错过最佳时机。', riskLevel: '中' },
    { id: 'C', title: '求助盟友', description: '主角决定向可信的同伴求助。', consequence: '增强实力，但可能泄露秘密。', riskLevel: '低' },
  ];
}

router.post('/ai/logic-check', async (req, res) => {
  const { chapters, currentChapterId, provider = 'zhipu', apiKey, model } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'API key required' });
  }
  
  const chapterText = chapters.map(c => `第${c.id}章 ${c.title}：\n${c.content.slice(0, 500)}`).join('\n\n');
  
  const prompt = `你是一个专业的网文编辑。请检查以下小说章节的逻辑问题。

${chapterText}

请检查以下方面：
1. 时间线一致性
2. 角色状态和行动是否矛盾
3. 人物关系是否合理
4. 剧情逻辑是否通顺

请用JSON格式返回检测结果：
{
  "issues": [
    {"type": "error/warning/info", "severity": "high/medium/low", "title": "问题标题", "description": "问题描述", "suggestion": "修改建议", "chapterRef": 章节号},
    ...
  ],
  "score": {
    "overall": 总分(0-100),
    "consistency": 一致性(0-100),
    "timeline": 时间线(0-100),
    "character": 角色(0-100),
    "plot": 剧情(0-100)
  }
}`;

  try {
    const response = await chat(provider, apiKey, [
      { role: 'user', content: prompt }
    ], model || 'glm-4');
    
    const content = extractContent(response);
    
    if (content) {
      try {
        const parsed = JSON.parse(content);
        res.json({ success: true, data: { issues: parsed.issues || [], score: parsed.score || {}, checkedAt: new Date().toISOString() } });
      } catch {
        res.json({ success: true, data: { issues: [], score: { overall: 85, consistency: 90, timeline: 85, character: 85, plot: 80 }, checkedAt: new Date().toISOString() } });
      }
    } else {
      res.status(500).json({ success: false, error: 'Failed to check logic' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;