# 声乐教学管理系统 - 微信小程序（uni-app 版）

## 项目简介

本目录为 **uni-app + Vue3 + Pinia** 实现的微信小程序端，功能覆盖：

- 教师端：学生管理、排课与课表、签到、收益统计、个人中心；
- 学生端：我的课时、本周课程、课表视图、上课/缴费记录、个人中心与切换账号。

后端接口完全复用 `vocal-class-backend`，数据与 H5 版本保持一致。

## 目录结构

```text
vocal-class-miniprogram/
  ├── pages.json                 # 小程序页面与 tabBar 配置
  ├── uni.scss                   # 全局样式变量（渐变色、字体等）
  └── src/
      ├── main.js                # 入口，创建应用和 Pinia
      ├── App.vue                # 根组件，负责启动时登录态检查与跳转
      ├── config/
      │   └── env.js             # 接口 BaseURL 配置（dev/prod）
      ├── api/                   # 接口封装（基于 uni.request）
      │   ├── request.js         # 通用请求封装，统一处理 code/message/token
      │   ├── auth.js            # 登录/登出/获取当前用户
      │   ├── student.js         # 学生增删改查 + 学生端「我的信息」
      │   ├── course.js          # 课程列表、创建、签到、取消等
      │   ├── income.js          # 收益概览与明细
      │   ├── settings.js        # 教学设置
      │   └── statistics.js      # 首页统计与课时预警
      ├── stores/                # Pinia 状态管理
      │   ├── auth.js            # 登录态与用户信息
      │   ├── student.js         # 学生列表/详情/我的信息
      │   ├── course.js          # 课程列表/今日课程/签到
      │   ├── income.js          # 收益概览与记录
      │   ├── settings.js        # 本地教学设置 + 同步后端
      │   └── statistics.js      # 仪表盘统计与预警
      ├── pages/                 # 教师端主包页面
      │   ├── login/             # 登录页（账号 + 密码 + 账号类型）
      │   ├── home/              # 首页（今日课程 + 数据卡片 + 快捷入口 + 预警）
      │   ├── students/          # 学生列表 / 新增 / 详情&购买课时
      │   ├── schedule/          # 课表视图（本周/本月/近一月）+ 签到/请假/取消
      │   ├── income/            # 教师端收益概览 + 按月明细
      │   └── profile/           # 教师端个人中心与教学设置
      └── subpackages/
          └── student/           # 学生端分包页面
              ├── home/          # 学生首页：剩余课时 + 本周课程
              ├── schedule/      # 学生课表（近一月）
              ├── records/       # 上课记录 + 缴费记录
              └── profile/       # 学生个人信息 + 切换账号
```

## 运行方式（开发环境）

> 详细依赖与 uni-app CLI/HBuilderX 安装参考官方文档，这里只列出项目相关步骤。

1. 安装依赖（项目根目录）：

```bash
cd vocal-class-miniprogram
npm install
```

2. 启动小程序（使用 HBuilderX 或 uni-app CLI）：

- HBuilderX：导入本目录，选择「运行到小程序模拟器」→「微信开发者工具」；
- CLI 方式示例：

```bash
# 具体命令以你本地 uni-app/cli 配置为准
npm run dev:mp-weixin
```

3. 微信开发者工具导入：

- 选择构建输出目录（如 `dist/dev/mp-weixin`）；
- 填写对应的 AppID；
- 即可在真机/模拟器中预览。

## 与后端接口的关系

- 接口 Base URL 在 `src/config/env.js` 中配置：
  - 开发：`http://localhost:3000/api`
  - 生产：`https://yourdomain.com/api`
- 所有接口遵循 `docs/backend/API.md` 中的响应格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

`src/api/request.js` 会统一处理：

- 在请求头注入 `Authorization: Bearer <token>`；
- 根据 `code` 判断成功/失败；
- 401 时清理本地登录态并跳转登录页。

## 教师端/学生端路由对应关系（与 H5 对齐）

- 教师端 Tab（在 `pages.json` 的 `tabBar` 中定义）：
  - `pages/home/index`：首页
  - `pages/schedule/index`：课表
  - `pages/students/index`：学生
  - `pages/income/index`：收益
  - `pages/profile/index`：我的

- 学生端分包（登录后根据角色跳转）：
  - `subpackages/student/home/index`：学生首页
  - `subpackages/student/schedule/index`：我的课表
  - `subpackages/student/records/index`：我的记录
  - `subpackages/student/profile/index`：个人中心

## 注意事项

- 小程序需要在「微信公众平台」和「微信开发者工具」中配置 **request 合法域名**，与 `env.js` 中的域名一致；
- 登录账号与密码规则与 PRD / 后端保持一致：
  - 教师账号：管理员手机号 + 自定义密码；
  - 学生账号：手机号；密码为「姓名首字母（大写）+ 手机号」。

## 后续扩展建议

- 将 H5 中的 ECharts 图表（收益趋势、学生贡献占比等）迁移到小程序端，可基于 `ec-canvas` 或官方小程序版 ECharts；
- 增加基础骨架屏与下拉刷新 loading 提示；
- 根据 `docs/style/` 设计图，进一步细化卡片阴影、圆角和渐变颜色的统一。


