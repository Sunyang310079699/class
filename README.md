# 声乐教学管理系统

> 专为声乐老师个人使用的课程管理系统，支持微信公众号 H5 应用和微信小程序

## 项目简介

这是一个完整的教学管理系统，包括前端和后端，帮助声乐老师高效管理学生课程、课时和收益。系统设计为单用户版本，适合个人教师使用。

**当前状态**：✅ 前端开发完成（支持 Mock 模式） + ✅ 后端 API 开发完成 + ✅ 微信小程序开发完成

### 核心功能

- 📚 **学生管理** - 管理学生信息和课时包
- 📅 **课表管理** - 可视化课程安排，支持日/周/月视图
- ✅ **点名签到** - 快速签到并自动扣除课时
- 💰 **收益统计** - 实时统计教学收入
- 📊 **数据分析** - 课程和收益数据可视化

## 技术栈

### 前端（H5）
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vant 4** - 移动端 UI 组件库
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **ECharts** - 数据可视化
- **Day.js** - 日期处理
- **Axios** - HTTP 请求
- **Mock.js** - 模拟数据生成
- **Weixin-js-sdk** - 微信 SDK

### 小程序
- **uni-app** - 跨平台应用开发框架
- **Vue 3** - 渐进式 JavaScript 框架
- **Pinia** - 状态管理
- **Day.js** - 日期处理

### 后端
- **Node.js** - JavaScript 运行环境
- **Express** - Web 框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB ODM
- **Express Validator** - 参数验证
- **CORS** - 跨域支持

## 项目结构

