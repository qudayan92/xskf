const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// JSON response settings - ensure Chinese characters are not escaped
app.set('json escape', false);
app.set('json spaces', 0);

// Middleware to ensure Chinese characters are properly encoded in JSON responses
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function(body) {
    if (body != null) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      const jsonStr = JSON.stringify(body, null, 0);
      return res.send(jsonStr);
    }
    return originalJson(body);
  };
  next();
});

// ===== Initialize Database =====
const { initDb, query } = require('./db');

// ===== Database Routes (SQLite) =====
const novelsRouter = require('./routes/novels');
const chaptersRouter = require('./routes/chapters');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const charactersRouter = require('./routes/characters');
const worldsRouter = require('./routes/worlds');
const projectsRouter = require('./routes/projects');

app.use('/api/v1/characters', charactersRouter);
app.use('/api/v1/worlds', worldsRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/novels', novelsRouter);
app.use('/api/v1', chaptersRouter);

// ===== Books Chapters Routes =====
app.get('/api/v1/books/:bookId/chapters', async (req, res) => {
  try {
    const { bookId } = req.params;
    const chapters = await query(
      'SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_no ASC',
      [bookId]
    );
    res.json({ success: true, data: chapters });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/categories', categoriesRouter);

// ===== AI Creation Wizard Routes =====
const createRouter = require('./routes/create');
// Mount composite creation route under separate path to avoid conflicts
const compositeRouter = require('./routes/create-composite');
app.use('/api/v1/create-composite', compositeRouter);
// Keep existing create routes for backward compatibility
app.use('/api/v1', createRouter);

// ===== AI Editor Routes =====
const editorAiRouter = require('./routes/editor-ai');
app.use('/api/v1', editorAiRouter);

// ===== Real AI Routes (Proxy) =====
const aiRouter = require('./routes/ai');
app.use('/api/v1', aiRouter);

// ===== Chapter Title Generator Routes =====
const chapterTitlesRouter = require('./routes/chapter-titles');
app.use('/api/v1/generate/chapter-titles', chapterTitlesRouter);


// ===== In-memory storage (legacy/Agent/Collab/AI) =====
const projects = [];
const chapters = [];
const characters = [];
const worlds = [];
const agents = [];
let collabLogs = [];

// Projects API (legacy)
app.get('/api/v1/projects', (req, res) => {
  res.json({ success: true, data: projects });
});

app.post('/api/v1/projects', (req, res) => {
  const { name, genre, stylePref, targetWordCount } = req.body;
  const project = { id: uuidv4(), name, genre, stylePref, targetWordCount, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  projects.push(project);
  res.status(201).json({ success: true, data: project });
});

app.get('/api/v1/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
  res.json({ success: true, data: project });
});

app.patch('/api/v1/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
  Object.assign(project, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success: true, data: project });
});

app.delete('/api/v1/projects/:id', (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Project not found' });
  projects.splice(index, 1);
  res.json({ success: true, message: 'Project deleted' });
});

// Legacy Chapters API
app.get('/api/v1/projects/:projectId/chapters', (req, res) => {
  res.json({ success: true, data: chapters.filter(c => c.projectId === req.params.projectId) });
});

app.post('/api/v1/projects/:projectId/chapters', (req, res) => {
  const { title, content } = req.body;
  const chapter = { id: uuidv4(), projectId: req.params.projectId, title, content: content || '', wordCount: content ? content.length : 0, version: 1, status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  chapters.push(chapter);
  res.status(201).json({ success: true, data: chapter });
});

// Characters API
app.get('/api/v1/projects/:projectId/characters', (req, res) => {
  res.json({ success: true, data: characters.filter(c => c.projectId === req.params.projectId) });
});

app.post('/api/v1/projects/:projectId/characters', (req, res) => {
  const { name, role, personality, appearance, avatar } = req.body;
  const character = { id: uuidv4(), projectId: req.params.projectId, name, role, personality, appearance, avatar, createdAt: new Date().toISOString() };
  characters.push(character);
  res.status(201).json({ success: true, data: character });
});

// Worlds API
app.get('/api/v1/projects/:projectId/worlds', (req, res) => {
  res.json({ success: true, data: worlds.filter(w => w.projectId === req.params.projectId) });
});

app.post('/api/v1/projects/:projectId/worlds', (req, res) => {
  const { type, name, description } = req.body;
  const world = { id: uuidv4(), projectId: req.params.projectId, type, name, description, createdAt: new Date().toISOString() };
  worlds.push(world);
  res.status(201).json({ success: true, data: world });
});

// Agents API (in-memory)
app.get('/api/v1/agents', (req, res) => res.json({ success: true, data: agents }));

app.post('/api/v1/agents', (req, res) => {
  const agent = { id: uuidv4(), ...req.body, status: req.body.status || '待命', currentTask: req.body.currentTask || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  agents.push(agent);
  res.status(201).json({ success: true, data: agent });
});

app.patch('/api/v1/agents/:id', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });
  Object.assign(agent, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success: true, data: agent });
});

