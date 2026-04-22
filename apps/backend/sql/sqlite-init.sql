-- ============================================
-- 明睿创作平台 - SQLite 初始化脚本
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    pen_name VARCHAR(50) DEFAULT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    email VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    bio TEXT,
    total_books INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER DEFAULT 0,
    name VARCHAR(50) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 作品表
CREATE TABLE IF NOT EXISTS novels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id VARCHAR(32) NOT NULL UNIQUE,
    author_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    subtitle VARCHAR(100) DEFAULT NULL,
    cover_image VARCHAR(255) DEFAULT NULL,
    summary TEXT,
    category_id INTEGER DEFAULT 0,
    tags VARCHAR(255) DEFAULT NULL,
    status INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    chapter_count INTEGER DEFAULT 0,
    last_chapter_id INTEGER DEFAULT NULL,
    last_update_time DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    chapter_no INTEGER NOT NULL,
    chapter_title VARCHAR(100) NOT NULL,
    content TEXT,
    word_count INTEGER DEFAULT 0,
    status INTEGER DEFAULT 0,
    publish_time DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES novels(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_novels_author ON novels(author_id);
CREATE INDEX IF NOT EXISTS idx_novels_status ON novels(status);
CREATE INDEX IF NOT EXISTS idx_novels_category ON novels(category_id);
CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_no ON chapters(book_id, chapter_no);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 初始分类数据
INSERT OR IGNORE INTO categories (id, parent_id, name, sort_order) VALUES
(1, 0, '全部', 0),
(2, 1, '玄幻', 1),
(3, 1, '科幻', 2),
(4, 1, '都市', 3),
(5, 1, '历史', 4),
(6, 1, '悬疑', 5),
(7, 1, '言情', 6),
(8, 1, '奇幻', 7),
(9, 1, '军事', 8),
(10, 1, '游戏', 9);

-- 初始测试用户（密码: test123）
INSERT OR IGNORE INTO users (username, password, pen_name, bio) VALUES
('admin', 'test123', '管理员', '平台管理员'),
('testuser', 'test123', '明睿', 'AI 赋能的创作者');