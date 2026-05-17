<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onLaunch(async () => {
  authStore.restoreFromStorage()

  if (!authStore.token) {
    uni.reLaunch({ url: '/pages/login/index' })
  } else {
    try {
      await authStore.fetchProfile()
      if (authStore.userType === 'teacher') {
        uni.reLaunch({ url: '/pages/home/index' })
      } else {
        uni.reLaunch({ url: '/subpackages/student/home/index' })
      }
    } catch (e) {
      // token 失效会在请求层统一处理
    }
  }
})

onShow(() => {
  // 可按需添加埋点等逻辑
})
</script>

<template>
  <slot />
</template>

<style>
/* 全局基础样式可统一放到 uni.scss，这里保持简洁 */
</style>


