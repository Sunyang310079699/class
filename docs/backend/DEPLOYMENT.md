# 部署文档

## 部署架构

```
[用户微信] 
    ↓
[微信公众号]
    ↓
[CDN / 静态服务器] ← 前端 H5 应用
    ↓
[Nginx 反向代理]
    ↓
[Node.js 后端服务]
    ↓
[MongoDB 数据库]
```

---

## 一、服务器准备

### 1.1 服务器配置要求

**最低配置**:
- CPU: 1核
- 内存: 2GB
- 磁盘: 20GB
- 带宽: 1Mbps

**推荐配置**:
- CPU: 2核
- 内存: 4GB
- 磁盘: 40GB SSD
- 带宽: 3Mbps

**操作系统**: Ubuntu 20.04 LTS 或 CentOS 7+

### 1.2 域名准备

1. 购买域名（必须备案）
2. 域名解析到服务器 IP
3. 准备两个子域名：
   - `app.yourdomain.com` - 前端应用
   - `api.yourdomain.com` - 后端 API

---

## 二、环境安装

### 2.1 安装 Node.js

```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node -v  # 验证安装
```

### 2.2 安装 MongoDB

**方式一：本地安装**
```bash
# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 启动 MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

**方式二：使用 MongoDB Atlas（推荐）**
1. 访问 https://www.mongodb.com/cloud/atlas
2. 注册并创建免费集群
3. 配置网络访问（添加服务器 IP）
4. 获取连接字符串

### 2.3 安装 Nginx

```bash
# Ubuntu
sudo apt update
sudo apt install nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.4 安装 PM2

```bash
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 -v
```

### 2.5 安装 Git

```bash
sudo apt install git
git --version
```

---

## 三、SSL 证书配置

### 3.1 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d www.sydyy.top -d sydyy.top

# 自动续期
sudo certbot renew --dry-run
```

---

## 四、后端部署

### 4.1 上传代码

```bash
# 在服务器上克隆代码
cd /var/www
sudo mkdir vocal-class
sudo chown $USER:$USER vocal-class
cd vocal-class

# 克隆仓库（或使用 FTP 上传）
git clone <your-repo-url> .
```

### 4.2 配置环境变量

```bash
cd backend
cp .env.example .env
nano .env
```

编辑 `.env` 文件：
```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/vocal_class
# 或使用 MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vocal_class

# JWT 配置
JWT_SECRET=your_very_strong_secret_key_change_this
JWT_EXPIRE=7d

# 微信公众号配置
WECHAT_APPID=your_wechat_appid
WECHAT_APPSECRET=your_wechat_appsecret
WECHAT_TOKEN=your_wechat_token

# 应用配置
# 如果使用子域名方式
APP_URL=https://app.yourdomain.com
API_URL=https://api.yourdomain.com

# 如果使用路径方式（www.sydyy.top/vocal-class/api）
# APP_URL=https://www.sydyy.top/vocal-class
# API_URL=https://www.sydyy.top/vocal-class/api
```

### 4.3 安装依赖

```bash
cd /var/www/vocal-class/backend
npm install --production
```

### 4.4 使用 PM2 启动

在 `vocal-class-backend` 目录下创建 PM2 配置文件 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [{
    name: 'vocal-class-api',
    script: './src/app.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
};
```

启动应用：
```bash
# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs vocal-class-api

# 设置开机自启
pm2 startup
pm2 save
```

---

## 五、前端部署

### 5.1 本地构建

在本地开发机器上：
```bash
cd frontend

# 配置生产环境 API 地址
nano .env.production
```

`.env.production` 内容：

