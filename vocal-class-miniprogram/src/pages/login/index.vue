<template>
  <view class="login-page">
    <view class="logo-area">
      <text class="title">声乐教学管理系统</text>
      <text class="subtitle">账号密码登录</text>
    </view>

    <view class="form-card">
      <picker :range="userTypeOptions" :value="userTypeIndex" @change="onUserTypeChange">
        <view class="picker-row">
          <text class="picker-label">账号类型</text>
          <text class="picker-value">{{ userTypeOptions[userTypeIndex] }}</text>
        </view>
      </picker>

      <view class="input-row">
        <input
          v-model="account"
          type="text"
          placeholder="请输入账号（手机号）"
          placeholder-class="placeholder"
        />
      </view>
      <view class="input-row">
        <input
          v-model="password"
          type="password"
          password
          placeholder="请输入密码"
          placeholder-class="placeholder"
        />
      </view>

      <button class="login-btn" @tap="handleLogin">登录</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const userTypeOptions = ['教师账号', '学生账号']
const userTypeIndex = ref(0)

const account = ref('')
const password = ref('')
const role = ref('teacher')

function onUserTypeChange(e) {
  userTypeIndex.value = Number(e.detail.value)
  role.value = userTypeIndex.value === 0 ? 'teacher' : 'student'
}

async function handleLogin() {
  if (!account.value || !password.value) {
    uni.showToast({ title: '请输入账号和密码', icon: 'none' })
    return
  }
  try {
    await authStore.login({
      account: account.value,
      password: password.value,
      role: role.value
    })
  } catch (e) {
    // 具体错误在 request 中已提示
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 40rpx 32rpx;
  background: linear-gradient(135deg, #ff8b7b 0%, #ff6b6b 35%, #a17fff 100%);
  box-sizing: border-box;
}

.logo-area {
  margin-top: 80rpx;
  margin-bottom: 60rpx;
  color: #ffffff;
}

.title {
  font-size: 40rpx;
  font-weight: 600;
}

.subtitle {
  margin-top: 12rpx;
  font-size: 26rpx;
  opacity: 0.9;
}

.form-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.picker-row,
.input-row {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-label {
  font-size: 28rpx;
  color: #333333;
}

.picker-value {
  font-size: 28rpx;
  color: #666666;
}

input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.placeholder {
  color: #c8c9cc;
}

.login-btn {
  margin-top: 40rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #ff8b7b 0%, #ff6b6b 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;
}
</style>


