<template>
  <div class="home-page">
    <!-- 顶部问候 -->
    <div class="greeting">
      <div class="greeting-text">
        <h2>你好，老师！</h2>
        <p>{{ greeting }}</p>
      </div>
    </div>

    <!-- 数据卡片 -->
    <div class="stats-cards">
      <div class="stats-card income">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <div class="card-label">本月收益</div>
          <div class="card-value">¥{{ stats.monthIncome }}</div>
        </div>
      </div>
      
      <div class="stats-card course">
        <div class="card-icon">📚</div>
        <div class="card-content">
          <div class="card-label">本月课程</div>
          <div class="card-value">{{ stats.monthCourses }}节</div>
        </div>
      </div>
      
      <div class="stats-card pending">
        <div class="card-icon">✅</div>
        <div class="card-content">
          <div class="card-label">待签到</div>
          <div class="card-value">{{ todayCourses.length }}节</div>
        </div>
      </div>
      
      <div class="stats-card warning" @click="goToLowHoursStudents" :class="{ 'has-warning': lowHoursCount > 0 }">
        <div class="card-icon">⚠️</div>
        <div class="card-content">
          <div class="card-label">课时不足</div>
          <div class="card-value">{{ lowHoursCount }}人</div>
        </div>
        <van-icon v-if="lowHoursCount > 0" name="arrow" class="arrow-icon" />
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-actions">
      <h3 class="section-title">快捷操作</h3>
      <div class="action-grid">
        <div class="action-item" @click="goToAddCourse">
          <div class="action-icon schedule">📅</div>
          <div class="action-name">快速排课</div>
        </div>
        <div class="action-item" @click="goToAddStudent">
          <div class="action-icon student">👥</div>
          <div class="action-name">添加学生</div>
        </div>
        <div class="action-item" @click="goToStudents">
          <div class="action-icon package">💳</div>
          <div class="action-name">购买课时</div>
        </div>
        <div class="action-item" @click="goToIncome">
          <div class="action-icon income">📊</div>
          <div class="action-name">收益统计</div>
        </div>
      </div>
    </div>

    <!-- 今日课程 -->
    <div class="today-courses">
      <h3 class="section-title">
        今日课程 
        <span class="count">({{ todayCourses.length }}节)</span>
      </h3>
      
      <van-empty 
        v-if="todayCourses.length === 0" 
        description="今天没有课程安排"
      />
      
      <div v-else class="course-list">
        <div 
          v-for="course in todayCourses" 
          :key="course.id"
          class="course-item"
          @click="handleCourseClick(course)"
        >
          <div class="course-time">
            <div class="time">{{ course.startTime }}</div>
            <div class="duration">{{ formatDuration(course.duration) }}</div>
          </div>
          <div class="course-info">
            <div class="student-name">{{ course.studentName }}</div>
            <div class="location">{{ course.location }}</div>
          </div>
          <div class="course-action">
            <template v-if="course.status === 'pending'">
              <van-button 
                type="primary" 
                size="small"
                style="margin-right: 8px;"
                @click.stop="handleCheckIn(course, 'present')"
              >
                签到
              </van-button>
              <van-button 
                type="warning" 
                size="small"
                @click.stop="handleCheckIn(course, 'leave')"
              >
                请假
              </van-button>
            </template>
            <van-tag v-else-if="course.status === 'completed' && course.attendanceStatus === 'present'" type="success">已完成</van-tag>
            <van-tag v-else-if="course.status === 'completed' && course.attendanceStatus === 'leave'" type="warning">已请假</van-tag>
            <van-tag v-else-if="course.status === 'completed' && course.attendanceStatus === 'absent'" type="danger">旷课</van-tag>
            <van-tag v-else type="default">已取消</van-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 课时预警 -->
    <div v-if="lowHoursStudents.length > 0" class="low-hours-alert">
      <h3 class="section-title">课时预警</h3>
      <div class="alert-list">
        <div 
          v-for="student in lowHoursStudents" 
          :key="student.id"
          class="alert-item"
          @click="goToStudentDetail(student.id)"
        >
          <van-icon name="warning-o" color="#ff976a" />
          <span class="student-name">{{ student.name }}</span>
          <span class="hours">剩余 {{ student.remainingHours }} 课时</span>
          <van-icon name="arrow" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { useStudentStore } from '@/stores/student'
