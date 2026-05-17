<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <transition :name="transitionName" mode="out-in">
      <keep-alive :include="['Home', 'Students', 'Schedule', 'Income', 'StudentHome', 'StudentSchedule']">
          <component :is="Component" :key="route.path" />
      </keep-alive>
      </transition>
    </router-view>
    
    <!-- 底部导航栏 - 根据角色显示不同导航 -->
    <!-- 教师端导航 -->
    <van-tabbar 
      v-if="showTeacherTabbar" 
      v-model="teacherActive" 
      route 
      fixed 
      placeholder
    >
      <van-tabbar-item to="/" icon="wap-home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/schedule" icon="calendar-o">课表</van-tabbar-item>
      <van-tabbar-item to="/students" icon="friends-o">学生</van-tabbar-item>
      <van-tabbar-item to="/income" icon="balance-o">收益</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
    
    <!-- 学生端导航 -->
    <van-tabbar 
      v-if="showStudentTabbar" 
      v-model="studentActive" 
      route 
      fixed 
      placeholder
    >
      <van-tabbar-item to="/student" icon="wap-home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/student/schedule" icon="calendar-o">课表</van-tabbar-item>
      <van-tabbar-item to="/student/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const teacherActive = ref(0)
const studentActive = ref(0)
const transitionName = ref('slide-left')

// 是否显示导航栏
const showTeacherTabbar = computed(() => {
  return authStore.isAuthenticated && authStore.isTeacher && route.path !== '/login'
})

const showStudentTabbar = computed(() => {
  return authStore.isAuthenticated && authStore.isStudent && route.path !== '/login'
})

// 教师端主导航路由顺序
const teacherRoutes = ['/', '/schedule', '/students', '/income', '/profile']
// 学生端主导航路由顺序
const studentRoutes = ['/student', '/student/schedule', '/student/profile']
let previousIndex = 0

// 根据路由设置激活的 tab 和过渡动画
watch(() => route.path, (path, oldPath) => {
  // 设置教师端激活 tab
  if (authStore.isTeacher) {
    switch (path) {
      case '/':
        teacherActive.value = 0
        break
      case '/schedule':
        teacherActive.value = 1
        break
      case '/students':
        teacherActive.value = 2
        break
      case '/income':
        teacherActive.value = 3
        break
      case '/profile':
        teacherActive.value = 4
        break
    }
  }
  
  // 设置学生端激活 tab
  if (authStore.isStudent) {
    switch (path) {
      case '/student':
        studentActive.value = 0
        break
      case '/student/schedule':
        studentActive.value = 1
        break
      case '/student/profile':
        studentActive.value = 2
        break
    }
  }
  
  // 确定过渡方向
  const currentRoutes = authStore.isTeacher ? teacherRoutes : studentRoutes
  const currentIndex = currentRoutes.indexOf(path)
  const oldIndex = currentRoutes.indexOf(oldPath)
  
  // 主导航之间的切换
  if (currentIndex !== -1 && oldIndex !== -1) {
    transitionName.value = currentIndex > oldIndex ? 'slide-left' : 'slide-right'
    previousIndex = currentIndex
  } 
  // 详情页面（非主导航）
  else if (currentIndex === -1 && oldIndex !== -1) {
    transitionName.value = 'slide-left' // 进入详情页
  } 
  else if (currentIndex !== -1 && oldIndex === -1) {
    transitionName.value = 'slide-right' // 从详情页返回
  }
  else {
    transitionName.value = 'fade' // 其他情况使用淡入淡出
  }
}, { immediate: true })

// 初始化时检查登录状态
authStore.checkAuth()
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 路由过渡动画 - 左滑 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-30%);
  opacity: 0;
}

/* 路由过渡动画 - 右滑 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(30%);
  opacity: 0;
}

/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
