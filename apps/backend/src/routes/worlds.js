const express = require('express');
const router = express.Router();
const { query, run, getLastInsertRowId } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { project_id, type } = req.query;
    let sql = 'SELECT * FROM worlds WHERE 1=1';
    const params = [];

    if (project_id) {
      sql += ' AND project_id = ?';
      params.push(project_id);
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC';

    const worlds = await query(sql, params);
    res.json({ success: true, data: worlds });
  } catch (err) {
    console.error('Error fetching worlds:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const worlds = await query('SELECT * FROM worlds WHERE id = ?', [req.params.id]);
    if (worlds.length === 0) {
      return res.status(404).json({ success: false, error: '世界观不存在' });
    }
    res.json({ success: true, data: worlds[0] });
  } catch (err) {
    console.error('Error fetching world:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { project_id, type, name, description, icon, attributes, relationships } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, error: '类型和名称不能为空' });
    }

    const sql = `
      INSERT INTO worlds (project_id, type, name, description, icon, attributes, relationships, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    const params = [project_id || null, type, name, description || null, icon || null, attributes || null, relationships || null];

    await run(sql, params);
    const id = await getLastInsertRowId();

    const newWorld = await query('SELECT * FROM worlds WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: newWorld[0] });
  } catch (err) {
    console.error('Error creating world:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const existing = await query('SELECT * FROM worlds WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: '世界观不存在' });
    }

    const { project_id, type, name, description, icon, attributes, relationships } = req.body;

    const sql = `
      UPDATE worlds SET
        project_id = COALESCE(?, project_id),
        type = COALESCE(?, type),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        attributes = COALESCE(?, attributes),
        relationships = COALESCE(?, relationships),
        updated_at = datetime('now')
      WHERE id = ?
    `;

    const params = [project_id, type, name, description, icon, attributes, relationships, req.params.id];

    await run(sql, params);

    const updated = await query('SELECT * FROM worlds WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Error updating world:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await query('SELECT * FROM worlds WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: '世界观不存在' });
    }

    await run('DELETE FROM worlds WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '世界观已删除' });
  } catch (err) {
    console.error('Error deleting world:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;