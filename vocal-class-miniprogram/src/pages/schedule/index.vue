<template>
  <scroll-view class="page" scroll-y>
    <view class="filter-bar">
      <view class="range" @tap="toggleRange">
        <text class="range-text">{{ timeRangeText }}</text>
      </view>
    </view>

    <view class="info-bar">
      <text class="date-range">{{ dateRangeText }}</text>
      <text class="total-count">共 {{ totalCoursesCount }} 节课</text>
    </view>

    <view class="content">
      <view v-if="filteredCourses.length === 0" class="empty">
        <text>{{ timeRangeText }}暂无课程</text>
      </view>
      <view
        v-for="(dayCourses, date) in groupedCourses"
        :key="date"
        class="day-section"
      >
        <view class="day-header">
          <text class="date">{{ formatDateHeader(date) }}</text>
          <text class="count">{{ dayCourses.length }}节课</text>
        </view>
        <view class="courses-list">
          <view
            v-for="course in dayCourses"
            :key="course.id"
            class="course-card"
            :class="course.status"
            @tap="openCourseActions(course)"
          >
            <view class="course-time">
              <text class="time">{{ course.startTime }}</text>
              <text class="duration">{{ course.duration }}课时</text>
            </view>
            <view class="course-info">
              <text class="student">{{ course.studentName }}</text>
              <view class="location">
                <text>地点：{{ course.location }}</text>
              </view>
              <text v-if="course.notes" class="notes">{{ course.notes }}</text>
            </view>
            <view class="course-status">
              <text v-if="course.status === 'pending'" class="tag warning">待上课</text>
              <text
                v-else-if="course.status === 'completed' && course.attendanceStatus === 'present'"
                class="tag success"
              >已完成</text>
              <text
                v-else-if="course.status === 'completed' && course.attendanceStatus === 'leave'"
                class="tag warning"
              >已请假</text>
              <text
                v-else-if="course.status === 'completed' && course.attendanceStatus === 'absent'"
                class="tag danger"
              >旷课</text>
              <text v-else class="tag default">已取消</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <button class="add-btn" @tap="showAddMenu = true">
      创建课程
    </button>

    <view v-if="showAddMenu" class="action-sheet-mask" @tap="showAddMenu = false">
      <view class="action-sheet" @tap.stop>
        <view
          class="action-item"
          v-for="item in addActions"
          :key="item.value"
          @tap="onAddSelect(item)"
        >
          <text>{{ item.name }}</text>
        </view>
        <view class="action-cancel" @tap="showAddMenu = false">
          <text>取消</text>
        </view>
      </view>
    </view>

    <view v-if="showCourseDetail" class="action-sheet-mask" @tap="showCourseDetail = false">
      <view class="course-detail-sheet" @tap.stop>
        <view class="course-detail">
          <text class="detail-title">{{ selectedCourse?.studentName }}</text>
          <text class="detail-line">
            时间：{{ selectedCourse?.date }} {{ selectedCourse?.startTime }}-{{ selectedCourse?.endTime }}
          </text>
          <text class="detail-line">
            地点：{{ selectedCourse?.location }}
          </text>
          <text v-if="selectedCourse?.notes" class="detail-line">
            备注：{{ selectedCourse?.notes }}
          </text>
        </view>
        <view class="detail-actions">
          <button v-if="selectedCourse?.status === 'pending'" class="primary-btn" @tap="handleCheckIn('present')">
            签到
          </button>
          <button v-if="selectedCourse?.status === 'pending'" class="secondary-btn" @tap="handleCheckIn('leave')">
            请假
          </button>
          <button v-if="selectedCourse?.status === 'pending'" class="danger-btn" @tap="handleCancel">
            取消课程
          </button>
          <button class="secondary-btn" @tap="showCourseDetail = false">
            关闭
          </button>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCourseStore } from '@/stores/course'
import { useStudentStore } from '@/stores/student'
import { useSettingsStore } from '@/stores/settings'
import dayjs from 'dayjs'

const courseStore = useCourseStore()
const studentStore = useStudentStore()
const settingsStore = useSettingsStore()

const timeRange = ref('thisWeek')
const showAddMenu = ref(false)
const showCourseDetail = ref(false)
const selectedCourse = ref(null)

const addActions = [
  { name: '单次排课', value: 'single' },
  { name: '周期性排课', value: 'recurring' }
]

const timeRangeText = computed(() => {
  switch (timeRange.value) {
    case 'thisWeek':
      return '本周'
    case 'thisMonth':
      return '本月'
    default:
      return '近一月'
  }
})

