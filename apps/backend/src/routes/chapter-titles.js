const express = require('express');
const router = express.Router();
const {
  generateChapterTitles,
  calculateEmotionCurve,
  DEFAULT_CONFIG,
  TITLE_TEMPLATES
} = require('../lib/chapter-title-rules');

// ===================== API 端点 =====================

// POST /api/v1/generate/chapter-titles
// 生成章节标题
router.post('/', async (req, res) => {
  try {
    const {
      bookTitle = "未命名作品",
      genre = "玄幻",
      chapterCount = 20,
      conflictCycle = DEFAULT_CONFIG.conflictCycle,
      climaxCycle = DEFAULT_CONFIG.climaxCycle,
      customHooks = []
    } = req.body;

    // 参数验证
    if (!bookTitle || bookTitle.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "书名不能为空"
      });
    }

    if (!genre || genre.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "流派不能为空"
      });
    }

    const validatedChapterCount = Math.min(Math.max(parseInt(chapterCount) || 20, 1), 100);
    const validatedConflictCycle = Math.min(Math.max(parseInt(conflictCycle) || 3, 1), 10);
    const validatedClimaxCycle = Math.min(Math.max(parseInt(climaxCycle) || 10, 1), 50);

    // 生成章节标题
    const chapters = generateChapterTitles({
      bookTitle,
      genre,
      chapterCount: validatedChapterCount,
      conflictCycle: validatedConflictCycle,
      climaxCycle: validatedClimaxCycle,
      customHooks: Array.isArray(customHooks) ? customHooks.filter(h => h && h.trim()) : []
    });

    // 计算情绪曲线
    const emotionCurve = calculateEmotionCurve(chapters);

    // 统计信息
    const stats = {
      totalChapters: chapters.length,
      byType: chapters.reduce((acc, ch) => {
        acc[ch.type] = (acc[ch.type] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        bookTitle,
        genre,
        chapters,
        emotionCurve,
        stats,
        config: {
          conflictCycle: validatedConflictCycle,
          climaxCycle: validatedClimaxCycle
        }
      }
    });
  } catch (err) {
    console.error('Generate chapter titles error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// GET /api/v1/generate/chapter-titles/genres
// 获取支持的流派列表
router.get('/genres', async (req, res) => {
  try {
    const genres = Object.keys(TITLE_TEMPLATES).map(genre => ({
      id: genre,
      name: genre,
      description: getGenreDescription(genre)
    }));

    res.json({
      success: true,
      data: genres
    });
  } catch (err) {
    console.error('Get genres error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// GET /api/v1/generate/chapter-titles/hooks
// 获取默认钩子列表
router.get('/hooks', async (req, res) => {
  try {
    const defaultHooks = [
      "身份之谜",
      "三日之约",
      "神秘残片",
      "血脉觉醒",
      "系统任务",
      "远古传承",
      "惊天秘密",
      "命运之子",
      "灭族之仇",
      "身世之谜"
    ];

    res.json({
      success: true,
      data: defaultHooks
    });
  } catch (err) {
    console.error('Get hooks error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// POST /api/v1/generate/chapter-titles/export
// 导出章节标题为指定格式
router.post('/export', async (req, res) => {
  try {
    const {
      bookTitle,
      genre,
      chapters,
      format = "markdown"
    } = req.body;

    if (!chapters || !Array.isArray(chapters)) {
      return res.status(400).json({
        success: false,
        error: "缺少章节数据"
      });
    }

    let output;
    switch (format) {
      case "markdown":
        output = exportToMarkdown(bookTitle, genre, chapters);
        break;
      case "json":
        output = JSON.stringify(chapters, null, 2);
        break;
      case "txt":
        output = exportToTxt(bookTitle, chapters);
        break;
      default:
        output = exportToMarkdown(bookTitle, chapters);
    }

    res.json({
      success: true,
      data: {
        content: output,
        format,
        filename: `${bookTitle || 'chapters'}.${format === 'markdown' ? 'md' : format}`
      }
    });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ===================== 辅助函数 =====================

function getGenreDescription(genre) {
  const descriptions = {
    "玄幻": "东方玄幻、仙侠修真、异世界转生",
    "都市": "都市生活、职场商战、情感纠葛",
    "科幻": "星际科幻、末世危机、虚拟现实",
    "历史": "历史穿越、架空历史、王朝争霸",
    "系统": "系统流、游戏异界、任务冒险"
  };
  return descriptions[genre] || "通用类型";
}

function exportToMarkdown(bookTitle, genre, chapters) {
  let md = `# ${bookTitle}\n\n`;
  md += `> 流派：${genre}\n\n`;
  md += `---\n\n`;

  chapters.forEach(ch => {
    md += `## 第${ch.chapter}章：${ch.title}\n\n`;
    md += `- 类型：${ch.type} | 情绪：${ch.emotion}/10`;
    if (ch.hook) {
      md += ` | 钩子：${ch.hook}`;
    }
    md += `\n\n`;
    md += `${ch.summary || ''}\n\n`;
  });

  return md;
}

function exportToTxt(bookTitle, chapters) {
  let txt = `${bookTitle}\n`;
  txt += `=${'='.repeat(20)}\n\n`;

  chapters.forEach(ch => {
    txt += `第${ch.chapter}章 ${ch.title}`;
    if (ch.hook) txt += ` [${ch.hook}]`;
    txt += `\n`;
  });

  return txt;
}

module.exports = router;