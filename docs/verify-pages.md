# 页面功能说明

## 确认页面功能是否正常

如果你看不到以下功能，请按以下步骤操作：

## 1. 初始化测试数据

### 方式1: 使用API端点（推荐）
```bash
# 如果后端正在运行，直接调用初始化API
curl -X POST http://localhost:4000/api/v1/seed

# 或者使用浏览器访问
# http://localhost:4000/api/v1/seed
```

### 方式2: 手动创建数据
```bash
# 进入backend目录
cd apps/backend

# 安装依赖（如果还没安装）
npm install mysql2

# 运行初始化脚本
node src/init-test-data.js
```

## 2. 重启后端服务

修改代码后需要重启：

```bash
# 在后端目录
cd apps/backend
npm run dev

# 等待服务器启动（约3-5秒）
```

## 3. 验证数据是否成功

在浏览器中访问以下地址验证：

```bash
# 1. 检查健康状态
http://localhost:4000/api/health

# 2. 查看所有作品
http://localhost:4000/api/v1/novels

# 3. 查看分类树
http://localhost:4000/api/v1/categories/tree

# 4. 查看用户列表
http://localhost:4000/api/v1/users
```

## 4. 刷新前端页面

1. 确保前端在运行：`cd apps/frontend && npm run dev`
2. 访问 http://localhost:3000 或 http://localhost:3000/works
3. 按 F5 刷新页面
4. 打开浏览器开发者工具（F12），查看Console标签是否有错误

## 预期结果

访问 http://localhost:3000/works 时应该看到：

- **顶部导航**: 返回首页、作品、创作、智能体、世界观、数据
- **标题**: "我的作品"
- **新建按钮**: "+ 新建作品" 按钮
- **筛选Tab**: 全部 | 连载中 | 已完结
- **统计卡片**: 总作品数、连载中、已完结、总字数
- **作品网格**: 2列网格显示作品卡片
  - 每个卡片包含：
    - 封面缩略图（占位符或真实图片）
    - 标题
    - 状态标签
    - 字数和章节数
    - 更新时间
    - 标签显示

访问 http://localhost:3000 时应该看到：

- **最近创作区域**:
  - 标题: "最近创作"
  - 作品数量统计
  - 6个作品卡片
  - "查看全部"链接

## 常见问题

### Q: 页面空白
A: 检查：
1. 后端是否在运行
2. 前端是否在运行
3. F12控制台是否有错误

### Q: 显示"加载中..."但不刷新
A: 检查：
1. 浏览器网络请求状态（F12 -> Network）
2. API端点是否可访问：`http://localhost:4000/api/v1/novels`
3. 如果显示"作品不存在"，说明数据库没有数据，需要执行步骤1

### Q: 数据显示但不是预期的
A: 检查：
1. 数据库中是否有初始数据
2. 数据是否正确插入到novels表
3. 前端API调用路径是否正确

## 技术支持

如果问题仍未解决：

1. 检查浏览器控制台的错误信息
2. 检查后端控制台的错误信息
3. 查看Network标签，确认API响应格式是否正确
