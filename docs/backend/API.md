# API 接口文档

## 接口说明

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **生产环境**: `https://yourdomain.com/api`
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式

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
  "message": "错误信息描述",
  "data": null
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 请求头

```http
Content-Type: application/json
Authorization: Bearer <token>
```

---

## 1. 身份验证

### 1.1 微信授权登录

**接口**: `POST /auth/wechat`

**描述**: 通过微信授权码获取用户信息并登录

**请求参数**:
```json
{
  "code": "微信授权码"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "nickname": "张老师",
      "avatar": "https://..."
    }
  }
}
```

---

## 2. 学生管理

### 2.1 获取学生列表

**接口**: `GET /students`

**描述**: 获取所有学生列表

**查询参数**:
- `keyword` (可选): 搜索关键词（姓名或电话）
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 20

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "students": [
      {
        "id": "student_id_1",
        "name": "王小明",
        "phone": "13800138000",
        "remainingHours": 10,
        "notes": "音域较宽",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-15T00:00:00.000Z"
      }
    ],
    "total": 8,
    "page": 1,
    "limit": 20
  }
}
```

### 2.2 获取学生详情

**接口**: `GET /students/:id`

**描述**: 获取单个学生的详细信息

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "student_id",
    "name": "王小明",
    "phone": "13800138000",
    "remainingHours": 10,
    "notes": "音域较宽",
    "coursePackages": [
      {
        "id": "package_id",
        "hours": 10,
        "amount": 2000,
        "purchaseDate": "2025-01-01",
        "note": "首次购买"
      }
    ],
    "recentCourses": [
      {
        "id": "course_id",
        "date": "2025-01-10",
        "startTime": "14:00",
        "endTime": "15:00",
        "status": "completed"
      }
    ]
  }
}
```

### 2.3 创建学生

**接口**: `POST /students`

**描述**: 添加新学生

**请求参数**:
```json
{
  "name": "王小明",
  "phone": "13800138000",
  "remainingHours": 0,
  "notes": "音域较宽"
}
```

**响应**:
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": "student_id",
    "name": "王小明",
    "phone": "13800138000",
    "remainingHours": 0,
    "notes": "音域较宽"
  }
}
```

### 2.4 更新学生信息

**接口**: `PUT /students/:id`

**描述**: 更新学生基本信息

**请求参数**:
```json
{
  "name": "王小明",
  "phone": "13800138001",
  "notes": "音域较宽，进步明显"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "student_id",
    "name": "王小明",
    "phone": "13800138001",
    "remainingHours": 10,
    "notes": "音域较宽，进步明显"
  }
}
```

### 2.5 删除学生

**接口**: `DELETE /students/:id`

**描述**: 删除学生（软删除）

**响应**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## 3. 课时包管理

### 3.1 购买课时包

**接口**: `POST /students/:studentId/course-packages`

**描述**: 为学生购买课时包

**请求参数**:
```json
{
  "hours": 10,
  "amount": 2000,
  "purchaseDate": "2025-01-01",
  "note": "首次购买"
}
```

**响应**:
```json
{
  "code": 201,
  "message": "购买成功",
  "data": {
    "coursePackage": {
      "id": "package_id",
      "studentId": "student_id",
      "hours": 10,
      "amount": 2000,
      "purchaseDate": "2025-01-01",
      "note": "首次购买"
    },
    "student": {
      "id": "student_id",
      "name": "王小明",
      "remainingHours": 10
    },
    "income": {
      "id": "income_id",
      "amount": 2000,
      "date": "2025-01-01"
    }
  }
}
```

### 3.2 获取课时包列表

**接口**: `GET /students/:studentId/course-packages`

**描述**: 获取学生的课时包购买记录

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "package_id",
      "hours": 10,
      "amount": 2000,
      "purchaseDate": "2025-01-01",
      "note": "首次购买",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 4. 课程管理

### 4.1 获取课程列表

**接口**: `GET /courses`

**描述**: 获取课程列表

**查询参数**:
- `startDate` (可选): 开始日期 (YYYY-MM-DD)
- `endDate` (可选): 结束日期 (YYYY-MM-DD)
- `studentId` (可选): 学生ID
- `status` (可选): 课程状态 (pending/completed/cancelled)
- `page` (可选): 页码
- `limit` (可选): 每页数量

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "courses": [
      {
        "id": "course_id",
        "student": {
          "id": "student_id",
          "name": "王小明"
        },
        "date": "2025-01-10",
        "startTime": "14:00",
        "endTime": "15:00",
        "duration": 1,
        "location": "音乐工作室",
        "status": "pending",
        "attendanceStatus": "none",
        "notes": "",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 20
  }
}
```

