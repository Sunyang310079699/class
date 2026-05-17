<template>
  <scroll-view class="page" scroll-y>
    <view class="header">
      <view class="title-row">
        <text class="title">今日概览</text>
        <text class="subtitle">课程与收益一目了然</text>
      </view>
      <view class="summary-cards">
        <view class="card income-card">
          <text class="label">今日收益</text>
          <text class="value">¥{{ dashboard?.todayIncome || 0 }}</text>
        </view>
        <view class="card course-card">
          <text class="label">今日课程</text>
          <text class="value">{{ dashboard?.todayCourses || 0 }}</text>
        </view>
      </view>
    </view>

    <view class="quick-actions">
      <view class="action" @tap="goTo('/pages/schedule/add')">
        <text class="icon">📅</text>
        <text class="text">快速排课</text>
      </view>
      <view class="action" @tap="goTo('/pages/students/add')">
        <text class="icon">👤</text>
        <text class="text">添加学生</text>
      </view>
      <view class="action" @tap="goTo('/pages/income/index')">
        <text class="icon">💰</text>
        <text class="text">查看收益</text>
      </view>
      <view class="action" @tap="goTo('/pages/students/index')">
        <text class="icon">📚</text>
        <text class="text">学生管理</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">今日待签到</text>
        <text class="section-sub">共 {{ todayCourses.length }} 节课</text>
      </view>
      <view v-if="todayCourses.length === 0" class="empty">
        <text>今天还没有课程安排</text>
      </view>
      <view v-else class="course-list">
        <view
          v-for="item in todayCourses"
          :key="item.id"
          class="course-item"
        >
          <view class="time">
            <text>{{ item.startTime }} - {{ item.endTime }}</text>
          </view>
          <view class="info">
            <text class="name">{{ item.studentName }}</text>
            <text class="status" :class="item.status">{{ mapStatus(item.status) }}</text>
          </view>
          <button
            v-if="item.status === 'pending'"
            class="sign-btn"
            size="mini"
            @tap="signCourse(item)"
          >
            签到
          </button>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">课时预警</text>
        <text class="section-sub">{{ lowHoursStudents.length }} 人课时不足</text>
      </view>
      <view v-if="lowHoursStudents.length === 0" class="empty">
        <text>暂无课时不足的学生</text>
      </view>
      <view v-else class="warning-list">
        <view
          v-for="s in lowHoursStudents"
          :key="s.id || s._id"
          class="warning-item"
          @tap="openStudentDetail(s)"
        >
          <text class="name">{{ s.name }}</text>
          <text class="hours">剩余 {{ s.remainingHours }} 课时</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCourseStore } from '@/stores/course'
import { useStudentStore } from '@/stores/student'
import { useStatisticsStore } from '@/stores/statistics'

const courseStore = useCourseStore()
const studentStore = useStudentStore()
const statisticsStore = useStatisticsStore()

const todayCourses = computed(() => courseStore.todayCourses)
const dashboard = computed(() => statisticsStore.dashboard)
const lowHoursStudents = computed(() => studentStore.lowHoursStudents)

function mapStatus(status) {
  if (status === 'completed') return '已完成'
  if (status === 'cancelled') return '已取消'
  return '待上课'
}

async function loadData() {
  await Promise.all([
    courseStore.fetchTodayCourses(),
    statisticsStore.fetchDashboard(),
    studentStore.fetchStudents()
  ])
}

function goTo(url) {
  uni.navigateTo({ url })
}

function openStudentDetail(student) {
  const id = student.id || student._id
  if (!id) return
  uni.navigateTo({
    url: `/pages/students/detail?id=${id}`
  })
}

function signCourse(course) {
  uni.showModal({
    title: '签到确认',
    content: `确认为 ${course.studentName} 签到并扣除课时吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await courseStore.signCourse(course.id, { attendanceStatus: 'present' })
          await loadData()
          uni.showToast({ title: '签到成功', icon: 'success' })
        } catch (e) {
          // 错误在请求层已提示
        }
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

.header {
  padding: 40rpx 32rpx 20rpx;
}

.title-row {
  margin-bottom: 24rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #323233;
}

.subtitle {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #969799;
}

.summary-cards {
  display: flex;
  gap: 24rpx;
}

.card {
  flex: 1;
  padding: 24rpx;
  border-radius: 24rpx;
  color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.income-card {
  background: linear-gradient(135deg, #a17fff 0%, #8b5fff 100%);
}

.course-card {
  background: linear-gradient(135deg, #ffb366 0%, #ff9a3d 100%);
}

.label {
  font-size: 24rpx;
  opacity: 0.9;
}

.value {
  margin-top: 16rpx;
  font-size: 36rpx;
  font-weight: 600;
}

.quick-actions {
  margin: 0 32rpx 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.action {
  width: 48%;
  margin-bottom: 24rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background-color: #f7f8fa;
  display: flex;
  align-items: center;
}

.icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.text {
  font-size: 26rpx;
  color: #323233;
}

.section {
  margin: 0 32rpx 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #323233;
}

.section-sub {
  font-size: 24rpx;
  color: #969799;
}

.empty {
  padding: 32rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #969799;
}

.course-list .course-item {
  padding: 16rpx 0;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f0f0f0;
}

.course-item:last-child {
  border-bottom-width: 0;
}

.time {
  width: 180rpx;
  font-size: 26rpx;
  color: #646566;
}

.info {
  flex: 1;
}

.info .name {
  display: block;
  font-size: 28rpx;
  color: #323233;
}

.status {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #ff9a3d;
}

.status.completed {
  color: #07c160;
}

.status.cancelled {
  color: #969799;
}

.sign-btn {
  padding: 0 24rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #7fd426 0%, #6ac021 100%);
  color: #ffffff;
  font-size: 26rpx;
}

.warning-list .warning-item {
  padding: 16rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f0f0f0;
}

.warning-item:last-child {
  border-bottom-width: 0;
}

.warning-item .name {
  font-size: 28rpx;
  color: #323233;
}

.warning-item .hours {
  font-size: 24rpx;
  color: #ee0a24;
}
</style>


