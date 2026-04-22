// 章节标题生成规则库
// 基于 logic_config.json 的成功公式逻辑

// ===================== 标题模板库 =====================
const TITLE_TEMPLATES = {
  // 玄幻流
  "玄幻": {
    "弱势开局": [
      "废物觉醒", "逆境求生", "暗藏锋芒", "绝境逢生",
      "资质测试", "家族轻视", "意外传承", "经脉重塑"
    ],
    "冲突": [
      "危机四伏", "强敌环伺", "风云际会", "针锋相对",
      "势力对决", "资源争夺", "生死赌约", "生死相搏"
    ],
    "打脸": [
      "震惊全场", "逆天改命", "王者归来", "一鸣惊人",
      "全场寂静", "身份揭晓", "实力碾压", "当场打脸"
    ],
    "高潮": [
      "惊天大战", "命运转折", "真相大白", "巅峰对决",
      "灭世危机", "终极对决", "天骄之战", "帝路争雄"
    ],
    "伏笔": [
      "迷雾重重", "暗流涌动", "真相浮现", "谜底揭晓",
      "古老遗迹", "神秘传承", "身世之谜", "惊人真相"
    ],
    "日常": [
      "修炼日常", "新的开始", "小试身手", "意外收获",
      "实力精进", "友谊加深", "任务完成", "收获满满"
    ]
  },

  // 都市流
  "都市": {
    "弱势开局": [
      "废物归来", "身份卑微", "被人轻视", "生活艰辛",
      "意外变故", "困境求生", "身陷危机", "绝境求生"
    ],
    "冲突": [
      "商场博弈", "明争暗斗", "权力角逐", "利益纷争",
      "职场竞争", "家族内斗", "黑帮对决", "阴谋浮现"
    ],
    "打脸": [
      "身份逆转", "震惊全场", "实力打脸", "强势反转",
      "霸气归来", "当场打脸", "全场震惊", "逆袭成功"
    ],
    "高潮": [
      "巅峰对决", "最终决战", "身份揭晓", "圆满结局",
      "生死之战", "权力之巅", "真相大白", "人生巅峰"
    ],
    "伏笔": [
      "暗藏玄机", "神秘人物", "惊人真相", "身份成谜",
      "线索浮现", "阴谋败露", "秘密揭开", "真相浮现"
    ],
    "日常": [
      "日常生活", "新的开始", "日常相处", "感情升温",
      "工作日常", "悠闲时光", "意外相遇", "温馨时刻"
    ]
  },

  // 科幻流
  "科幻": {
    "弱势开局": [
      "废物逆袭", "危机降临", "生存困境", "身份最低",
      "被选中者", "意外机遇", "生死存亡", "绝境逢生"
    ],
    "冲突": [
      "星际战争", "文明对决", "阵营对抗", "权力之争",
      "生存竞争", "资源争夺", "生死搏杀", "激烈战斗"
    ],
    "打脸": [
      "逆袭打脸", "科技碾压", "文明震惊", "实力证明",
      "全场震惊", "技术碾压", "智慧打脸", "强势反转"
    ],
    "高潮": [
      "终极决战", "文明毁灭", "宇宙危机", "救世主降临",
      "巅峰对决", "文明复兴", "史诗大战", "最终决战"
    ],
    "伏笔": [
      "神秘信号", "文明遗迹", "远古真相", "惊人秘密",
      "线索发现", "真相揭幕", "秘密浮现", "谜底揭晓"
    ],
    "日常": [
      "日常研究", "新的任务", "训练日常", "科技探索",
      "日常修炼", "悠闲时光", "任务报告", "收获总结"
    ]
  },

  // 历史流
  "历史": {
    "弱势开局": [
      "身份卑微", "家徒四壁", "被人欺凌", "穷困潦倒",
      "科举落第", "家族没落", "命运多舛", "身世凄凉"
    ],
    "冲突": [
      "朝堂斗争", "权谋博弈", "党派之争", "家族纷争",
      "战场杀敌", "江湖恩怨", "家国大义", "利益纷争"
    ],
    "打脸": [
      "一鸣惊人", "金榜题名", "战场立功", "声名鹊起",
      "震惊朝野", "身份逆转", "实力证明", "当场打脸"
    ],
    "高潮": [
      "王朝更迭", "终极对决", "一统天下", "千秋伟业",
      "改朝换代", "巅峰对决", "史诗战役", "名垂千古"
    ],
    "伏笔": [
      "暗藏玄机", "神秘势力", "惊人真相", "身份成谜",
      "线索浮现", "秘密败露", "真相揭开", "惊天秘密"
    ],
    "日常": [
      "日常琐事", "新的开始", "日常修炼", "文人雅集",
      "诗酒年华", "悠闲时光", "日常相处", "生活点滴"
    ]
  },

  // 系统流
  "系统": {
    "弱势开局": [
      "系统觉醒", "废物逆袭", "新手礼包", "身份最低",
      "系统傍身", "绝境逢生", "废物系统", "逆袭开始"
    ],
    "冲突": [
      "系统任务", "危机四伏", "副本挑战", "生死考验",
      "限时任务", "终极挑战", "生死搏杀", "boss大战"
    ],
    "打脸": [
      "系统无敌", "碾压全场", "逆天改命", "震惊世界",
      "全场震惊", "实力证明", "系统打脸", "逆袭成功"
    ],
    "高潮": [
      "系统终极", "诸天对决", "成神之路", "巅峰对决",
      "系统无敌", "诸天之战", "终极任务", "封神之战"
    ],
    "伏笔": [
      "系统秘密", "神秘任务", "隐藏功能", "惊天秘密",
      "任务线索", "真相揭开", "系统真相", "隐藏秘密"
    ],
    "日常": [
      "系统日常", "任务完成", "收获满满", "实力提升",
      "日常任务", "悠闲时光", "系统提示", "收获心得"
    ]
  }
};

