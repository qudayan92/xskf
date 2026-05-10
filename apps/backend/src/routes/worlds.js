const express = require('express');
const router = express.Router();
const WorldItem = require('../models/WorldItem');

// List world items for a project
router.get('/api/v1/projects/:projectId/worlds', async (req, res) => {
  try {
    const { type } = req.query;
    const items = await WorldItem.findByProject(req.params.projectId, type || null);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create world item for a project
router.post('/api/v1/projects/:projectId/worlds', async (req, res) => {
  try {
    const { type, name } = req.body;
    if (!type || !name) {
      return res.status(400).json({ success: false, error: 'Type and name are required' });
    }

    const item = await WorldItem.create({
      project_id: req.params.projectId,
      ...req.body
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update world item
router.patch('/api/v1/worlds/:id', async (req, res) => {
  try {
    const item = await WorldItem.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ success: false, error: 'World item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete world item
router.delete('/api/v1/worlds/:id', async (req, res) => {
  try {
    const item = await WorldItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'World item not found' });
    await WorldItem.delete(req.params.id);
    res.json({ success: true, message: 'World item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
