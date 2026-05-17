# Nginx 配置修复指南 - 静态资源 404 错误

## 问题描述

访问 `https://www.sydyy.top/vocal-class/` 时，控制台报错：
- JS 文件 404：`index-T75SoNG2.js`, `vant-B53B9VKF.js`, `vendor-DFuUiZjX.js`
- CSS 文件 MIME 类型错误：返回 `text/html` 而不是 `text/css`
- 静态资源路径缺少 `/vocal-class/` 前缀

## 根本原因

1. **前端构建时未设置 base 路径**：`vite.config.js` 中 `base: '/vocal-class/'` 被注释
2. **Nginx 配置中静态资源路径匹配问题**

## 修复步骤

### 步骤 1：修复 Vite 配置

编辑 `vocal-class-frontend/vite.config.js`：

```javascript
export default defineConfig({
  base: '/vocal-class/',  // ✅ 取消注释此行
  plugins: [
    // ...
  ],
  // ...
})
```

### 步骤 2：重新构建前端

```bash
cd vocal-class-frontend

# 清理旧的构建文件（可选）
rm -rf dist

# 重新构建
npm run build

# 验证构建结果
ls -la dist/
# 应该看到 index.html 和 assets/ 目录
```

### 步骤 3：检查构建后的 index.html

构建后的 `dist/index.html` 中，静态资源路径应该是：

```html
<script type="module" src="/vocal-class/assets/index-xxx.js"></script>
<link rel="stylesheet" href="/vocal-class/assets/index-xxx.css">
```

**注意**：路径应该以 `/vocal-class/` 开头，而不是 `/assets/`

### 步骤 4：上传文件到服务器

```bash
# 将构建好的文件上传到服务器
scp -r dist/* user@server:/app/vocal-class/frontend/

# 或在服务器上直接构建
ssh user@server
cd /app/vocal-class/frontend
npm install
npm run build
```

**确认文件结构**：
```bash
ssh user@server
ls -la /app/vocal-class/frontend/
# 应该看到：
# - index.html
# - assets/
#   - index-xxx.js
#   - index-xxx.css
#   - ...
```

### 步骤 5：更新 Nginx 配置

更新服务器上的 Nginx 配置文件 `/etc/nginx/sites-available/www.sydyy.top`：

```nginx
# 后端 API 代理配置
location /vocal-class/api {
    rewrite ^/vocal-class/api(.*)$ /api$1 break;
    proxy_pass http://vocal_class_backend;
    # ... 其他配置
}

# 前端静态资源文件配置（优先匹配）
location ~ ^/vocal-class/assets/(.*)$ {
    alias /app/vocal-class/frontend/assets/$1;
    expires 30d;
    add_header Cache-Control "public, immutable";
    access_log off;
}

# 匹配其他静态资源（如 vite.svg 等）
location ~ ^/vocal-class/(.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot))$ {
    alias /app/vocal-class/frontend/$1;
    expires 30d;
    add_header Cache-Control "public, immutable";
    access_log off;
}

# 前端页面配置
location /vocal-class {
    alias /app/vocal-class/frontend;
    index index.html;
    try_files $uri $uri/ /vocal-class/index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
```

### 步骤 6：测试并重启 Nginx

```bash
# 测试配置
sudo nginx -t

# 如果测试通过，重启 Nginx
sudo systemctl restart nginx

# 查看 Nginx 状态
sudo systemctl status nginx
```

### 步骤 7：验证修复

1. **清除浏览器缓存**（重要！）
   - Chrome/Edge: `Ctrl + Shift + Delete` 或 `Ctrl + F5`
   - Firefox: `Ctrl + Shift + Delete` 或 `Ctrl + F5`

2. **访问前端页面**
   ```
   https://www.sydyy.top/vocal-class/
   ```

3. **检查浏览器开发者工具**
   - 打开 Network 标签
   - 刷新页面
   - 检查所有资源是否返回 200 状态码
   - 确认 JS 和 CSS 文件的 Content-Type 正确

4. **测试 API**
   ```bash
   curl https://www.sydyy.top/vocal-class/api/health
   ```

## 验证清单

- [ ] `vite.config.js` 中 `base: '/vocal-class/'` 已取消注释
- [ ] 前端已重新构建
- [ ] `dist/index.html` 中的资源路径包含 `/vocal-class/` 前缀
- [ ] 文件已上传到 `/app/vocal-class/frontend/`
- [ ] Nginx 配置已更新
- [ ] Nginx 配置测试通过
- [ ] Nginx 已重启
- [ ] 浏览器缓存已清除
- [ ] 前端页面可以正常访问
- [ ] 静态资源（JS/CSS）可以正常加载
- [ ] API 接口可以正常调用

## 常见问题

### Q1: 构建后资源路径仍然不对

**A**: 检查 `vite.config.js` 中 `base` 配置是否正确，确保没有拼写错误：
```javascript
base: '/vocal-class/',  // 注意：末尾必须有斜杠
```

### Q2: Nginx 返回 404，但文件存在

**A**: 检查文件权限：
```bash
sudo chown -R www-data:www-data /app/vocal-class/frontend
sudo chmod -R 755 /app/vocal-class/frontend
```

### Q3: CSS 文件返回 text/html

**A**: 这通常是因为文件不存在，Nginx 返回了错误页面。检查：
1. 文件路径是否正确
2. Nginx 配置中的 alias 路径是否正确
3. 文件是否真的存在

### Q4: 页面空白，控制台没有错误

**A**: 检查：
1. `index.html` 中的资源路径是否正确
2. 浏览器控制台是否有 CORS 错误
3. 网络请求是否都被阻止

## 调试命令

```bash
# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看 Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# 测试文件是否存在
ls -la /app/vocal-class/frontend/assets/

# 测试 Nginx 配置
sudo nginx -t

# 查看 Nginx 进程
ps aux | grep nginx
```

## 参考

- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Nginx Location 匹配规则](https://nginx.org/en/docs/http/ngx_http_core_module.html#location)
- [项目部署文档](../DEPLOYMENT.md)

