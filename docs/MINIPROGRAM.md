# 微信小程序前端开发文档（uni-app 版）

## 1. 概述

- 技术栈：**uni-app + Vue3 + Pinia**
- 目标平台：微信小程序（mp-weixin）
- 功能范围：对齐 PRD 和 H5 前端，包含教师端与学生端两套导航。
- 接口：完全复用 `vocal-class-backend`，响应格式与 `docs/backend/API.md` 一致。

## 2. 目录与模块说明

见项目根 README 中 `vocal-class-miniprogram/` 小节，这里补充模块职责：

- `src/api/`：一一对应后端路由：
  - `auth.js`：`/auth/login`、`/auth/logout`、`/auth/me`
  - `student.js`：`/students` CRUD、`/students/:id/course-packages`、`/students/me/info`
  - `course.js`：`/courses` 列表、`/courses/today`、`/courses/:id/attendance` 等
  - `income.js`：`/income/overview`、`/income/records`、`/income/trend`
  - `settings.js`：`/settings` 获取/更新
  - `statistics.js`：`/statistics/dashboard`、`/statistics/warnings`
- `src/stores/`：
  - `auth`：登录态与用户信息（角色 teacher/student），统一跳转首页；
  - `student`：教师侧学生列表/详情，学生侧「我的信息」；
  - `course`：课程列表、今日课程、签到/取消；
  - `income`：收益概览与记录缓存；
  - `settings`：教学设置（课时长度、单价、地点、预警阈值）；
  - `statistics`：首页仪表盘统计与预警列表。

## 3. 登录与权限控制

### 3.1 登录流程

1. `pages/login/index.vue` 输入账号、密码，选择账号类型（教师/学生，可选）。
2. 调用 `auth.login({ account, password, role })`：
   - 后端返回 `token` 与 `user` 对象（含 `role` 和 `id`）。
3. `authStore.login`：
   - 保存 `token` 与 `userInfo` 到 Pinia 和 `uni.setStorageSync`；
   - 判断 `role`：
     - `teacher` → `reLaunch('/pages/home/index')`
     - `student` → `reLaunch('/subpackages/student/home/index')`

### 3.2 启动时检查登录态

- `App.vue` 的 `onLaunch`：
  - 调用 `authStore.restoreFromStorage()` 读取本地 token 与 user；
  - 无 token → 重定向登录；
  - 有 token → 调用 `auth.getProfile()`，根据角色跳转教师/学生首页。

### 3.3 请求拦截与 401 处理

- 所有请求经由 `src/api/request.js`：
  - 自动在 header 注入 `Authorization: Bearer <token>`；
  - 若响应 `code === 401`：
    - 清除本地 token / user；
    - `reLaunch('/pages/login/index')`；
    - Toast 提示「未授权，请重新登录」。

## 4. 教师端页面与数据流

### 4.1 首页 `pages/home/index.vue`

- 使用的 store：
  - `courseStore.fetchTodayCourses()` 获取今日课程；
  - `statisticsStore.fetchDashboard()` 获取今日收益、本周课程数等；
  - `studentStore.fetchStudents()` 获取学生列表（用于课时预警）。
- 主要区域：
  - 顶部统计卡片：今日收益 + 今日课程数；
  - 快捷入口：快速排课/添加学生/查看收益/学生管理；
  - 今日待签到：基于 `courseStore.todayCourses`；
  - 课时预警：`studentStore.lowHoursStudents`。
- 签到：
  - 点击课程「签到」，调用 `courseStore.signCourse(id, { attendanceStatus: 'present' })`；
  - 后端自动扣课时并返回最新课程/学生数据。

### 4.2 课表 `pages/schedule/index.vue`

- 视图：本周/本月/近一月 3 种时间范围轮换。
- 调用：
  - `courseStore.fetchCourses({ startDate, endDate })`；
  - 结果按日期分组、按开始时间排序展示。
