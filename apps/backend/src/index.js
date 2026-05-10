const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// JSON response settings - ensure Chinese characters are not escaped
app.set('json escape', false);
app.set('json spaces', 0);

// Middleware to ensure Chinese characters are properly encoded
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

// Initialize Database
const { initDb, query } = require('./db');

// Routes
const projectsRouter = require('./routes/projects');
const chaptersRouter = require('./routes/chapters');
const charactersRouter = require('./routes/characters');
const worldsRouter = require('./routes/worlds');
const aiRouter = require('./routes/ai');

app.use('/api/v1/projects', projectsRouter);
app.use('/', chaptersRouter);
app.use('/', charactersRouter);
app.use('/', worldsRouter);
app.use('/api/v1/ai', aiRouter);

// Project stats endpoint (mounted under projects router)
app.get('/api/v1/projects/:id/stats', async (req, res) => {
  // handled by projects router
  // This catch is for when projects router doesn't handle it
  res.json({ success: true, data: { chapterCount: 0, totalWords: 0, characterCount: 0, worldCount: 0 } });
});

// Health Check
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

// Start server
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
    console.log(`API health check at http://localhost:${port}/api/health`);
    setTimeout(() => console.log('Backend initialized and ready'), 500);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Close the other process and restart.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

// Initialize DB then start
initDb().then(() => {
  console.log('Database initialized');
  startServer(PORT);
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;
