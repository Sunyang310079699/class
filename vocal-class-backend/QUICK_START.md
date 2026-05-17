# 快速启动指南

## 1. 环境准备

### 确认 MongoDB 已启动

打开新的命令行窗口，运行：
```bash
mongosh vocal-class --eval "db.stats()"
```

如果看到数据库统计信息，说明 MongoDB 正常运行。

## 2. 安装依赖

在 `vocal-class-backend` 目录下：
```bash
npm install
```

## 3. 配置环境变量

确认 `.env` 文件存在：
```bash
# 如果不存在，运行初始化脚本
node setup.js
```

## 4. 启动服务器

### 方式 1：开发模式（推荐）
```bash
npm run dev
```

### 方式 2：生产模式
```bash
npm start
```

### 方式 3：直接运行
```bash
node src/app.js
```

## 5. 验证服务

服务器启动后，你应该看到类似输出：
```
==================================================
🚀 服务器启动成功！
📍 运行环境: development
🌐 访问地址: http://localhost:3000
📚 API 文档: http://localhost:3000/api/health
==================================================
MongoDB 连接成功: localhost
数据库名称: vocal-class
```

## 6. 测试 API

### 方式 1：使用测试脚本
打开新的命令行窗口：
```bash
cd vocal-class-backend
node test-api.js
```

### 方式 2：使用浏览器
访问：`http://localhost:3000/api/health`

### 方式 3：使用 curl
```bash
curl http://localhost:3000/api/health
```

### 方式 4：使用 PowerShell
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/health
```

## 7. 测试示例

### 创建学生
```bash
curl -X POST http://localhost:3000/api/students ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"张三\",\"phone\":\"13800138000\",\"notes\":\"擅长民族唱法\"}"
```

### 获取学生列表
```bash
curl http://localhost:3000/api/students
```

### 获取系统设置
```bash
curl http://localhost:3000/api/settings
```

### 获取首页统计
```bash
curl http://localhost:3000/api/statistics/dashboard
```

## 8. 常见问题

### Q: 无法连接到 MongoDB
**A**: 
1. 确认 MongoDB 服务正在运行
2. 检查 `.env` 文件中的 `MONGODB_URI` 配置
3. 确保数据库 `vocal-class` 已创建

### Q: 端口 3000 被占用
**A**: 
1. 修改 `.env` 文件中的 `PORT` 为其他端口
2. 或者停止占用 3000 端口的进程

### Q: 启动时报错
**A**: 
1. 确认 Node.js 版本 >= 14
2. 删除 `node_modules` 重新安装：`rm -rf node_modules && npm install`
3. 查看完整错误信息

## 9. 下一步

- 查看 [README.md](./README.md) 了解完整 API 文档
- 查看 [API.md](../docs/backend/API.md) 了解所有接口
- 使用 Postman 或类似工具进行完整测试

## 10. 开发建议

### 推荐工具
- **Postman** - API 测试工具
- **MongoDB Compass** - MongoDB 可视化工具
- **VS Code** - 代码编辑器
  - 推荐插件：ESLint, Prettier, REST Client

### 开发流程
1. 修改代码后，`nodemon` 会自动重启服务器
2. 使用 Postman 测试新接口
3. 查看 MongoDB Compass 验证数据变化
4. 查看控制台日志排查问题

## 联系支持

如有问题，请查看项目文档或联系开发团队。

