# 前端开发文档

## 文档信息

- **项目名称**：声乐教学管理系统 - 前端
- **版本**：v1.0.0
- **开发模式**：独立开发，使用 Mock 数据
- **创建日期**：2025-10-21

---

## 一、技术选型

### 1.1 核心框架

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.3+ | 采用 Composition API |
| Vite | 4.5+ | 构建工具 |
| Vue Router | 4.2+ | 路由管理 |
| Pinia | 2.1+ | 状态管理 |

### 1.2 UI 组件库

**Vant 4** - 轻量、可靠的移动端 Vue 组件库

选择理由：
- ✅ 专为移动端设计
- ✅ 组件丰富，覆盖常用场景
- ✅ 支持按需引入
- ✅ TypeScript 支持
- ✅ 主题定制方便

常用组件：
- Button、Cell、Form - 基础组件
- Calendar、DatePicker - 日期选择
- List、PullRefresh - 列表和刷新
- Dialog、Toast、Notify - 反馈组件
- Tabbar、NavBar - 导航组件

### 1.3 工具库

| 库名 | 用途 |
|------|------|
| Axios | HTTP 请求 |
| Day.js | 日期处理（轻量替代 Moment.js）|
| ECharts | 图表可视化 |
| Mock.js | 模拟数据生成 |
| VueUse | Vue Composition API 工具集 |

---

## 二、项目初始化

### 2.1 创建项目

```bash
# 使用 Vite 创建 Vue 3 项目
npm create vite@latest vocal-class-frontend -- --template vue

cd vocal-class-frontend
npm install
```

### 2.2 安装依赖

```bash
# UI 组件库
npm install vant

# 路由和状态管理
npm install vue-router pinia

# 工具库
npm install axios dayjs
npm install echarts
npm install mockjs

# VueUse（可选，但推荐）
npm install @vueuse/core

# 开发依赖
npm install -D sass
npm install -D unplugin-vue-components  # Vant 按需引入
npm install -D unplugin-auto-import     # API 自动引入
```

### 2.3 配置 Vite

创建 `vite.config.js`：

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),
    // Vant 按需引入
    Components({
      resolvers: [VantResolver()],
    }),
    // API 自动引入
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'vant': ['vant'],
          'echarts': ['echarts']
        }
      }
    }
  }
});
```

### 2.4 环境配置

创建 `.env.development`：
```env
# 开发环境
VITE_APP_TITLE=声乐教学管理系统
VITE_USE_MOCK=true
VITE_API_BASE_URL=/api
```

创建 `.env.production`：
```env
# 生产环境
VITE_APP_TITLE=声乐教学管理系统
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## 三、目录结构详解

```
src/
├── api/                    # API 接口层
│   ├── request.js         # Axios 封装
│   ├── student.js         # 学生相关接口
│   ├── course.js          # 课程相关接口
│   ├── income.js          # 收益相关接口
│   └── mock/              # Mock 数据
│       ├── index.js       # Mock 入口
│       ├── students.js    # 学生 Mock 数据
│       ├── courses.js     # 课程 Mock 数据
│       └── income.js      # 收益 Mock 数据
│
├── assets/                # 静态资源
│   ├── images/           # 图片
│   ├── icons/            # 图标
│   └── styles/           # 样式
│       ├── index.scss    # 全局样式
│       ├── variables.scss # 变量
│       └── mixins.scss   # 混入
│
├── components/            # 公共组件
│   ├── StudentCard/      # 学生卡片
│   │   └── index.vue
│   ├── CourseItem/       # 课程项
│   │   └── index.vue
│   ├── Calendar/         # 日历组件
│   │   └── index.vue
│   └── Charts/           # 图表组件
│       ├── LineChart.vue
│       └── PieChart.vue
│
├── views/                 # 页面视图
│   ├── Home/             # 首页
│   │   └── index.vue
│   ├── Students/         # 学生管理
│   │   ├── index.vue     # 学生列表
│   │   ├── Detail.vue    # 学生详情
│   │   └── Add.vue       # 添加学生
│   ├── Schedule/         # 课表
│   │   ├── index.vue     # 课表视图
│   │   └── AddCourse.vue # 添加课程
│   ├── Income/           # 收益
│   │   └── index.vue
│   └── Profile/          # 我的
│       └── index.vue
│
├── router/                # 路由配置
│   └── index.js
│
├── stores/                # Pinia 状态管理
│   ├── index.js          # Store 入口
│   ├── student.js        # 学生 Store
│   ├── course.js         # 课程 Store
│   ├── income.js         # 收益 Store
│   └── settings.js       # 设置 Store
│
├── utils/                 # 工具函数
│   ├── date.js           # 日期处理
│   ├── storage.js        # 本地存储
│   ├── validate.js       # 表单验证
│   └── format.js         # 格式化工具
│
├── App.vue                # 根组件
└── main.js                # 入口文件
```