- 课程操作：
  - 签到/请假：调用 `signCourse(id, { attendanceStatus })`；
  - 取消课程：调用 `cancelCourse(id, { reason })`。

### 4.3 学生管理 `pages/students/*.vue`

- 列表：搜索姓名/电话，调用 `studentStore.fetchStudents({ keyword })`；
- 新增：表单校验 PRD 规则（姓名 2–10 字、手机号 11 位等），调用 `studentStore.addStudent`；
- 详情：
  - 显示基本信息、剩余课时、课时包记录；
  - 购买课时表单 → `studentStore.buyCoursePackage(studentId, payload)`，由后端统一：
    - 增加剩余课时；
    - 生成课时包记录；
    - 生成收益记录。

### 4.4 收益 `pages/income/index.vue`

- 调用：
  - `incomeStore.fetchOverview()` → 今日/本周/本月/本年/总收益；
  - `incomeStore.fetchRecords()` → 收入明细；
- 本实现先提供「按月份 + 全学生」的简单筛选，图表功能预留在 H5 端。

### 4.5 个人中心 `pages/profile/index.vue`

- 展示：
  - 教师账号信息；
  - 学生总数、已上课程数、总收益；
  - 教学设置（课时长度/单价/地点/预警阈值）。
- 设置更新：
  - 本地弹窗填写后，调用 `settingsStore.updateSettings(partial)`；
  - 自动映射到后端字段 `defaultCourseDuration/defaultHourlyRate/defaultLocation/warningThreshold`。

## 5. 学生端页面与数据流

### 5.1 学生首页 `subpackages/student/home/index.vue`

- 展示：
  - 剩余课时（来自 `studentStore.fetchMyInfo()`）；
  - 本周课程列表（`courseStore.fetchCourses({ startDate, endDate })`，后端按当前学生过滤）。
- 课时不足（<3）时，展示「课时不足」标记。

### 5.2 学生课表 `subpackages/student/schedule/index.vue`

- 查询近一月课程，按日期分组展示；
- 仅查看，无签到/修改操作；
- 点击课程展示详情弹窗。

### 5.3 我的记录 `subpackages/student/records/index.vue`

- Tab1 上课记录：
  - 通过 `courseStore.fetchCourses({})` 获取历史课程；
  - 按日期倒序展示，带出席/请假/旷课等状态标签。
- Tab2 缴费记录：
  - `incomeStore.fetchRecords({})` 获取带 `course_package` 类型的收入记录；
  - 按日期倒序展示金额、日期和备注。

### 5.4 学生个人中心 `subpackages/student/profile/index.vue`

- 展示：
  - 学生姓名、账号、剩余课时；
  - 入口：我的记录、切换账号。
- 切换账号：
  - 调用 `authStore.logout()`；
  - 清理 token 与 user 信息并返回登录页。

## 6. 视觉与交互规范

- 全局样式变量在 `uni.scss` 中维护，关键点：
  - 渐变色：
    - 学生模块：`$student-gradient`
    - 收益模块：`$income-gradient`
    - 课表模块：`$schedule-gradient`
  - 卡片：
    - `border-radius: 24rpx`；
    - `box-shadow` 见 `uni.scss`。
- 交互统一：
  - 成功提示：`uni.showToast({ title: '操作成功', icon: 'success' })`；
  - 错误提示：`uni.showToast({ title: msg, icon: 'none' })`；
  - 危险操作（删除、取消课程、切换账号）：`uni.showModal` 二次确认。

## 7. 开发与调试建议

- 推荐在 HBuilderX 中运行到「微信开发者工具」，方便真机调试；
- 与 H5 逻辑对齐时，可直接参考 `vocal-class-frontend/src/views/**` 与 `src/stores/**`；
- 调用后端接口前，确认 `vocal-class-backend` 已在本地 `http://localhost:3000` 启动；
- 小程序端调试 401/权限问题时，重点查看：
  - `src/api/request.js` 的 header 与返回 `code`；
  - `authStore.restoreFromStorage` 与 `authStore.fetchProfile` 行为。


