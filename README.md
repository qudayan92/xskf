# 明睿小说智能创作平台

AI 赋能的小说创作平台，提供智能大纲、角色建模、世界观构建、AI 辅助写作等功能。

## 项目结构

```
novel-ai-platform/
├── apps/
│   ├── frontend/          # Next.js 前端应用
│   │   ├── pages/         # 页面路由
│   │   ├── components/    # React 组件
│   │   ├── lib/           # API 客户端、工具函数
│   │   ├── styles/        # 全局样式
│   │   └── store.tsx      # Zustand 状态管理
│   └── backend/           # Express 后端 API
│       ├── src/           # 服务端代码
│       └── test-api.js    # API 测试脚本
├── docs/                  # 项目文档
├── tools/                 # 开发工具
└── preview-*.html         # 静态预览文件
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务

```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:frontend   # 前端 http://localhost:3000
npm run dev:backend    # 后端 http://localhost:4000
```

### 3. 访问应用

- **前端**: http://localhost:3000
- **后端 API**: http://localhost:4000
- **API 健康检查**: http://localhost:4000/api/health

## 技术栈

### 前端
- **框架**: Next.js 13 + React 18
- **语言**: TypeScript
- **样式**: 自定义 CSS + 磨砂玻璃效果
- **状态管理**: Zustand
- **HTTP 客户端**: Axios

### 后端
- **运行时**: Node.js 18+
- **框架**: Express.js
- **开发工具**: Nodemon
- **数据存储**: 内存存储 (开发阶段)

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/v1/projects` | 获取所有项目 |
| POST | `/api/v1/projects` | 创建项目 |
| GET | `/api/v1/projects/:id/chapters` | 获取章节列表 |
| POST | `/api/v1/projects/:id/chapters` | 创建章节 |
| POST | `/api/v1/generate/outline` | AI 生成大纲 |
| POST | `/api/v1/generate/chapter` | AI 生成章节 |
| POST | `/api/v1/generate/character` | AI 生成角色 |

## 开发计划

### 已完成 ✅
- [x] 前端基础架构 (Next.js + TypeScript)
- [x] 三栏编辑器布局
- [x] Agent 协作面板
- [x] 协作日志功能
- [x] 首页 UI 优化 (磨砂玻璃效果)
- [x] 后端 API 服务 (Express)
- [x] 基础 CRUD API
- [x] AI 生成接口 (Mock)

### 进行中 🚧
- [ ] 前端 API 集成
- [ ] 真实 AI 模型接入
- [ ] 数据库持久化 (PostgreSQL)

### 待开发 📋
- [ ] 用户认证系统
- [ ] 实时协作 (WebSocket)
- [ ] 文件导出 (PDF/EPUB)
- [ ] 云端同步
- [ ] 移动端适配

## 预览

项目包含三个静态预览文件，可直接双击打开：
- `preview.html` - 原始首页预览
- `preview-home.html` - 优化后首页预览
- `preview-editor.html` - 编辑器预览

## 贡献

欢迎提交 Issue 和 Pull Request！