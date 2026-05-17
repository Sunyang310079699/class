<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo/标题 -->
      <div class="login-header">
        <h1 class="title">声乐教学管理系统</h1>
        <p class="subtitle">请登录您的账号</p>
      </div>
      
      <!-- 登录表单 -->
      <van-form @submit="onSubmit">
        <!-- 账号输入 -->
        <van-field
          v-model="form.account"
          name="account"
          label="账号"
          placeholder="请输入手机号"
          type="tel"
          maxlength="11"
          required
          clearable
        />
        
        <!-- 密码输入 -->
        <van-field
          v-model="form.password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          type="password"
          required
          clearable
        />
        
        <!-- 登录按钮 -->
        <div class="submit-btn">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
          >
            登录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)

const form = ref({
  account: '',
  password: ''
})

// 提交登录
const onSubmit = async () => {
  if (!form.value.account || !form.value.password) {
    showToast('请输入账号和密码')
    return
  }
  
  loading.value = true
  
  try {
    // 不传 role 参数，后端会根据账号自动判断类型
    const result = await authStore.login(form.value.account, form.value.password)
    
    if (!result) {
      return
    }
    
    // 默认保存账号（持久登录态）
    localStorage.setItem('rememberedAccount', form.value.account)
    
    // 确保状态已更新（等待下一个 tick）
    await new Promise(resolve => {
      setTimeout(() => {
        // 再次检查状态
        authStore.checkAuth()
        resolve()
      }, 100)
    })
    
    // 跳转到对应首页
    const redirect = route.query.redirect || (authStore.isTeacher ? '/' : '/student')
    
    console.log('登录成功，准备跳转:', {
      redirect,
      isAuthenticated: authStore.isAuthenticated,
      isTeacher: authStore.isTeacher,
      isStudent: authStore.isStudent,
      user: authStore.user
    })
    
    // 使用 replace 避免返回登录页，并添加错误处理
    try {
      await router.replace(redirect)
    } catch (err) {
      console.error('路由跳转失败:', err)
      // 如果路由跳转失败，使用 window.location 强制跳转
      window.location.href = redirect
    }
  } catch (error) {
    // 错误已在 store 中处理
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时检查是否已登录
onMounted(() => {
  // 如果已登录，直接跳转
  if (authStore.checkAuth()) {
    const redirect = route.query.redirect || (authStore.isTeacher ? '/' : '/student')
    router.push(redirect)
    return
  }
  
  // 恢复记住的账号
  const rememberedAccount = localStorage.getItem('rememberedAccount')
  if (rememberedAccount) {
    form.value.account = rememberedAccount
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $padding-lg;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: $border-radius-xl;
  padding: $padding-xxl;
  box-shadow: $box-shadow-lg;
}

.login-header {
  text-align: center;
  margin-bottom: $padding-xxl;
  
  .title {
    font-size: 24px;
    font-weight: bold;
    color: $text-color;
    margin-bottom: $padding-sm;
  }
  
  .subtitle {
    font-size: $font-size-md;
    color: $text-color-secondary;
  }
}

.submit-btn {
  margin-top: $padding-xl;
}

:deep(.van-cell-group) {
  background: transparent;
  box-shadow: none;
}

:deep(.van-field__label) {
  width: 80px;
}
</style>

