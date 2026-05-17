<template>
  <scroll-view class="page" scroll-y>
    <view class="user-card">
      <view class="avatar">{{ userNameFirst }}</view>
      <view class="info">
        <text class="name">{{ userName }}</text>
        <text class="account">账号：{{ account }}</text>
      </view>
    </view>

    <view class="group">
      <view class="group-title">我的课时</view>
      <view class="cell">
        <text class="cell-title">剩余课时</text>
        <text class="cell-value">{{ remainingHours }} 课时</text>
      </view>
    </view>

    <view class="group">
      <view class="group-title">记录</view>
      <view class="cell" @tap="goRecords">
        <text class="cell-title">上课记录</text>
      </view>
      <view class="cell" @tap="goRecords">
        <text class="cell-title">缴费记录</text>
      </view>
    </view>

    <view class="group">
      <view class="group-title">账号</view>
      <view class="cell" @tap="handleLogout">
        <text class="cell-title danger">切换账号</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'

const authStore = useAuthStore()
const studentStore = useStudentStore()

const userName = computed(() => authStore.userInfo?.name || '同学')
const userNameFirst = computed(() => userName.value.charAt(0))
const account = computed(() => authStore.userInfo?.account || '')
const remainingHours = computed(() => studentStore.currentStudent?.remainingHours || 0)

async function loadData() {
  await studentStore.fetchMyInfo()
}

function goRecords() {
  uni.navigateTo({ url: '/subpackages/student/records/index' })
}

function handleLogout() {
  uni.showModal({
    title: '确认切换账号',
    content: '切换账号后将退出当前登录，确定吗？',
    success: async (res) => {
      if (res.confirm) {
        await authStore.logout()
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.user-card {
  padding: 40rpx 32rpx 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 600;
  color: #ffffff;
}

.info .name {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

.info .account {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.group {
  margin: 12rpx 24rpx 0;
}

.group-title {
  margin: 12rpx 4rpx 6rpx;
  font-size: 24rpx;
  color: #969799;
}

.cell {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f2f3f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cell:last-child {
  border-bottom-width: 0;
}

.cell-title {
  font-size: 28rpx;
  color: #323233;
}

.cell-title.danger {
  color: #ee0a24;
}

.cell-value {
  font-size: 26rpx;
  color: #646566;
}
</style>