app.delete('/api/v1/agents/:id', (req, res) => {
  const index = agents.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Agent not found' });
  agents.splice(index, 1);
  res.json({ success: true, message: 'Agent deleted' });
});

// Collab Logs API (in-memory)
app.get('/api/v1/collab/logs', (req, res) => res.json({ success: true, data: collabLogs }));

app.post('/api/v1/collab/logs', (req, res) => {
  const log = { id: uuidv4(), ...req.body, ts: new Date().toISOString() };
  collabLogs.push(log);
  res.status(201).json({ success: true, data: log });
});

app.delete('/api/v1/collab/logs/:id', (req, res) => {
  const index = collabLogs.findIndex(l => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Log not found' });
  collabLogs.splice(index, 1);
  res.json({ success: true, message: 'Log deleted' });
});

// AI Generation API (Mock)
app.post('/api/v1/generate/outline', (req, res) => {
  const { genre, theme } = req.body;
  res.json({ success: true, data: {
    title: `${theme || '新作品'} - 大纲`,
    acts: [
      { title: '第一幕：启程', scenes: ['主角登场', '任务接受', '出发'] },
      { title: '第二幕：遭遇', scenes: ['异常信号', '神秘文明', '抉择'] },
      { title: '第三幕：高潮', scenes: ['最终对决', '真相揭露', '结局'] }
    ],
    generatedAt: new Date().toISOString()
  }});
});

app.post('/api/v1/generate/chapter', (req, res) => {
  const { prompt } = req.body;
  const content = `【AI 生成内容】

基于您的提示"${prompt}"，AI 为您生成了以下内容：

飞船穿越星际尘埃带，林远航注视着舷窗外无尽的星海。这是他离开地球的第三百七十二天，也是他成为星际探索员的第一个年头。

突然，通讯器传来一阵刺耳的杂音，紧接着是一个陌生的声音——

"探索员林远航，这里是未知文明信号，请注意接收..."`;
  res.json({ success: true, data: { content, wordCount: content.length } });
});

app.post('/api/v1/generate/character', (req, res) => {
  const { role } = req.body;
  res.json({ success: true, data: {
    name: '林墨', role: role || '主角', age: '28岁',
    personality: '冷静果断，善于思考，对未知充满好奇',
    appearance: '身高180cm，深邃的眼眸，军人气质',
    background: '星际联盟最优秀的探索员之一',
    generatedAt: new Date().toISOString()
  }});
});

// Health Check (with DB status)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'not configured';
  try {
    await query('SELECT 1');
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = 'error: ' + e.message;
  }
  res.json({ status: 'ok', db: dbStatus, timestamp: new Date().toISOString() });
});

// Seed test data route (for development)
app.post('/api/v1/seed', async (req, res) => {
  try {
    const Novel = require('./models/Novel');
    const User = require('./models/User');

    const novels = await query('SELECT COUNT(*) as count FROM novels');
    if (novels[0].count > 0) {
      return res.json({ success: false, error: 'Novels table already has data' });
    }

    console.log('Creating test user...');
    let user = await User.findByUsername('testuser');
    if (!user) {
      user = await User.create({
        username: 'testuser',
        password: 'test123',
        pen_name: '测试作者',
        email: 'test@example.com'
      });
    }

    console.log('Creating test novels...');
    const testNovels = [
      {
        book_id: `BK${Date.now()}`,
        author_id: user.id,
        title: '星际流光',
        subtitle: '银河系边缘的星际探索',
        cover_image: null,
        category_id: 3,
        tags: '科幻,星际,冒险',
        status: 1,
        word_count: 328000,
        chapter_count: 128,
      },
      {
        book_id: `BK${Date.now()}`,
        author_id: user.id,
        title: '长安夜话',
        subtitle: '大唐盛世下的悬疑谜案',
        cover_image: null,
        category_id: 5,
        tags: '历史,悬疑,推理',
        status: 1,
        word_count: 156000,
        chapter_count: 56,
      },
      {
        book_id: `BK${Date.now()}`,
        author_id: user.id,
        title: '迷雾之塔',
        subtitle: '古老魔法世界的冒险',
        cover_image: null,
        category_id: 8,
        tags: '奇幻,魔法,冒险',
        status: 2,
        word_count: 89000,
        chapter_count: 32,
      },
      {
        book_id: `BK${Date.now()}`,
        author_id: user.id,
        title: '深海回声',
        subtitle: '深海深处的秘密',
        cover_image: null,
        category_id: 6,
        tags: '悬疑,科幻,探险',
        status: 0,
        word_count: 0,
        chapter_count: 0,
      }
    ];

    for (const novel of testNovels) {
      await Novel.create(novel);
    }

    res.json({ success: true, message: 'Test data seeded successfully', count: testNovels.length });
  } catch (err) {
    console.error('Seeding error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📚 API docs at http://localhost:${PORT}/api/health`);

  // Auto-seed if database is empty
  setTimeout(() => {
    console.log('Backend initialized and ready');
  }, 1000);
});

module.exports = app;
