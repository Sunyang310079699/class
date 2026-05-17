# 后端实现文档

## 项目概述

声乐课程管理系统后端 API 服务，基于 Node.js + Express + MongoDB 构建。

## 技术架构

### 技术栈
- **运行环境**: Node.js v14+
- **Web 框架**: Express 4.18
- **数据库**: MongoDB 
- **ODM**: Mongoose 8.0
- **验证**: Express Validator 7.0
- **跨域**: CORS 2.8

### 架构模式
- **MVC 模式**: Model-View-Controller
- **RESTful API**: 遵循 REST 规范
- **中间件架构**: 模块化中间件设计

## 项目结构

```
vocal-class-backend/
├── src/                    # 源代码目录
│   ├── config/            # 配置文件
│   │   └── database.js    # 数据库连接配置
│   │
│   ├── models/            # 数据模型（Mongoose Schema）
│   │   ├── Student.js           # 学生模型
│   │   ├── CoursePackage.js     # 课时包模型
│   │   ├── Course.js            # 课程模型
│   │   ├── IncomeRecord.js      # 收入记录模型
│   │   └── Settings.js          # 系统设置模型
│   │
│   ├── controllers/       # 控制器（业务逻辑）
│   │   ├── studentController.js        # 学生管理
│   │   ├── coursePackageController.js  # 课时包管理
│   │   ├── courseController.js         # 课程管理
│   │   ├── incomeController.js         # 收益统计
│   │   ├── statisticsController.js     # 数据统计
│   │   └── settingsController.js       # 系统设置
│   │
│   ├── routes/            # 路由定义
│   │   ├── studentRoutes.js
│   │   ├── coursePackageRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── incomeRoutes.js
│   │   ├── statisticsRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── index.js       # 路由总入口
│   │
│   ├── middlewares/       # 中间件
│   │   ├── errorHandler.js    # 全局错误处理
│   │   └── validator.js       # 参数验证
│   │
│   ├── utils/             # 工具类
│   │   ├── response.js        # 统一响应格式
│   │   └── asyncHandler.js    # 异步错误捕获
│   │
│   └── app.js             # 应用入口
│
├── .env                   # 环境变量（需自行创建）
├── .env.example          # 环境变量示例
├── .gitignore            # Git 忽略文件
├── package.json          # 项目依赖
├── README.md             # 项目说明
├── QUICK_START.md        # 快速启动指南
├── setup.js              # 初始化脚本
├── test-api.js           # API 测试脚本
└── start.bat             # Windows 启动脚本
```

## 核心功能实现

### 1. 学生管理模块

**文件**: `studentController.js`, `Student.js`

**功能**:
- ✅ 学生列表查询（支持搜索、分页）
- ✅ 学生详情查询（包含课时包和课程记录）
- ✅ 创建学生（手机号唯一性验证）
- ✅ 更新学生信息
- ✅ 软删除学生

**特性**:
- 手机号唯一索引
- 自动过滤已删除记录
- 课时预警静态方法
- 数据验证和错误处理

### 2. 课时包管理模块

**文件**: `coursePackageController.js`, `CoursePackage.js`

**功能**:
- ✅ 购买课时包
- ✅ 自动增加学生剩余课时
- ✅ 自动创建收入记录
- ✅ 查询学生课时包历史

**特性**:
- 事务支持（确保数据一致性）
- 三表联动更新（课时包、学生、收入记录）
- 购买日期倒序排序

### 3. 课程管理模块

**文件**: `courseController.js`, `Course.js`

**功能**:
- ✅ 课程列表查询（多条件筛选）
- ✅ 今日课程快速查询
- ✅ 创建课程（时间冲突检测）
- ✅ 更新课程（调课）
- ✅ 取消课程
- ✅ 课程签到（自动扣课时）

**特性**:
- 时间冲突检测算法
- 签到自动扣课时
- 请假不扣课时
- 课时不足预警
- 事务支持

### 4. 收益统计模块

