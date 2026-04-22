const Novel = require('./models/Novel');
const User = require('./models/User');
const { query } = require('./db');

async function initTestData() {
  try {
    console.log('🔄 Initializing test data...\n');

    // Check if novels exist
    const [novels] = await query('SELECT COUNT(*) as count FROM novels');
    if (novels[0].count > 0) {
      console.log('✅ Novels table already has data, skipping initialization.\n');
      process.exit(0);
    }

    // Create test user
    console.log('1. Creating test user...');
    let user;
    try {
      user = await User.create({
        username: 'testuser',
        password: 'test123',
        pen_name: '测试作者',
        email: 'test@example.com'
      });
      console.log(`   ✅ User created: ${user.pen_name} (ID: ${user.id})\n`);
    } catch (err) {
      if (err.message.includes('unique')) {
        // User already exists
        const existingUser = await User.findByUsername('testuser');
        user = existingUser;
        console.log(`   ✅ User already exists: ${user.pen_name} (ID: ${user.id})\n`);
      } else {
        throw err;
      }
    }

    // Insert test novels
    console.log('2. Creating test novels...');
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
      console.log(`   ✅ Created: "${novel.title}" (${novel.word_count.toLocaleString()} 字, ${novel.chapter_count} 章)`);
    }
    console.log(`\n   Total novels: ${testNovels.length}\n`);

    console.log('✅ Initialization completed successfully!\n');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Initialization failed:', err.message);
    process.exit(1);
  }
}

initTestData();