### 4.2 获取今日课程

**接口**: `GET /courses/today`

**描述**: 获取今天的所有课程

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "course_id",
      "student": {
        "id": "student_id",
        "name": "王小明",
        "remainingHours": 10
      },
      "date": "2025-01-10",
      "startTime": "14:00",
      "endTime": "15:00",
      "duration": 1,
      "location": "音乐工作室",
      "status": "pending",
      "attendanceStatus": "none"
    }
  ]
}
```

### 4.3 创建课程

**接口**: `POST /courses`

**描述**: 创建新课程

**请求参数**:
```json
{
  "studentId": "student_id",
  "date": "2025-01-10",
  "startTime": "14:00",
  "endTime": "15:00",
  "duration": 1,
  "location": "音乐工作室",
  "notes": "练习曲目：茉莉花"
}
```

**响应**:
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": "course_id",
    "studentId": "student_id",
    "date": "2025-01-10",
    "startTime": "14:00",
    "endTime": "15:00",
    "duration": 1,
    "location": "音乐工作室",
    "status": "pending",
    "attendanceStatus": "none",
    "notes": "练习曲目：茉莉花"
  }
}
```

### 4.4 更新课程

**接口**: `PUT /courses/:id`

**描述**: 更新课程信息（调课）

**请求参数**:
```json
{
  "date": "2025-01-11",
  "startTime": "15:00",
  "endTime": "16:00",
  "notes": "时间调整"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "course_id",
    "date": "2025-01-11",
    "startTime": "15:00",
    "endTime": "16:00",
    "notes": "时间调整"
  }
}
```

### 4.5 取消课程

**接口**: `POST /courses/:id/cancel`

**描述**: 取消课程

**请求参数**:
```json
{
  "reason": "学生请假"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "取消成功",
  "data": {
    "id": "course_id",
    "status": "cancelled"
  }
}
```

### 4.6 课程签到

**接口**: `POST /courses/:id/attendance`

**描述**: 对课程进行签到并扣除课时

**请求参数**:
```json
{
  "attendanceStatus": "present",
  "notes": "表现良好"
}
```

**参数说明**:
- `attendanceStatus`: present(出席) / absent(旷课) / leave(请假)

**响应**:
```json
{
  "code": 200,
  "message": "签到成功",
  "data": {
    "course": {
      "id": "course_id",
      "status": "completed",
      "attendanceStatus": "present"
    },
    "student": {
      "id": "student_id",
      "name": "王小明",
      "remainingHours": 9
    },
    "warning": "学生课时不足 3 节，请提醒续费"
  }
}
```

---

## 5. 收益统计

### 5.1 获取收益概览

**接口**: `GET /income/overview`

