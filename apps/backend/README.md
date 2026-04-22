# 明睿小说平台 - 后端 API 服务

基于 Node.js + Express 构建的后端 API 服务，为前端提供数据支持。

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **开发工具**: Nodemon (热重载)
- **数据**: 内存存储 (后续替换为 PostgreSQL)

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式 (热重载)
npm run dev

# 生产模式
npm start
```

服务默认运行在 `http://localhost:4000`

## API 端点

### 健康检查
- `GET /api/health` - 服务状态检查

### 项目管理
- `GET /api/v1/projects` - 获取所有项目
- `POST /api/v1/projects` - 创建新项目
- `GET /api/v1/projects/:id` - 获取项目详情
- `PATCH /api/v1/projects/:id` - 更新项目
- `DELETE /api/v1/projects/:id` - 删除项目

### 章节管理
- `GET /api/v1/projects/:projectId/chapters` - 获取项目所有章节
- `POST /api/v1/projects/:projectId/chapters` - 创建新章节
- `GET /api/v1/chapters/:id` - 获取章节详情
- `PATCH /api/v1/chapters/:id` - 更新章节

### 角色管理
- `GET /api/v1/projects/:projectId/characters` - 获取项目所有角色
- `POST /api/v1/projects/:projectId/characters` - 创建新角色

### 世界观管理
- `GET /api/v1/projects/:projectId/worlds` - 获取项目所有世界观设定
- `POST /api/v1/projects/:projectId/worlds` - 创建新世界观设定

### AI 生成
- `POST /api/v1/generate/outline` - AI 生成故事大纲
- `POST /api/v1/generate/chapter` - AI 生成章节内容
- `POST /api/v1/generate/character` - AI 生成角色设定

## 测试 API

```bash
node test-api.js
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务端口 | 4000 |
| NODE_ENV | 运行环境 | development |

## 项目结构

```
apps/backend/
├── src/
│   └── index.js          # 主服务文件
├── .env                  # 环境变量
├── test-api.js           # API 测试脚本
├── package.json
└── README.md
```

## 开发计划

- [ ] 接入 PostgreSQL 数据库
- [ ] 实现用户认证 (JWT)
- [ ] 接入真实 AI 模型 API
- [ ] 添加文件上传支持
- [ ] 实现 WebSocket 实时协作
- [ ] 添加 API 限流和缓存