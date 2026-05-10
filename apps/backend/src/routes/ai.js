const express = require('express');
const router = express.Router();
const {
  generateMockContinue,
  generateMockPolish,
  generateMockExpand,
  generateMockTitles,
} = require('../lib/ai');

// Continue writing
router.post('/continue', (req, res) => {
  try {
    const { text, genre, context } = req.body;
    const result = generateMockContinue(text);
    res.json({
      success: true,
      data: {
        content: result,
        wordCount: result.length,
        provider: 'mock'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Polish text
router.post('/polish', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'Text is required' });

    const result = generateMockPolish(text);
    res.json({
      success: true,
      data: {
        content: result,
        wordCount: result.length,
        provider: 'mock'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Expand description
router.post('/expand', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'Text is required' });

    const result = generateMockExpand(text);
    res.json({
      success: true,
      data: {
        content: result,
        wordCount: result.length,
        provider: 'mock'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate chapter titles
router.post('/titles', (req, res) => {
  try {
    const { genre, count = 5 } = req.body;
    const titles = generateMockTitles(genre, count);
    res.json({
      success: true,
      data: {
        titles,
        provider: 'mock'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