// ===================== 情绪值配置 =====================
const EMOTION_CONFIG = {
  "弱势开局": 5,
  "伏笔": 6,
  "日常": 5,
  "冲突": 7,
  "打脸": 9,
  "高潮": 10
};

// ===================== 默认设置 =====================
const DEFAULT_CONFIG = {
  conflictCycle: 3,      // 冲突周期：每3章一个冲突
  climaxCycle: 10,      // 高潮周期：每10章一个大高潮
  hookCycle: 5,         // 钩子周期：每5章一个钩子
  climaxStart: 3        // 首次高潮开始章节
};

// ===================== 章节类型判断 =====================
function getChapterType(chapter, config, customHooks, totalChapters) {
  const { conflictCycle, climaxCycle, hookCycle, climaxStart } = config;
  const chapterNum = chapter.chapter;

  // 第1章一定是弱势开局
  if (chapterNum === 1) {
    return "弱势开局";
  }

  // 大高潮章节（每10章）
  if (chapterNum % climaxCycle === 0 && chapterNum <= totalChapters) {
    return "高潮";
  }

  // 钩子章节（自定义钩子轮询）
  if (customHooks.length > 0) {
    const hookIndex = ((chapterNum - 1) % (climaxCycle - 1));
    if (hookIndex < customHooks.length) {
      return "伏笔";
    }
  }

  // 冲突章节（每3章）- 打脸前一章
  if ((chapterNum - 1) % conflictCycle === 0 && chapterNum > 1) {
    return "冲突";
  }

  // 打脸章节（冲突后一章）
  if (chapterNum > 2 && (chapterNum - 2) % conflictCycle === 0) {
    return "打脸";
  }

  // 日常章节（填充）
  return "日常";
}

// ===================== 生成章节标题 =====================
function generateChapterTitles(options) {
  const {
    bookTitle = "",
    genre = "玄幻",
    chapterCount = 20,
    conflictCycle = DEFAULT_CONFIG.conflictCycle,
    climaxCycle = DEFAULT_CONFIG.climaxCycle,
    customHooks = []
  } = options;

  // 获取流派模板，没有则用玄幻模板
  const templates = TITLE_TEMPLATES[genre] || TITLE_TEMPLATES["玄幻"];

  // 配置
  const config = {
    conflictCycle,
    climaxCycle,
    hookCycle: climaxCycle - 1,
    climaxStart: DEFAULT_CONFIG.climaxStart
  };

  const chapters = [];
  const totalChapters = Math.min(Math.max(chapterCount, 1), 100);

  for (let i = 1; i <= totalChapters; i++) {
    // 确定章节类型
    const type = getChapterType(
      { chapter: i },
      config,
      customHooks,
      totalChapters
    );

    // 获取该类型的标题模板
    const typeTemplates = templates[type] || templates["日常"];
    const templateList = Array.isArray(typeTemplates) ? typeTemplates : typeTemplates.titles || templates["日常"];

    // 随机选择一个模板（保持一致性：使用书名+章节号作为种子）
    const seed = (bookTitle.length || 1) * i;
    const templateIndex = seed % templateList.length;
    const selectedTemplate = templateList[templateIndex];

    // 生成标题
    let title;
    if (i <= 3) {
      // 前3章用固定格式
      title = i === 1 ? `第一章：${selectedTemplate}` : `第${i}章：${selectedTemplate}`;
    } else if (i <= 10) {
      title = `第${i}章：${selectedTemplate}`;
    } else {
      title = `第${i}章：${selectedTemplate}`;
    }

    // 情绪值
    const emotion = EMOTION_CONFIG[type] || 5;

    // 添加自定义钩子
    let hook = null;
    if (type === "伏笔" && customHooks.length > 0) {
      const hookIndex = ((i - 1) % Math.min(customHooks.length, climaxCycle - 1));
      hook = customHooks[hookIndex] || null;
    }

    chapters.push({
      chapter: i,
      title,
      type,
      emotion,
      hook,
      summary: getChapterSummary(type, selectedTemplate)
    });
  }

  return chapters;
}

// ===================== 生成章节简介 =====================
function getChapterSummary(type, template) {
  const summaries = {
    "弱势开局": `主角处于最低谷状态，${template}，为后续逆袭做铺垫`,
    "冲突": `矛盾冲突加剧，${template}，主角面临考验`,
    "打脸": `主角强势反击，${template}，爽点密集`,
    "高潮": `重大转折点，${template}，情节推向高潮`,
    "伏笔": `埋下伏笔，${template}，揭示部分真相`,
    "日常": `过渡章节，${template}，丰富世界观`
  };
  return summaries[type] || `章节内容：${template}`;
}

// ===================== 情绪曲线计算 =====================
function calculateEmotionCurve(chapters) {
  const curve = [];
  let currentEmotion = 3;

  chapters.forEach((ch, idx) => {
    const targetEmotion = ch.emotion;
    // 平滑过渡
    if (targetEmotion > currentEmotion) {
      currentEmotion = Math.min(currentEmotion + 2, targetEmotion);
    } else if (targetEmotion < currentEmotion) {
      currentEmotion = Math.max(currentEmotion - 1, targetEmotion);
    }
    curve.push({
      chapter: ch.chapter,
      emotion: currentEmotion,
      type: ch.type
    });
  });

  return curve;
}

// ===================== 导出配置 =====================
module.exports = {
  TITLE_TEMPLATES,
  EMOTION_CONFIG,
  DEFAULT_CONFIG,
  generateChapterTitles,
  calculateEmotionCurve,
  getChapterType,
  getChapterSummary
};