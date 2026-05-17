<template>
  <scroll-view class="page" scroll-y>
    <view class="header">
      <text class="title">我的课表</text>
      <text class="sub">{{ dateRangeText }}</text>
    </view>

    <view v-if="courses.length === 0" class="empty">
      <text>近一月暂无课程</text>
    </view>

    <view
      v-for="(dayCourses, date) in grouped"
      :key="date"
      class="day-section"
    >
      <view class="day-header">
        <text class="date">{{ formatDateHeader(date) }}</text>
        <text class="count">{{ dayCourses.length }} 节</text>
      </view>
      <view class="list">
        <view
          v-for="c in dayCourses"
          :key="c.id"
          class="course-card"
          @tap="showCourse(c)"
        >
          <view class="time">
            <text class="main">{{ c.startTime }} - {{ c.endTime }}</text>
            <text class="duration">{{ c.duration }}课时</text>
          </view>
          <view class="info">
            <text class="location">{{ c.location }}</text>
            <text v-if="c.notes" class="notes">{{ c.notes }}</text>
          </view>
          <view class="status">
            <text v-if="c.status === 'pending'" class="tag warning">待上课</text>
            <text
              v-else-if="c.status === 'completed' && c.attendanceStatus === 'present'"
              class="tag success"
            >已完成</text>
            <text
              v-else-if="c.status === 'completed' && c.attendanceStatus === 'leave'"
              class="tag warning"
            >已请假</text>
            <text
              v-else-if="c.status === 'completed' && c.attendanceStatus === 'absent'"
              class="tag danger"
            >旷课</text>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCourseStore } from '@/stores/course'
import dayjs from 'dayjs'

const courseStore = useCourseStore()
const courses = ref([])

const range = computed(() => {
  const start = dayjs().subtract(15, 'day')
  const end = dayjs().add(15, 'day')
  return {
    start,
    end,
    startText: start.format('YYYY-MM-DD'),
    endText: end.format('YYYY-MM-DD')
  }
})

const dateRangeText = computed(() => {
  return `${range.value.startText} 至 ${range.value.endText}`
})

const grouped = computed(() => {
  const map = {}
  courses.value.forEach((c) => {
    if (!map[c.date]) map[c.date] = []
    map[c.date].push(c)
  })
  Object.keys(map).forEach((d) => {
    map[d].sort((a, b) => a.startTime.localeCompare(b.startTime))
  })
  return map
})

function formatDateHeader(date) {
  const d = dayjs(date)
  const w = ['日', '一', '二', '三', '四', '五', '六'][d.day()]
  return `${d.format('MM月DD日')} 周${w}`
}

async function loadData() {
  const data = await courseStore.fetchCourses({
    startDate: range.value.startText,
    endDate: range.value.endText
  })
  courses.value = data.courses || []
}

function showCourse(c) {
  const msg =
    `日期：${c.date}\n` +
    `时间：${c.startTime} - ${c.endTime}\n` +
    `地点：${c.location}` +
    (c.notes ? `\n备注：${c.notes}` : '')
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

.header {
  padding: 32rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #323233;
}

.sub {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #969799;
}

.empty {
  padding: 40rpx 32rpx;
  text-align: center;
  color: #969799;
}

.day-section {
  margin: 0 24rpx 16rpx;
}

.day-header {
  padding: 8rpx;
  display: flex;
  justify-content: space-between;
}

.day-header .date {
  font-size: 28rpx;
  font-weight: 500;
}

.day-header .count {
  font-size: 24rpx;
  color: #969799;
}

.list {
  margin-top: 8rpx;
}

.course-card {
  margin-bottom: 12rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background-color: #ffffff;
  display: flex;
  gap: 12rpx;
}

.time {
  width: 160rpx;
}

.time .main {
  font-size: 28rpx;
  font-weight: 500;
}

.time .duration {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #969799;
}

.info {
  flex: 1;
}

.info .location {
  font-size: 26rpx;
  color: #323233;
}

.info .notes {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #969799;
}

.status {
  justify-content: center;
  align-items: center;
  display: flex;
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


