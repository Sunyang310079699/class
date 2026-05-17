<template>
  <div class="schedule-page">
    <van-nav-bar title="课表" fixed placeholder />
    
    <!-- 筛选栏（合并到一行） -->
    <div class="filter-bar">
      <van-dropdown-menu>
        <van-dropdown-item v-model="timeRange" :options="timeRangeOptions" @change="onTimeRangeChange" />
        <van-dropdown-item 
          v-model="filterStudentId" 
          :options="studentOptions" 
          :title="studentFilterTitle"
          @change="onStudentFilterChange"
        />
        <van-dropdown-item 
          v-model="filterStatus" 
          :options="statusOptions" 
          :title="statusFilterTitle"
          @change="onStatusFilterChange"
        />
      </van-dropdown-menu>
    </div>
    
    <!-- 时间和课程数信息 -->
    <div class="info-bar">
      <span class="date-range">{{ timeRangeText }}</span>
      <span class="total-count">共 {{ totalCoursesCount }} 节课</span>
    </div>
    
    <!-- 课程列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="schedule-content">
        <van-empty v-if="filteredCourses.length === 0" :description="`${timeRangeText}暂无课程`" />
        
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
              :data-attendance="course.attendanceStatus"
              @click="handleCourseClick(course)"
            >
              <div class="course-time">
                <div class="time">{{ course.startTime }}</div>
                <div class="duration">{{ course.duration }}课时</div>
              </div>
              
              <div class="course-info">
                <div class="student-name">
                  {{ course.studentName }}
                  <van-tag 
                    v-if="course.courseType === 'temporary'" 
                    type="primary" 
                    size="mini"
                    style="margin-left: 8px;"
                  >
                    临时
                  </van-tag>
                </div>
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
                <van-tag v-else type="default">已取消</van-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-pull-refresh>
    
    <!-- 添加按钮 -->
    <van-button
      type="primary"
      size="large"
      round
      class="add-btn"
      @click="showAddMenu = true"
    >
      <van-icon name="plus" />
      创建课程
    </van-button>
    
    <!-- 添加菜单 -->
    <van-action-sheet
      v-model:show="showAddMenu"
      :actions="addActions"
      cancel-text="取消"
      close-on-click-action
      @select="onAddSelect"
    />
    
    
    <!-- 课程详情弹窗 -->
    <van-action-sheet
      v-model:show="showCourseDetail"
      :actions="courseActions"
      cancel-text="取消"
      @select="onActionSelect"
    >
      <template #description>
        <div class="course-detail">
          <h3>{{ selectedCourse?.studentName }}</h3>
          <p>时间：{{ selectedCourse?.date }} {{ selectedCourse?.startTime }}-{{ selectedCourse?.endTime }}</p>
          <p>地点：{{ selectedCourse?.location }}</p>
          <p v-if="selectedCourse?.notes">备注：{{ selectedCourse?.notes }}</p>
        </div>
      </template>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { useStudentStore } from '@/stores/student'
