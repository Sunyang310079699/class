# 声乐教学管理系统 - 前端

> 基于 Vue 3 + Vite + Vant 4 的移动端教学管理系统

## 快速启动

### 1. 安装依赖

```bash
cd vocal-class-frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:5173 启动

### 3. 构建生产版本

```bash
npm run build
```

## 功能特性

### ✅ 已完成功能

- **首页仪表盘**
  - 数据概览（今日收益、本月课程、待签到、课时预警）
  - 快捷操作入口
  - 今日课程列表
  - 课时预警提醒

- **学生管理**
  - 学生列表（搜索、筛选）
  - 添加学生
  - 学生详情
  - 购买课时包
  - 编辑/删除学生

- **课表管理**
  - 周视图课表
  - 按日期分组显示
  - 课程筛选（全部/待上课/已完成）
  - 创建课程
  - 编辑课程（常规课程可选择是否同步后续课程）
  - 课程签到
  - 课程状态管理

- **收益统计**
  - 收益概览（今日/本周/本月/本年/总收益）
  - 收入明细列表
  - 按月份/学生筛选
  - 手动添加收入记录

- **个人中心**
  - 数据统计展示
  - 教学设置（课时长度、单价、地点、预警阈值）
  - 数据管理（统计、导出、清空）

## 技术栈

- **Vue 3.3+** - 采用 Composition API
- **Vite 4.5+** - 构建工具
- **Vant 4** - 移动端 UI 组件库
- **Pinia 2.1+** - 状态管理
- **Vue Router 4.2+** - 路由管理
- **Axios** - HTTP 请求
- **Day.js** - 日期处理
- **Mock.js** - 数据模拟

## 目录结构

```
src/
├── api/                 # API 接口层
│   ├── request.js      # Axios 封装
│   ├── student.js      # 学生接口
│   ├── course.js       # 课程接口
│   ├── income.js       # 收益接口
│   └── mock/           # Mock 数据
├── assets/             # 静态资源
│   └── styles/         # 全局样式
├── views/              # 页面组件
│   ├── Home/          # 首页
│   ├── Students/      # 学生管理
│   ├── Schedule/      # 课表
│   ├── Income/        # 收益
│   └── Profile/       # 我的
├── router/             # 路由配置
├── stores/             # Pinia Store
│   ├── student.js     # 学生状态
│   ├── course.js      # 课程状态
│   ├── income.js      # 收益状态
│   └── settings.js    # 设置状态
├── utils/              # 工具函数
│   ├── date.js        # 日期处理
│   ├── storage.js     # 本地存储
│   ├── validate.js    # 表单验证
│   └── format.js      # 格式化
├── App.vue             # 根组件
└── main.js             # 入口文件
```

## Mock 数据说明

当前项目使用 Mock.js 模拟后端接口，数据存储在 `localStorage` 中。

### 特点

- ✅ 完整模拟所有 API 接口
- ✅ 数据持久化到本地存储
- ✅ 真实的业务逻辑（扣课时、计算收益等）
- ✅ 随时可切换到真实后端接口

### 切换到真实接口

修改 `.env.development` 文件：

```env
# 使用 Mock 数据（默认）
VITE_USE_MOCK=true

# 使用真实接口
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## 开发规范

### 代码风格

- 组件命名：PascalCase（`StudentCard.vue`）
- 变量命名：camelCase（`studentList`）
- 常量命名：UPPER_CASE（`MAX_COUNT`）
- 事件命名：kebab-case（`@update-student`）

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

## 浏览器支持

- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 微信内置浏览器（主要目标）
- iOS Safari >= 12
- Android Chrome >= 70

## 常见问题

### Q: Vant 组件样式不生效？
A: 检查是否正确配置了 `unplugin-vue-components`

### Q: Mock 数据如何持久化？
A: 使用 `localStorage` 存储数据，刷新页面不会丢失

### Q: 如何清空 Mock 数据？
A: 在"个人中心"页面点击"清空数据"按钮

## 相关文档

- [产品需求文档](../docs/PRD.md)
- [前端开发文档](../docs/FRONTEND.md)
- [Mock 数据说明](../docs/MOCK_DATA.md)
- [API 接口文档](../docs/backend/API.md)

## 许可证

MIT License

---

**当前版本**: v1.0.0  
**最后更新**: 2025-10-21
