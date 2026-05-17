# 声乐课程管理系统 - 后端 API

基于 Node.js + Express + MongoDB 的声乐课程管理系统后端服务。

## 技术栈

- **Node.js** - JavaScript 运行环境
- **Express** - Web 框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB ODM
- **Express Validator** - 参数验证
- **CORS** - 跨域支持

## 项目结构

```
vocal-class-backend/
├── src/
│   ├── config/           # 配置文件
│   │   └── database.js   # 数据库连接配置
│   ├── models/           # 数据模型
│   │   ├── Student.js
│   │   ├── CoursePackage.js
│   │   ├── Course.js
│   │   ├── IncomeRecord.js
│   │   └── Settings.js
│   ├── controllers/      # 控制器
│   │   ├── studentController.js
│   │   ├── coursePackageController.js
│   │   ├── courseController.js
│   │   ├── incomeController.js
│   │   ├── statisticsController.js
│   │   └── settingsController.js
│   ├── routes/           # 路由
│   │   ├── studentRoutes.js
│   │   ├── coursePackageRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── incomeRoutes.js
│   │   ├── statisticsRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── index.js
│   ├── middlewares/      # 中间件
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── utils/            # 工具类
│   │   ├── response.js
│   │   └── asyncHandler.js
│   └── app.js            # 应用入口
├── .env                  # 环境变量（需自行创建）
├── .env.example          # 环境变量示例
├── .gitignore
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd vocal-class-backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vocal-class
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

### 3. 确保 MongoDB 已启动

确保 MongoDB 服务正在运行，并且已经初始化了 `vocal-class` 数据库。

### 4. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3000` 启动。

## API 接口

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **数据格式**: JSON
- **字符编码**: UTF-8

### 主要接口

#### 学生管理
- `GET /api/students` - 获取学生列表
- `GET /api/students/:id` - 获取学生详情
- `POST /api/students` - 创建学生
- `PUT /api/students/:id` - 更新学生
- `DELETE /api/students/:id` - 删除学生

#### 课时包管理
- `POST /api/students/:studentId/course-packages` - 购买课时包
- `GET /api/students/:studentId/course-packages` - 获取课时包列表

#### 课程管理
- `GET /api/courses` - 获取课程列表
- `GET /api/courses/today` - 获取今日课程
- `GET /api/courses/:id` - 获取课程详情
- `POST /api/courses` - 创建课程
- `PUT /api/courses/:id` - 更新课程（支持 `updateFutureCourses` 同步后续常规课程时间）
- `POST /api/courses/:id/cancel` - 取消课程
- `POST /api/courses/:id/attendance` - 课程签到

#### 收益统计
- `GET /api/income/overview` - 获取收益概览
- `GET /api/income/records` - 获取收入明细
- `POST /api/income/records` - 添加其他收入
- `GET /api/income/trend` - 获取收益趋势

#### 统计数据
- `GET /api/statistics/dashboard` - 获取首页统计
- `GET /api/statistics/warnings` - 获取课时预警

#### 系统设置
- `GET /api/settings` - 获取系统设置
- `PUT /api/settings` - 更新系统设置

### 响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

## 测试

### 健康检查

```bash
curl http://localhost:3000/api/health
```

### 创建学生示例

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "phone": "13800138000",
    "notes": "擅长民族唱法"
  }'
```

## 开发说明

### 添加新功能

1. 在 `models/` 创建数据模型
2. 在 `controllers/` 创建控制器
3. 在 `routes/` 创建路由
4. 在 `routes/index.js` 注册路由

### 错误处理

所有异步路由处理器都使用 `asyncHandler` 包装，自动捕获错误并传递给全局错误处理中间件。

### 数据验证

使用 `express-validator` 进行参数验证，验证规则定义在 `middlewares/validator.js`。

## 常见问题

### 无法连接数据库

1. 检查 MongoDB 服务是否启动
2. 确认 `.env` 中的 `MONGODB_URI` 配置正确
3. 确保数据库 `vocal-class` 已创建并初始化

### 端口被占用

修改 `.env` 中的 `PORT` 配置为其他端口。

### CORS 错误

确认 `.env` 中的 `CORS_ORIGIN` 配置与前端地址一致。

## 部署

### 生产环境配置

1. 设置环境变量 `NODE_ENV=production`
2. 使用强密码配置 `JWT_SECRET`
3. 配置 MongoDB 连接字符串（推荐使用 MongoDB Atlas）
4. 限制 CORS 允许的域名

### 使用 PM2 部署

```bash
npm install -g pm2
pm2 start src/app.js --name vocal-class-api
pm2 save
pm2 startup
```

## 相关文档

- [API 接口文档](../../docs/backend/API.md)
- [数据库设计文档](../../docs/backend/DATABASE.md)
- [数据库初始化说明](../../docs/backend/DATABASE_SETUP.md)

## 许可证

ISC

## 作者

Vocal Class Team

