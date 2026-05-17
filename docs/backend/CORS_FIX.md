# CORS 错误修复指南

## 问题描述

前端访问时出现 CORS 错误：
```
Access to XMLHttpRequest at 'https://api.yourdomain.com/api/auth/login' 
from origin 'https://www.sydyy.top' has been blocked by CORS policy
```

## 问题原因

1. **前端 API 地址配置错误**：前端仍在请求 `https://api.yourdomain.com/api/auth/login` 而不是 `https://www.sydyy.top/vocal-class/api/auth/login`
2. **后端 CORS 配置**：后端可能没有正确配置允许 `https://www.sydyy.top` 的请求

## 修复步骤

### 1. 前端配置修复 ✅

已创建 `.env.production` 文件，配置如下：
```env
VITE_API_BASE_URL=https://www.sydyy.top/vocal-class/api
VITE_APP_TITLE=声乐教学管理系统
```

### 2. 重新构建前端

```bash
cd vocal-class-frontend

# 清理旧的构建文件
rm -rf dist

# 重新构建（会使用 .env.production 中的配置）
npm run build

# 验证构建结果
cat dist/index.html | grep -E "(src|href)"
# 应该看到所有路径都以 /vocal-class/ 开头
```

### 3. 上传到服务器

```bash
# 将构建好的文件上传到服务器
scp -r dist/* user@server:/app/vocal-class/frontend/

# 同时上传 .env.production 文件（如果服务器上也需要）
scp .env.production user@server:/app/vocal-class/frontend/
```

### 4. 后端 CORS 配置

检查后端 `.env` 文件，确保 CORS_ORIGIN 配置正确：

**方式一：允许特定域名（推荐）**

在 `vocal-class-backend/.env` 文件中：
```env
CORS_ORIGIN=https://www.sydyy.top
```

**方式二：允许多个域名**

```env
CORS_ORIGIN=https://www.sydyy.top,https://sydyy.top
```

**方式三：允许所有来源（开发环境）**

```env
CORS_ORIGIN=*
```

### 5. 重启后端服务

```bash
# 在服务器上
cd /app/vocal-class/backend

# 重启 PM2 服务
pm2 restart vocal-class-api

# 查看日志确认配置生效
pm2 logs vocal-class-api --lines 20
```

### 6. 验证修复

1. **清除浏览器缓存**（重要！）
   - `Ctrl + Shift + Delete` 或 `Ctrl + F5`

2. **访问前端页面**
   ```
   https://www.sydyy.top/vocal-class/
   ```

3. **打开浏览器开发者工具（F12）**
   - 查看 Network 标签
   - 尝试登录
   - 检查 API 请求地址是否为 `https://www.sydyy.top/vocal-class/api/auth/login`

4. **检查响应头**
   - 在 Network 中点击请求
   - 查看 Response Headers
   - 应该看到 `Access-Control-Allow-Origin: https://www.sydyy.top`

## 常见问题

### Q1: 仍然请求 api.yourdomain.com

**A**: 检查：
1. `.env.production` 文件是否存在且配置正确
2. 是否重新构建了前端
3. 服务器上的文件是否已更新

### Q2: CORS 错误仍然存在

**A**: 检查：
1. 后端 `.env` 文件中的 `CORS_ORIGIN` 配置
2. 后端服务是否已重启
3. 浏览器控制台中的完整错误信息

### Q3: 预检请求（OPTIONS）失败

**A**: 确保后端 CORS 配置包含：
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 调试命令

```bash
# 检查前端构建后的 API 地址
cd vocal-class-frontend
grep -r "VITE_API_BASE_URL" dist/ || echo "环境变量已编译到代码中"

# 检查后端 CORS 配置
cd ../vocal-class-backend
grep CORS_ORIGIN .env || echo "使用默认配置 *"

# 测试 API 访问
curl -H "Origin: https://www.sydyy.top" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://www.sydyy.top/vocal-class/api/auth/login -v
```

## 参考

- [MDN CORS 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
- [Express CORS 中间件](https://expressjs.com/en/resources/middleware/cors.html)
- [Vite 环境变量](https://vitejs.dev/guide/env-and-mode.html)

