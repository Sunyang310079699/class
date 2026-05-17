# MongoDB 数据库设置说明

## 数据库信息

- **数据库名称**: `vocal-class`
- **数据库类型**: MongoDB
- **初始化时间**: 2025-11-12
- **状态**: ✅ 已初始化

## 已创建的集合

| 集合名称 | 说明 | 索引数量 | 当前文档数 |
|---------|------|---------|-----------|
| students | 学生信息 | 5 | 0 |
| course_packages | 课时包购买记录 | 2 | 0 |
| courses | 课程安排 | 5 | 0 |
| income_records | 收入记录 | 4 | 0 |
| settings | 系统设置 | 1 | 1 |

**总计**: 5 个集合，17 个索引

## 初始化内容

### 1. 索引

所有集合都已创建必要的索引，包括：
- 唯一索引：`students.phone`
- 复合索引：用于优化查询性能
- 时间倒序索引：用于最新数据查询

### 2. 数据验证规则

已为所有集合配置数据验证规则：
- 字段类型验证
- 字段长度限制
- 枚举值验证
- 必填字段检查

验证级别：`moderate`（温和模式）
验证动作：`warn`（警告但不阻止）

### 3. 系统设置

已创建默认系统设置：
```json
{
  "_id": "000000000000000000000001",
  "defaultCourseDuration": 1,
  "defaultHourlyRate": 200,
  "defaultLocation": "音乐工作室",
  "warningThreshold": 3,
  "teacherName": "",
  "teacherPhone": "",
  "wechatOpenId": "",
  "updatedAt": "2025-11-12T08:07:27.689Z"
}
```

## 常用命令

### 连接数据库
```bash
mongosh vocal-class
```

### 查看所有集合
```bash
mongosh vocal-class --eval "db.getCollectionNames()"
```

### 查看数据库统计
```bash
mongosh vocal-class --eval "db.stats()"
```

### 查看某个集合的索引
```bash
mongosh vocal-class --eval "db.students.getIndexes()"
```

### 重新初始化数据库
```bash
mongosh --file scripts/init-db.js
```

⚠️ **注意**: 重新初始化前请先备份数据！

## 数据库连接配置

### Node.js (Mongoose)
```javascript
const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/vocal-class';

mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

### 环境变量配置
```env
MONGODB_URI=mongodb://localhost:27017/vocal-class
DB_NAME=vocal-class
```

## 测试数据

如需插入测试数据，可以创建 `scripts/seed-data.js` 文件：

```javascript
db = db.getSiblingDB('vocal-class');

// 插入测试学生
db.students.insertMany([
  {
    name: "张三",
    phone: "13800138001",
    remainingHours: 10,
    notes: "擅长民族唱法",
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "李四",
    phone: "13800138002",
    remainingHours: 5,
    notes: "声音有特色",
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('测试数据插入完成！');
```

## 备份与恢复

### 备份数据库
```bash
mongodump --db=vocal-class --out=./backup/$(date +%Y%m%d)
```

### 恢复数据库
```bash
mongorestore --db=vocal-class ./backup/20251112/vocal-class
```

### 导出为 JSON
```bash
mongoexport --db=vocal-class --collection=students --out=students.json
```

### 从 JSON 导入
```bash
mongoimport --db=vocal-class --collection=students --file=students.json
```

## 监控与维护

### 查看当前连接数
```javascript
db.serverStatus().connections
```

### 查看慢查询
```javascript
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

### 查看集合大小
```javascript
db.students.stats()
```

### 重建索引（如果需要）
```javascript
db.students.reIndex()
```

## 故障排查

### 问题：无法连接到数据库
**解决方案**:
1. 确认 MongoDB 服务正在运行：`systemctl status mongod` (Linux) 或检查任务管理器 (Windows)
2. 检查连接字符串是否正确
3. 检查防火墙设置

### 问题：索引创建失败
**解决方案**:
1. 检查是否存在重复数据（如 phone 字段）
2. 删除现有索引后重新创建
3. 检查磁盘空间

### 问题：数据验证失败
**解决方案**:
1. 查看 MongoDB 日志获取详细错误信息
2. 检查插入的数据格式是否符合验证规则
3. 如需临时跳过验证，可以修改 validationLevel

## 安全建议

1. **创建专用用户**（生产环境必须）：
```javascript
use vocal-class
db.createUser({
  user: "vocal_app",
  pwd: "your_strong_password_here",
  roles: [
    { role: "readWrite", db: "vocal-class" }
  ]
})
```

2. **启用认证**：
编辑 MongoDB 配置文件 `/etc/mongod.conf`:
```yaml
security:
  authorization: enabled
```

3. **限制网络访问**：
```yaml
net:
  bindIp: 127.0.0.1  # 仅本地访问
  port: 27017
```

## 下一步

1. ✅ 数据库已创建并初始化
2. ⏳ 开发后端 API 接口
3. ⏳ 实现数据模型 (Mongoose Schema)
4. ⏳ 编写单元测试
5. ⏳ 配置自动备份

## 相关文档

- [DATABASE.md](./DATABASE.md) - 完整数据库设计文档
- [API.md](./API.md) - API 接口文档
- [scripts/init-db.js](../../scripts/init-db.js) - 数据库初始化脚本

---

**创建时间**: 2025-11-12  
**最后更新**: 2025-11-12

