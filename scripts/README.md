# 数据库初始化脚本说明

## 脚本列表

### 1. init-db.js
本地 MongoDB 数据库初始化脚本（使用 MongoDB Shell）

**使用方法**:
```bash
# 连接到本地 MongoDB
mongo mongodb://localhost:27017/vocal-class scripts/init-db.js

# 或者如果已配置认证
mongo mongodb://username:password@localhost:27017/vocal-class scripts/init-db.js
```

### 2. init-remote-db.js
远程 MongoDB 数据库初始化脚本（使用 Node.js）

**数据库信息**:
- 地址: 39.106.63.161:27017
- 账号: root
- 密码: 147258
- 数据库名: vocal-class

**使用方法**:

1. 首先确保已安装 mongodb 依赖（在后端项目目录）:
```bash
cd vocal-class-backend
npm install mongodb
```

2. 运行初始化脚本:
```bash
# 从项目根目录运行
node scripts/init-remote-db.js

# 或者从后端项目目录运行
cd vocal-class-backend
node ../scripts/init-remote-db.js
```

**功能说明**:
- 创建所有必要的集合索引
- 初始化系统设置（settings 集合）
- 创建数据验证规则
- 显示初始化结果和统计信息

**注意事项**:
- 脚本会自动创建数据库（如果不存在）
- 如果系统设置已存在，不会重复创建
- 索引创建是幂等的，重复运行不会出错
- 验证规则创建失败不会影响脚本执行

## 初始化后的验证

初始化完成后，可以通过以下方式验证：

1. **使用 MongoDB Compass 连接**:
   - 连接字符串: `mongodb://root:147258@39.106.63.161:27017/vocal-class`

2. **使用 MongoDB Shell**:
   ```bash
   mongo mongodb://root:147258@39.106.63.161:27017/vocal-class
   ```

3. **检查集合和索引**:
   ```javascript
   // 查看所有集合
   show collections
   
   // 查看索引
   db.students.getIndexes()
   db.courses.getIndexes()
   db.course_packages.getIndexes()
   db.income_records.getIndexes()
   
   // 查看系统设置
   db.settings.findOne()
   ```

## 故障排查

### 连接失败
- 检查网络连接是否正常
- 确认 MongoDB 服务是否运行
- 验证账号密码是否正确
- 检查防火墙设置

### 权限错误
- 确认 root 用户有创建数据库的权限
- 检查用户角色配置

### 脚本执行失败
- 检查 Node.js 版本（建议 v14+）
- 确认已安装 mongodb 依赖包
- 查看错误信息并检查网络连接