import { formatDate } from '@/utils/date'
import { showToast, showDialog, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()
const courseStore = useCourseStore()
const studentStore = useStudentStore()

const refreshing = ref(false)
const filterStatus = ref('all')
const filterStudentId = ref('all')
const timeRange = ref('thisWeek') // 默认本周
const showCalendar = ref(false)
const showAddMenu = ref(false)

// 状态筛选选项
const statusOptions = [
  { text: '全部', value: 'all' },
  { text: '待上课', value: 'pending' },
  { text: '已完成', value: 'completed' },
  { text: '已请假', value: 'leave' },
  { text: '已取消', value: 'cancelled' }
]

// 状态筛选标题（显示当前选中的状态）
const statusFilterTitle = computed(() => {
  if (filterStatus.value === 'all') {
    return '状态筛选'
  }
  const selectedOption = statusOptions.find(opt => opt.value === filterStatus.value)
  return selectedOption ? selectedOption.text : '状态筛选'
})

// 学生筛选标题（显示当前选中的学生）
const studentFilterTitle = computed(() => {
  if (filterStudentId.value === 'all') {
    return '学生筛选'
  }
  const selectedStudent = studentStore.students.find(s => s.id === filterStudentId.value)
  return selectedStudent ? selectedStudent.name : '学生筛选'
})

const addActions = [
  { name: '单次排课', icon: 'add-o', value: 'single' },
  { name: '周期性排课', icon: 'replay', value: 'recurring' },
  { name: '生成下周课程', icon: 'calendar-o', value: 'generate' }
]
const showCourseDetail = ref(false)
const selectedCourse = ref(null)

// 时间范围选项
const timeRangeOptions = [
  { text: '本周', value: 'thisWeek' },
  { text: '本月', value: 'thisMonth' },
  { text: '近一月', value: 'lastMonth' },
  { text: '上周', value: 'lastWeek' },
  { text: '上月', value: 'lastMonthOnly' }
]

// 学生选项
const studentOptions = computed(() => {
  const options = [{ text: '全部学生', value: 'all' }]
  studentStore.students.forEach(student => {
    options.push({
      text: student.name,
      value: student.id
    })
  })
  return options
})

// 时间范围文本
const timeRangeText = computed(() => {
  const now = dayjs()
  switch (timeRange.value) {
    case 'thisWeek':
      const weekStart = now.startOf('week')
      const weekEnd = weekStart.add(6, 'day')
      return `${weekStart.format('MM/DD')} - ${weekEnd.format('MM/DD')}`
    case 'thisMonth':
      return `${now.format('YYYY年MM月')}`
    case 'lastMonth':
      const lastMonthStart = now
      const lastMonthEnd = now.add(30, 'day')
      return `${lastMonthStart.format('MM/DD')} - ${lastMonthEnd.format('MM/DD')}`
    case 'lastWeek':
      const lastWeekStart = now.subtract(1, 'week').startOf('week')
      const lastWeekEnd = lastWeekStart.add(6, 'day')
      return `${lastWeekStart.format('MM/DD')} - ${lastWeekEnd.format('MM/DD')}`
    case 'lastMonthOnly':
      const prevMonth = now.subtract(1, 'month')
      return `${prevMonth.format('YYYY年MM月')}`
    default:
      return ''
  }
})

// 获取时间范围的开始和结束日期
const getDateRange = computed(() => {
  const now = dayjs()
  let startDate, endDate
  
  switch (timeRange.value) {
    case 'thisWeek':
      startDate = now.startOf('week').format('YYYY-MM-DD')
      endDate = now.endOf('week').format('YYYY-MM-DD')
      break
    case 'thisMonth':
      startDate = now.startOf('month').format('YYYY-MM-DD')
      endDate = now.endOf('month').format('YYYY-MM-DD')
      break
    case 'lastMonth':
      startDate = now.format('YYYY-MM-DD')
      endDate = now.add(30, 'day').format('YYYY-MM-DD')
      break
    case 'lastWeek':
      startDate = now.subtract(1, 'week').startOf('week').format('YYYY-MM-DD')
      endDate = now.subtract(1, 'week').endOf('week').format('YYYY-MM-DD')
      break
    case 'lastMonthOnly':
      const prevMonth = now.subtract(1, 'month')
      startDate = prevMonth.startOf('month').format('YYYY-MM-DD')
      endDate = prevMonth.endOf('month').format('YYYY-MM-DD')
      break
    default:
      startDate = now.startOf('week').format('YYYY-MM-DD')
      endDate = now.endOf('week').format('YYYY-MM-DD')
  }
  
  return { startDate, endDate }
})

// 当前时间范围内的课程（从store中筛选）
const rangeCourses = computed(() => {
  const { startDate, endDate } = getDateRange.value
  
  // 如果store中没有课程数据，返回空数组
  if (!courseStore.courses || courseStore.courses.length === 0) {
    return []
  }
  
  return courseStore.courses.filter(c => 
    c.date >= startDate && c.date <= endDate
  )
})

// 过滤后的课程
const filteredCourses = computed(() => {
  let courses = rangeCourses.value
  
  // 学生筛选
  if (filterStudentId.value !== 'all') {
    courses = courses.filter(c => c.studentId === filterStudentId.value)
  }
  
  // 状态筛选
  if (filterStatus.value === 'all') {
    // 显示所有课程，包括已取消的
    return courses
  } else if (filterStatus.value === 'leave') {
    // 筛选已请假的课程（attendanceStatus === 'leave'）
    return courses.filter(c => c.attendanceStatus === 'leave')
  } else if (filterStatus.value === 'cancelled') {
    // 筛选已取消的课程
    return courses.filter(c => c.status === 'cancelled')
  } else {
    // 根据状态筛选（pending 或 completed）
    return courses.filter(c => c.status === filterStatus.value)
  }
})

// 课程总数（不包含已请假的课程）
const totalCoursesCount = computed(() => {
  let courses = rangeCourses.value
  
  // 学生筛选
  if (filterStudentId.value !== 'all') {
    courses = courses.filter(c => c.studentId === filterStudentId.value)
  }
  
  // 排除已请假的课程
  return courses.filter(c => c.attendanceStatus !== 'leave').length
})

// 状态筛选改变
const onStatusFilterChange = () => {
  // 筛选逻辑在 computed 中处理
}

// 按日期分组的课程
const groupedCourses = computed(() => {
  const groups = {}
  
  filteredCourses.value.forEach(course => {
    if (!groups[course.date]) {
      groups[course.date] = []
    }
    groups[course.date].push(course)
  })
  
  // 排序每天的课程
  Object.keys(groups).forEach(date => {
    groups[date].sort((a, b) => a.startTime.localeCompare(b.startTime))
  })
  
  return groups
})

// 课程操作
const courseActions = computed(() => {
  const actions = []
  
  if (selectedCourse.value?.status === 'pending') {
    actions.push({ name: '签到', color: '#07c160' })
    actions.push({ name: '请假', color: '#ff9800' })
    actions.push({ name: '编辑' })
    actions.push({ name: '取消课程', color: '#ee0a24' })
  } else if (selectedCourse.value?.status === 'cancelled') {
    actions.push({ name: '查看详情' })
  } else {
    actions.push({ name: '查看详情' })
  }
  
  return actions
})

// 格式化日期标题
const formatDateHeader = (date) => {
  const d = dayjs(date)
  const today = dayjs()
  
  if (d.isSame(today, 'day')) {
    return `今天 ${d.format('MM月DD日')} 周${['日', '一', '二', '三', '四', '五', '六'][d.day()]}`
  } else if (d.isSame(today.add(1, 'day'), 'day')) {
    return `明天 ${d.format('MM月DD日')} 周${['日', '一', '二', '三', '四', '五', '六'][d.day()]}`
  } else {
    return `${d.format('MM月DD日')} 周${['日', '一', '二', '三', '四', '五', '六'][d.day()]}`
  }
}

// 加载数据
const loadData = async () => {
  try {
    const { startDate, endDate } = getDateRange.value
    await Promise.all([
      courseStore.fetchCourses({
        startDate,
        endDate,
        studentId: filterStudentId.value !== 'all' ? filterStudentId.value : undefined
      }),
      studentStore.fetchStudents()
    ])
  } catch (error) {
    showToast('加载失败')
  }
}

// 时间范围改变
const onTimeRangeChange = () => {
  loadData()
}

// 学生筛选改变
const onStudentFilterChange = () => {
  // 不需要重新加载数据，只需要重新筛选
}

// 下拉刷新
const onRefresh = async () => {
  await loadData()
  refreshing.value = false
  showToast('刷新成功')
}

// 点击课程
const handleCourseClick = (course) => {
  selectedCourse.value = course
  showCourseDetail.value = true
}

// 操作选择
const onActionSelect = async (action) => {
  showCourseDetail.value = false
  
  switch (action.name) {
    case '签到':
      await handleCheckIn('present')
      break
    case '请假':
      await handleCheckIn('leave')
      break
    case '编辑':
      handleEdit()
      break
    case '取消课程':
      await handleCancel()
      break
    case '查看详情':
      handleViewDetail()
      break
  }
}

// 签到
const handleCheckIn = async (attendanceStatus = 'present') => {
  try {
    const isLeave = attendanceStatus === 'leave'
    const title = isLeave ? '确认请假' : '确认签到'
    const message = isLeave 
      ? `确认 ${selectedCourse.value.studentName} 请假？请假不扣除课时。`
      : `确认 ${selectedCourse.value.studentName} 已上课？`
    
    await showConfirmDialog({
      title,
      message
    })
    
    await courseStore.checkIn(selectedCourse.value.id, { 
      attendanceStatus,
      notes: isLeave ? '学生请假' : ''
    })
    await studentStore.fetchStudents()
    
    showToast(isLeave ? '请假记录成功' : '签到成功')
    
    // 只有出席时才检查课时预警
    if (attendanceStatus === 'present') {
      const student = studentStore.students.find(s => s.id === selectedCourse.value.studentId)
      if (student && student.remainingHours < 3) {
        setTimeout(() => {
          showDialog({
            title: '课时预警',
            message: `${student.name} 剩余课时不足 3 节`,
            confirmButtonText: '知道了',
            cancelButtonText: '取消'
          })
        }, 1000)
      }
    }
    
    // 刷新课程列表
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      showToast(attendanceStatus === 'leave' ? '请假记录失败' : '签到失败')
    }
  }
}