```
class/
├── docs/                          # 项目文档
│   ├── PRD.md                    # 产品需求文档
│   ├── FRONTEND.md               # 前端开发文档
│   ├── MOCK_DATA.md              # Mock 数据说明
│   ├── style/                    # 设计参考图
│   │   ├── style.jpg
│   │   ├── style1.jpg
│   │   └── style2.jpg
│   └── backend/                  # 后端文档
│       ├── API.md               # API 接口文档
│       ├── DATABASE.md          # 数据库设计文档
│       ├── DATABASE_SETUP.md    # 数据库初始化说明
│       ├── BACKEND_IMPLEMENTATION.md # 后端实现文档
│       ├── DEPLOYMENT.md        # 部署文档
│       └── README.md            # 后端说明
├── vocal-class-frontend/         # 前端 H5 项目目录
├── vocal-class-miniprogram/      # 微信小程序项目目录
│   ├── src/
│   │   ├── api/                 # API 接口封装
│   │   │   ├── request.js      # uni.request 封装
│   │   │   ├── auth.js         # 认证相关接口
│   │   │   ├── student.js      # 学生相关接口
│   │   │   ├── course.js       # 课程相关接口
│   │   │   ├── income.js       # 收益相关接口
│   │   │   ├── settings.js     # 设置相关接口
│   │   │   └── statistics.js   # 统计相关接口
│   │   ├── config/             # 配置文件
│   │   │   └── env.js          # 环境配置
│   │   ├── pages/              # 页面
│   │   │   ├── login/          # 登录页
│   │   │   ├── home/           # 首页
│   │   │   ├── students/       # 学生管理
│   │   │   ├── schedule/       # 课表
│   │   │   ├── income/         # 收益
│   │   │   └── profile/        # 个人中心
│   │   ├── subpackages/        # 分包
│   │   │   └── student/        # 学生端页面
│   │   ├── stores/             # Pinia 状态管理
│   │   │   ├── index.js        # Store 入口
│   │   │   ├── auth.js         # 认证 Store
│   │   │   ├── student.js      # 学生 Store
│   │   │   ├── course.js       # 课程 Store
│   │   │   ├── income.js       # 收益 Store
│   │   │   └── settings.js     # 设置 Store
│   │   ├── utils/              # 工具函数
│   │   │   ├── date.js         # 日期处理
│   │   │   ├── storage.js      # 本地存储
│   │   │   ├── format.js       # 格式化工具
│   │   │   └── validate.js     # 表单验证
│   │   ├── App.vue             # 根组件
│   │   ├── main.js             # 入口文件
│   │   ├── manifest.json       # 应用配置
│   │   └── pages.json          # 页面配置
│   ├── package.json
│   ├── vite.config.js
│   └── project.config.json     # 微信小程序项目配置
├── vocal-class-frontend/         # 前端 H5 项目目录
│   ├── src/
│   │   ├── api/                 # API 接口封装
│   │   │   ├── request.js      # Axios 封装
│   │   │   ├── student.js      # 学生相关接口
│   │   │   ├── course.js       # 课程相关接口
│   │   │   ├── income.js       # 收益相关接口
│   │   │   └── mock/           # Mock 数据
│   │   │       ├── index.js    # Mock 入口和拦截器
│   │   │       ├── students.js # 学生 Mock 数据
│   │   │       ├── courses.js  # 课程 Mock 数据
│   │   │       └── income.js   # 收益 Mock 数据
│   │   ├── assets/             # 静态资源
│   │   │   ├── images/        # 图片
│   │   │   ├── icons/         # 图标
│   │   │   └── styles/        # 全局样式
│   │   │       ├── index.scss      # 全局样式入口
│   │   │       ├── variables.scss  # 样式变量
│   │   │       └── responsive.scss # 响应式样式
│   │   ├── components/         # 公共组件
│   │   │   └── Charts/        # 图表组件
│   │   │       ├── MonthlyIncomeChart.vue      # 月度收入柱状图
│   │   │       ├── YearlyIncomeTrendChart.vue  # 年度收入趋势图
│   │   │       └── StudentContributionChart.vue # 学生消费占比饼图
│   │   ├── views/              # 页面视图
│   │   │   ├── Home/          # 首页
│   │   │   │   └── index.vue  # 仪表盘
│   │   │   ├── Students/      # 学生管理
│   │   │   │   ├── index.vue  # 学生列表
│   │   │   │   ├── Add.vue    # 添加学生
│   │   │   │   └── Detail.vue # 学生详情
│   │   │   ├── Schedule/      # 课表
│   │   │   │   ├── index.vue         # 课表视图
│   │   │   │   ├── AddCourse.vue     # 创建课程
│   │   │   │   └── RecurringCourse.vue # 周期性排课
│   │   │   ├── Income/        # 收益
│   │   │   │   └── index.vue  # 收益统计（含图表）
│   │   │   └── Profile/       # 我的
│   │   │       └── index.vue  # 个人中心
│   │   ├── router/             # 路由配置
│   │   │   └── index.js
│   │   ├── stores/             # Pinia 状态管理
│   │   │   ├── index.js       # Store 入口
│   │   │   ├── student.js     # 学生 Store
│   │   │   ├── course.js      # 课程 Store
│   │   │   ├── income.js      # 收益 Store
│   │   │   └── settings.js    # 设置 Store
│   │   ├── utils/              # 工具函数
│   │   │   ├── date.js        # 日期处理
│   │   │   ├── storage.js     # 本地存储
│   │   │   ├── validate.js    # 表单验证
│   │   │   ├── format.js      # 格式化工具
│   │   │   └── export.js      # 数据导出（CSV）
│   │   ├── App.vue             # 根组件
│   │   └── main.js             # 入口文件
│   ├── public/                 # 公共资源
│   ├── .env.development        # 开发环境配置
│   ├── .env.production         # 生产环境配置
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── vocal-class-backend/          # 后端项目目录
│   ├── src/
│   │   ├── config/              # 配置文件
│   │   │   ├── database.js     # 数据库连接
│   │   │   └── wechat.js       # 微信小程序配置
│   │   ├── models/              # 数据模型
│   │   │   ├── Student.js      # 学生模型
│   │   │   ├── CoursePackage.js # 课时包模型
│   │   │   ├── Course.js       # 课程模型
│   │   │   ├── IncomeRecord.js # 收入记录模型
│   │   │   └── Settings.js     # 系统设置模型
│   │   ├── controllers/         # 控制器
│   │   │   ├── studentController.js
│   │   │   ├── coursePackageController.js
│   │   │   ├── courseController.js
│   │   │   ├── incomeController.js
│   │   │   ├── statisticsController.js
│   │   │   └── settingsController.js
│   │   ├── routes/              # 路由
│   │   │   ├── studentRoutes.js
│   │   │   ├── coursePackageRoutes.js
│   │   │   ├── courseRoutes.js
│   │   │   ├── incomeRoutes.js
│   │   │   ├── statisticsRoutes.js
│   │   │   ├── settingsRoutes.js
│   │   │   └── index.js
│   │   ├── middlewares/         # 中间件
│   │   │   ├── errorHandler.js
│   │   │   └── validator.js
│   │   ├── utils/               # 工具类
│   │   │   ├── response.js
│   │   │   └── asyncHandler.js
│   │   └── app.js               # 应用入口
│   ├── .env                     # 环境变量
│   ├── .gitignore
│   ├── package.json
│   ├── README.md                # 后端说明
│   ├── QUICK_START.md           # 快速启动指南
│   ├── setup.js                 # 初始化脚本
│   ├── test-api.js              # API 测试脚本
│   └── start.bat                # Windows 启动脚本
├── vocal-class-desktop/          # Electron 桌面端项目目录
│   ├── src/
│   │   └── main/                # Electron 主进程
│   │       ├── main.js          # 窗口管理，桌面端调用线上 API
│   │       └── preload.js       # 预加载脚本
│   ├── scripts/
│   │   └── build-renderer.mjs   # 构建并复制 H5 前端产物
│   ├── package.json             # 桌面端依赖和打包配置
│   └── README.md                # 桌面端说明
├── scripts/                      # 脚本文件
│   └── init-db.js               # 数据库初始化脚本
└── README.md                    # 项目总说明
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- MongoDB >= 5.0

### 方式一：使用 Mock 数据（仅前端）

适合快速预览和前端开发。

```bash
# 进入前端目录
cd vocal-class-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看应用