**文件**: `incomeController.js`, `IncomeRecord.js`

**功能**:
- ✅ 收益概览（今日/本周/本月/本年/总收益）
- ✅ 收入明细查询
- ✅ 添加其他收入
- ✅ 收益趋势分析（月度/年度）

**特性**:
- 聚合查询优化
- 自动填充空白月份数据
- 多维度统计

### 5. 数据统计模块

**文件**: `statisticsController.js`

**功能**:
- ✅ 首页仪表盘数据
- ✅ 课时预警列表
- ✅ 多项数据并行查询

**统计指标**:
- 今日收入/课程
- 待上课程数
- 学生总数
- 课时预警学生数
- 本月课程数/收入

### 6. 系统设置模块

**文件**: `settingsController.js`, `Settings.js`

**功能**:
- ✅ 获取系统设置
- ✅ 更新系统设置
- ✅ 单例模式（全局唯一配置）

**配置项**:
- 默认课时长度
- 默认课时单价
- 默认上课地点
- 课时预警阈值
- 教师信息

## 数据模型设计

### 1. Student（学生）
```javascript
{
  name: String,              // 姓名
  phone: String,             // 电话（唯一）
  remainingHours: Number,    // 剩余课时
  notes: String,             // 备注
  isDeleted: Boolean,        // 软删除标记
  createdAt: Date,          // 创建时间
  updatedAt: Date           // 更新时间
}
```

### 2. CoursePackage（课时包）
```javascript
{
  studentId: ObjectId,       // 学生ID（外键）
  hours: Number,             // 课时数
  amount: Number,            // 金额
  purchaseDate: Date,        // 购买日期
  note: String,              // 备注
  createdAt: Date           // 创建时间
}
```

### 3. Course（课程）
```javascript
{
  studentId: ObjectId,       // 学生ID（外键）
  date: String,              // 日期（YYYY-MM-DD）
  startTime: String,         // 开始时间（HH:mm）
  endTime: String,           // 结束时间（HH:mm）
  duration: Number,          // 课时长度
  location: String,          // 地点
  status: String,            // 状态（pending/completed/cancelled）
  attendanceStatus: String,  // 签到状态（none/present/absent/leave）
  notes: String,             // 备注
  createdAt: Date,          // 创建时间
  updatedAt: Date           // 更新时间
}
```

### 4. IncomeRecord（收入记录）
```javascript
{
  studentId: ObjectId,       // 学生ID（外键）
  amount: Number,            // 金额
  type: String,              // 类型（course_package/other）
  date: Date,                // 日期
  note: String,              // 备注
  relatedId: ObjectId,       // 关联ID
  createdAt: Date           // 创建时间
}
```

### 5. Settings（系统设置）
```javascript
{
  defaultCourseDuration: Number,    // 默认课时长度
  defaultHourlyRate: Number,        // 默认课时单价
  defaultLocation: String,          // 默认地点
  warningThreshold: Number,         // 预警阈值
  teacherName: String,              // 教师姓名
  teacherPhone: String,             // 教师电话
  wechatOpenId: String,             // 微信OpenID
  updatedAt: Date                   // 更新时间
}
```

## API 接口清单

### 学生管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/students | 获取学生列表 |
| GET | /api/students/:id | 获取学生详情 |
| POST | /api/students | 创建学生 |
| PUT | /api/students/:id | 更新学生 |
| DELETE | /api/students/:id | 删除学生 |

### 课时包管理
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/students/:studentId/course-packages | 购买课时包 |
| GET | /api/students/:studentId/course-packages | 获取课时包列表 |

### 课程管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/courses | 获取课程列表 |
| GET | /api/courses/today | 获取今日课程 |
| POST | /api/courses | 创建课程 |
| PUT | /api/courses/:id | 更新课程 |
| POST | /api/courses/:id/cancel | 取消课程 |
| POST | /api/courses/:id/attendance | 课程签到 |