// 编辑
const handleEdit = () => {
  if (!selectedCourse.value?.id) {
    showToast('课程信息不存在')
    return
  }
  router.push(`/schedule/edit/${selectedCourse.value.id}`)
}

// 取消课程
const handleCancel = async () => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消该课程吗？'
    })
    
    await courseStore.cancelCourse(selectedCourse.value.id, '用户取消')
    
    showToast('已取消')
    // 刷新课程列表
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      showToast('取消失败')
    }
  }
}

// 查看详情
const handleViewDetail = () => {
  showDialog({
    title: '课程详情',
    message: `
      学生：${selectedCourse.value.studentName}
      时间：${selectedCourse.value.date} ${selectedCourse.value.startTime}-${selectedCourse.value.endTime}
      地点：${selectedCourse.value.location}
      备注：${selectedCourse.value.notes || '无'}
    `,
    confirmButtonText: '知道了',
    cancelButtonText: '取消'
  })
}

// 跳转到创建课程
const onAddSelect = async (action) => {
  if (action.value === 'single') {
    router.push('/schedule/add')
  } else if (action.value === 'recurring') {
    router.push('/schedule/recurring')
  } else if (action.value === 'generate') {
    await handleGenerateNextWeek()
  }
}

// 生成下周课程
const handleGenerateNextWeek = async () => {
  try {
    await showConfirmDialog({
      title: '确认生成',
      message: '将为本周的常规课程自动生成下周同一时间段的课程（仅生成剩余课时充足的学生），确认吗？'
    })
    
    const { generateNextWeekCourses } = await import('@/api/course')
    const result = await generateNextWeekCourses()
    
    let message = `成功生成 ${result.created} 节课程`
    if (result.skipped > 0) {
      message += `，跳过 ${result.skipped} 节`
      // 如果有跳过的课程，显示详细信息
      if (result.skippedCourses && result.skippedCourses.length > 0) {
        const skippedReasons = result.skippedCourses
          .slice(0, 5) // 最多显示5条
          .map(item => `${item.student}: ${item.reason}`)
          .join('\n')
        const moreText = result.skippedCourses.length > 5 
          ? `\n...还有 ${result.skippedCourses.length - 5} 条` 
          : ''
        
        setTimeout(() => {
          showDialog({
            title: '跳过详情',
            message: skippedReasons + moreText,
            confirmButtonText: '知道了',
            cancelButtonText: '取消'
          })
        }, 1000)
      }
    }
    
    showToast(message)
    
    // 刷新课程列表
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      showToast('生成失败')
    }
  }
}