### 方式三：运行微信小程序

适合在微信开发者工具中预览和调试。

```bash
# 进入小程序目录
cd vocal-class-miniprogram

# 安装依赖
npm install

# 启动开发服务器（会自动构建到 dist/dev/mp-weixin 目录）
npm run dev:mp-weixin
```

然后在微信开发者工具中：
1. 打开微信开发者工具
2. 选择"导入项目"
3. **选择构建后的目录**：`vocal-class-miniprogram/dist/dev/mp-weixin`
4. AppID 填写：`wx45a282f204420a61`
5. 点击"导入"即可预览

**注意**：uni-app 项目需要先构建才能用微信开发者工具打开，不能直接打开源码目录。

### 方式四：运行 Electron 桌面端

适合在 Windows 桌面应用中使用现有 H5 页面，并直接调用线上 API。

```bash
# 进入桌面端目录
cd vocal-class-desktop

# 安装依赖
npm install

# 启动桌面应用
npm start
```

桌面端会自动构建 H5 前端产物，默认 API 地址为 `https://www.sydyy.top/vocal-class/api`，不再启动本地后端服务。

生成安装包：

```bash
npm run dist
```

### 方式二：完整运行（前端 + 后端）

适合完整功能测试和生产部署。

#### 1. 初始化 MongoDB 数据库

```bash
# 确保 MongoDB 已启动
mongosh --file scripts/init-db.js
```

#### 2. 启动后端服务

```bash
# 进入后端目录
cd vocal-class-backend

# 安装依赖
npm install

# 初始化配置
node setup.js

# 启动服务
npm run dev
```

后端服务将在 http://localhost:3000 启动

#### 3. 启动前端（连接真实后端）

```bash
# 进入前端目录
cd vocal-class-frontend

# 修改 .env.development 文件
# VITE_USE_MOCK=false
# VITE_API_BASE_URL=http://localhost:3000

# 启动前端
npm run dev
```

前端应用将在 http://localhost:5173 启动

### 构建生产版本

```bash
# 前端构建
cd vocal-class-frontend
npm run build

# 后端无需构建，直接运行
cd vocal-class-backend
npm start
```

## Mock 数据说明

当前项目使用 Mock.js 模拟后端接口，数据存储在 `localStorage` 中，刷新页面数据不会丢失。

### Mock 数据特点

- ✅ 完整模拟所有 API 接口
- ✅ 数据持久化到本地存储
- ✅ 真实的业务逻辑（扣课时、计算收益等）
- ✅ 随时可切换到真实后端接口

### 切换到真实接口

1. 修改 `.env.development` 文件：
```env
# Mock 模式（默认）
VITE_USE_MOCK=true

# 真实接口模式
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.yourdomain.com
```

2. 重启开发服务器

详细说明请查看：[docs/MOCK_DATA.md](docs/MOCK_DATA.md)

## 开发进度

### 前端开发 ✅

#### 第一阶段 - MVP 核心功能 ✅
- [x] 项目初始化和基础配置
- [x] Mock 数据和 API 封装
- [x] 学生管理页面（列表、添加、详情、购买课时）
- [x] 课表展示页面（周视图、筛选、签到）
- [x] 点名签到功能（自动扣课时、课时预警）
- [x] 收益统计页面（统计、明细、筛选）
- [x] 首页仪表盘（数据概览、快捷操作、今日课程）
- [x] 个人中心（教学设置、数据管理）

#### 第二阶段 - 优化功能 ✅
- [x] 周期性排课
- [x] 课时预警提醒
- [x] 收益图表分析
- [x] 数据导出功能
- [x] 页面过渡动画
- [x] 响应式优化

### 后端开发 ✅

#### 第一阶段 - 核心 API ✅
- [x] 数据库设计和初始化
- [x] 数据模型创建（Mongoose Schema）
- [x] 学生管理 API（CRUD）
- [x] 课时包管理 API
- [x] 课程管理 API（含签到逻辑）
- [x] 收益统计 API
- [x] 系统设置 API
- [x] 数据统计 API

