const Novel = require('./models/Novel');
const { query } = require('./db');

async function seedTestNovels() {
  try {
    console.log('Seeding test novels...');

    // Check if novels table exists and has data
    const [novels] = await query('SELECT COUNT(*) as count FROM novels');
    if (novels[0].count > 0) {
      console.log('Novels table already has data, skipping seed.');
      return;
    }

    // Insert test novels
    const testNovels = [
      {
        book_id: 'BK001',
        author_id: 1,
        title: '星际流光',
        subtitle: '银河系边缘的星际探索',
        cover_image: '/placeholder-cover-1.jpg',
        category_id: 3,
        tags: '科幻,星际,冒险',
        status: 1,
        word_count: 328000,
        chapter_count: 128,
      },
      {
        book_id: 'BK002',
        author_id: 1,
        title: '长安夜话',
        subtitle: '大唐盛世下的悬疑谜案',
        cover_image: '/placeholder-cover-2.jpg',
        category_id: 5,
        tags: '历史,悬疑,推理',
        status: 1,
        word_count: 156000,
        chapter_count: 56,
      },
      {
        book_id: 'BK003',
        author_id: 1,
        title: '迷雾之塔',
        subtitle: '古老魔法世界的冒险',
        cover_image: '/placeholder-cover-3.jpg',
        category_id: 8,
        tags: '奇幻,魔法,冒险',
        status: 2,
        word_count: 89000,
        chapter_count: 32,
      },
      {
        book_id: 'BK004',
        author_id: 1,
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
      console.log(`Created novel: ${novel.title}`);
    }

    console.log('✅ Test novels seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

seedTestNovels()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
