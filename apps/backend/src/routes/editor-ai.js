const express = require('express');
const https = require('https');
const router = express.Router();

function callZhipuAI(messages, apiKey, model) {
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
          resolve(JSON.parse(body));
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

function callDeepSeekAI(messages, apiKey, model) {
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
          resolve(JSON.parse(body));
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

function callAI(messages, apiKey, model, provider) {
  if (provider === 'deepseek') {
    return callDeepSeekAI(messages, apiKey, model || 'deepseek-chat');
  }
  return callZhipuAI(messages, apiKey, model || 'glm-4');
}

function extractContent(response) {
  if (response.choices && response.choices[0] && response.choices[0].message) {
    return response.choices[0].message.content;
  }
  return null;
}

router.post('/ai/polish', async (req, res) => {
  const { text, action, style, provider, apiKey, model } = req.body;
  
  if (apiKey && provider) {
    try {
      let prompt = '';
      if (action === 'expand') {
        prompt = `请扩写以下文字，增加细节描写和感官描写，使文章更加生动丰富。保持原有风格。\n原文：${text}`;
      } else if (action === 'polish') {
        prompt = `请润色以下文字，优化表达，使文字更加流畅优美。\n原文：${text}`;
      } else if (action === 'ancient' || style === '古风') {
        prompt = `请将以下文字改写为古风文风，使用古典的措辞和句式。\n原文：${text}`;
      } else if (action === 'environment') {
        prompt = `请为以下内容增加环境渲染和氛围描写，使场景更加立体。\n原文：${text}`;
      } else {
        prompt = `请润色以下文字：\n${text}`;
      }
      
      const response = await callAI([{ role: 'user', content: prompt }], apiKey, model, provider);
      const content = extractContent(response);
      
      if (content) {
        return res.json({ success: true, data: { original: text, action, style, result: content } });
      }
    } catch (err) {
      console.error('Polish AI error:', err.message);
    }
  }
  
  const mockResults = {
    expand: `${text}，那种感觉如同流星一般穿过肺脸，在心外留下了无法擦除的痕迹。阳光透过窗帘洒在桌面上，他盯着那一根光柱，思绪已经飞到了万里之外。`,
    polish: text.replace(/\s+/g, '。').replace(/。/g, '，') + '。',
    ancient: `暮色苍茫间，${text.replace(/\s+/g, '')}，恰如那古老诗篇中描绘的画卷。风起了，树叶粗粝地响动着，似久远的时光在此刻倒流。`,
    environment: `四周的环境也为这一刻增添了浓厚的色彩——空气中弥漫着淡淡的铁锈味，远处的蓝荧闪烁着异常的光芒。${text}。`
  };
  
  const result = mockResults[action] || mockResults['polish'];
  res.json({ success: true, data: { original: text, action, style, result } });
});

router.post('/ai/dehumanize', async (req, res) => {
  const { text, level = 'normal', provider, apiKey, model } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ success: false, error: '文本不能为空' });
  }

  // 改进的提示词，更有效去除AI味
  const prompts = {
    light: `你是一个写作风格优化专家。请对以下文字进行轻度修改，去除AI写作痕迹，使其读起来更像人类自然写作的风格。

要求：
1. 保持原意完全不变
2. 减少过于完美的对仗工整句式
3. 让句式更自然流畅
4. 保持文章整体流畅性

原文：
${text}

请直接返回优化后的文字，不要加任何说明。`,
    normal: `你是一个专业编辑。请对以下文字进行修改，彻底去除AI写作痕迹，使其读起来更像人类自然写作的作品。

要求：
1. 保持原意和主要情节
2. 打破AI常用的完美句式结构
3. 增加自然的断句和停顿
4. 加入人类写作特有的细节和感受
5. 允许轻微的不完美表达

原文：
${text}

请直接返回优化后的文字，不要加任何说明。`,
    strong: `你是一个资深文字编辑。请对以下文字进行深度改写，完全去除AI写作痕迹，使其读起来就像一个经验丰富的人类作者写的。

要求：
1. 完全改变句式结构，避免AI的对仗工整
2. 增加自然的断句、重复、思考痕迹
3. 加入人类的情感细节和个人风格
4. 保持情节逻辑完整
5. 让文字有温度和呼吸感

原文：
${text}

请直接返回改写后的文字，不要加任何说明。`
  };

  const prompt = prompts[level] || prompts['normal'];
  let result = null;
  let errorMsg = null;

  // 尝试调用AI API
  if (apiKey && provider) {
    try {
      const response = await callAI([{ role: 'user', content: prompt }], apiKey, model, provider);
      const content = extractContent(response);

      if (content) {
        result = content;
      }
    } catch (err) {
      console.error('Dehumanize AI error:', err.message);
      errorMsg = err.message;
    }
  }

  // 如果没有AI结果，使用增强的模拟结果
  if (!result) {
    // 更智能的模拟去AI味
    let processed = text;

    if (level === 'strong') {
      // 深度处理：打乱句式，增加自然感
      processed = processed
        // 将连续的长句拆分成短句
        .replace(/，([^，]{10,})/g, '。$1')
        // 减少完美的对仗
        .replace(/。([^。]{0,2})。([^。]{0,2})。/g, '...$1, $2.')
        // 增加自然的停顿
        .replace(/\n\n/g, '\n')
        // 打乱过于整齐的列举
        .replace(/、([^、]{1,3})、([^、]{1,3})、/g, '，$1，$2，')
        // 添加自然的思考痕迹
        + '\n\n（人工润色）';
    } else if (level === 'light') {
      // 轻度处理：保持结构，只做微调
      processed = processed
        // 轻微打乱句尾
        .replace(/。$/, '......')
        .replace(/，$/, '，......')
        // 减少感叹号使用
        .replace(/！{2,}/g, '！')
        // 轻微调整
        .replace(/\n\n\n/g, '\n\n');
    } else {
      // 普通处理：中等程度
      processed = processed
        // 减少AI常用的完美句式
        .replace(/\.{2,}/g, '...')
        .replace(/，$/, '...')
        // 增加自然断句
        .replace(/。{2,}/g, '...')
        // 打乱过于整齐的句式
        .replace(/，([^，]{5,})，([^，]{5,})，/g, '...$1...$2...')
        // 添加标记
        + '\n\n（已优化表达）';
    }

    result = processed;
  }

  res.json({
    success: true,
    data: {
      original: text,
      level,
      result,
      error: errorMsg
    }
  });
});

