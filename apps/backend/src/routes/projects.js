const express = require('express');
const router = express.Router();
const { query, run, getLastInsertRowId } = require('../db');

router.get('/test', async (req, res) => {
  try {
    const tables = await query("SELECT name FROM sqlite_master WHERE type='table'");
    res.json({ success: true, data: { message: 'API is working', tables: tables.map(t => t.name) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    console.log('GET /api/v1/projects called');
    const projects = await query('SELECT * FROM projects ORDER BY id DESC');
    console.log('Projects found:', projects.length);
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }
    const projects = await query('SELECT * FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }
    res.json({ success: true, data: projects[0] });
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, genre, summary } = req.body;

    // Log raw body for debugging
    console.log('[Projects POST] body:', req.body);

    if (!name) {
      return res.status(400).json({ success: false, error: '项目名称不能为空' });
    }

    console.log('Creating project:', name);

    const sql = `INSERT INTO projects (name, genre, summary, status, created_at, updated_at) VALUES (?, ?, ?, '新建', datetime('now'), datetime('now'))`;
    const params = [name, genre || null, summary || null];

    await run(sql, params);
    const id = await getLastInsertRowId();

    const newProject = await query('SELECT * FROM projects WHERE id = ?', [id]);
    console.log('Created project:', newProject[0]);

    res.status(201).json({ success: true, data: newProject[0] });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }
    
    const existing = await query('SELECT * FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    const { name, genre, summary, outline, target_word_count, style_pref, status, word_count, cover_image } = req.body;

    const sql = `
      UPDATE projects SET
        name = COALESCE(?, name),
        genre = COALESCE(?, genre),
        summary = COALESCE(?, summary),
        outline = COALESCE(?, outline),
        target_word_count = COALESCE(?, target_word_count),
        style_pref = COALESCE(?, style_pref),
        status = COALESCE(?, status),
        word_count = COALESCE(?, word_count),
        cover_image = COALESCE(?, cover_image),
        updated_at = datetime('now')
      WHERE id = ?
    `;

    const params = [
      name || null, genre || null, summary || null, outline || null, 
      target_word_count || null, style_pref || null, status || null, 
      word_count || null, cover_image || null, id
    ];

    await run(sql, params);

    const updated = await query('SELECT * FROM projects WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }

    const existing = await query('SELECT * FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    await run('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ success: true, message: '项目已删除' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
