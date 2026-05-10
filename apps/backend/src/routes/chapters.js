const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');

// List chapters for a project
router.get('/api/v1/projects/:projectId/chapters', async (req, res) => {
  try {
    const chapters = await Chapter.findByProject(req.params.projectId);
    res.json({ success: true, data: chapters });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create chapter for a project
router.post('/api/v1/projects/:projectId/chapters', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });

    // Auto-increment chapter_no
    const existing = await Chapter.findByProject(req.params.projectId);
    const chapter_no = existing.length + 1;

    const chapter = await Chapter.create({
      project_id: req.params.projectId,
      chapter_no,
      title,
      content
    });
    res.status(201).json({ success: true, data: chapter });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reorder chapters
router.patch('/api/v1/projects/:projectId/chapters/reorder', async (req, res) => {
  try {
    const { chapterIds } = req.body;
    if (!chapterIds || !Array.isArray(chapterIds)) {
      return res.status(400).json({ success: false, error: 'chapterIds array is required' });
    }
    const chapters = await Chapter.reorder(req.params.projectId, chapterIds);
    res.json({ success: true, data: chapters });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single chapter
router.get('/api/v1/chapters/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ success: false, error: 'Chapter not found' });
    res.json({ success: true, data: chapter });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update chapter
router.patch('/api/v1/chapters/:id', async (req, res) => {
  try {
    const chapter = await Chapter.update(req.params.id, req.body);
    if (!chapter) return res.status(404).json({ success: false, error: 'Chapter not found' });
    res.json({ success: true, data: chapter });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete chapter
router.delete('/api/v1/chapters/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ success: false, error: 'Chapter not found' });
    await Chapter.delete(req.params.id);
    res.json({ success: true, message: 'Chapter deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
