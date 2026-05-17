# 登录认证系统快速启动指南

## 一、初始化教师账号

在首次使用系统前，需要创建一个教师账号。

### 方法一：使用脚本创建（推荐）

```bash
cd vocal-class-backend
node scripts/create-teacher.js
```

按提示输入：
- 手机号（作为账号）
- 密码（至少6位）
- 姓名（可选）

### 方法二：使用 API 创建

```bash
curl -X POST http://localhost:3000/api/auth/create-teacher \
  -H "Content-Type: application/json" \
  -d '{
    "account": "13800138000",
    "password": "Teacher123",
    "name": "张老师"
  }'
```

## 二、学生账号自动生成

当教师添加新学生时，系统会自动为学生创建登录账号：

- **账号**：学生的手机号
- **密码**：学生姓名首字母（大写）+ 手机号

**示例**：
- 学生：王小明
- 手机号：13800138001
- 账号：`13800138001`
- 密码：`W13800138001`

教师可以在学生详情页查看学生的账号信息。

## 三、登录系统

### 前端登录

1. 访问前端应用：http://localhost:5173
2. 系统会自动跳转到登录页（如果未登录）
3. 选择账号类型（教师/学生）
4. 输入账号和密码
5. 点击登录

### API 登录示例

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "13800138001",
    "password": "W13800138001",
    "role": "student"
  }'
```

响应示例：
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

## 四、权限说明

### 教师账号权限

- ✅ 学生管理（增删改查）
- ✅ 课程管理（创建、编辑、签到、取消）
- ✅ 收益统计（查看、导出）
- ✅ 系统设置
- ✅ 数据导出

### 学生账号权限

- ✅ 查看个人剩余课时
- ✅ 查看个人上课历史记录
- ✅ 查看个人每周课程安排
- ✅ 查看个人缴费记录
- ❌ 不能管理其他学生数据
- ❌ 不能查看收益统计
- ❌ 不能修改课程

## 五、API 使用说明

### 请求头

所有需要认证的 API 请求都需要在请求头中添加 Token：

```
Authorization: Bearer {token}
```

### 学生端 API

学生端调用 API 时，不需要传递 `studentId` 参数，后端会自动过滤，只返回当前学生的数据。

**示例**：
```javascript
// 获取我的课程（学生端）
GET /api/courses?startDate=2025-01-01&endDate=2025-01-31
// 后端自动过滤，只返回当前学生的课程

// 获取我的缴费记录（学生端）
GET /api/income/records
// 后端自动过滤，只返回当前学生的缴费记录
```

## 六、环境变量配置

### 后端环境变量

在 `vocal-class-backend/.env` 文件中配置：

```env
# JWT 配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/vocal-class
```

### 前端环境变量

在 `vocal-class-frontend/.env.development` 文件中配置：

```env
# 使用真实 API（关闭 Mock）
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:3000/api
```

## 七、常见问题

### Q1: 学生忘记密码怎么办？

A: 密码格式为：姓名首字母（大写）+ 手机号。例如：王小明，手机号 13800138001，密码为 `W13800138001`。

### Q2: 如何修改密码？

A: 登录后，在个人中心页面可以修改密码。

### Q3: 登录后 Token 过期怎么办？

A: Token 默认有效期为 7 天。过期后需要重新登录。前端会自动检测 Token 过期并跳转到登录页。

### Q4: 学生账号被锁定怎么办？

A: 登录失败 5 次后账号会被锁定 30 分钟。等待 30 分钟后可重新尝试登录。

### Q5: 如何切换账号？

A: 在个人中心页面点击"切换账号"，确认后会退出当前登录并返回登录页。

## 八、安全建议

1. **生产环境**：
   - 修改 `JWT_SECRET` 为强密码
   - 使用 HTTPS
   - 定期更新密码

2. **密码安全**：
   - 教师账号密码建议使用强密码（字母+数字+特殊字符）
   - 学生首次登录后建议修改密码

3. **Token 安全**：
   - Token 存储在 localStorage，注意 XSS 防护
   - 生产环境建议实现 Token 刷新机制

---

**文档版本**：v1.0  
**最后更新**：2025-11-12