#### 第二阶段 - 功能增强 ✅
- [x] 参数验证中间件
- [x] 错误处理中间件
- [x] 统一响应格式
- [x] 数据库事务支持
- [x] 时间冲突检测
- [x] 课时预警逻辑

### 第三阶段 - 高级功能 ✅
- [x] **账号密码登录系统**
  - [x] 教师账号登录（最高权限，管理所有功能）
  - [x] 学生账号登录（仅查看个人数据）
  - [x] 账号生成规则：账号=手机号，密码=姓名首字母+手机号
  - [x] 登录状态持久化（localStorage + token）
  - [x] 切换账号功能
  - [x] 权限控制和路由守卫
  - [x] JWT Token 认证
  - [x] 学生端页面（首页、课表、记录、个人中心）
- [ ] 图片上传（学生头像）
- [ ] JWT 身份验证
- [ ] API 限流
- [ ] 语音笔记
- [ ] PWA 支持（离线使用）
- [ ] 数据导出（Excel）

## 页面路由

### 公共路由
| 路径 | 页面 | 说明 |
|------|------|------|
| `/login` | 登录页 | 账号密码登录 |

### 教师端路由
| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 今日课程和数据概览 |
| `/students` | 学生列表 | 所有学生管理 |
| `/students/:id` | 学生详情 | 学生信息、课时、记录 |
| `/students/add` | 添加学生 | 创建新学生 |
| `/schedule` | 课表 | 日历视图 |
| `/schedule/add` | 创建课程 | 排课表单 |
| `/schedule/recurring` | 周期性排课 | 批量创建课程 |
| `/income` | 收益统计 | 收入明细和统计 |
| `/profile` | 个人中心 | 设置和关于 |

### 学生端路由
| 路径 | 页面 | 说明 |
|------|------|------|
| `/student` | 学生首页 | 我的课时和本周课程 |
| `/student/schedule` | 我的课表 | 个人课程安排 |
| `/student/records` | 我的记录 | 上课历史和缴费记录 |
| `/student/profile` | 个人中心 | 个人信息和切换账号 |

## 开发规范

### 代码规范
- 使用 ESLint + Prettier 格式化代码
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case
- 遵循 Vue 3 Composition API 风格

### Git 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试
chore: 构建/工具链
```

### 组件开发规范
- 单一职责原则
- Props 类型声明
- 事件命名使用 kebab-case
- 合理使用 computed 和 watch

## 浏览器兼容性

- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 微信内置浏览器（主要目标）
- iOS Safari >= 12
- Android Chrome >= 70

## 部署

### 静态部署
构建后的 `dist` 目录可部署到：
- 阿里云 OSS
- 腾讯云 COS
- Vercel
- Netlify
- GitHub Pages

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name app.yourdomain.com;
    root /var/www/vocal-class/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### 微信公众号配置
1. 上传验证文件到网站根目录
2. 配置 JS 接口安全域名
3. 配置 OAuth2.0 授权回调域名

详细部署说明：[docs/backend/DEPLOYMENT.md](docs/backend/DEPLOYMENT.md)

## 相关文档

### 产品文档
- [产品需求文档 PRD.md](docs/PRD.md)

### 前端文档
- [前端开发文档 FRONTEND.md](docs/FRONTEND.md)
- [Mock 数据说明 MOCK_DATA.md](docs/MOCK_DATA.md)
- [前端 README](vocal-class-frontend/README.md)

### 后端文档
- [API 接口文档 API.md](docs/backend/API.md)
- [数据库设计文档 DATABASE.md](docs/backend/DATABASE.md)
- [数据库初始化说明 DATABASE_SETUP.md](docs/backend/DATABASE_SETUP.md)
- [后端实现文档 BACKEND_IMPLEMENTATION.md](docs/backend/BACKEND_IMPLEMENTATION.md)
- [登录认证系统设计文档 AUTH_SYSTEM.md](docs/backend/AUTH_SYSTEM.md)
- [登录系统快速启动指南 AUTH_QUICK_START.md](docs/AUTH_QUICK_START.md)
- [后端 README](vocal-class-backend/README.md)
- [快速启动指南](vocal-class-backend/QUICK_START.md)

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎反馈。

---

**开发状态**：
- ✅ 前端开发完成（支持 Mock 和真实 API 两种模式）
- ✅ 后端 API 开发完成
- ✅ MongoDB 数据库设计和初始化完成
- ⏳ 部署和微信集成（待完成）

**创建时间**：2025-10-21  
**最后更新**：2025-11-12