---

## 四、核心功能实现

### 4.1 路由配置

`src/router/index.js`：

```javascript
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: { title: '首页', keepAlive: true }
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('@/views/Students/index.vue'),
    meta: { title: '学生管理', keepAlive: true }
  },
  {
    path: '/students/add',
    name: 'AddStudent',
    component: () => import('@/views/Students/Add.vue'),
    meta: { title: '添加学生' }
  },
  {
    path: '/students/:id',
    name: 'StudentDetail',
    component: () => import('@/views/Students/Detail.vue'),
    meta: { title: '学生详情' }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('@/views/Schedule/index.vue'),
    meta: { title: '课表', keepAlive: true }
  },
  {
    path: '/schedule/add',
    name: 'AddCourse',
    component: () => import('@/views/Schedule/AddCourse.vue'),
    meta: { title: '创建课程' }
  },
  {
    path: '/income',
    name: 'Income',
    component: () => import('@/views/Income/index.vue'),
    meta: { title: '收益统计', keepAlive: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile/index.vue'),
    meta: { title: '我的' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '声乐教学管理系统';
  next();
});

export default router;
```

### 4.2 Axios 封装

`src/api/request.js`：

```javascript
import axios from 'axios';
import { showToast, showLoadingToast, closeToast } from 'vant';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 显示加载提示
    if (config.loading !== false) {
      showLoadingToast({
        message: '加载中...',
        forbidClick: true,
        duration: 0
      });
    }
    
    return config;
  },
  error => {
    closeToast();
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    closeToast();
    
    const { code, message, data } = response.data;
    
    if (code === 200) {
      return data;
    } else {
      showToast(message || '请求失败');
      return Promise.reject(new Error(message));
    }
  },
  error => {
    closeToast();
    
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 401:
          showToast('未授权，请重新登录');
          // 跳转到登录页
          break;
        case 403:
          showToast('拒绝访问');
          break;
        case 404:
          showToast('请求地址不存在');
          break;
        case 500:
          showToast('服务器错误');
          break;
        default:
          showToast('网络错误');
      }
    } else {
      showToast('网络连接失败');
    }
    
    return Promise.reject(error);
  }
);

export default request;
```

### 4.3 Pinia Store 示例

`src/stores/student.js`：

```javascript
import { defineStore } from 'pinia';
import { getStudents, getStudentDetail, createStudent, updateStudent, deleteStudent } from '@/api/student';

export const useStudentStore = defineStore('student', {
  state: () => ({
    students: [],
    currentStudent: null,
    loading: false
  }),
  
  getters: {
    // 获取课时不足的学生
    lowHoursStudents: (state) => {
      return state.students.filter(s => s.remainingHours < 3);
    },
    
    // 获取学生总数
    totalStudents: (state) => state.students.length,
    
    // 根据 ID 获取学生
    getStudentById: (state) => (id) => {
      return state.students.find(s => s.id === id);
    }
  },
  
  actions: {
    // 获取学生列表
    async fetchStudents(params = {}) {
      this.loading = true;
      try {
        const data = await getStudents(params);
        this.students = data.students || [];
        return data;
      } catch (error) {
        console.error('获取学生列表失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取学生详情
    async fetchStudentDetail(id) {
      this.loading = true;
      try {
        const data = await getStudentDetail(id);
        this.currentStudent = data;
        return data;
      } catch (error) {
        console.error('获取学生详情失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 添加学生
    async addStudent(studentData) {
      try {
        const data = await createStudent(studentData);
        this.students.push(data);
        return data;
      } catch (error) {
        console.error('添加学生失败:', error);
        throw error;
      }
    },
    
    // 更新学生
    async updateStudent(id, studentData) {
      try {
        const data = await updateStudent(id, studentData);
        const index = this.students.findIndex(s => s.id === id);
        if (index !== -1) {
          this.students[index] = data;
        }
        return data;
      } catch (error) {
        console.error('更新学生失败:', error);
        throw error;
      }
    },
    
    // 删除学生
    async removeStudent(id) {
      try {
        await deleteStudent(id);
        const index = this.students.findIndex(s => s.id === id);
        if (index !== -1) {
          this.students.splice(index, 1);
        }
      } catch (error) {
        console.error('删除学生失败:', error);
        throw error;
      }
    }
  }
});
```