**如果使用子域名方式（api.yourdomain.com）**：
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_TITLE=声乐教学管理系统
```

**如果使用路径方式（www.sydyy.top/vocal-class/api）**：
```env
VITE_API_BASE_URL=https://www.sydyy.top/vocal-class/api
VITE_APP_TITLE=声乐教学管理系统
```

**重要：如果前端部署在子路径 `/vocal-class` 下，需要配置 Vite base 路径**：

编辑 `vite.config.js`，取消注释 base 配置：
```javascript
export default defineConfig({
  base: '/vocal-class/',  // 取消注释此行
  plugins: [
    // ...
  ],
  // ...
})
```

构建生产版本：
```bash
npm run build
```

### 5.2 上传到服务器

**如果使用路径方式（www.sydyy.top/vocal-class）**：

```bash
# 方式一：将构建好的 dist 目录内容上传到服务器
# 注意：目标路径是 /app/vocal-class/frontend（不是 dist 子目录）
scp -r dist/* user@server:/app/vocal-class/frontend/

# 方式二：在服务器上直接构建
ssh user@server
cd /app/vocal-class/frontend
# 确保已安装依赖
npm install
# 构建（确保已配置 base: '/vocal-class/'）
npm run build
```

**目录结构说明**：
- 服务器文件路径：`/app/vocal-class/frontend/`
- 访问路径：`https://www.sydyy.top/vocal-class/`
- 确保 `/app/vocal-class/frontend/index.html` 存在
- 确保静态资源在 `/app/vocal-class/frontend/assets/` 目录下

**如果使用子域名方式（app.yourdomain.com）**：

```bash
# 将 dist 目录上传到服务器
scp -r dist/* user@server:/var/www/vocal-class/frontend/dist/

# 或在服务器上直接构建
cd /var/www/vocal-class/frontend
npm install
npm run build
```

---

## 六、Nginx 配置

### 6.1 前端配置

创建 `/etc/nginx/sites-available/vocal-class-frontend`：
```nginx
server {
    listen 80;
    server_name app.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;

    root /var/www/vocal-class/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存策略
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 6.2 后端 API 配置

#### 方式一：子域名方式（api.yourdomain.com）

创建 `/etc//sites-available/vocal-class-backend`：
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

upstream backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # 请求体大小限制
    client_max_body_size 10M;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

#### 方式二：路径方式（www.sydyy.top/vocal-class/api）

如果要将 API 配置到主域名的子路径下，例如 `https://www.sydyy.top/vocal-class/api`，可以使用以下配置：

创建或编辑 `/etc/nginx/sites-available/www.sydyy.top`：

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name www.sydyy.top sydyy.top;
    return 301 https://$server_name$request_uri;
}

# 后端服务 upstream
upstream vocal_class_backend {
    server localhost:3000;
    keepalive 64;
}

# HTTPS 服务器配置
server {
    listen 443 ssl http2;
    server_name www.sydyy.top sydyy.top;

    # SSL 证书配置（根据实际证书路径修改）
    ssl_certificate /etc/letsencrypt/live/www.sydyy.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.sydyy.top/privkey.pem;

    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 请求体大小限制
    client_max_body_size 10M;

    # 后端 API 代理配置
    location /vocal-class/api {
        # 路径重写：将 /vocal-class/api 重写为 /api
        rewrite ^/vocal-class/api(.*)$ /api$1 break;
        
        # 代理到后端服务
        proxy_pass http://vocal_class_backend;
        proxy_http_version 1.1;
        
        # 代理头设置
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Prefix /vocal-class;
        
        # 超时设置
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # 前端静态资源文件配置（必须在 /vocal-class 之前，优先匹配）
    # 匹配 /vocal-class/assets/ 下的所有静态资源
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

    # 前端静态文件配置
    # 访问路径：https://www.sydyy.top/vocal-class/
    # 文件路径：/app/vocal-class/frontend
    location /vocal-class {
        # 注意：使用 alias 时，路径末尾不能有斜杠
        alias /app/vocal-class/frontend;
        index index.html;
        
        # SPA 路由支持：所有路由都返回 index.html
        try_files $uri $uri/ /vocal-class/index.html;
        
        # Gzip 压缩
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_comp_level 6;
        gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    }

    # 注意：根路径 / 已被其他前端使用，不要重定向
    # 如果需要重定向，取消下面的注释
    # location = / {
    #     return 301 /vocal-class/;
    # }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

**配置说明**：

1. **Location 优先级**：Nginx 按照最长匹配原则，`/vocal-class/api` 会优先匹配 API 请求，`/vocal-class` 匹配前端静态文件
2. **API 代理**：
   - `location /vocal-class/api`：匹配所有以 `/vocal-class/api` 开头的请求
   - `rewrite ^/vocal-class/api(.*)$ /api$1 break;`：将 `/vocal-class/api/xxx` 重写为 `/api/xxx`，然后转发到后端
   - `proxy_pass http://vocal_class_backend;`：代理到本地 3000 端口的后端服务
   - `X-Forwarded-Prefix`：告诉后端应用原始路径前缀，便于生成正确的 URL

3. **前端静态文件**：
   - `location /vocal-class`：匹配所有以 `/vocal-class` 开头的请求（除了 `/vocal-class/api`）
   - `alias /app/vocal-class/frontend;`：指向前端文件目录
   - `try_files $uri $uri/ /vocal-class/index.html;`：SPA 路由支持，所有路由都返回 index.html
   - 静态资源缓存：图片、字体等缓存 1 年，JS/CSS 缓存 30 天

4. **重要注意事项**：
   - 前端文件必须放在 `/app/vocal-class/frontend/` 目录下
   - 前端构建时需要设置 `base: '/vocal-class/'`（在 vite.config.js 中）
   - 根路径 `/` 已被其他前端使用，不要重定向
   - 确保 `/app/vocal-class/frontend/index.html` 文件存在

**测试配置**：
```bash
# 测试 Nginx 配置
sudo nginx -t

# 如果配置正确，重启 Nginx
sudo systemctl restart nginx

# 测试 API 访问
curl https://www.sydyy.top/vocal-class/api/health
```

### 6.3 启用配置

**对于子域名方式**：
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/vocal-class-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/vocal-class-backend /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

**对于路径方式（www.sydyy.top/vocal-class/api）**：
```bash
# 复制配置文件（或使用项目中的配置文件）
sudo cp docs/backend/nginx-vocal-class-api.conf /etc/nginx/sites-available/www.sydyy.top

# 编辑配置文件，修改 SSL 证书路径（如果不同）
sudo nano /etc/nginx/sites-available/www.sydyy.top

# 创建软链接
sudo ln -s /etc/nginx/sites-available/www.sydyy.top /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 验证配置
curl https://www.sydyy.top/vocal-class/api/health
```

---

## 七、微信公众号配置

### 7.1 配置服务器信息

1. 登录微信公众平台
2. 进入【开发】-【基本配置】
3. 配置服务器地址：`https://api.yourdomain.com/wechat`
4. 配置 Token（与 .env 中的 WECHAT_TOKEN 一致）
5. 配置 IP 白名单

### 7.2 配置 JS 接口安全域名

1. 进入【设置】-【公众号设置】-【功能设置】
2. JS接口安全域名：`app.yourdomain.com`
3. 下载验证文件并上传到前端根目录

### 7.3 配置 OAuth2.0 授权

1. 进入【开发】-【接口权限】-【网页授权】
2. 授权回调页面域名：`app.yourdomain.com`

---

## 八、数据库初始化

```bash
# 连接到 MongoDB
mongo

# 或使用 mongosh（新版本）
mongosh

# 切换到数据库
use vocal_class;

# 创建管理员用户
db.createUser({
  user: "vocal_admin",
  pwd: "strong_password_here",
  roles: [
    { role: "readWrite", db: "vocal_class" }
  ]
});

# 创建索引（参考 DATABASE.md）
db.students.createIndex({ phone: 1 }, { unique: true });
db.students.createIndex({ name: 1 });
db.students.createIndex({ remainingHours: 1 });

# 初始化系统设置
db.settings.insertOne({
  _id: ObjectId("000000000000000000000001"),
  defaultCourseDuration: 1,
  defaultHourlyRate: 200,
  defaultLocation: "音乐工作室",
  warningThreshold: 3,
  teacherName: "",
  teacherPhone: "",
  wechatOpenId: "",
  updatedAt: new Date()
});
```

---

## 九、监控和日志

### 9.1 PM2 监控

```bash
# 查看应用状态
pm2 status

# 查看实时日志
pm2 logs

# 查看监控面板
pm2 monit

# 查看详细信息
pm2 info vocal-class-api
```

### 9.2 Nginx 日志

```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 9.3 MongoDB 日志

```bash
# 查看 MongoDB 日志
sudo tail -f /var/log/mongodb/mongod.log
```

---

## 十、备份策略

### 10.1 数据库备份脚本

创建 `/var/www/vocal-class/scripts/backup.sh`：
```bash
#!/bin/bash

# 配置
BACKUP_DIR="/var/backups/vocal-class"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="vocal_class"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mongodump --db=$DB_NAME --out=$BACKUP_DIR/$DATE

# 压缩备份
cd $BACKUP_DIR
tar -czf $DATE.tar.gz $DATE
rm -rf $DATE

# 删除 30 天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

设置定时任务：
```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点执行备份
0 2 * * * /var/www/vocal-class/scripts/backup.sh
```

### 10.2 代码备份

```bash
# 在服务器上创建 Git 仓库
cd /var/www/vocal-class
git init
git add .
git commit -m "Initial deployment"

# 推送到远程仓库
git remote add origin <your-backup-repo>
git push -u origin master
```

---

## 十一、安全加固

### 11.1 防火墙配置

```bash
# 启用 UFW 防火墙
sudo ufw enable

# 允许 SSH
sudo ufw allow 22

# 允许 HTTP 和 HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 查看状态
sudo ufw status
```

### 11.2 SSH 安全

```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 修改以下配置
Port 2222                    # 修改 SSH 端口
PermitRootLogin no          # 禁止 root 登录
PasswordAuthentication no   # 禁用密码登录（使用密钥）

# 重启 SSH
sudo systemctl restart sshd
```

### 11.3 定期更新

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 自动安全更新
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 十二、常见问题排查

### 12.1 后端服务无法启动

```bash
# 检查端口占用
sudo lsof -i :3000

# 查看 PM2 日志
pm2 logs vocal-class-api --lines 50

# 检查环境变量
pm2 env vocal-class-api
```

### 12.2 数据库连接失败

```bash
# 检查 MongoDB 状态
sudo systemctl status mongod

# 测试连接
mongosh --host localhost --port 27017

# 查看日志
sudo tail -f /var/log/mongodb/mongod.log
```

### 12.3 前端无法访问

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 12.4 微信授权失败

1. 检查域名配置是否正确
2. 确认 APPID 和 APPSECRET 正确
3. 检查服务器 IP 是否在白名单
4. 查看后端日志排查错误

---

## 十三、更新部署

### 13.1 后端更新

```bash
cd /var/www/vocal-class/backend

# 拉取最新代码
git pull

# 安装新依赖
npm install --production

# 重启服务
pm2 restart vocal-class-api

# 查看状态
pm2 status
```

### 13.2 前端更新

```bash
# 本地构建
cd frontend
npm run build

# 上传到服务器
scp -r dist/* user@server:/var/www/vocal-class/frontend/dist/

# 清除 CDN 缓存（如使用 CDN）
```

---

## 十四、性能优化

### 14.1 Nginx 优化

```nginx
# 在 nginx.conf 中添加
worker_processes auto;
worker_connections 1024;

# 启用 HTTP/2
listen 443 ssl http2;

# 开启 Gzip
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript;
```

### 14.2 Node.js 优化

```javascript
// 使用 cluster 模式
instances: 'max',  // PM2 配置

// 连接池优化
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2
});
```

---

## 十五、联系方式

**技术支持**: support@yourdomain.com

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-21

