const express = require('express');
const router = express.Router();
const Character = require('../models/Character');

// List characters for a project
router.get('/api/v1/projects/:projectId/characters', async (req, res) => {
  try {
    const characters = await Character.findByProject(req.params.projectId);
    res.json({ success: true, data: characters });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create character for a project
router.post('/api/v1/projects/:projectId/characters', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

    const character = await Character.create({
      project_id: req.params.projectId,
      ...req.body
    });
    res.status(201).json({ success: true, data: character });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update character
router.patch('/api/v1/characters/:id', async (req, res) => {
  try {
    const character = await Character.update(req.params.id, req.body);
    if (!character) return res.status(404).json({ success: false, error: 'Character not found' });
    res.json({ success: true, data: character });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete character
router.delete('/api/v1/characters/:id', async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) return res.status(404).json({ success: false, error: 'Character not found' });
    await Character.delete(req.params.id);
    res.json({ success: true, message: 'Character deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