import { getDashboardStats } from '@/api/statistics'
import { getToday } from '@/utils/date'
import { showToast, showDialog, showConfirmDialog } from 'vant'

const router = useRouter()
const courseStore = useCourseStore()
const studentStore = useStudentStore()

// 数据
const stats = ref({
  monthIncome: 0, // 本月收益（根据课程数计算）
  todayCourses: 0,
  pendingCourses: 0,
  lowHoursStudents: 0,
  totalStudents: 0,
  monthCourses: 0
})

// 今日课程
const todayCourses = computed(() => {
  return courseStore.courses.filter(c => c.date === getToday())
})

// 课时不足的学生
const lowHoursStudents = computed(() => {
  return studentStore.lowHoursStudents
})

const lowHoursCount = computed(() => {
  return lowHoursStudents.value.length
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

// 格式化课时显示
const formatDuration = (duration) => {
  if (!duration) return '0课时'
  // 如果是整数，直接显示
  if (duration % 1 === 0) {
    return `${duration}课时`
  }
  // 如果是小数，转换为分数形式
  // 例如：0.5 -> 0.5课时，0.75 -> 0.75课时
  return `${duration}课时`
}

// 加载数据
const loadData = async () => {
  try {
    // 加载学生列表
    await studentStore.fetchStudents()
    
    // 加载课程列表
    await courseStore.fetchCourses()
    
    // 加载首页统计数据（包含本月收益）
    const dashboardStats = await getDashboardStats()
    stats.value.monthIncome = dashboardStats.monthIncome // 本月收益（根据课程数计算）
    stats.value.todayCourses = dashboardStats.todayCourses
    stats.value.pendingCourses = dashboardStats.pendingCourses
    stats.value.lowHoursStudents = dashboardStats.lowHoursStudents
    stats.value.totalStudents = dashboardStats.totalStudents
    stats.value.monthCourses = dashboardStats.monthCourses
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 签到
const handleCheckIn = async (course, attendanceStatus = 'present') => {
  try {
    const isLeave = attendanceStatus === 'leave'
    const title = isLeave ? '确认请假' : '确认签到'
    const message = isLeave 
      ? `确认 ${course.studentName} 请假？请假不扣除课时。`
      : `确认 ${course.studentName} 已上课？\n将扣除 ${course.duration} 课时`
    
    await showConfirmDialog({
      title,
      message
    })
    
    await courseStore.checkIn(course.id, { 
      attendanceStatus,
      notes: isLeave ? '学生请假' : ''
    })
    await studentStore.fetchStudents()
    
    showToast(isLeave ? '请假记录成功' : '签到成功')
    
    // 只有出席时才检查课时预警
    if (attendanceStatus === 'present') {
      const student = studentStore.students.find(s => s.id === course.studentId)
      if (student && student.remainingHours < 3) {
        setTimeout(() => {
          showDialog({
            title: '⚠️ 课时预警',
            message: `${student.name} 剩余课时不足 3 节，建议提醒续费。\n\n当前剩余：${student.remainingHours} 课时`,
            confirmButtonText: '立即购买',
            cancelButtonText: '稍后处理'
          }).then(() => {
            // 跳转到学生详情页的购买课时功能
            router.push({
              path: `/students/${student.id}`,
              query: { action: 'purchase' }
            })
          }).catch(() => {
            // 用户选择稍后处理，不做任何操作
          })
        }, 1000)
      }
    }
    
    // 刷新数据
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      showToast(attendanceStatus === 'leave' ? '请假记录失败' : '签到失败')
    }
  }
}

// 查看课程详情
const handleCourseClick = (course) => {
  showDialog({
    title: '课程详情',
    message: `
     学生：${course.studentName}
     时间：${course.date} ${course.startTime}-${course.endTime}
     地点：${course.location}
     备注：${course.notes || '无'}
    `,
    confirmButtonText: '知道了',
    cancelButtonText: '取消'
  })
}

// 导航
const goToAddCourse = () => {
  router.push('/schedule/add')
}

const goToAddStudent = () => {
  router.push('/students/add')
}

const goToStudents = () => {
  router.push('/students')
}

const goToIncome = () => {
  router.push('/income')
}

const goToStudentDetail = (id) => {
  router.push(`/students/${id}`)
}

const goToLowHoursStudents = () => {
  if (lowHoursCount.value > 0) {
    router.push({
      path: '/students',
      query: { filter: 'lowHours' }
    })
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.home-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 70px;
}

.greeting {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: $padding-xxl $padding-lg;
  
  h2 {
    font-size: $font-size-xxl;
    margin-bottom: $padding-xs;
  }
  
  p {
    font-size: $font-size-md;
    opacity: 0.9;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $padding-md;
  padding: $padding-lg;
  margin-top: -30px;
}

.stats-card {
  background: white;
  border-radius: $border-radius-lg;
  padding: $padding-lg;
  box-shadow: $box-shadow-sm;
  display: flex;
  align-items: center;
  gap: $padding-md;
  position: relative;
  transition: all 0.3s;
  
  &.income {
    background: $income-gradient;
    color: white;
  }
  
  &.course {
    background: $schedule-gradient;
    color: white;
  }
  
  &.pending {
    background: $class-gradient;
    color: white;
  }
  
  &.warning {
    background: $record-gradient;
    color: white;
    cursor: pointer;
    
    &.has-warning {
      animation: pulse 2s infinite;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  .card-icon {
    font-size: 32px;
  }
  
  .card-content {
    flex: 1;
  }
  
  .card-label {
    font-size: $font-size-sm;
    opacity: 0.9;
    margin-bottom: 4px;
  }
  
  .card-value {
    font-size: $font-size-xl;
    font-weight: bold;
  }
  
  .arrow-icon {
    margin-left: auto;
    font-size: 16px;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: $box-shadow-sm;
  }
  50% {
    box-shadow: 0 4px 20px rgba(255, 168, 168, 0.5);
  }
}

.quick-actions {
  padding: 0 $padding-lg $padding-lg;
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

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $padding-md;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $padding-sm;
  cursor: pointer;
  
  .action-icon {
    width: 50px;
    height: 50px;
    border-radius: $border-radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    
    &.schedule {
      background: linear-gradient(135deg, #FFB366, #FF9A3D);
    }
    
    &.student {
      background: linear-gradient(135deg, #FF8B7B, #FF6B6B);
    }
    
    &.package {
      background: linear-gradient(135deg, #00D4AA, #00C896);
    }
    
    &.income {
      background: linear-gradient(135deg, #A17FFF, #8B5FFF);
    }
  }
  
  .action-name {
    font-size: $font-size-sm;
    color: $text-color;
  }
}

.today-courses,
.low-hours-alert {
  padding: 0 $padding-lg $padding-lg;
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
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: $background-color;
  }
  
  .course-time {
    text-align: center;
    
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
    
    .student-name {
      font-size: $font-size-md;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .location {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }
}

.alert-list {
  background: white;
  border-radius: $border-radius-lg;
  overflow: hidden;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: $padding-md;
  padding: $padding-md $padding-lg;
  border-bottom: 1px solid $border-color;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: $background-color;
  }
  
  .student-name {
    flex: 1;
    font-size: $font-size-md;
  }
  
  .hours {
    font-size: $font-size-sm;
    color: $warning-color;
    font-weight: bold;
  }
}
</style>

