const express = require('express');
const router = express.Router();
const { query, run, getLastInsertRowId } = require('../db');

async function ensureDefaultUser() {
  // Try to get existing user
  const users = await query("SELECT id FROM users LIMIT 1");
  if (users && users.length > 0) return users[0].id;
  // Create a default admin user if none exists
  await run("INSERT INTO users (username, password, pen_name, bio) VALUES ('admin', 'admin', '管理员', '平台管理员')");
  const created = await query("SELECT id FROM users WHERE username = 'admin' ORDER BY id DESC LIMIT 1");
  return created[0]?.id;
}

// Unified create: projects + novels
// POST /api/v1/create-composite
router.post('/', async (req, res) => {
  try {
    const { project, novel } = req.body;
    if (!project || !project.name) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }
    // Create project
    const sqlProj = `INSERT INTO projects (name, genre, summary, status, created_at, updated_at) VALUES (?, ?, ?, '新建', datetime('now'), datetime('now'))`;
    const projParams = [project.name, project.genre || null, project.summary || null];
    await run(sqlProj, projParams);
    const projId = await getLastInsertRowId();
    const newProject = await query('SELECT * FROM projects WHERE id = ?', [projId]);

    // Prepare novel data
    const title = novel?.title;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Novel title is required' });
    }
    const authorId = novel?.author_id || await ensureDefaultUser();
    const bookId = novel?.book_id || ('BK' + Date.now().toString(36).toUpperCase());
    const subtitle = novel?.subtitle || null;
    const category_id = novel?.category_id || 0;
    const tags = novel?.tags || null;
    const status = typeof novel?.status === 'number' ? novel.status : 0;
    const word_count = novel?.word_count || 0;

    const sqlNovel = `INSERT INTO novels (book_id, author_id, title, subtitle, cover_image, summary, category_id, tags, status, word_count) VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?)`;
    const novelParams = [bookId, authorId, title, subtitle, category_id, tags, status, word_count];
    await run(sqlNovel, novelParams);
    const novelId = await getLastInsertRowId();
    const newNovel = await query('SELECT * FROM novels WHERE id = ?', [novelId]);

    res.json({ success: true, data: { project: newProject[0], novel: newNovel[0] } });
  } catch (err) {
    console.error('Composite create error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
