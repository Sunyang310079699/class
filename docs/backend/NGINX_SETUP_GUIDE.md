# Nginx 配置指南 - www.sydyy.top/vocal-class

本文档说明如何将前端和后端配置到 `https://www.sydyy.top/vocal-class` 路径下。

## 一、前置条件

1. ✅ 域名 `www.sydyy.top` 已配置 SSL 证书
2. ✅ 后端服务运行在 `localhost:3000`
3. ✅ 前端文件存放在 `/app/vocal-class/frontend/`
4. ✅ Nginx 已安装并运行

## 二、前端配置

### 2.1 配置 Vite base 路径

编辑 `vocal-class-frontend/vite.config.js`：

```javascript
export default defineConfig({
  base: '/vocal-class/',  // 取消注释此行
  plugins: [
    // ...
  ],
  // ...
})
```

### 2.2 配置生产环境 API 地址

创建或编辑 `vocal-class-frontend/.env.production`：

```env
VITE_API_BASE_URL=https://www.sydyy.top/vocal-class/api
VITE_APP_TITLE=声乐教学管理系统
```

### 2.3 构建前端

```bash
cd vocal-class-frontend
npm run build
```

### 2.4 上传到服务器

```bash
# 将构建好的 dist 目录内容上传到服务器
scp -r dist/* user@server:/app/vocal-class/frontend/

# 或在服务器上直接构建
ssh user@server
cd /app/vocal-class/frontend
npm install
npm run build
```

**重要**：确保目录结构如下：
```
/app/vocal-class/frontend/
├── index.html
├── assets/
│   ├── index-xxx.js
│   ├── index-xxx.css
│   └── ...
└── ...
```

## 三、Nginx 配置

### 3.1 复制配置文件

```bash
# 复制配置文件到 Nginx 配置目录
sudo cp docs/backend/nginx-vocal-class-api.conf /etc/nginx/sites-available/www.sydyy.top

# 或者如果配置文件已存在，直接编辑
sudo nano /etc/nginx/sites-available/www.sydyy.top
```

### 3.2 确认配置

确保配置文件中包含以下关键配置：

1. **后端 API 代理**：
```nginx
location /vocal-class/api {
    rewrite ^/vocal-class/api(.*)$ /api$1 break;
    proxy_pass http://vocal_class_backend;
    # ... 其他代理配置
}
```

2. **前端静态文件**：
```nginx
location /vocal-class {
    alias /app/vocal-class/frontend;
    index index.html;
    try_files $uri $uri/ /vocal-class/index.html;
    # ... 其他配置
}
```

3. **Upstream 配置**：
```nginx
upstream vocal_class_backend {
    server localhost:3000;
    keepalive 64;
}
```

### 3.3 启用配置

```bash
# 创建软链接（如果不存在）
sudo ln -s /etc/nginx/sites-available/www.sydyy.top /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 如果测试通过，重启 Nginx
sudo systemctl restart nginx
```

## 四、验证配置

### 4.1 测试前端访问

```bash
# 访问前端首页
curl https://www.sydyy.top/vocal-class/

# 应该返回 index.html 内容
```

在浏览器中访问：`https://www.sydyy.top/vocal-class/`

### 4.2 测试 API 访问

```bash
# 测试健康检查接口
curl https://www.sydyy.top/vocal-class/api/health

# 应该返回 JSON 响应
```

### 4.3 检查静态资源

在浏览器开发者工具中检查：
- 静态资源（JS、CSS）是否正常加载
- 资源路径是否为 `/vocal-class/assets/xxx.js`
- API 请求是否发送到 `/vocal-class/api/xxx`

## 五、常见问题

### 5.1 前端页面空白

**原因**：可能是 base 路径未配置或静态资源路径错误

**解决**：
1. 检查 `vite.config.js` 中 `base: '/vocal-class/'` 是否已配置
2. 重新构建前端：`npm run build`
3. 检查浏览器控制台错误信息
4. 确认静态资源路径是否正确

### 5.2 API 请求 404

**原因**：Nginx 配置中的路径重写可能有问题

**解决**：
1. 检查 Nginx 错误日志：`sudo tail -f /var/log/nginx/error.log`
2. 确认后端服务是否运行：`pm2 status`
3. 测试后端本地访问：`curl http://localhost:3000/api/health`
4. 检查 Nginx 配置中的 `rewrite` 规则

### 5.3 静态资源 404

**原因**：文件路径或 alias 配置错误

**解决**：
1. 确认文件是否存在：`ls -la /app/vocal-class/frontend/`
2. 检查 Nginx 配置中的 `alias` 路径是否正确
3. 确认文件权限：`sudo chown -R www-data:www-data /app/vocal-class/frontend`
4. 检查 Nginx 访问日志：`sudo tail -f /var/log/nginx/access.log`

### 5.4 SPA 路由不工作

**原因**：`try_files` 配置可能有问题

**解决**：
1. 确认 `try_files $uri $uri/ /vocal-class/index.html;` 配置正确
2. 检查 location 块是否正确匹配 `/vocal-class` 路径
3. 确保 `index.html` 文件存在

## 六、配置检查清单

- [ ] Vite 配置中设置了 `base: '/vocal-class/'`
- [ ] `.env.production` 中配置了正确的 API 地址
- [ ] 前端文件已上传到 `/app/vocal-class/frontend/`
- [ ] Nginx 配置文件中路径正确
- [ ] SSL 证书路径正确
- [ ] 后端服务运行在 `localhost:3000`
- [ ] Nginx 配置测试通过
- [ ] 前端页面可以正常访问
- [ ] API 接口可以正常调用
- [ ] 静态资源可以正常加载

## 七、更新部署

当需要更新前端时：

```bash
# 1. 本地构建
cd vocal-class-frontend
npm run build

# 2. 上传到服务器
scp -r dist/* user@server:/app/vocal-class/frontend/

# 3. 清除浏览器缓存或使用强制刷新（Ctrl+F5）
```

当需要更新后端时：

```bash
# 在服务器上
cd /app/vocal-class/backend
git pull
npm install --production
pm2 restart vocal-class-api
```

## 八、参考文档

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [项目部署文档](../DEPLOYMENT.md)

