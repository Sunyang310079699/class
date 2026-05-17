<template>
  <div class="add-course-page">
    <van-nav-bar
      :title="pageTitle"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="studentName"
          name="student"
          label="选择学生"
          placeholder="点击选择学生"
          readonly
          required
          @click="openStudentPicker"
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
          v-if="showFutureSyncOption"
          name="updateFutureCourses"
          label="后续课程"
        >
          <template #input>
            <van-radio-group v-model="updateFutureCourses" direction="horizontal">
              <van-radio :name="false">不变动</van-radio>
              <van-radio :name="true">跟随变动</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        
        <van-field
          v-model="form.date"
          name="date"
          label="上课日期"
          placeholder="点击选择日期"
          readonly
          required
          @click="showDatePicker = true"
        />
        
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
      
      <div class="submit-btn">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
        >
          {{ submitText }}
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
    
    <!-- 日期选择器 -->
    <van-calendar
      v-model:show="showDatePicker"
      :min-date="minDate"
      @confirm="onDateConfirm"
    />
    
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { useStudentStore } from '@/stores/student'
import { useSettingsStore } from '@/stores/settings'
import { formatDate, getToday } from '@/utils/date'
import { showToast } from 'vant'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const studentStore = useStudentStore()
const settingsStore = useSettingsStore()

const createDefaultForm = () => ({
  studentId: '',
  courseType: 'regular', // 默认常规课程
  date: getToday(),
  startTime: '',
  endTime: '',
  duration: 1, // 默认1课时（45分钟）
  location: settingsStore.defaultLocation,
  notes: ''
})

const form = ref(createDefaultForm())
const loading = ref(false)
const loadingCourse = ref(false)
const updateFutureCourses = ref(false)
const showStudentPicker = ref(false)
const showDatePicker = ref(false)
const showStartTimePicker = ref(false)
const showEndTimePicker = ref(false)

const startTimeValue = ref(['14', '00'])
const endTimeValue = ref(['15', '00'])
const minDate = ref(new Date())

const editId = computed(() => route.params.id)
const isEditMode = computed(() => Boolean(editId.value))
const pageTitle = computed(() => isEditMode.value ? '编辑课程' : '创建课程')
const submitText = computed(() => isEditMode.value ? '保存修改' : '创建课程')
const showFutureSyncOption = computed(() => isEditMode.value && form.value.courseType === 'regular')

// 学生列表
const students = computed(() => studentStore.students)

// 学生选择列表
const studentColumns = computed(() => {
  return students.value.map(s => ({
    text: `${s.name} (剩余${s.remainingHours}课时)`,
    value: s.id
  }))
})

// 选中的学生名称
const studentName = computed(() => {
  const student = students.value.find(s => s.id === form.value.studentId)
  return student ? student.name : ''
})

