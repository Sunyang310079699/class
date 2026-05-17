# 数据库设计文档

## 数据库信息

- **数据库类型**: MongoDB
- **数据库名称**: vocal-class
- **数据库地址**: 39.106.63.161:27017
- **数据库账号**: root
- **字符编码**: UTF-8
- **时区**: UTC
- **连接字符串**: mongodb://root:147258@39.106.63.161:27017/vocal-class

---

## 数据库架构

### 集合列表

| 集合名称 | 说明 | 文档数量（预估） |
|---------|------|-----------------|
| students | 学生信息 | 8-50 |
| course_packages | 课时包购买记录 | 20-200 |
| courses | 课程安排 | 100-1000 |
| income_records | 收入记录 | 50-500 |
| settings | 系统设置 | 1 |
| users | 用户账号 | 8-50 |

---

## 集合详细设计

### 1. students（学生表）

**用途**: 存储学生基本信息和课时数据

**字段说明**:

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| name | String | 是 | - | 学生姓名 (2-10字符) |
| phone | String | 是 | - | 联系电话 (11位) |
| remainingHours | Number | 是 | 0 | 剩余课时数 |
| notes | String | 否 | "" | 备注信息 (最多200字) |
| isDeleted | Boolean | 是 | false | 是否删除（软删除） |
| createdAt | Date | 是 | 当前时间 | 创建时间 |
| updatedAt | Date | 是 | 当前时间 | 更新时间 |

**索引设计**:
```javascript
{
  phone: 1,          // 唯一索引
  name: 1,           // 普通索引（用于搜索）
  remainingHours: 1, // 普通索引（用于课时预警查询）
  isDeleted: 1       // 普通索引（用于过滤已删除）
}
```

**示例文档**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "王小明",
  "phone": "13800138000",
  "remainingHours": 10,
  "notes": "音域较宽，适合练习高音部分",
  "isDeleted": false,
  "createdAt": ISODate("2025-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2025-01-15T08:30:00.000Z")
}
```

**业务规则**:
- 电话号码唯一，不能重复
- 剩余课时不能为负数
- 删除学生时执行软删除（isDeleted = true）
- 课时低于 3 时触发预警

---

### 2. course_packages（课时包表）

**用途**: 记录学生购买课时包的历史

**字段说明**:

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| studentId | ObjectId | 是 | - | 学生ID（外键） |
| hours | Number | 是 | - | 购买课时数（正整数） |
| amount | Number | 是 | - | 支付金额（元） |
| purchaseDate | Date | 是 | 当前日期 | 购买日期 |
| note | String | 否 | "" | 备注说明 |
| createdAt | Date | 是 | 当前时间 | 创建时间 |

**索引设计**:
```javascript
{
  studentId: 1,
  purchaseDate: -1  // 倒序，最新的在前
}
```

**示例文档**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "studentId": ObjectId("507f1f77bcf86cd799439011"),
  "hours": 10,
  "amount": 2000,
  "purchaseDate": ISODate("2025-01-01"),
  "note": "首次购买",
  "createdAt": ISODate("2025-01-01T10:30:00.000Z")
}
```

**业务规则**:
- 购买课时后自动增加学生的 remainingHours
- 同时创建对应的 income_record
- hours 必须为正整数
- amount 必须为正数

---

### 3. courses（课程表）

**用途**: 存储课程安排和上课记录

**字段说明**:

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| studentId | ObjectId | 是 | - | 学生ID（外键） |
| date | String | 是 | - | 上课日期 (YYYY-MM-DD) |
| startTime | String | 是 | - | 开始时间 (HH:mm) |
| endTime | String | 是 | - | 结束时间 (HH:mm) |
| duration | Number | 是 | 1 | 课时长度（课时数） |
| location | String | 否 | "" | 上课地点 |
| status | String | 是 | "pending" | 课程状态 |
| attendanceStatus | String | 是 | "none" | 签到状态 |
| notes | String | 否 | "" | 课程备注 |
| createdAt | Date | 是 | 当前时间 | 创建时间 |
| updatedAt | Date | 是 | 当前时间 | 更新时间 |

**枚举值说明**:

**status** (课程状态):
- `pending`: 待上课
- `completed`: 已完成
- `cancelled`: 已取消

**attendanceStatus** (签到状态):
- `none`: 未签到
- `present`: 出席
- `absent`: 旷课
- `leave`: 请假

**索引设计**:
```javascript
{
  studentId: 1,
  date: 1,
  startTime: 1,       // 用于时间冲突检测
  status: 1,          // 用于筛选课程
  createdAt: -1
}
```

**复合索引**:
```javascript
{
  date: 1,
  startTime: 1,
  status: 1           // 用于按日期和时间查询课程
}
```

