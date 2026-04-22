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

router.post('/ai/book-names', async (req, res) => {
  const { keyword, genre, provider, apiKey, model } = req.body;
  
  // Use real AI if API key is provided
  if (apiKey && provider) {
    try {
      const messages = [{
        role: 'user',
        content: `你是一个网文创作专家。请根据以下信息生成10个吸引人的书名。

类型：${genre || '科幻'}
核心词：${keyword || '星际'}

请生成10个符合网文流行趋势的书名，每个书名要有创意、吸引眼球。
书名长度控制在4-12个字之间。
请直接返回书名列表，用换行分隔，不要编号。`
      }];
      
      const response = await callAI(messages, apiKey, model, provider);
      
      const content = extractContent(response);
      
      if (content) {
        const names = content.split('\n').filter(n => n.trim()).slice(0, 10);
        return res.json({ success: true, data: { keyword, genre, names } });
      }
    } catch (err) {
      console.error('Real AI error:', err.message);
    }
  }
  
  // Fallback to mock data
  const nameTemplates = {
    '玄幻': ['{k}纪元','{k}传说','万古{k}','{k}至尊','绝世{k}','{k}帝尊','混沌{k}','{k}天道'],
    '科幻': ['{k}星途','星际{k}','{k}纪元','穹顶{k}','{k}轨迹','银河{k}','虚空{k}','{k}彼岸'],
    '都市': ['{k}人生','巅峰{k}','{k}之王','都市{k}','{k}传奇','绝世{k}','{k}枭雄','重生之{k}'],
    '历史': ['{k}风云','大唐{k}','{k}天下','乱世{k}','{k}江山','帝国{k}','烽火{k}','{k}春秋'],
    '悬疑': ['{k}迷局','深渊{k}','{k}密码','暗夜{k}','{k}诡事','迷雾{k}','{k}追踪','致命{k}'],
    '言情': ['{k}之恋','遇见{k}','{k}时光','倾城{k}','{k}约定','深爱{k}','{k}物语','如果{k}'],
    '奇幻': ['{k}魔法师','幻境{k}','{k}王座','魔法{k}','{k}编年史','奥术{k}','元素{k}','{k}法则'],
    '军事': ['铁血{k}','{k}锋芒','战地{k}','{k}突击','利剑{k}','特战{k}','{k}防线','荣耀{k}'],
    '游戏': ['{k}时代','网游之{k}','全职{k}','{k}大师','巅峰{k}','王者{k}','{k}之路','超神{k}']
  };
  const defaultTemplates = ['{k}传说','无尽{k}','{k}之旅','永恒{k}','{k}纪元','神秘{k}','{k}觉醒','命运{k}','终极{k}','{k}起源'];
  const templates = (genre && nameTemplates[genre]) || defaultTemplates;
  const k = keyword || '星辰';
  const names = templates.map(t => t.replace('{k}', k));
  const extraNames = [`${k}·起源`,`第${Math.floor(Math.random()*9)+1}${k}`,`${k}：觉醒`,`穿越之${k}`];
  res.json({ success: true, data: { keyword: k, genre, names: [...names.slice(0,6),...extraNames].slice(0,10) } });
});

router.post('/ai/expand-hook', async (req, res) => {
  const { hook, genre, provider, apiKey, model } = req.body;
  
  if (apiKey && provider) {
    try {
      const messages = [{
        role: 'user',
        content: `你是一个网文创作专家。请根据以下核心看点，扩写为300字左右的作品简介。

类型：${genre || '科幻'}
核心看点（20字以内）：${hook || '星际探险'}

简介要求：
1. 开头要吸引人，制造悬念
2. 中间介绍主角和主要矛盾
3. 结尾留下钩子，引发读者好奇
4. 风格要符合网文读者的口味
5. 字数控制在250-350字之间`
      }];
      
      const response = await callAI(messages, apiKey, model, provider);
      const content = extractContent(response);
      
      if (content) {
        return res.json({ success: true, data: { hook, genre, summary: content } });
      }
    } catch (err) {
      console.error('Real AI error:', err.message);
    }
  }
  
  // Fallback to mock
  const summaries = {
    '玄幻': `在浩瀚无垠的修仙界中，${hook||'一个平凡少年'}意外获得了上古传承，从此踏上了一条与众不同的修行之路。面对宗门的倾轧、强敌的追杀以及天道的无情考验，他凭借过人的毅力和机缘，一步步突破境界，最终问鼎巅峰。然而，当真相逐渐浮出水面时，他发现自己所认知的世界，不过是更大棋局中的一枚棋子……`,
    '科幻': `公元3047年，人类文明已遍布银河系。${hook||'在一次例行的深空探索任务中'}，探索员林远航的飞船截获了一段来自未知文明的加密信号。这段信号不仅颠覆了人类对宇宙的认知，更牵扯出一个隐藏在星际联盟背后的惊天阴谋。`,
    '都市': `繁华都市的霓虹灯下，${hook||'一个看似普通的年轻人'}过着朝九晚五的生活。然而一次意外的相遇，彻底改变了他的人生轨迹。`,
    '历史': `大唐盛世，万国来朝。${hook||'长安城内'}，一位年轻的书生因一首诗词而名动天下，却也因此卷入了朝堂的权力漩涡。`,
    '悬疑': `深夜的雨声掩盖了一切罪恶。${hook||'一具无名尸体的发现'}，让平静的小镇掀起了轩然大波。`,
    '言情': `${hook||'那是一个阳光明媚的下午'}，他们的故事从一场意外的邂逅开始。`,
    '奇幻': `在这个魔法与剑气交织的世界里，${hook||'一个被预言选中的少年'}踏上了寻找失落魔法的旅程。`,
    '军事': `边境线上，硝烟弥漫。${hook||'一支特种部队'}接到了一项几乎不可能完成的任务。`,
    '游戏': `《幻界》——全球首款全沉浸式虚拟现实游戏，${hook||'一位普通玩家'}意外触发了隐藏剧情。`
  };
  res.json({ success: true, data: { hook, genre, summary: summaries[genre] || summaries['科幻'] } });
});

