# 登录认证系统设计文档

## 文档信息

- **文档名称**：登录认证系统设计文档
- **版本**：v1.0
- **创建日期**：2025-11-12
- **文档类型**：系统设计文档

---

## 一、系统概述

### 1.1 设计目标

实现一个基于账号密码的登录认证系统，支持教师和学生两种角色，提供权限控制和状态持久化功能。

### 1.2 核心特性

- ✅ 账号密码登录
- ✅ 双角色权限控制（教师/学生）
- ✅ 登录状态持久化
- ✅ JWT Token 认证
- ✅ 自动账号生成
- ✅ 切换账号功能

---

## 二、账号体系

### 2.1 账号类型

#### 教师账号
- **角色标识**：`teacher`
- **权限级别**：最高权限
- **账号规则**：
  - 账号：管理员手机号（手动配置）
  - 密码：手动设置（首次登录后建议修改）
- **功能权限**：
  - 学生管理（增删改查）
  - 课程管理（创建、编辑、签到、取消）
  - 收益统计（查看、导出）
  - 系统设置（修改默认配置）
  - 数据导出（所有数据）

#### 学生账号
- **角色标识**：`student`
- **权限级别**：只读权限（个人数据）
- **账号规则**：
  - 账号：手机号（添加学生时填写）
  - 密码：姓名首字母（大写）+ 手机号
  - 示例：学生"王小明"，手机号"13800138001"，密码为"W13800138001"
- **功能权限**：
  - 查看个人剩余课时
  - 查看个人上课历史记录
  - 查看个人每周课程安排
  - 查看个人缴费记录

### 2.2 账号生成规则

#### 学生账号自动生成

当教师添加新学生时，系统自动创建学生登录账号：

```javascript
// 账号生成逻辑
function generateStudentAccount(student) {
  const account = student.phone; // 账号 = 手机号
  const firstLetter = student.name.charAt(0).toUpperCase(); // 姓名首字母（大写）
  const password = firstLetter + student.phone; // 密码 = 首字母 + 手机号
  
  return {
    account,
    password,
    role: 'student',
    studentId: student._id
  };
}
```

**示例**：
- 学生：王小明，手机号：13800138001
- 账号：`13800138001`
- 密码：`W13800138001`

---

## 三、数据库设计

### 3.1 User 模型

```javascript
{
  _id: ObjectId,
  account: String,        // 账号（手机号）
  password: String,        // 密码（bcrypt加密）
  role: String,           // 角色：'teacher' | 'student'
  studentId: ObjectId,    // 学生ID（仅学生账号有）
  phone: String,          // 手机号
  name: String,           // 姓名（仅学生账号）
  isActive: Boolean,      // 是否激活
  lastLoginAt: Date,      // 最后登录时间
  createdAt: Date,        // 创建时间
  updatedAt: Date         // 更新时间
}
```

### 3.2 索引设计

```javascript
// 账号唯一索引
db.users.createIndex({ account: 1 }, { unique: true });

// 学生ID索引（用于关联查询）
db.users.createIndex({ studentId: 1 });

// 角色索引（用于权限查询）
db.users.createIndex({ role: 1 });
```

---

## 四、API 接口设计

### 4.1 登录接口

**POST** `/api/auth/login`

**请求体**：
```json
{
  "account": "13800138001",
  "password": "W13800138001",
  "role": "student"  // 可选，用于区分教师/学生登录
}
```

**响应**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "account": "13800138001",
      "role": "student",
      "name": "王小明",
      "studentId": "student_id"
    }
  }
}
```

### 4.2 登出接口

**POST** `/api/auth/logout`

**请求头**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

### 4.3 获取当前用户信息

**GET** `/api/auth/me`

**请求头**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "user_id",
    "account": "13800138001",
    "role": "student",
    "name": "王小明",
    "studentId": "student_id"
  }
}
```

### 4.4 修改密码接口

**PUT** `/api/auth/password`

**请求头**：
```
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "oldPassword": "W13800138001",
  "newPassword": "NewPassword123"
}
```

