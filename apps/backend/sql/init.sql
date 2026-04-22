-- ============================================
-- 明睿创作平台 - 数据库初始化脚本
-- 数据库: MySQL 8.0+
-- 字符集: utf8mb4
-- 引擎: InnoDB
-- ============================================

CREATE DATABASE IF NOT EXISTS novel_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE novel_platform;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    pen_name VARCHAR(50) DEFAULT NULL COMMENT '笔名',
    avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    bio TEXT COMMENT '个人简介',
    total_books INT UNSIGNED DEFAULT 0 COMMENT '作品数',
    total_words BIGINT UNSIGNED DEFAULT 0 COMMENT '累计字数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    parent_id INT UNSIGNED DEFAULT 0 COMMENT '父分类ID，0为一级',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

-- 作品表
CREATE TABLE IF NOT EXISTS novels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    book_id VARCHAR(32) NOT NULL UNIQUE COMMENT '作品唯一标识',
    author_id BIGINT UNSIGNED NOT NULL COMMENT '作者ID',
    title VARCHAR(100) NOT NULL COMMENT '作品名称',
    subtitle VARCHAR(100) DEFAULT NULL COMMENT '副标题',
    cover_image VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
    summary TEXT COMMENT '作品简介',
    category_id INT UNSIGNED DEFAULT 0 COMMENT '分类ID',
    tags VARCHAR(255) DEFAULT NULL COMMENT '标签，逗号分隔',
    status TINYINT DEFAULT 0 COMMENT '0草稿 1连载中 2已完结 3暂停',
    word_count INT UNSIGNED DEFAULT 0 COMMENT '总字数',
    chapter_count INT UNSIGNED DEFAULT 0 COMMENT '总章节数',
    last_chapter_id BIGINT UNSIGNED DEFAULT NULL COMMENT '最新章节ID',
    last_update_time DATETIME DEFAULT NULL COMMENT '最后更新时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_author_id (author_id),
    INDEX idx_status (status),
    INDEX idx_category (category_id),
    CONSTRAINT fk_novel_author FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小说作品表';

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    book_id BIGINT UNSIGNED NOT NULL COMMENT '关联作品ID',
    chapter_no INT UNSIGNED NOT NULL COMMENT '章节序号',
    chapter_title VARCHAR(100) NOT NULL COMMENT '章节标题',
    content LONGTEXT COMMENT '章节正文',
    word_count INT UNSIGNED DEFAULT 0 COMMENT '本章字数',
    status TINYINT DEFAULT 0 COMMENT '0草稿 1已发布',
    publish_time DATETIME DEFAULT NULL COMMENT '发布时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_book_id (book_id),
    INDEX idx_chapter_no (book_id, chapter_no),
    CONSTRAINT fk_chapter_book FOREIGN KEY (book_id) REFERENCES novels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='章节表';

-- 初始分类数据
INSERT INTO categories (id, parent_id, name, sort_order) VALUES
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
INSERT INTO users (username, password, pen_name, bio) VALUES
('admin', 'test123', '管理员', '平台管理员'),
('testuser', 'test123', '明睿', 'AI 赋能的创作者');