router.post('/ai/genre-corpus', (req, res) => {
  const { genre } = req.body;
  const corpusData = {
    '玄幻': { subGenres: ['系统流','无敌流','重生流','穿越流','洪荒流','修仙流'], keywords: ['修炼','突破','境界','丹药'], tropes: ['废柴逆袭','奇遇获宝'] },
    '科幻': { subGenres: ['硬科幻','软科幻','太空歌剧','赛博朋克','时间旅行'], keywords: ['星际','飞船','虫洞','量子'], tropes: ['第一次接触','技术奇点'] },
    '都市': { subGenres: ['神医流','总裁文','重生商战','娱乐明星'], keywords: ['商业','豪门','逆袭'], tropes: ['英雄救美','打脸爽文'] },
    '历史': { subGenres: ['架空历史','穿越历史','三国演义','唐宋明清'], keywords: ['朝堂','权谋','战役'], tropes: ['穿越改革','科技兴国'] },
    '悬疑': { subGenres: ['本格推理','犯罪心理','惊悚恐怖','密室推理'], keywords: ['谋杀','动机','不在场证明'], tropes: ['暴风雪山庄','叙述性诡计'] },
    '言情': { subGenres: ['现代言情','古代言情','校园青春','豪门甜宠'], keywords: ['初恋','暗恋','表白'], tropes: ['欢喜冤家','青梅竹马'] },
    '奇幻': { subGenres: ['西幻','东方奇幻','DND风格','克苏鲁'], keywords: ['魔法','巨龙','精灵'], tropes: ['勇者斗恶龙','魔法学院'] },
    '军事': { subGenres: ['现代战争','特种作战','抗战题材','未来战争'], keywords: ['战术','狙击','侦察'], tropes: ['孤胆英雄','小队协作'] },
    '游戏': { subGenres: ['VR游戏','数据流','竞技游戏','种田建设'], keywords: ['升级','副本','装备'], tropes: ['满级账号','隐藏职业'] },
  };
  const data = corpusData[genre] || corpusData['科幻'];
  res.json({ success: true, data: { genre, ...data } });
});

router.post('/ai/generate-outline', async (req, res) => {
  const { title, genre, summary, provider, apiKey, model } = req.body;

  if (apiKey && provider) {
    try {
      const prompt = `你是一个专业的网文大纲专家。请根据以下信息生成一个完整的故事大纲。

作品标题：${title}
类型：${genre}
简介：${summary || '无'}

请生成包含以下内容的大纲：
1. 故事结构（三幕式或起承转合）
2. 主线情节（3-5个关键情节点）
3. 章节规划（建议15-30章）
4. 核心冲突
5. 伏笔与高潮

请用JSON格式返回：
{"structure": {"act1": "第一幕描述", "act2": "第二幕描述", "act3": "第三幕描述"}, "plotPoints": [{"chapter": 章节号, "title": "标题", "description": "描述"}], "chapterCount": 建议章节数, "mainConflict": "核心冲突", "setup": "伏笔设置", "climax": "高潮安排"}}`;

      const response = await callAI([{ role: 'user', content: prompt }], apiKey, model, provider);
      const content = extractContent(response);

      if (content) {
        try {
          const parsed = JSON.parse(content);
          return res.json({ success: true, data: { title, genre, outline: parsed } });
        } catch {
          return res.json({ success: true, data: { title, genre, outline: { raw: content } } });
        }
      }
    } catch (err) {
      console.error('Outline AI error:', err.message);
    }
  }

  const mockOutline = {
    structure: {
      act1: '建立世界，主角出场，冲突初现',
      act2: '冲突升级，主角成长，重大转折',
      act3: '高潮对决，解决问题，完美收官'
    },
    plotPoints: [
      { chapter: 1, title: '开端', description: '介绍主角和世界观' },
      { chapter: 5, title: '第一次冲突', description: '主角面临第一个挑战' },
      { chapter: 10, title: '转折点', description: '真相大白，局势逆转' },
      { chapter: 15, title: '高潮', description: '最终对决' },
      { chapter: 20, title: '结局', description: '完美收官' }
    ],
    chapterCount: 20,
    mainConflict: '主角与反派的终极对决',
    setup: '多处伏笔呼应',
    climax: '最终章的激烈对决'
  };

  res.json({ success: true, data: { title, genre, outline: mockOutline } });
});

