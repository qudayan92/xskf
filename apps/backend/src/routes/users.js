const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/v1/users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: '用户不存在' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/users (register)
router.post('/', async (req, res) => {
  try {
    const { username, password, pen_name, email } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: 'username 和 password 必填' });
    const existing = await User.findByUsername(username);
    if (existing) return res.status(400).json({ success: false, error: '用户名已存在' });
    const user = await User.create({ username, password, pen_name, email });
    delete user.password;
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v1/users/:id
router.patch('/:id', async (req, res) => {
  try {
    const user = await User.update(req.params.id, req.body);
    if (!user) return res.status(404).json({ success: false, error: '用户不存在' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/users/:id
router.delete('/:id', async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ success: true, message: '用户已删除' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
