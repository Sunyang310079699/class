import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // 登录页（公开）
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  
  // 教师端路由
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: { title: '首页', keepAlive: true, requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('@/views/Students/index.vue'),
    meta: { title: '学生管理', keepAlive: true, requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/students/add',
    name: 'AddStudent',
    component: () => import('@/views/Students/Add.vue'),
    meta: { title: '添加学生', requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/students/:id',
    name: 'StudentDetail',
    component: () => import('@/views/Students/Detail.vue'),
    meta: { title: '学生详情', requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('@/views/Schedule/index.vue'),
    meta: { title: '课表', keepAlive: true, requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/schedule/add',
    name: 'AddCourse',
    component: () => import('@/views/Schedule/AddCourse.vue'),
    meta: { title: '创建课程', requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/schedule/edit/:id',
    name: 'EditCourse',
    component: () => import('@/views/Schedule/AddCourse.vue'),
    meta: { title: '编辑课程', requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/schedule/recurring',
    name: 'RecurringCourse',
    component: () => import('@/views/Schedule/RecurringCourse.vue'),
    meta: { title: '周期性排课', requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/income',
    name: 'Income',
    component: () => import('@/views/Income/index.vue'),
    meta: { title: '收益统计', keepAlive: true, requiresAuth: true, requiresTeacher: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile/index.vue'),
    meta: { title: '我的', requiresAuth: true, requiresTeacher: true }
  },
  
  // 学生端路由
  {
    path: '/student',
    name: 'StudentHome',
    component: () => import('@/views/Student/Home/index.vue'),
    meta: { title: '我的首页', keepAlive: true, requiresAuth: true, requiresStudent: true }
  },
  {
    path: '/student/schedule',
    name: 'StudentSchedule',
    component: () => import('@/views/Student/Schedule/index.vue'),
    meta: { title: '我的课表', keepAlive: true, requiresAuth: true, requiresStudent: true }
  },
  {
    path: '/student/records',
    name: 'StudentRecords',
    component: () => import('@/views/Student/Records/index.vue'),
    meta: { title: '我的记录', requiresAuth: true, requiresStudent: true }
  },
  {
    path: '/student/profile',
    name: 'StudentProfile',
    component: () => import('@/views/Student/Profile/index.vue'),
    meta: { title: '个人中心', requiresAuth: true, requiresStudent: true }
  }
]

const router = createRouter({
  // 使用 Vite 配置的 base 路径，与 vite.config.js 中的 base 保持一致
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 路由守卫 - 权限控制和页面标题
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '声乐教学管理系统'
  
  const authStore = useAuthStore()
  
  // 登录页不需要权限检查
  if (to.path === '/login') {
    // 如果已登录，跳转到对应首页
    if (authStore.checkAuth()) {
      const redirect = authStore.isTeacher ? '/' : '/student'
      next(redirect)
      return
    }
    next()
    return
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth !== false) {
    // 先检查 localStorage，确保状态同步
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      // 如果 localStorage 有数据但 store 没有，同步状态
      if (!authStore.isAuthenticated) {
        authStore.checkAuth()
      }
    }
    
    // 如果仍未登录，跳转到登录页
    if (!authStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // 检查教师权限
    if (to.meta.requiresTeacher && !authStore.isTeacher) {
      // 学生账号访问教师页面，跳转到学生首页
      next('/student')
      return
    }
    
    // 检查学生权限
    if (to.meta.requiresStudent && !authStore.isStudent) {
      // 教师账号访问学生页面，跳转到教师首页
      next('/')
      return
    }
  }
  
  next()
})

export default router