router.post('/ai/branch-plot', async (req, res) => {
  const { context, chapterTitle, provider, apiKey, model } = req.body;
  
  if (apiKey && provider) {
    try {
      const prompt = `你是一个专业的网文情节设计专家。请根据当前的剧情，为作者提供3个不同的剧情走向选择。

当前章节：${chapterTitle || '未命名'}
当前剧情：${context || '（无内容）'}

请给出3个不同的剧情分支方案，每个方案包括：
1. 标题（如：直接行动、暗中调查、求助盟友）
2. 描述（主角会采取的行动）
3. 后果预测（可能带来的影响和冲突）
4. 风险等级（高/中/低）

请用JSON格式返回，格式如下：
{"branches": [{"id": "A", "title": "方案A标题", "description": "描述", "consequence": "后果", "riskLevel": "高"}, ...]}`;

      const response = await callAI([{ role: 'user', content: prompt }], apiKey, model, provider);
      const content = extractContent(response);
      
      if (content) {
        try {
          const parsed = JSON.parse(content);
          return res.json({ success: true, data: { context, branches: parsed.branches || [] } });
        } catch {
          // Fallback
        }
      }
    } catch (err) {
      console.error('Branch plot AI error:', err.message);
    }
  }
  
  const branches = [
    { id: 'A', title: '直接行动', description: '主角决定不再犹豫，主动出击，探索未知的真相。', consequence: '可能暴露自身位置，引来敌人的注意，但也能获得关键线索。', riskLevel: '高' },
    { id: 'B', title: '暗中调查', description: '主角选择隐藏意图，在暗中收集更多信息，寻找更好的时机。', consequence: '获得更多信息，但可能错过最佳时机，让对方先发制人。', riskLevel: '中' },
    { id: 'C', title: '求助盟友', description: '主角决定向可信的同伴求助，共同面对当前的困境。', consequence: '增强实力，但可能泄露秘密，或者被出卖。', riskLevel: '低' },
  ];
  
  res.json({ success: true, data: { context, branches } });
});

router.post('/ai/logic-check', async (req, res) => {
  const { chapters, currentChapterId, provider, apiKey, model } = req.body;
  
  if (apiKey && provider) {
    try {
      const chapterText = chapters.map(c => `第${c.id}章 ${c.title}：\n${(c.content || '').slice(0, 500)}`).join('\n\n');
      
      const prompt = `你是一个专业的网文编辑。请检查以下小说章节的逻辑问题。

${chapterText}

请检查以下方面：
1. 时间线一致性
2. 角色状态和行动是否矛盾
3. 人物关系是否合理
4. 剧情逻辑是否通顺

请用JSON格式返回检测结果：
{"issues": [{"type": "error/warning/info", "severity": "high/medium/low", "title": "问题标题", "description": "问题描述", "suggestion": "修改建议", "chapterRef": 章节号}, ...], "score": {"overall": 总分(0-100), "consistency": 一致性, "timeline": 时间线, "character": 角色, "plot": 剧情}}`;

      const response = await callAI([{ role: 'user', content: prompt }], apiKey, model, provider);
      const content = extractContent(response);
      
      if (content) {
        try {
          const parsed = JSON.parse(content);
          return res.json({ success: true, data: { issues: parsed.issues || [], score: parsed.score || {}, checkedAt: new Date().toISOString() } });
        } catch {
          // Fallback
        }
      }
    } catch (err) {
      console.error('Logic check AI error:', err.message);
    }
  }
  
  const issues = [
    { type: 'warning', severity: 'medium', title: '时间线重叠', description: '第3章描述时间为12:00，但第2章结束时为14:00，存在时间线冲突。', suggestion: '检查时间设定', chapterRef: 3 },
    { type: 'info', severity: 'low', title: '角色一致性', description: '角色名称与前文保持一致，未发现人设崩塌问题', suggestion: '无需修改', chapterRef: null },
    { type: 'error', severity: 'high', title: '角色状态冲突', description: '角色"查尔斯"在前文已离开，本章再次出现在现场', suggestion: '补充其回归的原因', chapterRef: 5 },
  ];
  
  const score = { overall: 82, consistency: 90, timeline: 75, character: 85, plot: 80 };
  
  res.json({ success: true, data: { issues, score, checkedAt: new Date().toISOString() } });
});

module.exports = router;