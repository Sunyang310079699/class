<template>
  <scroll-view class="page" scroll-y>
    <view class="greeting">
      <view class="text">
        <text class="title">你好，{{ userName }}！</text>
        <text class="sub">{{ greeting }}</text>
      </view>
    </view>

    <view class="hours-card">
      <view class="icon">📚</view>
      <view class="content">
        <text class="label">剩余课时</text>
        <view class="row">
          <text class="value">{{ studentInfo?.remainingHours || 0 }}</text>
          <text class="unit">课时</text>
        </view>
      </view>
      <view v-if="isLow" class="warn-tag">
        <text>课时不足</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">本周课程</text>
        <text class="section-sub">共 {{ weekCourses.length }} 节</text>
      </view>
      <view v-if="weekCourses.length === 0" class="empty">
        <text>本周暂无课程安排</text>
      </view>
      <view
        v-for="item in weekCourses"
        :key="item.id"
        class="course-item"
        @tap="showCourse(item)"
      >
        <view class="date">
          <text class="day">{{ formatDay(item.date) }}</text>
          <text class="week">{{ formatWeek(item.date) }}</text>
        </view>
        <view class="info">
          <text class="time">{{ item.startTime }} - {{ item.endTime }}</text>
          <text class="location">{{ item.location }}</text>
        </view>
        <view class="status">
          <text v-if="item.status === 'pending'" class="tag warning">待上课</text>
          <text
            v-else-if="item.status === 'completed' && item.attendanceStatus === 'present'"
            class="tag success"
          >已完成</text>
          <text
            v-else-if="item.status === 'completed' && item.attendanceStatus === 'leave'"
            class="tag warning"
          >已请假</text>
          <text
            v-else-if="item.status === 'completed' && item.attendanceStatus === 'absent'"
            class="tag danger"
          >旷课</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { useCourseStore } from '@/stores/course'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const courseStore = useCourseStore()

const studentInfo = ref(null)
const weekCourses = ref([])

const userName = computed(() => authStore.userInfo?.name || '同学')

const isLow = computed(
  () => studentInfo.value && (studentInfo.value.remainingHours || 0) < 3
)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，注意休息'
  if (h < 9) return '早上好，新的一天开始了'
  if (h < 12) return '上午好，今天也要加油哦'
  if (h < 14) return '中午好，记得休息一下'
  if (h < 18) return '下午好，继续努力'
  return '晚上好，今天表现很棒'
})

function formatDay(date) {
  return dayjs(date).format('MM-DD')
}

function formatWeek(date) {
  const w = ['日', '一', '二', '三', '四', '五', '六'][dayjs(date).day()]
  return `周${w}`
}

async function loadData() {
  const me = await studentStore.fetchMyInfo()
  studentInfo.value = me
  const start = dayjs().startOf('week').format('YYYY-MM-DD')
  const end = dayjs().endOf('week').format('YYYY-MM-DD')
  const data = await courseStore.fetchCourses({ startDate: start, endDate: end })
  weekCourses.value = data.courses || []
}

function showCourse(course) {
  const msg =
    `日期：${course.date}\n` +
    `时间：${course.startTime} - ${course.endTime}\n` +
    `地点：${course.location}\n` +
    `状态：${course.status === 'pending' ? '待上课' : '已完成'}` +
    (course.notes ? `\n备注：${course.notes}` : '')
  uni.showModal({
    title: '课程详情',
    content: msg,
    showCancel: false
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

.greeting {
  padding: 40rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
}

.sub {
  margin-top: 8rpx;
  font-size: 24rpx;
  opacity: 0.9;
}

.hours-card {
  margin: -30rpx 24rpx 16rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  position: relative;
}

.hours-card .icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff8b7b 0%, #ff6b6b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #ffffff;
  margin-right: 16rpx;
}

.hours-card .label {
  font-size: 24rpx;
  color: #969799;
}

.hours-card .row {
  display: flex;
  align-items: baseline;
  margin-top: 6rpx;
}

.hours-card .value {
  font-size: 40rpx;
  font-weight: 600;
  color: #323233;
}

.hours-card .unit {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #646566;
}

.warn-tag {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background-color: #fff7cc;
  color: #ff9a3d;
  font-size: 22rpx;
}

.section {
  margin: 8rpx 24rpx 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 500;
}

.section-sub {
  font-size: 24rpx;
  color: #969799;
}

.empty {
  padding: 40rpx 0;
  text-align: center;
  color: #969799;
}

.course-item {
  margin-top: 12rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
}

.course-item .date {
  width: 120rpx;
}

.course-item .day {
  font-size: 28rpx;
  font-weight: 500;
}

.course-item .week {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #969799;
}

.course-item .info {
  flex: 1;
  margin-left: 12rpx;
}

.course-item .time {
  font-size: 26rpx;
  color: #323233;
}

.course-item .location {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #646566;
}

.status {
  margin-left: 8rpx;
}

.tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.tag.warning {
  background-color: #fff7cc;
  color: #ff9a3d;
}

.tag.success {
  background-color: #e8f9e8;
  color: #07c160;
}

.tag.danger {
  background-color: #ffe7e7;
  color: #ee0a24;
}
</style>


