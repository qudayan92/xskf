const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Chapter = require('../models/Chapter');
const Character = require('../models/Character');
const WorldItem = require('../models/WorldItem');

router.get('/', async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const project = await Project.update(req.params.id, req.body);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    await Project.delete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get project stats
router.get('/:id/stats', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const chStats = await Chapter.countByProject(req.params.id);
    const charCount = await Character.countByProject(req.params.id);
    const worldCount = await WorldItem.countByProject(req.params.id);

    res.json({
      success: true,
      data: {
        chapterCount: chStats.count,
        totalWords: chStats.total_words,
        characterCount: charCount,
        worldCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