const goToAddCourse = () => {
  showAddMenu.value = true
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.schedule-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 90px;
}

.filter-bar {
  background: white;
  padding: $padding-sm $padding-lg;
  border-bottom: 1px solid $border-color;
  
  .van-dropdown-menu {
    :deep(.van-dropdown-menu__bar) {
      box-shadow: none;
    }
  }
  
}

.info-bar {
  background: white;
  padding: $padding-xs $padding-lg;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $border-color;
  
  .date-range {
    font-size: $font-size-xs;
    color: $text-color-secondary;
  }
  
  .total-count {
    font-size: $font-size-xs;
    color: $text-color-secondary;
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
  margin-bottom: $padding-sm;
  
  .date {
    font-size: $font-size-md;
    font-weight: bold;
    color: $text-color;
  }
  
  .count {
    font-size: $font-size-sm;
    color: $text-color-secondary;
  }
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: $padding-sm;
}

.course-card {
  background: white;
  border-radius: $border-radius-lg;
  padding: $padding-lg;
  box-shadow: $box-shadow-sm;
  display: flex;
  gap: $padding-md;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid transparent;
  
  &.pending {
    border-left-color: $warning-color;
  }
  
  &.completed {
    border-left-color: $success-color;
  }
  
  &.cancelled {
    border-left-color: $text-color-light;
    opacity: 0.6;
  }
  
  // 请假状态样式
  &.completed[data-attendance="leave"] {
    border-left-color: $warning-color;
  }
  
  &.completed[data-attendance="absent"] {
    border-left-color: $danger-color;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.course-time {
  text-align: center;
  
  .time {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $primary-color;
    margin-bottom: 4px;
  }
  
  .duration {
    font-size: $font-size-xs;
    color: $text-color-secondary;
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
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .notes {
    font-size: $font-size-xs;
    color: $text-color-light;
  }
}

.course-status {
  display: flex;
  align-items: center;
}

.add-btn {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 400px;
  z-index: 100;
  box-shadow: $box-shadow-lg;
}

.course-detail {
  padding: $padding-xl;
  
  h3 {
    font-size: $font-size-xl;
    margin-bottom: $padding-md;
  }
  
  p {
    font-size: $font-size-md;
    line-height: 1.8;
    color: $text-color-secondary;
  }
}
</style>