### 4.4 工具函数示例

`src/utils/date.js`：

```javascript
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

/**
 * 格式化日期
 * @param {Date|String} date - 日期
 * @param {String} format - 格式
 * @returns {String}
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  return dayjs(date).format(format);
}

/**
 * 格式化时间
 * @param {Date|String} date - 日期
 * @returns {String}
 */
export function formatTime(date) {
  return dayjs(date).format('HH:mm');
}

/**
 * 格式化日期时间
 * @param {Date|String} date - 日期
 * @returns {String}
 */
export function formatDateTime(date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 相对时间
 * @param {Date|String} date - 日期
 * @returns {String}
 */
export function fromNow(date) {
  return dayjs(date).fromNow();
}

/**
 * 获取今天日期
 * @returns {String}
 */
export function getToday() {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * 获取本周日期范围
 * @returns {Object}
 */
export function getThisWeek() {
  const start = dayjs().startOf('week');
  const end = dayjs().endOf('week');
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD')
  };
}

/**
 * 获取本月日期范围
 * @returns {Object}
 */
export function getThisMonth() {
  const start = dayjs().startOf('month');
  const end = dayjs().endOf('month');
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD')
  };
}

/**
 * 判断是否是今天
 * @param {Date|String} date - 日期
 * @returns {Boolean}
 */
export function isToday(date) {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * 时间是否冲突
 * @param {String} start1 - 开始时间1
 * @param {String} end1 - 结束时间1
 * @param {String} start2 - 开始时间2
 * @param {String} end2 - 结束时间2
 * @returns {Boolean}
 */
export function isTimeConflict(start1, end1, start2, end2) {
  const s1 = dayjs(`2000-01-01 ${start1}`);
  const e1 = dayjs(`2000-01-01 ${end1}`);
  const s2 = dayjs(`2000-01-01 ${start2}`);
  const e2 = dayjs(`2000-01-01 ${end2}`);
  
  return s1.isBefore(e2) && e1.isAfter(s2);
}
```

---

## 五、样式规范

### 5.0 整体设计风格

**设计参考**：参考 `docs/style/` 文件夹中的设计图片