**示例文档**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "studentId": ObjectId("507f1f77bcf86cd799439011"),
  "date": "2025-01-10",
  "startTime": "14:00",
  "endTime": "15:00",
  "duration": 1,
  "location": "音乐工作室",
  "status": "completed",
  "attendanceStatus": "present",
  "notes": "练习曲目：茉莉花",
  "createdAt": ISODate("2025-01-01T10:30:00.000Z"),
  "updatedAt": ISODate("2025-01-10T15:05:00.000Z")
}
```

**业务规则**:
- 创建课程时检查时间冲突
- 签到时自动扣除学生课时（status = completed, attendanceStatus = present）
- 请假不扣课时（attendanceStatus = leave）
- 取消的课程不扣课时（status = cancelled）
- 只有 status = pending 的课程可以签到
- 签到后 status 自动改为 completed

---

### 4. income_records（收入记录表）

**用途**: 记录所有收入明细

**字段说明**:

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| studentId | ObjectId | 是 | - | 学生ID（外键） |
| amount | Number | 是 | - | 收入金额（元） |
| type | String | 是 | - | 收入类型 |
| date | Date | 是 | 当前日期 | 收入日期 |
| note | String | 否 | "" | 备注说明 |
| relatedId | ObjectId | 否 | null | 关联ID（如课时包ID） |
| createdAt | Date | 是 | 当前时间 | 创建时间 |

**枚举值说明**:

**type** (收入类型):
- `course_package`: 课时包收入
- `other`: 其他收入（教材费、场地费等）

**索引设计**:
```javascript
{
  studentId: 1,
  date: -1,           // 倒序，最新的在前
  type: 1
}
```

**示例文档**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "studentId": ObjectId("507f1f77bcf86cd799439011"),
  "amount": 2000,
  "type": "course_package",
  "date": ISODate("2025-01-01"),
  "note": "购买10节课",
  "relatedId": ObjectId("507f1f77bcf86cd799439012"),
  "createdAt": ISODate("2025-01-01T10:30:00.000Z")
}
```

**业务规则**:
- 购买课时包时自动创建收入记录（type = course_package）
- 其他收入需手动添加（type = other）
- amount 必须为正数
- 收入记录不可删除，只能查询和统计

---

### 5. settings（系统设置表）

**用途**: 存储系统全局设置

**字段说明**:

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 固定值 | 主键（单例） |
| defaultCourseDuration | Number | 是 | 1 | 默认课时长度 |
| defaultHourlyRate | Number | 是 | 200 | 默认课时单价（元） |
| defaultLocation | String | 否 | "" | 默认上课地点 |
| warningThreshold | Number | 是 | 3 | 课时预警阈值 |
| teacherName | String | 否 | "" | 老师姓名 |
| teacherPhone | String | 否 | "" | 老师电话 |
| wechatOpenId | String | 否 | "" | 微信OpenID |
| updatedAt | Date | 是 | 当前时间 | 更新时间 |

**示例文档**:
```json
{
  "_id": ObjectId("000000000000000000000001"),
  "defaultCourseDuration": 1,
  "defaultHourlyRate": 200,
  "defaultLocation": "音乐工作室",
  "warningThreshold": 3,
  "teacherName": "张老师",
  "teacherPhone": "13900139000",
  "wechatOpenId": "oxxxxxxxxxxxxxxxxxxxxxx",
  "updatedAt": ISODate("2025-01-01T10:30:00.000Z")
}
```

**业务规则**:
- 全局只有一条记录（单例模式）
- 应用启动时检查并创建默认设置

---

### 6. users（用户账号表）

**用途**: 存储用户登录账号信息（老师和学生）

**字段说明**:

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| _id | ObjectId | 是 | 自动生成 | 主键 |
| account | String | 是 | - | 登录账号（11位手机号） |
| password | String | 是 | - | 密码（已加密） |
| role | String | 是 | "student" | 角色类型 |
| studentId | ObjectId | 否 | null | 学生ID（仅学生账号） |
| phone | String | 是 | - | 联系电话（11位） |
| name | String | 否 | "" | 姓名（仅学生账号） |
| isActive | Boolean | 是 | true | 账号是否激活 |
| loginAttempts | Number | 是 | 0 | 登录失败次数 |
| lockUntil | Date | 否 | null | 账号锁定截止时间 |
| lastLoginAt | Date | 否 | null | 最后登录时间 |
| createdAt | Date | 是 | 当前时间 | 创建时间 |
| updatedAt | Date | 是 | 当前时间 | 更新时间 |

**枚举值说明**:

**role** (角色类型):
- `teacher`: 老师账号
- `student`: 学生账号

**索引设计**:
```javascript
{
  account: 1,        // 唯一索引
  role: 1,           // 普通索引
  studentId: 1,      // 普通索引
  phone: 1           // 普通索引
}
```