### 收益统计
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/income/overview | 获取收益概览 |
| GET | /api/income/records | 获取收入明细 |
| POST | /api/income/records | 添加其他收入 |
| GET | /api/income/trend | 获取收益趋势 |

### 统计数据
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/statistics/dashboard | 获取首页统计 |
| GET | /api/statistics/warnings | 获取课时预警 |

### 系统设置
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/settings | 获取系统设置 |
| PUT | /api/settings | 更新系统设置 |

## 关键技术实现

### 1. 统一响应格式

**文件**: `utils/response.js`

```javascript
// 成功响应
ApiResponse.success(res, data, 'success', 200);

// 错误响应
ApiResponse.error(res, '错误信息', 400, 1001);
```

### 2. 异步错误处理

**文件**: `utils/asyncHandler.js`

自动捕获异步路由中的错误，无需每个函数都写 try-catch。

### 3. 参数验证

**文件**: `middlewares/validator.js`

使用 express-validator 进行参数验证：
- 类型验证
- 长度验证
- 格式验证（正则）
- 自定义验证

### 4. 全局错误处理

**文件**: `middlewares/errorHandler.js`

统一处理：
- Mongoose 验证错误
- MongoDB 重复键错误
- JWT 错误
- 自定义业务错误

### 5. 数据库事务

购买课时包和课程签到使用事务确保数据一致性：

```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // 多个数据库操作
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 6. 索引优化

为常用查询字段创建索引：
- 唯一索引：学生手机号
- 复合索引：课程日期+时间+状态
- 时间倒序索引：收入记录日期

## 部署说明

### 开发环境

1. 安装依赖：`npm install`
2. 配置 `.env` 文件
3. 启动服务：`npm run dev`

### 生产环境

1. 设置环境变量 `NODE_ENV=production`
2. 配置生产数据库连接
3. 使用 PM2 部署：
   ```bash
   pm2 start src/app.js --name vocal-class-api
   ```

### Docker 部署（可选）

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]
```

## 测试

### 单元测试（待实现）
```bash
npm test
```

### API 测试
```bash
node test-api.js
```

### 手动测试
使用 Postman 或 curl 测试各个接口。

## 性能优化

### 已实现
- ✅ MongoDB 索引优化
- ✅ 查询结果分页
- ✅ 并行查询（Promise.all）
- ✅ 连接池配置

### 待优化
- ⏳ Redis 缓存（热点数据）
- ⏳ 查询结果缓存
- ⏳ CDN 静态资源

## 安全措施

### 已实现
- ✅ 参数验证
- ✅ MongoDB 注入防护（Mongoose）
- ✅ CORS 配置
- ✅ 错误信息脱敏

### 待实现
- ⏳ JWT 身份验证
- ⏳ API 限流
- ⏳ 敏感数据加密
- ⏳ HTTPS 支持

## 监控与日志

### 当前实现
- 控制台日志（开发环境）
- 错误日志输出

### 建议增强
- Winston 日志框架
- 日志文件轮转
- 性能监控（APM）
- 错误追踪（Sentry）

## 维护建议

### 日常维护
1. 定期备份数据库
2. 查看错误日志
3. 监控服务器性能
4. 更新依赖包

### 升级计划
1. TypeScript 重构
2. GraphQL API
3. 微服务拆分
4. 消息队列集成

## 常见问题

### 1. 数据库连接失败
- 检查 MongoDB 服务状态
- 验证连接字符串
- 检查网络和防火墙

### 2. 课时扣除错误
- 查看事务日志
- 检查学生剩余课时
- 验证课程状态

### 3. 时间冲突检测
- 确认查询条件
- 检查索引是否生效
- 验证时间格式

## 相关文档

- [API 接口文档](./API.md)
- [数据库设计文档](./DATABASE.md)
- [快速启动指南](../../vocal-class-backend/QUICK_START.md)
- [项目 README](../../vocal-class-backend/README.md)

---

**文档版本**: v1.0.0  
**创建时间**: 2025-11-12  
**最后更新**: 2025-11-12