// AI Character Generation
router.post('/ai/generate-character', async (req, res) => {
  const { name, role, genre, provider, apiKey, model } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: '角色名称不能为空' });
  }

  const prompt = `你是一个小说角色设定专家。请为以下角色生成详细的设定信息：
角色名称：${name}
角色定位：${role}
小说类型：${genre || '玄幻'}

请生成以下JSON格式的角色信息（只需返回JSON，不要其他内容）：
{
  "personality": "性格特点描述",
  "appearance": "外貌描述",
  "background": "背景故事",
  "goals": "目标和动机",
  "secrets": "隐藏的秘密",
  "weaknesses": "角色的弱点",
  "tags": "标签（逗号分隔）",
  "arc": "角色成长弧光",
  "habit": "言行特征或口头禅"
}`;

  const messages = [{ role: 'user', content: prompt }];

  // Try real AI if API key provided
  if (apiKey && provider) {
    try {
      const response = await callAI(messages, apiKey, model, provider);
      const content = extractContent(response);
      if (content) {
        const char = JSON.parse(content);
        return res.json({ success: true, data: { character: char } });
      }
    } catch (err) {
      console.error('AI character generation error:', err);
    }
  }

  // Mock response
  const mockCharacter = {
    personality: role === '主角' ? '冷静果断，善于思考，对未知充满好奇' :
                 role === '女主' ? '聪慧机敏，外交官背景，善于沟通' :
                 role === '反派' ? '野心勃勃，权谋深沉，不择手段' :
                 '性格复杂，内心矛盾',
    appearance: '这是一个重要的人物，有独特的外貌特征',
    background: `${name}的背景故事还在发展中...`,
    goals: '完成自己的使命和目标',
    secrets: '有一个不为人知的秘密',
    weaknesses: '感情用事，有时过于正直',
    tags: role === '主角' ? '热血,正直' : role === '反派' ? '腹黑,权谋' : '神秘',
    arc: '从迷茫到坚定，从弱小到强大',
    habit: '思考时会不自觉地皱眉头',
  };

  res.json({ success: true, data: { character: mockCharacter } });
});

// AI World Generation
router.post('/ai/generate-world', async (req, res) => {
  const { prompt, genre, provider, apiKey, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: '提示词不能为空' });
  }

  const aiPrompt = `你是一个世界设定专家。请根据以下描述生成世界观设定：
描述：${prompt}
小说类型：${genre || '玄幻'}

请生成3-5个相关的世界观元素，每个元素包含以下JSON信息：
{
  "type": "类型（星球/势力/科技/历史/种族）",
  "name": "名称",
  "description": "描述",
  "icon": "图标emoji"
}

请直接返回一个JSON数组，不要其他内容。`;

  const messages = [{ role: 'user', content: aiPrompt }];

  if (apiKey && provider) {
    try {
      const response = await callAI(messages, apiKey, model, provider);
      const content = extractContent(response);
      if (content) {
        const worlds = JSON.parse(content);
        return res.json({ success: true, data: worlds });
      }
    } catch (err) {
      console.error('AI world generation error:', err);
    }
  }

  // Mock response
  const typeIcons = { '星球': '🌍', '势力': '🚀', '科技': '💫', '历史': '📜', '种族': '👽' };
  const types = ['星球', '势力', '科技', '历史', '种族'];
  const mockWorlds = types.map((type, i) => ({
    type,
    name: `${prompt.slice(0, 4)}${type}`,
    description: `基于"${prompt}"生成的${type}设定`,
    icon: typeIcons[type]
  }));

  res.json({ success: true, data: mockWorlds });
});

module.exports = router;