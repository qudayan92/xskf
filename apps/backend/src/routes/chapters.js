const express = require('express');
const router = express.Router();
const { query, run, getLastInsertRowId } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { project_id, status } = req.query;
    let sql = 'SELECT * FROM chapters WHERE 1=1';
    const params = [];

    if (project_id) {
      sql += ' AND project_id = ?';
      params.push(project_id);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY chapter_no ASC';

    const chapters = await query(sql, params);
    res.json({ success: true, data: chapters });
  } catch (err) {
    console.error('Error fetching chapters:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const chapters = await query('SELECT * FROM chapters WHERE id = ?', [req.params.id]);
    if (chapters.length === 0) {
      return res.status(404).json({ success: false, error: '章节不存在' });
    }
    res.json({ success: true, data: chapters[0] });
  } catch (err) {
    console.error('Error fetching chapter:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { project_id, chapter_no, title, content } = req.body;

    if (!project_id || !title) {
      return res.status(400).json({ success: false, error: '项目ID和标题不能为空' });
    }

    const sql = `
      INSERT INTO chapters (project_id, chapter_no, title, content, word_count, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'draft', datetime('now'), datetime('now'))
    `;

    const wordCount = content ? content.length : 0;
    const params = [project_id, chapter_no || 1, title, content, wordCount];

    await run(sql, params);
    const id = await getLastInsertRowId();

    const newChapter = await query('SELECT * FROM chapters WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: newChapter[0] });
  } catch (err) {
    console.error('Error creating chapter:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const existing = await query('SELECT * FROM chapters WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: '章节不存在' });
    }

    const { chapter_no, title, content, status } = req.body;

    const sql = `
      UPDATE chapters SET
        chapter_no = COALESCE(?, chapter_no),
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        word_count = COALESCE(?, word_count),
        status = COALESCE(?, status),
        updated_at = datetime('now')
      WHERE id = ?
    `;

    const wordCount = content ? content.length : undefined;
    const params = [chapter_no, title, content, wordCount, status, req.params.id];

    await run(sql, params);

    const updated = await query('SELECT * FROM chapters WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Error updating chapter:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await query('SELECT * FROM chapters WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: '章节不存在' });
    }

    await run('DELETE FROM chapters WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '章节已删除' });
  } catch (err) {
    console.error('Error deleting chapter:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;