**示例文档**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "account": "13800138000",
  "password": "$2b$10$...",
  "role": "student",
  "studentId": ObjectId("507f1f77bcf86cd799439011"),
  "phone": "13800138000",
  "name": "王小明",
  "isActive": true,
  "loginAttempts": 0,
  "lockUntil": null,
  "lastLoginAt": ISODate("2025-01-15T10:30:00.000Z"),
  "createdAt": ISODate("2025-01-01T10:30:00.000Z"),
  "updatedAt": ISODate("2025-01-15T10:30:00.000Z")
}
```

**业务规则**:
- 账号（account）必须唯一，不能重复
- 账号和手机号格式必须为11位有效手机号码
- 学生账号创建时自动关联学生ID
- 登录失败5次后锁定账号30分钟
- 密码使用 bcrypt 加密存储
- 学生账号密码规则：姓名拼音首字母（小写）+ 手机号

---

## 数据关系图

```
students (1) ----< (N) course_packages
students (1) ----< (N) courses
students (1) ----< (N) income_records
students (1) ----< (1) users (studentId)
course_packages (1) ----< (1) income_records (relatedId)
```

---

## 查询示例

### 1. 查询剩余课时不足的学生
```javascript
db.students.find({
  remainingHours: { $lt: 3 },
  isDeleted: false
}).sort({ remainingHours: 1 });
```

### 2. 查询今日课程
```javascript
const today = new Date().toISOString().split('T')[0];
db.courses.find({
  date: today,
  status: "pending"
}).populate('studentId');
```

### 3. 查询某月收益
```javascript
db.income_records.aggregate([
  {
    $match: {
      date: {
        $gte: ISODate("2025-01-01"),
        $lt: ISODate("2025-02-01")
      }
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$amount" }
    }
  }
]);
```

### 4. 查询学生上课记录
```javascript
db.courses.find({
  studentId: ObjectId("507f1f77bcf86cd799439011"),
  status: "completed"
}).sort({ date: -1, startTime: -1 }).limit(20);
```

### 5. 查询时间冲突的课程
```javascript
db.courses.find({
  date: "2025-01-10",
  status: { $ne: "cancelled" },
  $or: [
    {
      startTime: { $lt: "15:00" },
      endTime: { $gt: "14:00" }
    }
  ]
});
```

### 6. 统计每个学生的消费总额
```javascript
db.income_records.aggregate([
  {
    $group: {
      _id: "$studentId",
      totalAmount: { $sum: "$amount" }
    }
  },
  {
    $lookup: {
      from: "students",
      localField: "_id",
      foreignField: "_id",
      as: "student"
    }
  },
  {
    $sort: { totalAmount: -1 }
  }
]);
```

---

## 数据迁移脚本

### 初始化数据库
```javascript
// 创建数据库
use vocal-class;

// 创建索引
db.students.createIndex({ phone: 1 }, { unique: true });
db.students.createIndex({ name: 1 });
db.students.createIndex({ remainingHours: 1 });
db.students.createIndex({ isDeleted: 1 });

db.course_packages.createIndex({ studentId: 1, purchaseDate: -1 });

db.courses.createIndex({ studentId: 1, date: 1, startTime: 1 });
db.courses.createIndex({ date: 1, startTime: 1, status: 1 });
db.courses.createIndex({ status: 1 });
db.courses.createIndex({ courseType: 1 });
db.courses.createIndex({ createdAt: -1 });

db.income_records.createIndex({ studentId: 1, date: -1 });
db.income_records.createIndex({ date: -1 });
db.income_records.createIndex({ type: 1 });

db.users.createIndex({ account: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ studentId: 1 });
db.users.createIndex({ phone: 1 });

// 初始化系统设置
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

## 数据备份策略

### 备份方案
1. **每日自动备份**: 凌晨 2:00 执行全量备份
2. **保留周期**: 保留最近 30 天的备份
3. **备份工具**: mongodump

### 备份命令
```bash
# 全量备份
mongodump --db=vocal-class --out=/backup/$(date +%Y%m%d)

# 恢复数据
mongorestore --db=vocal-class /backup/20250101/vocal-class
```

---

## 性能优化建议

### 1. 索引优化
- 为常用查询字段创建索引
- 避免创建过多索引影响写入性能
- 定期分析索引使用情况

### 2. 查询优化
- 使用投影减少返回字段
- 合理使用分页
- 避免全表扫描

### 3. 数据归档
- 定期归档历史课程数据（1年以前）
- 归档已删除的学生数据

### 4. 连接池配置
```javascript
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

---

## 安全建议

### 1. 访问控制
```javascript
// 创建应用用户
db.createUser({
  user: "vocal_app",
  pwd: "strong_password_here",
  roles: [
    { role: "readWrite", db: "vocal-class" }
  ]
});
```

### 2. 敏感数据
- 电话号码等敏感信息考虑加密存储
- 定期更新数据库密码
- 使用强密码策略

### 3. 监控告警
- 监控数据库连接数
- 监控慢查询
- 磁盘空间告警

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-21

