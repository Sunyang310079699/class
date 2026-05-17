<template>
  <div class="recurring-course-page">
    <van-nav-bar
      title="周期性排课"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset title="基本信息">
        <van-field
          v-model="studentName"
          name="student"
          label="选择学生"
          placeholder="点击选择学生"
          readonly
          required
          @click="showStudentPicker = true"
        />
        
        <van-field name="courseType" label="课程类型">
          <template #input>
            <van-radio-group v-model="form.courseType" direction="horizontal">
              <van-radio name="regular">常规课程</van-radio>
              <van-radio name="temporary">临时加课</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        
        <van-field
          v-model="form.startTime"
          name="startTime"
          label="开始时间"
          placeholder="点击选择时间"
          readonly
          required
          @click="showStartTimePicker = true"
        />
        
        <van-field
          v-model="form.endTime"
          name="endTime"
          label="结束时间"
          placeholder="自动计算（开始时间+45分钟）"
          readonly
          required
          @click="showEndTimePicker = true"
        />
        
        <van-field
          :model-value="displayDuration"
          name="duration"
          label="课时"
          placeholder="自动计算"
          readonly
          suffix="课时"
        />
        
        <van-field
          v-model="form.location"
          name="location"
          label="上课地点"
          placeholder="请输入上课地点"
        />
      </van-cell-group>
      
      <van-cell-group inset title="周期设置">
        <van-field name="frequency" label="重复频率">
          <template #input>
            <van-radio-group v-model="form.frequency" direction="horizontal">
              <van-radio name="weekly">每周</van-radio>
              <van-radio name="biweekly">每两周</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        
        <van-field name="weekdays" label="星期">
          <template #input>
            <van-checkbox-group v-model="form.weekdays" direction="horizontal">
              <van-checkbox 
                v-for="day in weekdayOptions" 
                :key="day.value" 
                :name="day.value"
                shape="square"
              >
                {{ day.label }}
              </van-checkbox>
            </van-checkbox-group>
          </template>
        </van-field>
        
        <van-field
          v-model="dateRangeText"
          name="dateRange"
          label="日期范围"
          placeholder="点击选择开始和结束日期"
          readonly
          required
          @click="showDateRangePicker = true"
        />
      </van-cell-group>
      
      <van-cell-group inset title="其他信息">
        <van-field
          v-model="form.notes"
          name="notes"
          label="备注"
          type="textarea"
          placeholder="请输入备注（选填）"
          rows="3"
          maxlength="200"
          show-word-limit
        />
      </van-cell-group>
      
      <!-- 预览 -->
      <van-cell-group v-if="previewCourses.length > 0" inset title="课程预览">
        <van-cell 
          v-for="(course, index) in previewCourses" 
          :key="index"
          :title="`${course.date} (${course.weekday})`"
          :label="`${course.startTime} - ${course.endTime}`"
        />
        <van-cell 
          title="共计" 
          :value="`${previewCourses.length} 节课`" 
          value-class="total-count"
        />
      </van-cell-group>
      
      <div class="submit-btn">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          :disabled="previewCourses.length === 0"
        >
          批量创建 {{ previewCourses.length }} 节课
        </van-button>
      </div>
    </van-form>
    
    <!-- 学生选择器 -->
    <van-popup v-model:show="showStudentPicker" position="bottom">
      <van-picker
        :columns="studentColumns"
        @confirm="onStudentConfirm"
        @cancel="showStudentPicker = false"
      />
    </van-popup>
    
    <!-- 开始时间选择器 -->
    <van-popup v-model:show="showStartTimePicker" position="bottom">
      <van-time-picker
        v-model="startTimeValue"
        title="选择开始时间"
        @confirm="onStartTimeConfirm"
        @cancel="showStartTimePicker = false"
      />
    </van-popup>
    
    <!-- 结束时间选择器 -->
    <van-popup v-model:show="showEndTimePicker" position="bottom">
      <van-time-picker
        v-model="endTimeValue"
        title="选择结束时间"
        @confirm="onEndTimeConfirm"
        @cancel="showEndTimePicker = false"
      />
    </van-popup>
    
    <!-- 日期范围选择器 -->
    <van-calendar
      v-model:show="showDateRangePicker"
      type="range"
      :min-date="minDate"
      :max-date="maxDate"
      @confirm="onDateRangeConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { useStudentStore } from '@/stores/student'
import { useSettingsStore } from '@/stores/settings'
import { showToast, showDialog, showLoadingToast, closeToast } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()
const courseStore = useCourseStore()
const studentStore = useStudentStore()
const settingsStore = useSettingsStore()

const loading = ref(false)
const showStudentPicker = ref(false)
const showStartTimePicker = ref(false)
const showEndTimePicker = ref(false)
const showDateRangePicker = ref(false)

const startTimeValue = ref(['09', '00'])
const endTimeValue = ref(['10', '00'])

const form = ref({
  studentId: '',
  courseType: 'regular', // 默认常规课程
  startTime: '',
  endTime: '',
  duration: 1, // 默认1课时（45分钟）
  location: '',
  frequency: 'weekly',
  weekdays: [],
  startDate: '',
  endDate: '',
  notes: ''
})

// 星期选项
const weekdayOptions = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
  { label: '日', value: 0 }
]

// 日期范围
const minDate = new Date()
const maxDate = new Date(new Date().getFullYear() + 1, 11, 31)

// 学生列表
const studentColumns = computed(() => {
  return studentStore.students.map(s => ({
    text: s.name,
    value: s.id
  }))
})

// 选中的学生名称
const studentName = computed(() => {
  if (!form.value.studentId) return ''
  const student = studentStore.students.find(s => s.id === form.value.studentId)
  return student ? student.name : ''
})

