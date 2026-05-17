<template>
  <div class="student-home-page">
    <!-- 顶部问候 -->
    <div class="greeting">
      <div class="greeting-text">
        <h2>你好，{{ userName }}！</h2>
        <p>{{ greeting }}</p>
      </div>
    </div>

    <!-- 剩余课时卡片 -->
    <div class="hours-card">
      <div class="card-icon">📚</div>
      <div class="card-content">
        <div class="card-label">剩余课时</div>
        <div class="card-value">{{ studentInfo?.remainingHours || 0 }}</div>
        <div class="card-unit">课时</div>
      </div>
      <van-tag v-if="isLowHours" type="warning" class="warning-tag">
        课时不足
      </van-tag>
    </div>

    <!-- 近一月课程 -->
    <div class="month-courses">
      <h3 class="section-title">
        近一月课程
        <span class="count">({{ monthCourses.length }}节)</span>
      </h3>
      
      <van-empty 
        v-if="monthCourses.length === 0" 
        description="近一月暂无课程安排"
      />
      
      <div v-else class="course-list">
        <div 
          v-for="course in monthCourses" 
          :key="course.id"
          class="course-item"
          @click="handleCourseClick(course)"
        >
          <div class="course-date">
            <div class="date">{{ formatDate(course.date) }}</div>
            <div class="weekday">{{ getWeekday(course.date) }}</div>
          </div>
          <div class="course-info">
            <div class="time">{{ course.startTime }} - {{ course.endTime }}</div>
            <div class="location">
              <van-icon name="location-o" />
              {{ course.location }}
            </div>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { useCourseStore } from '@/stores/course'
import { getRecentMonth } from '@/utils/date'
import { showDialog } from 'vant'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const courseStore = useCourseStore()

const studentInfo = ref(null)
const monthCourses = ref([])

const userName = computed(() => authStore.userName)

// 课时是否不足
const isLowHours = computed(() => {
  return studentInfo.value && studentInfo.value.remainingHours < 3
})

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，注意休息'
  if (hour < 9) return '早上好，新的一天开始了'
  if (hour < 12) return '上午好，今天也要加油哦'
  if (hour < 14) return '中午好，记得休息一下'
  if (hour < 17) return '下午好，继续努力'
  if (hour < 19) return '傍晚好，一天辛苦了'
  return '晚上好，今天表现很棒'
})

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}

// 获取星期
const getWeekday = (date) => {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `周${weekdays[dayjs(date).day()]}`
}

// 加载数据
const loadData = async () => {
  try {
    // 获取学生信息（使用学生端 API）
    const student = await studentStore.fetchMyInfo()
    studentInfo.value = student
    
    // 获取近一月课程（不需要传 studentId，后端会自动过滤）
    const monthRange = getRecentMonth()
    const courses = await courseStore.fetchCourses({
      startDate: monthRange.start,
      endDate: monthRange.end
    })
    
    // 按日期排序，最新的在前
    monthCourses.value = (courses.courses || []).sort((a, b) => {
      return dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    })
  } catch (error) {
    console.error('加载数据失败:', error)
  }
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

.student-home-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 70px;
}

.greeting {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 45px 16px;
  
  h2 {
    font-size: $font-size-xxl;
    margin-bottom: $padding-xs;
  }
  
  p {
    font-size: $font-size-md;
    opacity: 0.9;
  }
}

.hours-card {
  // 毛玻璃半透明背景效果
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: $border-radius-lg;
  padding: $padding-xl;
  margin: -30px $padding-lg 0; // 移除底部 margin，避免与下方内容重叠
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  gap: $padding-lg;
  position: relative;
  z-index: 1;
  
  .card-icon {
    font-size: 48px;
    flex-shrink: 0;
  }
  
  .card-content {
    flex: 1;
    min-width: 0; // 防止内容溢出
    
    .card-label {
      font-size: $font-size-sm;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .card-value {
      font-size: 36px;
      font-weight: bold;
      color: $primary-color;
      line-height: 1;
      margin-bottom: 2px;
    }
    
    .card-unit {
      font-size: $font-size-sm;
      color: rgba(0, 0, 0, 0.6);
    }
  }
  
  .warning-tag {
    position: absolute;
    top: $padding-md;
    right: $padding-md;
    flex-shrink: 0;
  }
}

.month-courses {
  padding: 0 $padding-lg $padding-lg;
  margin-top: $padding-md; // 确保与上方卡片有间距，避免遮盖
}

.section-title {
  font-size: $font-size-lg;
  font-weight: bold;
  margin-bottom: $padding-md;
  
  .count {
    font-size: $font-size-sm;
    color: $text-color-secondary;
    font-weight: normal;
  }
}

.course-list {
  background: white;
  border-radius: $border-radius-lg;
  overflow: hidden;
}

.course-item {
  display: flex;
  align-items: center;
  gap: $padding-md;
  padding: $padding-lg;
  border-bottom: 1px solid $border-color;
  cursor: pointer;
  position: relative;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: $background-color;
  }
  
  .course-date {
    text-align: center;
    min-width: 60px;
    flex-shrink: 0;
    
    .date {
      font-size: $font-size-lg;
      font-weight: bold;
      color: $primary-color;
      line-height: 1.2;
    }
    
    .weekday {
      font-size: $font-size-xs;
      color: $text-color-secondary;
      margin-top: 4px;
      line-height: 1.2;
    }
  }
  
  .course-info {
    flex: 1;
    min-width: 0; // 防止内容溢出
    
    .time {
      font-size: $font-size-md;
      font-weight: bold;
      margin-bottom: 4px;
      line-height: 1.3;
    }
    
    .location {
      font-size: $font-size-sm;
      color: $text-color-secondary;
      display: flex;
      align-items: center;
      gap: 4px;
      line-height: 1.3;
    }
  }
  
  .course-status {
    flex-shrink: 0;
    margin-left: auto;
  }
}
</style>

