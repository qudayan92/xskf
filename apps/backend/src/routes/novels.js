const express = require('express');
const router = express.Router();
const Novel = require('../models/Novel');

// GET /api/v1/novels
router.get('/', async (req, res) => {
  try {
    const novels = await Novel.findAll(req.query);
    res.json({ success: true, data: novels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/novels/:id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let novel;
    if (/^\d+$/.test(id)) {
      novel = await Novel.findById(id);
    } else {
      novel = await Novel.findByBookId(id);
    }
    if (!novel) return res.status(404).json({ success: false, error: '作品不存在' });
    res.json({ success: true, data: novel });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/novels
router.post('/', async (req, res) => {
  try {
    const { title, author_id, ...rest } = req.body;
    if (!title || !author_id) return res.status(400).json({ success: false, error: 'title 和 author_id 必填' });
    const book_id = 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    const novel = await Novel.create({ book_id, title, author_id, ...rest });
    // Update user stats
    const User = require('../models/User');
    await User.updateStats(author_id, 1, 0);
    res.status(201).json({ success: true, data: novel });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v1/novels/:id
router.patch('/:id', async (req, res) => {
  try {
    const novel = await Novel.update(req.params.id, req.body);
    if (!novel) return res.status(404).json({ success: false, error: '作品不存在' });
    res.json({ success: true, data: novel });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/novels/:id
router.delete('/:id', async (req, res) => {
  try {
    await Novel.delete(req.params.id);
    res.json({ success: true, message: '作品已删除' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