const dateRange = computed(() => {
  const now = dayjs()
  if (timeRange.value === 'thisWeek') {
    const start = now.startOf('week')
    const end = now.endOf('week')
    return { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') }
  }
  if (timeRange.value === 'thisMonth') {
    const start = now.startOf('month')
    const end = now.endOf('month')
    return { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') }
  }
  const start = now
  const end = now.add(30, 'day')
  return { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') }
})

const dateRangeText = computed(() => {
  const { startDate, endDate } = dateRange.value
  return `${startDate} 至 ${endDate}`
})

const filteredCourses = computed(() => courseStore.courses)

const totalCoursesCount = computed(() => filteredCourses.value.length)

const groupedCourses = computed(() => {
  const groups = {}
  filteredCourses.value.forEach(c => {
    if (!groups[c.date]) groups[c.date] = []
    groups[c.date].push(c)
  })
  Object.keys(groups).forEach(date => {
    groups[date].sort((a, b) => a.startTime.localeCompare(b.startTime))
  })
  return groups
})

function formatDateHeader(date) {
  const d = dayjs(date)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.format('MM月DD日')} 周${weekdays[d.day()]}`
}

async function loadData() {
  const { startDate, endDate } = dateRange.value
  await Promise.all([
    courseStore.fetchCourses({ startDate, endDate }),
    studentStore.fetchStudents(),
    settingsStore.fetchSettings()
  ])
}

function toggleRange() {
  if (timeRange.value === 'thisWeek') {
    timeRange.value = 'thisMonth'
  } else if (timeRange.value === 'thisMonth') {
    timeRange.value = 'recent'
  } else {
    timeRange.value = 'thisWeek'
  }
  loadData()
}

function onAddSelect(action) {
  showAddMenu.value = false
  if (action.value === 'single') {
    uni.navigateTo({ url: '/pages/schedule/add' })
  } else if (action.value === 'recurring') {
    uni.navigateTo({ url: '/pages/schedule/recurring' })
  }
}

function openCourseActions(course) {
  selectedCourse.value = course
  showCourseDetail.value = true
}

async function handleCheckIn(attendanceStatus) {
  if (!selectedCourse.value) return
  const title = attendanceStatus === 'leave' ? '确认请假' : '确认签到'
  const content =
    attendanceStatus === 'leave'
      ? `确认 ${selectedCourse.value.studentName} 请假？请假不扣除课时。`
      : `确认 ${selectedCourse.value.studentName} 已上课并扣除课时吗？`
  uni.showModal({
    title,
    content,
    success: async (res) => {
      if (res.confirm) {
        try {
          await courseStore.signCourse(selectedCourse.value.id, { attendanceStatus })
          await loadData()
          uni.showToast({
            title: attendanceStatus === 'leave' ? '请假成功' : '签到成功',
            icon: 'success'
          })
        } catch (e) {
          // 统一错误处理
        } finally {
          showCourseDetail.value = false
        }
      }
    }
  })
}

async function handleCancel() {
  if (!selectedCourse.value) return
  uni.showModal({
    title: '确认取消',
    content: '确定要取消该课程吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await courseStore.cancelCourse(selectedCourse.value.id, '老师取消')
          await loadData()
          uni.showToast({ title: '已取消', icon: 'success' })
        } catch (e) {
          // 错误提示在请求层
        } finally {
          showCourseDetail.value = false
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

.filter-bar {
  padding: 16rpx 32rpx;
  background-color: #ffffff;
}

.range {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background-color: #f7f8fa;
  display: inline-block;
}

.range-text {
  font-size: 26rpx;
  color: #323233;
}

.info-bar {
  padding: 12rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #ebedf0;
  display: flex;
  justify-content: space-between;
}

.date-range {
  font-size: 24rpx;
  color: #969799;
}

.total-count {
  font-size: 24rpx;
  color: #969799;
}

.content {
  padding: 24rpx 32rpx 120rpx;
}

.empty {
  padding: 40rpx 0;
  text-align: center;
  color: #969799;
}

.day-section {
  margin-bottom: 24rpx;
}

.day-header {
  padding: 8rpx 8rpx 8rpx 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-header .date {
  font-size: 28rpx;
  font-weight: 500;
  color: #323233;
}

.day-header .count {
  font-size: 24rpx;
  color: #969799;
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.course-card {
  padding: 20rpx;
  border-radius: 20rpx;
  background-color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 16rpx;
}

.course-card.pending {
  border-left: 4rpx solid #ff976a;
}

.course-card.completed {
  border-left: 4rpx solid #07c160;
}

.course-card.cancelled {
  border-left: 4rpx solid #c8c9cc;
  opacity: 0.6;
}

.course-time {
  width: 140rpx;
  text-align: center;
}

.course-time .time {
  font-size: 30rpx;
  font-weight: 600;
  color: #1989fa;
}

.course-time .duration {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #969799;
}

.course-info {
  flex: 1;
}

.course-info .student {
  font-size: 28rpx;
  font-weight: 500;
  color: #323233;
}

.course-info .location {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #646566;
}

.course-info .notes {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #969799;
}

.course-status {
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

.tag.default {
  background-color: #f2f3f5;
  color: #646566;
}

.add-btn {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #ff8b7b 0%, #ff6b6b 100%);
  color: #ffffff;
  font-size: 30rpx;
}

.action-sheet-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 999;
}

.action-sheet {
  width: 100%;
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: 24rpx;
}

.action-item {
  padding: 28rpx;
  text-align: center;
  font-size: 30rpx;
  border-bottom: 1rpx solid #f2f3f5;
}

.action-cancel {
  padding: 28rpx;
  text-align: center;
  font-size: 30rpx;
  color: #646566;
}

.course-detail-sheet {
  width: 100%;
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 24rpx 24rpx 40rpx;
}

.course-detail {
  margin-bottom: 24rpx;
}

.detail-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #323233;
}

.detail-line {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #646566;
}

.detail-actions button {
  margin-top: 12rpx;
}

.primary-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  background-color: #07c160;
  color: #ffffff;
  font-size: 28rpx;
}

.secondary-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  background-color: #f7f8fa;
  color: #323233;
  font-size: 28rpx;
}

.danger-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  background-color: #ee0a24;
  color: #ffffff;
  font-size: 28rpx;
}
</style>


