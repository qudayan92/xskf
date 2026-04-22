const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET /api/v1/categories (flat list)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/categories/tree (tree structure)
router.get('/tree', async (req, res) => {
  try {
    const tree = await Category.findTree();
    res.json({ success: true, data: tree });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, error: '分类不存在' });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/categories
router.post('/', async (req, res) => {
  try {
    const { name, parent_id, sort_order } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'name 必填' });
    const cat = await Category.create({ name, parent_id: parent_id || 0, sort_order: sort_order || 0 });
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v1/categories/:id
router.patch('/:id', async (req, res) => {
  try {
    const cat = await Category.update(req.params.id, req.body);
    if (!cat) return res.status(404).json({ success: false, error: '分类不存在' });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    await Category.delete(req.params.id);
    res.json({ success: true, message: '分类已删除' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