// 计算课时（以课时为单位：1课时=45分钟）
const calculateDuration = () => {
  if (form.value.startTime && form.value.endTime) {
    const start = dayjs(`2000-01-01 ${form.value.startTime}`)
    const end = dayjs(`2000-01-01 ${form.value.endTime}`)
    const minutes = end.diff(start, 'minute')
    // 转换为课时数（1课时=45分钟）
    form.value.duration = Math.max(0, minutes / 45)
  }
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

const syncTimePickerValue = () => {
  if (form.value.startTime) {
    const [hour, minute] = form.value.startTime.split(':')
    startTimeValue.value = [hour, minute]
  }
  if (form.value.endTime) {
    const [hour, minute] = form.value.endTime.split(':')
    endTimeValue.value = [hour, minute]
  }
}

const fillFormByCourse = (course) => {
  updateFutureCourses.value = false
  form.value = {
    ...createDefaultForm(),
    studentId: course.studentId || course.student?.id || '',
    courseType: course.courseType || 'regular',
    date: course.date || getToday(),
    startTime: course.startTime || '',
    endTime: course.endTime || '',
    duration: course.duration || 1,
    location: course.location || settingsStore.defaultLocation,
    notes: course.notes || ''
  }
  syncTimePickerValue()
}

// 加载学生列表
const loadStudents = async () => {
  try {
    await studentStore.fetchStudents()
    
    // 如果有 studentId 参数，自动选中
    if (!isEditMode.value && route.query.studentId) {
      form.value.studentId = route.query.studentId
    }
  } catch (error) {
    showToast('加载学生列表失败')
  }
}

const loadCourseDetail = async () => {
  if (!isEditMode.value) return
  
  loadingCourse.value = true
  const cachedCourse = courseStore.courses.find(course => course.id === editId.value)
  if (cachedCourse) {
    if (cachedCourse.status !== 'pending') {
      showToast('只能编辑待上课课程')
      loadingCourse.value = false
      return
    }
    fillFormByCourse(cachedCourse)
    loadingCourse.value = false
    return
  }
  
  try {
    const course = await courseStore.fetchCourseDetail(editId.value)
    if (course.status !== 'pending') {
      showToast('只能编辑待上课课程')
      return
    }
    fillFormByCourse(course)
  } catch (error) {
    if (!cachedCourse) {
      showToast('加载课程详情失败，请返回课表重试')
    }
  } finally {
    loadingCourse.value = false
  }
}

// 返回
const onClickLeft = () => {
  router.back()
}

const openStudentPicker = () => {
  showStudentPicker.value = true
}

// 学生选择确认
const onStudentConfirm = ({ selectedOptions }) => {
  form.value.studentId = selectedOptions[0].value
  showStudentPicker.value = false
}

// 日期选择确认
const onDateConfirm = (date) => {
  form.value.date = formatDate(date)
  showDatePicker.value = false
}

// 开始时间确认
const onStartTimeConfirm = ({ selectedValues }) => {
  form.value.startTime = `${selectedValues[0]}:${selectedValues[1]}`
  showStartTimePicker.value = false
  // 自动计算结束时间（向后推45分钟）
  calculateEndTime()
}

// 结束时间确认
const onEndTimeConfirm = ({ selectedValues }) => {
  form.value.endTime = `${selectedValues[0]}:${selectedValues[1]}`
  showEndTimePicker.value = false
  calculateDuration()
}

// 提交
const onSubmit = async () => {
  if (!form.value.studentId) {
    showToast('请选择学生')
    return
  }
  
  if (!form.value.date || !form.value.startTime || !form.value.endTime) {
    showToast('请填写完整信息')
    return
  }
  
  // 验证时间
  const start = dayjs(`2000-01-01 ${form.value.startTime}`)
  const end = dayjs(`2000-01-01 ${form.value.endTime}`)
  
  if (end.isBefore(start)) {
    showToast('结束时间必须晚于开始时间')
    return
  }
  
  loading.value = true
  
  try {
    if (isEditMode.value) {
      const result = await courseStore.updateCourse(editId.value, {
        ...form.value,
        updateFutureCourses: showFutureSyncOption.value ? updateFutureCourses.value : false
      })
      const updatedFutureCount = result?.updatedFutureCount || 0
      showToast(updatedFutureCount > 0 ? `保存成功，已同步${updatedFutureCount}节后续课程` : '保存成功')
    } else {
      await courseStore.addCourse(form.value)
      showToast('创建成功')
    }
    router.back()
  } catch (error) {
    showToast(isEditMode.value ? '保存失败' : '创建失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 加载设置和学生列表
  try {
    await settingsStore.fetchSettings()
    // 更新默认地点
    form.value.location = settingsStore.defaultLocation
    // 更新默认课时（如果设置中有）
    if (settingsStore.defaultDuration) {
      form.value.duration = settingsStore.defaultDuration
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
  await loadStudents()
  await loadCourseDetail()
})

// 监听开始和结束时间变化
watch([() => form.value.startTime, () => form.value.endTime], () => {
  calculateDuration()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.add-course-page {
  min-height: 100vh;
  background: $background-color;
}

.submit-btn {
  padding: $padding-lg;
}
</style>