// 日期范围文本
const dateRangeText = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return ''
  return `${form.value.startDate} 至 ${form.value.endDate}`
})

// 生成课程预览
const previewCourses = computed(() => {
  const { studentId, startTime, endTime, startDate, endDate, frequency, weekdays } = form.value
  
  if (!studentId || !startTime || !endTime || !startDate || !endDate || weekdays.length === 0) {
    return []
  }
  
  const courses = []
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const interval = frequency === 'weekly' ? 7 : 14
  
  let currentDate = start
  let weekCounter = 0
  
  while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
    const dayOfWeek = currentDate.day()
    
    // 检查是否是选中的星期
    if (weekdays.includes(dayOfWeek)) {
      // 如果是每两周，检查周计数
      if (frequency === 'biweekly') {
        const weekDiff = currentDate.diff(start, 'week')
        if (weekDiff % 2 !== 0) {
          currentDate = currentDate.add(1, 'day')
          continue
        }
      }
      
      const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']
      courses.push({
        date: currentDate.format('YYYY-MM-DD'),
        weekday: `周${weekdayNames[dayOfWeek]}`,
        startTime,
        endTime
      })
    }
    
    currentDate = currentDate.add(1, 'day')
  }
  
  return courses
})

// 计算课时（以课时为单位：1课时=45分钟）
const calculateDuration = () => {
  if (!form.value.startTime || !form.value.endTime) return
  
  const start = dayjs(`2000-01-01 ${form.value.startTime}`)
  const end = dayjs(`2000-01-01 ${form.value.endTime}`)
  const minutes = end.diff(start, 'minute')
  
  // 转换为课时数（1课时=45分钟）
  form.value.duration = Math.max(0, minutes / 45)
}

// 显示课时数
const displayDuration = computed(() => {
  if (form.value.duration) {
    return form.value.duration.toFixed(2)
  }
  return '0'
})

// 根据开始时间自动计算结束时间（向后推45分钟）
const calculateEndTime = () => {
  if (form.value.startTime) {
    const start = dayjs(`2000-01-01 ${form.value.startTime}`)
    const end = start.add(45, 'minute')
    form.value.endTime = end.format('HH:mm')
    // 更新结束时间选择器的值
    endTimeValue.value = [end.format('HH'), end.format('mm')]
    // 重新计算课时
    calculateDuration()
  }
}

// 学生选择确认
const onStudentConfirm = ({ selectedOptions }) => {
  form.value.studentId = selectedOptions[0].value
  showStudentPicker.value = false
}

// 开始时间确认
const onStartTimeConfirm = () => {
  form.value.startTime = `${startTimeValue.value[0]}:${startTimeValue.value[1]}`
  showStartTimePicker.value = false
  // 自动计算结束时间（向后推45分钟）
  calculateEndTime()
}

// 结束时间确认
const onEndTimeConfirm = () => {
  form.value.endTime = `${endTimeValue.value[0]}:${endTimeValue.value[1]}`
  showEndTimePicker.value = false
  calculateDuration()
}

// 日期范围确认
const onDateRangeConfirm = (values) => {
  const [start, end] = values
  form.value.startDate = dayjs(start).format('YYYY-MM-DD')
  form.value.endDate = dayjs(end).format('YYYY-MM-DD')
  showDateRangePicker.value = false
}

// 提交表单
const onSubmit = async () => {
  // 验证
  if (!form.value.studentId) {
    showToast('请选择学生')
    return
  }
  
  if (form.value.weekdays.length === 0) {
    showToast('请选择至少一个星期')
    return
  }
  
  if (previewCourses.value.length === 0) {
    showToast('没有可创建的课程')
    return
  }
  
  // 确认创建
  try {
    await showConfirmDialog({
      title: '确认创建',
      message: `将为 ${studentName.value} 创建 ${previewCourses.value.length} 节课程，确认吗？`
    })
    
    loading.value = true
    showLoadingToast({
      message: '创建中...',
      forbidClick: true,
      duration: 0
    })
    
    // 批量创建课程
    const { studentId, startTime, endTime, duration, location, notes } = form.value
    
    for (const course of previewCourses.value) {
      const courseData = {
        studentId,
        date: course.date,
        startTime,
        endTime,
        duration,
        location,
        notes
      }
      
      await courseStore.createCourse(courseData)
    }
    
    closeToast()
    showToast('创建成功')
    
    // 返回课表页面
    router.push('/schedule')
  } catch (error) {
    closeToast()
    if (error !== 'cancel') {
      showToast('创建失败')
    }
  } finally {
    loading.value = false
  }
}

// 返回
const onClickLeft = () => {
  router.back()
}

// 初始化
onMounted(async () => {
  await studentStore.fetchStudents()
  
  // 加载默认设置
  try {
    await settingsStore.fetchSettings()
    if (settingsStore.defaultLocation) {
      form.value.location = settingsStore.defaultLocation
    }
    // 更新默认课时（如果设置中有）
    if (settingsStore.defaultDuration) {
      form.value.duration = settingsStore.defaultDuration
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.recurring-course-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 30px;
}

:deep(.van-cell-group__title) {
  font-weight: bold;
  color: $text-color;
}

:deep(.van-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: $padding-sm;
}

:deep(.van-checkbox) {
  margin-right: 0;
}

:deep(.van-radio-group) {
  display: flex;
  gap: $padding-lg;
}

.submit-btn {
  margin: $padding-xxl $padding-lg;
}

:deep(.total-count) {
  font-size: $font-size-lg;
  font-weight: bold;
  color: $primary-color;
}
</style>

