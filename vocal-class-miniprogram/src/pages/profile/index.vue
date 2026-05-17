<template>
  <scroll-view class="page" scroll-y>
    <view class="user-card">
      <view class="avatar">{{ userNameFirst }}</view>
      <view class="info">
        <text class="name">{{ userName }}</text>
        <text class="account">账号：{{ account }}</text>
      </view>
    </view>

    <view class="stats-row">
      <view class="stat-item">
        <text class="value">{{ totalStudents }}</text>
        <text class="label">学生</text>
      </view>
      <view class="stat-item">
        <text class="value">{{ completedCourses }}</text>
        <text class="label">已上课程</text>
      </view>
      <view class="stat-item">
        <text class="value">{{ totalIncome }}</text>
        <text class="label">总收益(元)</text>
      </view>
    </view>

    <view class="group">
      <view class="group-title">教学设置</view>
      <view class="cell" @tap="openDuration">
        <text class="cell-title">默认课时长度</text>
        <text class="cell-value">{{ settings.defaultDuration }} 分钟</text>
      </view>
      <view class="cell" @tap="openPrice">
        <text class="cell-title">默认课时单价</text>
        <text class="cell-value">¥{{ settings.defaultPrice }}</text>
      </view>
      <view class="cell" @tap="openLocation">
        <text class="cell-title">默认上课地点</text>
        <text class="cell-value">{{ settings.defaultLocation }}</text>
      </view>
      <view class="cell" @tap="openThreshold">
        <text class="cell-title">课时预警阈值</text>
        <text class="cell-value">{{ settings.lowHoursThreshold }} 课时</text>
      </view>
    </view>

    <view class="group">
      <view class="group-title">数据管理</view>
      <view class="cell" @tap="showDataStats">
        <text class="cell-title">数据统计</text>
      </view>
      <view class="cell" @tap="handleClearLocal">
        <text class="cell-title">清空本地缓存</text>
      </view>
    </view>

    <view class="group">
      <view class="group-title">账号</view>
      <view class="cell" @tap="handleLogout">
        <text class="cell-title danger">切换账号</text>
      </view>
    </view>

    <view v-if="dialog.visible" class="dialog-mask">
      <view class="dialog">
        <text class="dialog-title">{{ dialog.title }}</text>
        <input
          v-if="dialog.type === 'number'"
          v-model="dialog.value"
          class="dialog-input"
          type="number"
        />
        <input
          v-else
          v-model="dialog.value"
          class="dialog-input"
          type="text"
        />
        <view class="dialog-actions">
          <button class="btn-cancel" @tap="closeDialog">取消</button>
          <button class="btn-ok" @tap="confirmDialog">确定</button>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { useCourseStore } from '@/stores/course'
import { useIncomeStore } from '@/stores/income'
import { useSettingsStore } from '@/stores/settings'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const courseStore = useCourseStore()
const incomeStore = useIncomeStore()
const settingsStore = useSettingsStore()

const userName = computed(() => authStore.userInfo?.name || authStore.userInfo?.account || '教师')
const userNameFirst = computed(() => userName.value.charAt(0))
const account = computed(() => authStore.userInfo?.account || '')

const totalStudents = computed(() => studentStore.totalStudents)
const completedCourses = computed(() => courseStore.completedCourses.length)
const totalIncome = computed(() => incomeStore.overview.total || 0)

const settings = computed(() => ({
  defaultDuration: settingsStore.defaultDuration,
  defaultPrice: settingsStore.defaultPrice,
  defaultLocation: settingsStore.defaultLocation,
  lowHoursThreshold: settingsStore.lowHoursThreshold
}))

const dialog = reactive({
  visible: false,
  type: 'number',
  title: '',
  field: '',
  value: ''
})

async function loadData() {
  await Promise.all([
    studentStore.fetchStudents(),
    courseStore.fetchCourses(),
    incomeStore.fetchOverview(),
    settingsStore.fetchSettings()
  ])
}

function openDuration() {
  dialog.visible = true
  dialog.type = 'number'
  dialog.title = '默认课时长度(分钟)'
  dialog.field = 'defaultDuration'
  dialog.value = String(settingsStore.defaultDuration)
}

function openPrice() {
  dialog.visible = true
  dialog.type = 'number'
  dialog.title = '默认课时单价(元)'
  dialog.field = 'defaultPrice'
  dialog.value = String(settingsStore.defaultPrice)
}

function openLocation() {
  dialog.visible = true
  dialog.type = 'text'
  dialog.title = '默认上课地点'
  dialog.field = 'defaultLocation'
  dialog.value = settingsStore.defaultLocation
}

function openThreshold() {
  dialog.visible = true
  dialog.type = 'number'
  dialog.title = '课时预警阈值(课时)'
  dialog.field = 'lowHoursThreshold'
  dialog.value = String(settingsStore.lowHoursThreshold)
}

function closeDialog() {
  dialog.visible = false
}

async function confirmDialog() {
  if (!dialog.value) {
    uni.showToast({ title: '请输入有效数值', icon: 'none' })
    return
  }
  const payload = {}
  if (dialog.field === 'defaultDuration' || dialog.field === 'lowHoursThreshold') {
    payload[dialog.field] = Number(dialog.value)
  } else if (dialog.field === 'defaultPrice') {
    payload[dialog.field] = Number(dialog.value)
  } else {
    payload[dialog.field] = dialog.value
  }
  try {
    await settingsStore.updateSettings(payload)
    uni.showToast({ title: '设置已更新', icon: 'success' })
  } catch (e) {
    // 错误提示在请求层
  } finally {
    dialog.visible = false
  }
}

function showDataStats() {
  const warnCount = studentStore.lowHoursStudents.length
  const msg = `学生总数：${totalStudents.value} 人\n已上课程：${completedCourses.value} 节\n总收益：¥${totalIncome.value}\n课时预警：${warnCount} 人`
  uni.showModal({
    title: '数据统计',
    content: msg,
    showCancel: false
  })
}

function handleClearLocal() {
  uni.showModal({
    title: '清空本地缓存',
    content: '仅清空当前设备缓存数据，不会影响服务器数据。确定继续？',
    success: (res) => {
      if (res.confirm) {
        try {
          uni.clearStorageSync()
          uni.showToast({ title: '已清空', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '清空失败', icon: 'none' })
        }
      }
    }
  })
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
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 600;
  color: #ffffff;
}

.info .name {
  font-size: 34rpx;
  font-weight: 600;
  color: #ffffff;
}

.info .account {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

.stats-row {
  margin: -40rpx 24rpx 16rpx;
  padding: 20rpx 0;
  border-radius: 24rpx;
  background-color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  display: flex;
}

.stat-item {
  flex: 1;
  text-align: center;
  border-right: 1rpx solid #ebedf0;
}

.stat-item:last-child {
  border-right-width: 0;
}

.stat-item .value {
  font-size: 30rpx;
  font-weight: 600;
  color: #1989fa;
}

.stat-item .label {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #969799;
}

.group {
  margin: 8rpx 24rpx 0;
}

.group-title {
  margin: 16rpx 4rpx 8rpx;
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

.dialog-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.dialog {
  width: 620rpx;
  padding: 32rpx 28rpx 24rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
}

.dialog-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #323233;
}

.dialog-input {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  background-color: #f7f8fa;
  font-size: 26rpx;
  color: #323233;
}

.dialog-actions {
  margin-top: 24rpx;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.btn-cancel,
.btn-ok {
  min-width: 120rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
}

.btn-cancel {
  background-color: #f7f8fa;
  color: #323233;
}

.btn-ok {
  background-color: #1989fa;
  color: #ffffff;
}
</style>


