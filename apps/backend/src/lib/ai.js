/**
 * AI Provider abstraction layer.
 * Currently mock-only. Real providers (Zhipu, DeepSeek, Qwen, OpenAI)
 * can be plugged in by implementing the same function signatures.
 */

const AI_PROVIDERS = {
  mock: { enabled: true }
};

function generateMockContinue(text) {
  const snippets = [
    '他凝视着远方，心中涌起一股难以言喻的情绪。这些天来的经历如同梦境一般，让他不得不重新审视自己所相信的一切。',
    '"这不可能..."她低声说道，手指紧紧攥住衣角。眼前的情景完全超出了她的预期，所有的计划在这一刻都变得毫无意义。',
    '风吹过荒原，带来远方的气息。他知道，前方还有更长的路要走，但此刻的他已不再是当初那个犹豫不决的少年。',
    '夜色渐深，星光洒落在古老的城墙上。城中的灯火一盏接一盏地亮起，仿佛在诉说着千年来未曾改变的故事。',
    '长剑出鞘的瞬间，空气仿佛凝固了。他深吸一口气，目光锁定了对手的每一个细微动作。这一战，他必须赢。',
    '推开门的刹那，时光仿佛倒流。熟悉的檀香味、窗台上那盆依然翠绿的兰花、还有桌上摊开的未完成的书稿——一切都和他离开时一模一样。',
  ];
  const snippet = snippets[Math.floor(Math.random() * snippets.length)];
  return (text ? text.slice(-50) : '') + '\n\n' + snippet;
}

function generateMockPolish(text) {
  if (!text || text.length < 10) return text || '';

  // Simulate polishing by adding literary flourishes
  const polished = text
    .replace(/说/g, '轻声说道')
    .replace(/看/g, '凝望')
    .replace(/走/g, '缓步前行');

  return polished + '\n\n—— 经过润色的文字更加流畅优美，增加了文学性的表达。';
}

function generateMockExpand(text) {
  if (!text || text.length < 10) {
    return '周围的空气仿佛凝固了，每一个细节都在此刻被无限放大。光线从窗棂的缝隙中渗入，在地面上投下斑驳的光影。空气中弥漫着若有若无的花香，夹杂着一丝难以察觉的紧张气息。';
  }

  const expansions = [
    '\n\n四周的空气仿佛凝固了，每一个细节都在此刻被无限放大。远处的钟声悠悠传来，像是在为这寂静的夜晚打着节拍。',
    '\n\n微风拂过，带来远处桂花树的清香。月光如水，静静地流淌在青石板铺就的小径上，映出一片银白色的世界。',
    '\n\n突然间，一阵急促的脚步声打破了沉寂。所有人都屏住了呼吸，目光不由自主地转向声音传来的方向。',
  ];
  const expansion = expansions[Math.floor(Math.random() * expansions.length)];

  return text + expansion;
}

function generateMockTitles(genre, count = 5) {
  const titlesByGenre = {
    '玄幻': ['破晓之光', '九天之上', '万界之主', '天道的召唤', '不朽传说', '星辰大海', '苍穹之下'],
    '科幻': ['星际迷途', '量子深渊', '机械之心', '深空回响', '时间的裂缝', '未来纪元', 'AI 觉醒'],
    '都市': ['城市之光', '霓虹深处', '午夜的风', '繁华背后', '街角的咖啡店', '雨夜的约定'],
    '历史': ['长安旧事', '帝国的黄昏', '乱世风云', '千年一梦', '大漠孤烟', '烽火连天'],
    '悬疑': ['迷雾重重', '消失的夜晚', '第十二个嫌疑人', '暗处的眼睛', '真相的代价', '谎言之网'],
    '言情': ['花开的季节', '遇见你', '星光下的誓言', '时光里的秘密', '此去经年', '心之所向'],
    '奇幻': ['魔法学徒', '龙之谷', '精灵之森', '失落的王国', '魔法石的秘密', '永恒之塔'],
    '军事': ['钢铁风暴', '最后的防线', '红色闪电', '无声战场', '铁血征途', '利刃出鞘'],
  };

  const pool = titlesByGenre[genre] || [
    '新的开始', '命运之轮', '暗流涌动', '转折点', '未知的旅途',
    '黎明之前', '风暴将至', '抉择时刻', '远方来信', '燃烧的征途'
  ];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getActiveProvider() {
  return 'mock';
}

module.exports = {
  getActiveProvider,
  generateMockContinue,
  generateMockPolish,
  generateMockExpand,
  generateMockTitles,
};