设计风格要点：
- 🎨 **色彩方案**：采用鲜艳明快的多色系设计，使用渐变色彩增强视觉效果
  - 学员模块：珊瑚红渐变 (#FF8B7B → #FF6B6B)
  - 收款模块：紫色渐变 (#A17FFF → #8B5FFF)
  - 关注模块：青绿色渐变 (#00D4AA → #00C896)
  - 课表模块：橙黄色渐变 (#FFB366 → #FF9A3D)

- 📐 **布局特点**：
  - 圆角卡片设计（border-radius: 12-16px）
  - 模块化网格布局（2列或4列）
  - 合理的留白和间距
  - 清晰的信息层级

- 🎯 **图标设计**：
  - 扁平化风格图标
  - 统一的图标尺寸
  - 与功能语义强关联
  - 配色与模块背景协调

- 💡 **交互体验**：
  - 大按钮设计（便于点击）
  - 清晰的状态反馈
  - 流畅的页面切换动画
  - 友好的加载状态

### 5.1 全局样式

`src/assets/styles/variables.scss`：

```scss
// 主题颜色 - 参考设计稿配色
$primary-color: #1989fa;
$success-color: #07c160;
$warning-color: #ff976a;
$danger-color: #ee0a24;

// 功能模块渐变色
$student-gradient: linear-gradient(135deg, #FF8B7B 0%, #FF6B6B 100%);
$income-gradient: linear-gradient(135deg, #A17FFF 0%, #8B5FFF 100%);
$attention-gradient: linear-gradient(135deg, #00D4AA 0%, #00C896 100%);
$schedule-gradient: linear-gradient(135deg, #FFB366 0%, #FF9A3D 100%);
$record-gradient: linear-gradient(135deg, #FFA8A8 0%, #FF8787 100%);
$class-gradient: linear-gradient(135deg, #82D43A 0%, #6BC030 100%);
$oneonone-gradient: linear-gradient(135deg, #7FD426 0%, #6AC021 100%);
$homework-gradient: linear-gradient(135deg, #FF8585 0%, #FF6B6B 100%);
$evaluation-gradient: linear-gradient(135deg, #8B7FFF 0%, #7B6FFF 100%);
$facecheck-gradient: linear-gradient(135deg, #A89FFF 0%, #9B8FFF 100%);

// 文字颜色
$text-color: #323233;
$text-color-secondary: #969799;
$text-color-light: #C8C9CC;

// 背景颜色
$border-color: #ebedf0;
$background-color: #f7f8fa;
$background-white: #ffffff;

// 字体大小
$font-size-xs: 10px;
$font-size-sm: 12px;
$font-size-md: 14px;
$font-size-lg: 16px;
$font-size-xl: 18px;
$font-size-xxl: 20px;

// 间距
$padding-xs: 4px;
$padding-sm: 8px;
$padding-md: 12px;
$padding-lg: 16px;
$padding-xl: 20px;
$padding-xxl: 24px;

// 圆角 - 参考设计稿使用较大圆角
$border-radius-sm: 6px;
$border-radius-md: 12px;
$border-radius-lg: 16px;
$border-radius-xl: 20px;

// 阴影
$box-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
$box-shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
$box-shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.15);
```

### 5.2 主题定制

Vant 主题定制通过 CSS 变量：

```scss
:root {
  --van-primary-color: #1989fa;
  --van-success-color: #07c160;
  --van-danger-color: #ee0a24;
  --van-warning-color: #ff976a;
  --van-text-color: #323233;
  --van-border-color: #ebedf0;
  --van-background-color: #f7f8fa;
}
```

---

## 六、开发建议

### 6.1 代码规范

1. **组件命名**
   - 使用 PascalCase：`StudentCard.vue`
   - 组件名多个单词组成

2. **变量命名**
   - 使用 camelCase：`studentList`
   - 常量使用 UPPER_CASE：`MAX_COUNT`

3. **Props 定义**
   ```javascript
   defineProps({
     studentId: {
       type: String,
       required: true
     },
     showActions: {
       type: Boolean,
       default: true
     }
   });
   ```

4. **事件命名**
   - 使用 kebab-case：`@update-student`

### 6.2 性能优化

1. **组件懒加载**
   ```javascript
   const StudentDetail = () => import('@/views/Students/Detail.vue');
   ```

2. **图片懒加载**
   ```vue
   <van-image lazy-load :src="imageUrl" />
   ```

3. **列表虚拟滚动**
   - 对于长列表使用虚拟滚动

4. **合理使用 keep-alive**
   ```vue
   <keep-alive :include="['Students', 'Schedule']">
     <router-view />
   </keep-alive>
   ```

### 6.3 用户体验优化

1. **加载状态**
   - 使用骨架屏
   - 显示加载提示

2. **错误处理**
   - 友好的错误提示
   - 提供重试机制

3. **交互反馈**
   - 点击反馈
   - 操作成功提示

4. **页面过渡**
   ```vue
   <transition name="slide-right">
     <router-view />
   </transition>
   ```

---

## 七、调试技巧

### 7.1 Vue Devtools

安装 Vue Devtools 浏览器扩展，可以：
- 查看组件树
- 检查 Props 和 State
- 查看 Pinia Store
- 分析性能

### 7.2 Vite 开发工具

```bash
# 查看依赖关系
npm run dev -- --debug

# 分析打包体积
npm run build -- --report
```

### 7.3 移动端调试

1. **vconsole**
   ```bash
   npm install vconsole
   ```
   
   ```javascript
   // main.js
   import VConsole from 'vconsole';
   if (import.meta.env.DEV) {
     new VConsole();
   }
   ```

2. **Chrome 远程调试**
   - 手机连接电脑
   - Chrome 访问 `chrome://inspect`

---

## 八、常见问题

### Q1: Vant 组件样式不生效？
A: 检查是否正确配置了 `unplugin-vue-components`

### Q2: 路由切换时页面闪烁？
A: 使用 `<transition>` 添加过渡动画

### Q3: Mock 数据如何持久化？
A: 使用 `localStorage` 存储数据

### Q4: 如何调试微信环境？
A: 使用微信开发者工具或 vconsole

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-21