**响应**：
```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

---

## 五、前端实现

### 5.1 登录状态管理

使用 Pinia Store 管理登录状态：

```javascript
// stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: false
  }),
  
  getters: {
    isTeacher: (state) => state.user?.role === 'teacher',
    isStudent: (state) => state.user?.role === 'student',
    currentUserId: (state) => state.user?.id
  },
  
  actions: {
    async login(account, password, role) {
      // 调用登录API
      const response = await loginApi({ account, password, role })
      
      // 保存登录状态
      this.token = response.data.token
      this.user = response.data.user
      this.isAuthenticated = true
      
      // 持久化到localStorage
      localStorage.setItem('token', this.token)
      localStorage.setItem('user', JSON.stringify(this.user))
    },
    
    logout() {
      // 清除状态
      this.token = ''
      this.user = null
      this.isAuthenticated = false
      
      // 清除localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    
    checkAuth() {
      // 检查登录状态
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isAuthenticated = true
        return true
      }
      
      return false
    }
  }
})
```

### 5.2 路由守卫

```javascript
// router/index.js
import { useAuthStore } from '@/stores/auth'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查登录状态
  if (!authStore.isAuthenticated) {
    authStore.checkAuth()
  }
  
  // 需要登录的页面
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    // 权限检查
    if (to.meta.requiresTeacher && !authStore.isTeacher) {
      next({ path: '/403' }) // 无权限页面
    } else {
      next()
    }
  }
})
```

### 5.3 登录页面

**路径**：`/login`

**功能**：
- 账号密码输入
- 角色选择（教师/学生）
- 记住密码选项
- 登录按钮
- 错误提示

**设计要点**：
- 简洁清晰的表单布局
- 友好的错误提示
- 支持键盘操作（回车登录）

### 5.4 学生端页面

#### 学生首页
- 剩余课时大卡片显示
- 本周课程列表
- 快捷入口（我的课程、我的记录）

#### 学生课表页
- 仅显示当前学生的课程
- 课程状态标识（待上课/已完成）
- 课程详情查看（只读）

#### 学生个人中心
- 个人信息展示
- 我的课时记录
- 我的缴费记录
- 切换账号按钮

---

## 六、安全设计

### 6.1 密码加密

使用 bcrypt 加密存储密码：

```javascript
const bcrypt = require('bcrypt')

// 加密密码
const hashedPassword = await bcrypt.hash(password, 10)

// 验证密码
const isValid = await bcrypt.compare(password, hashedPassword)
```

### 6.2 JWT Token

**Token 结构**：
```json
{
  "userId": "user_id",
  "role": "student",
  "account": "13800138001",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**配置**：
- 密钥：使用环境变量 `JWT_SECRET`
- 过期时间：7天（可配置）
- 算法：HS256

### 6.3 防暴力破解

- 登录失败5次后锁定账号30分钟
- 记录登录失败次数和时间
- 使用 Redis 或内存缓存实现

### 6.4 HTTPS

生产环境必须使用 HTTPS，确保数据传输安全。

---

## 七、业务流程

### 7.1 学生账号创建流程

```
教师添加学生
    ↓
系统自动生成账号密码
    ↓
保存到 User 表
    ↓
关联到 Student 表
    ↓
教师可在学生详情页查看账号信息
```

### 7.2 登录流程

```
用户访问系统
    ↓
检查 localStorage 中的 token
    ↓
有 token？
    ├─ 是 → 验证 token 有效性
    │       ├─ 有效 → 进入系统
    │       └─ 无效 → 跳转登录页
    └─ 否 → 跳转登录页
    ↓
用户输入账号密码
    ↓
调用登录API
    ↓
验证成功？
    ├─ 是 → 保存 token 和用户信息
    │       → 跳转到对应首页
    └─ 否 → 显示错误提示
```

### 7.3 切换账号流程

```
用户点击"切换账号"
    ↓
确认对话框
    ↓
用户确认
    ↓
清除 localStorage
    ↓
清除 Pinia Store 状态
    ↓
跳转到登录页
```

---

## 八、开发任务清单

### 后端开发

- [ ] 创建 User 数据模型
- [ ] 实现登录接口
- [ ] 实现登出接口
- [ ] 实现获取当前用户接口
- [ ] 实现修改密码接口
- [ ] 实现 JWT Token 生成和验证中间件
- [ ] 实现密码加密和验证
- [ ] 实现防暴力破解逻辑
- [ ] 在学生创建时自动生成账号
- [ ] 添加权限验证中间件

### 前端开发

- [ ] 创建登录页面
- [ ] 创建 Auth Store（Pinia）
- [ ] 实现路由守卫
- [ ] 实现 API 请求拦截器（添加 token）
- [ ] 创建学生端首页
- [ ] 创建学生端课表页
- [ ] 创建学生端个人中心
- [ ] 实现切换账号功能
- [ ] 根据角色显示不同导航栏
- [ ] 实现权限控制组件

### 测试

- [ ] 登录功能测试
- [ ] 权限控制测试
- [ ] Token 过期处理测试
- [ ] 切换账号测试
- [ ] 学生账号自动生成测试

---

## 九、注意事项

1. **密码规则**：学生密码格式固定，首次登录后建议修改
2. **Token 刷新**：考虑实现 token 刷新机制，提升用户体验
3. **多设备登录**：当前设计支持多设备登录，如需限制可添加设备管理
4. **账号找回**：暂不实现密码找回功能，由教师重置
5. **数据隔离**：学生账号只能访问自己的数据，后端必须严格验证

---

**文档版本**：v1.0  
**最后更新**：2025-11-12

