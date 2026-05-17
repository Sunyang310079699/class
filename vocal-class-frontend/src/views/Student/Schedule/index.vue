<template>
  <div class="student-schedule-page">
    <van-nav-bar title="我的课表" fixed placeholder />
    
    <!-- 日期范围显示 -->
    <div class="date-selector">
      <div class="date-info" @click="showCalendar = true">
        <div class="month">{{ monthText }}</div>
        <div class="date-range">{{ dateRangeText }}</div>
      </div>
    </div>
    
    <!-- 课程列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="schedule-content">
        <van-empty v-if="filteredCourses.length === 0" description="近一月暂无课程" />
        
        <div v-for="(dayCourses, date) in groupedCourses" :key="date" class="day-section">
          <div class="day-header">
            <span class="date">{{ formatDateHeader(date) }}</span>
            <span class="count">{{ dayCourses.length }}节课</span>
          </div>
          
          <div class="courses-list">
            <div
              v-for="course in dayCourses"
              :key="course.id"
              class="course-card"
              :class="course.status"
              @click="handleCourseClick(course)"
            >
              <div class="course-time">
                <div class="time">{{ course.startTime }}</div>
                <div class="duration">{{ formatDuration(course.duration) }}</div>
              </div>
              
              <div class="course-info">
                <div class="location">
                  <van-icon name="location-o" />
                  {{ course.location }}
                </div>
                <div v-if="course.notes" class="notes">{{ course.notes }}</div>
              </div>
              
              <div class="course-status">
                <van-tag v-if="course.status === 'pending'" type="warning">待上课</van-tag>
                <van-tag v-else-if="course.status === 'completed' && course.attendanceStatus === 'present'" type="success">已完成</van-tag>
                <van-tag v-else-if="course.status === 'completed' && course.attendanceStatus === 'leave'" type="warning">已请假</van-tag>
                <van-tag v-else-if="course.status === 'completed' && course.attendanceStatus === 'absent'" type="danger">旷课</van-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-pull-refresh>
    
    <!-- 日历选择器 -->
    <van-calendar
      v-model:show="showCalendar"
      @confirm="onCalendarConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCourseStore } from '@/stores/course'
import { getRecentMonth } from '@/utils/date'
import { showDialog } from 'vant'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const courseStore = useCourseStore()

const refreshing = ref(false)
const showCalendar = ref(false)

// 近一月日期范围
const monthRange = computed(() => {
  return getRecentMonth()
})

// 月份文本
const monthText = computed(() => {
  return '近一月课程'
})

// 日期范围文本
const dateRangeText = computed(() => {
  return `${monthRange.value.start} 至 ${monthRange.value.end}`
})

// 课程列表
const courses = ref([])

// 过滤后的课程（仅当前学生的）
// 后端已经根据学生身份自动过滤了，这里直接使用返回的数据
const filteredCourses = computed(() => {
  // 后端已经过滤，直接返回所有课程
  return courses.value
})

// 按日期分组的课程
const groupedCourses = computed(() => {
  const grouped = {}
  filteredCourses.value.forEach(course => {
    const date = course.date
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(course)
  })
  
  // 按日期排序（最新的在前），然后按时间排序
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    return dayjs(b).valueOf() - dayjs(a).valueOf()
  })
  
  const sortedGrouped = {}
  sortedDates.forEach(date => {
    sortedGrouped[date] = grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime))
  })
  
  return sortedGrouped
})

// 格式化课时显示
const formatDuration = (duration) => {
  if (!duration) return '0课时'
  // 如果是整数，直接显示
  if (duration % 1 === 0) {
    return `${duration}课时`
  }
  // 如果是小数，转换为分数形式
  return `${duration}课时`
}

// 加载数据
const loadData = async () => {
  try {
    console.log('加载课程数据:', {
      startDate: monthRange.value.start,
      endDate: monthRange.value.end,
      studentId: authStore.studentId
    })
    
    // 获取近一月课程（不需要传 studentId，后端会自动过滤）
    const data = await courseStore.fetchCourses({
      startDate: monthRange.value.start,
      endDate: monthRange.value.end
    })
    
    console.log('获取到的课程数据:', data)
    courses.value = data.courses || []
    console.log('课程列表:', courses.value.length, '条')
  } catch (error) {
    console.error('加载课程失败:', error)
  }
}

// 下拉刷新
const onRefresh = async () => {
  await loadData()
  refreshing.value = false
}

// 日历确认（选择日期后，重新加载近一月数据）
const onCalendarConfirm = (value) => {
  showCalendar.value = false
  // 选择日期后，仍然显示近一月的数据
  loadData()
}

// 格式化日期标题
const formatDateHeader = (date) => {
  const d = dayjs(date)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.format('MM月DD日')} 周${weekdays[d.day()]}`
}

// 查看课程详情
const handleCourseClick = (course) => {
  showDialog({
    title: '课程详情',
    message: `
      日期：${course.date}
      时间：${course.startTime} - ${course.endTime}
      地点：${course.location}
      状态：${course.status === 'pending' ? '待上课' : '已完成'}
      ${course.notes ? `备注：${course.notes}` : ''}
    `,
    confirmButtonText: '知道了',
    cancelButtonText: '取消'
  })
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.student-schedule-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 70px;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $padding-lg;
  background: white;
  
  .date-info {
    flex: 1;
    text-align: center;
    cursor: pointer;
    
    .month {
      font-size: $font-size-lg;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .date-range {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }
}

.schedule-content {
  padding: $padding-lg;
}

.day-section {
  margin-bottom: $padding-lg;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $padding-md $padding-lg;
  background: white;
  border-radius: $border-radius-lg $border-radius-lg 0 0;
  
  .date {
    font-size: $font-size-md;
    font-weight: bold;
  }
  
  .count {
    font-size: $font-size-sm;
    color: $text-color-secondary;
  }
}

.courses-list {
  background: white;
  border-radius: 0 0 $border-radius-lg $border-radius-lg;
  overflow: hidden;
}

.course-card {
  display: flex;
  align-items: center;
  gap: $padding-md;
  padding: $padding-lg;
  border-bottom: 1px solid $border-color;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: $background-color;
  }
  
  .course-time {
    text-align: center;
    min-width: 60px;
    
    .time {
      font-size: $font-size-lg;
      font-weight: bold;
      color: $primary-color;
    }
    
    .duration {
      font-size: $font-size-xs;
      color: $text-color-secondary;
      margin-top: 2px;
    }
  }
  
  .course-info {
    flex: 1;
    
    .location {
      font-size: $font-size-md;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .notes {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }
}
</style>