**描述**: 获取收益统计数据

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "today": 400,
    "week": 2000,
    "month": 8000,
    "year": 50000,
    "total": 100000
  }
}
```

### 5.2 获取收入明细

**接口**: `GET /income/records`

**描述**: 获取收入明细列表

**查询参数**:
- `startDate` (可选): 开始日期
- `endDate` (可选): 结束日期
- `studentId` (可选): 学生ID
- `type` (可选): 类型 (course_package/other)
- `page` (可选): 页码
- `limit` (可选): 每页数量

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "id": "income_id",
        "student": {
          "id": "student_id",
          "name": "王小明"
        },
        "amount": 2000,
        "type": "course_package",
        "date": "2025-01-01",
        "note": "购买10节课",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

### 5.3 添加其他收入

**接口**: `POST /income/records`

**描述**: 手动添加其他收入记录

**请求参数**:
```json
{
  "studentId": "student_id",
  "amount": 100,
  "type": "other",
  "date": "2025-01-01",
  "note": "教材费"
}
```

**响应**:
```json
{
  "code": 201,
  "message": "添加成功",
  "data": {
    "id": "income_id",
    "studentId": "student_id",
    "amount": 100,
    "type": "other",
    "date": "2025-01-01",
    "note": "教材费"
  }
}
```

### 5.4 获取收益趋势

**接口**: `GET /income/trend`

**描述**: 获取收益趋势数据（用于图表）

**查询参数**:
- `type`: month(月度) / year(年度)
- `year` (可选): 年份，默认当前年

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "labels": ["1月", "2月", "3月", "4月", "5月", "6月"],
    "values": [5000, 6000, 5500, 7000, 8000, 8500]
  }
}
```

---

## 6. 统计数据

### 6.1 获取首页统计

**接口**: `GET /statistics/dashboard`

**描述**: 获取首页仪表盘数据

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "todayIncome": 400,
    "todayCourses": 3,
    "pendingCourses": 5,
    "lowHoursStudents": 2,
    "totalStudents": 8,
    "monthCourses": 45,
    "monthIncome": 8000
  }
}
```

### 6.2 获取课时预警

**接口**: `GET /statistics/warnings`

**描述**: 获取课时不足的学生列表

**查询参数**:
- `threshold` (可选): 预警阈值，默认 3

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "student_id",
      "name": "王小明",
      "phone": "13800138000",
      "remainingHours": 2
    }
  ]
}
```

---

## 7. 系统设置

### 7.1 获取设置

**接口**: `GET /settings`

**描述**: 获取系统设置

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "defaultCourseDuration": 1,
    "defaultHourlyRate": 200,
    "defaultLocation": "音乐工作室",
    "warningThreshold": 3
  }
}
```

### 7.2 更新设置

**接口**: `PUT /settings`

**描述**: 更新系统设置

**请求参数**:
```json
{
  "defaultCourseDuration": 1,
  "defaultHourlyRate": 200,
  "defaultLocation": "音乐工作室",
  "warningThreshold": 3
}
```

**响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "defaultCourseDuration": 1,
    "defaultHourlyRate": 200,
    "defaultLocation": "音乐工作室",
    "warningThreshold": 3
  }
}
```

---

## 8. 数据导出

### 8.1 导出学生数据

**接口**: `GET /export/students`

**描述**: 导出学生数据为 Excel

**响应**: Excel 文件下载

### 8.2 导出课程数据

**接口**: `GET /export/courses`

**描述**: 导出课程数据为 Excel

**查询参数**:
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应**: Excel 文件下载

### 8.3 导出收入数据

**接口**: `GET /export/income`

**描述**: 导出收入数据为 Excel

**查询参数**:
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应**: Excel 文件下载

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 1001 | 参数验证失败 |
| 1002 | 资源不存在 |
| 1003 | 课时不足 |
| 1004 | 时间冲突 |
| 1005 | 重复操作 |
| 2001 | 未授权 |
| 2002 | Token 过期 |
| 2003 | Token 无效 |
| 5000 | 服务器内部错误 |
| 5001 | 数据库错误 |

---

## 附录

### 日期格式
- 日期：YYYY-MM-DD (如 2025-01-10)
- 时间：HH:mm (如 14:00)
- 日期时间：ISO 8601 格式 (如 2025-01-10T14:00:00.000Z)

### 分页参数
- `page`: 页码，从 1 开始
- `limit`: 每页数量，默认 20，最大 100

### 排序参数
- `sortBy`: 排序字段
- `order`: asc(升序) / desc(降序)

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-21

