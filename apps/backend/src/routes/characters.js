const express = require('express');
const router = express.Router();
const { query, run, getLastInsertRowId } = require('../db');

// 获取角色列表
router.get('/', async (req, res) => {
  try {
    const { project_id, role, tags } = req.query;
    let sql = 'SELECT * FROM characters WHERE 1=1';
    const params = [];

    if (project_id) {
      sql += ' AND project_id = ?';
      params.push(project_id);
    }

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (tags) {
      sql += ' AND tags LIKE ?';
      params.push(`%${tags}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const characters = await query(sql, params);
    res.json({ success: true, data: characters });
  } catch (err) {
    console.error('Error fetching characters:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 获取单个角色
router.get('/:id', async (req, res) => {
  try {
    const characters = await query('SELECT * FROM characters WHERE id = ?', [req.params.id]);
    if (characters.length === 0) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }
    res.json({ success: true, data: characters[0] });
  } catch (err) {
    console.error('Error fetching character:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 创建角色
router.post('/', async (req, res) => {
  try {
    const {
      project_id, name, role, age, gender, avatar,
      appearance, personality, background, goals,
      secrets, weaknesses, tags, arc, habit, skills, relationships
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: '角色名称不能为空' });
    }

    const sql = `
      INSERT INTO characters (
        project_id, name, role, age, gender, avatar,
        appearance, personality, background, goals,
        secrets, weaknesses, tags, arc, habit, skills, relationships,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    const params = [
      project_id || null, name, role || '配角', age, gender, avatar,
      appearance, personality, background, goals,
      secrets, weaknesses, tags, arc, habit, skills, relationships
    ];

    await run(sql, params);
    const id = await getLastInsertRowId();

    const newCharacter = await query('SELECT * FROM characters WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: newCharacter[0] });
  } catch (err) {
    console.error('Error creating character:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 更新角色
router.patch('/:id', async (req, res) => {
  try {
    const existing = await query('SELECT * FROM characters WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }

    const {
      project_id, name, role, age, gender, avatar,
      appearance, personality, background, goals,
      secrets, weaknesses, tags, arc, habit, skills, relationships
    } = req.body;

    const sql = `
      UPDATE characters SET
        project_id = COALESCE(?, project_id),
        name = COALESCE(?, name),
        role = COALESCE(?, role),
        age = COALESCE(?, age),
        gender = COALESCE(?, gender),
        avatar = COALESCE(?, avatar),
        appearance = COALESCE(?, appearance),
        personality = COALESCE(?, personality),
        background = COALESCE(?, background),
        goals = COALESCE(?, goals),
        secrets = COALESCE(?, secrets),
        weaknesses = COALESCE(?, weaknesses),
        tags = COALESCE(?, tags),
        arc = COALESCE(?, arc),
        habit = COALESCE(?, habit),
        skills = COALESCE(?, skills),
        relationships = COALESCE(?, relationships),
        updated_at = datetime('now')
      WHERE id = ?
    `;

    const params = [
      project_id, name, role, age, gender, avatar,
      appearance, personality, background, goals,
      secrets, weaknesses, tags, arc, habit, skills, relationships,
      req.params.id
    ];

    await run(sql, params);

    const updated = await query('SELECT * FROM characters WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Error updating character:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 删除角色
router.delete('/:id', async (req, res) => {
  try {
    const existing = await query('SELECT * FROM characters WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }

    await run('DELETE FROM characters WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '角色已删除' });
  } catch (err) {
    console.error('Error deleting character:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
