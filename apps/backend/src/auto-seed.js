const Novel = require('./models/Novel');
const User = require('./models/User');
const Chapter = require('./models/Chapter');
const { query } = require('./db');

async function autoSeedIfEmpty() {
  try {
    // 检查novels表是否有数据
    const [novels] = await query('SELECT COUNT(*) as count FROM novels');
    const count = novels[0].count;

    if (count === 0) {
      console.log('🔄 检测到novels表为空，正在自动初始化测试数据...');

      try {
        // 创建测试用户
        let user = await User.findByUsername('testuser');
        if (!user) {
          user = await User.create({
            username: 'testuser',
            password: 'test123',
            pen_name: '测试作者',
            email: 'test@example.com'
          });
          console.log('✅ 测试用户创建成功');
        } else {
          console.log('✅ 测试用户已存在');
        }

        // 创建测试作品
        const testNovels = [
          {
            book_id: `BK${Date.now()}`,
            author_id: user.id,
            title: '星际流光',
            subtitle: '银河系边缘的星际探索',
            cover_image: null,
            category_id: 3,
            tags: '科幻,星际,冒险',
            status: 1,
            word_count: 328000,
            chapter_count: 128,
          },
          {
            book_id: `BK${Date.now()}`,
            author_id: user.id,
            title: '长安夜话',
            subtitle: '大唐盛世下的悬疑谜案',
            cover_image: null,
            category_id: 5,
            tags: '历史,悬疑,推理',
            status: 1,
            word_count: 156000,
            chapter_count: 56,
          },
          {
            book_id: `BK${Date.now()}`,
            author_id: user.id,
            title: '迷雾之塔',
            subtitle: '古老魔法世界的冒险',
            cover_image: null,
            category_id: 8,
            tags: '奇幻,魔法,冒险',
            status: 2,
            word_count: 89000,
            chapter_count: 32,
          },
          {
            book_id: `BK${Date.now()}`,
            author_id: user.id,
            title: '深海回声',
            subtitle: '深海深处的秘密',
            cover_image: null,
            category_id: 6,
            tags: '悬疑,科幻,探险',
            status: 0,
            word_count: 0,
            chapter_count: 0,
          }
        ];

        for (const novel of testNovels) {
          await Novel.create(novel);
        }

        console.log(`✅ 成功创建 ${testNovels.length} 部测试作品`);

      } catch (err) {
        console.error('❌ 初始化数据失败:', err);
      }
    } else {
      console.log(`✅ Novels表已有 ${count} 部作品，跳过初始化`);
    }
  } catch (err) {
    console.error('❌ 检查novels表失败:', err);
  }
}

// 在应用启动时自动执行
autoSeedIfEmpty();
