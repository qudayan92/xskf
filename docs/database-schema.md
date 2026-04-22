# 数据库表关系说明

## ER 图

```
┌──────────────┐       ┌──────────────────┐
│    users     │ 1   N │      novels       │
│──────────────│───────│──────────────────│
│ id (PK)      │       │ id (PK)          │
│ username     │       │ book_id (UNIQUE)  │
│ pen_name     │◄──────│ author_id (FK)    │
│ password     │       │ title            │
│ total_books  │       │ category_id (FK)  │
│ total_words  │       │ status           │
└──────────────┘       │ word_count       │
                       └────────┬─────────┘
                                │ 1
                                │ N
                       ┌────────▼─────────┐
                       │    chapters       │
                       │──────────────────│
                       │ id (PK)          │
                       │ book_id (FK)     │
                       │ chapter_no       │
                       │ chapter_title    │
                       │ content (LONGTEXT)│
                       │ word_count       │
                       │ status           │
                       └──────────────────┘

┌──────────────────┐
│   categories     │
│──────────────────│
│ id (PK)          │
│ parent_id (自引用)│◄──┐
│ name             │   │ 树形结构
│ sort_order       │───┘
└──────────────────┘
```

## 表关系详解

### 1. users → novels（一对多）
- **关系**: 一个用户可以创作多部作品
- **外键**: `novels.author_id` → `users.id`
- **级联规则**: 删除用户时需先处理其作品（应用层控制）
- **统计联动**: 创建/删除作品时更新 `users.total_books`

### 2. novels → chapters（一对多）
- **关系**: 一部作品包含多个章节
- **外键**: `chapters.book_id` → `novels.id`
- **级联规则**: 删除作品时级联删除所有章节 (`ON DELETE CASCADE`)
- **统计联动**:
  - 新增/修改/删除章节时自动更新 `novels.word_count`
  - 自动更新 `novels.chapter_count`
  - 自动更新 `novels.last_chapter_id` 和 `last_update_time`

### 3. novels → categories（多对一）
- **关系**: 多个作品属于同一分类
- **外键**: `novels.category_id` → `categories.id`
- **说明**: 分类为可选字段，0 表示未分类

### 4. categories 自引用（树形结构）
- **关系**: 分类支持无限层级（parent_id 指向自身）
- **根节点**: `parent_id = 0` 表示一级分类
- **查询**: 使用递归 CTE 或应用层构建树形结构

## 状态码定义

| 表 | 字段 | 值 | 含义 |
|----|------|-----|------|
| novels | status | 0 | 草稿 |
| novels | status | 1 | 连载中 |
| novels | status | 2 | 已完结 |
| novels | status | 3 | 暂停 |
| chapters | status | 0 | 草稿 |
| chapters | status | 1 | 已发布 |

## API 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/novels` | 作品列表（支持按 author_id/status/category_id 筛选）|
| POST | `/api/v1/novels` | 创建作品（自动生成 book_id）|
| GET | `/api/v1/novels/:id` | 作品详情 |
| PATCH | `/api/v1/novels/:id` | 更新作品 |
| DELETE | `/api/v1/novels/:id` | 删除作品 |
| GET | `/api/v1/books/:bookId/chapters` | 章节列表 |
| POST | `/api/v1/books/:bookId/chapters` | 创建章节（自动计算 chapter_no 和 word_count）|
| GET | `/api/v1/chapters/:id` | 章节详情（含完整内容）|
| PATCH | `/api/v1/chapters/:id` | 更新章节（自动重算 word_count）|
| DELETE | `/api/v1/chapters/:id` | 删除章节（自动更新作品统计）|
| GET | `/api/v1/users` | 用户列表 |
| POST | `/api/v1/users` | 注册用户 |
| GET | `/api/v1/users/:id` | 用户详情 |
| PATCH | `/api/v1/users/:id` | 更新用户 |
| DELETE | `/api/v1/users/:id` | 删除用户 |
| GET | `/api/v1/categories` | 分类列表（扁平）|
| GET | `/api/v1/categories/tree` | 分类树（嵌套结构）|
| POST | `/api/v1/categories` | 创建分类 |
| PATCH | `/api/v1/categories/:id` | 更新分类 |
| DELETE | `/api/v1/categories/:id` | 删除分类（含子分类）|

## 使用方式

```bash
# 1. 初始化数据库
mysql -u root -p < apps/backend/sql/init.sql

# 2. 配置数据库连接
# 编辑 apps/backend/.env

# 3. 启动后端服务
cd apps/backend && npm run dev

# 4. 测试接口
curl http://localhost:4000/api/health
curl http://localhost:4000/api/v1/novels
curl http://localhost:4000/api/v1/categories/tree
```
