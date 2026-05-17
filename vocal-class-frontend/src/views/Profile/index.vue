<template>
  <div class="profile-page">
    <van-nav-bar title="我的" fixed placeholder />
    
    <!-- 用户信息 -->
    <div class="user-info">
      <div class="avatar">{{ userName.charAt(0) }}</div>
      <div class="info">
        <h2 class="name">{{ userName }}</h2>
        <p class="desc">{{ userAccount }}</p>
      </div>
    </div>
    
    <!-- 数据统计 -->
    <div class="data-stats">
      <div class="stat-item" @click="goToStudents">
        <div class="value">{{ totalStudents }}</div>
        <div class="label">学生</div>
      </div>
      <div class="stat-item" @click="goToSchedule">
        <div class="value">{{ completedCourses }}</div>
        <div class="label">已上课程</div>
      </div>
      <div class="stat-item" @click="goToIncome">
        <div class="value">{{ totalIncome }}</div>
        <div class="label">总收益(元)</div>
      </div>
    </div>
    
    <!-- 教学设置 -->
    <van-cell-group inset title="教学设置">
      <van-cell title="默认课时长度" :value="`${settings.defaultDuration}分钟`" is-link @click="showDurationDialog = true" />
      <van-cell title="默认课时单价" :value="`¥${settings.defaultPrice}`" is-link @click="showPriceDialog = true" />
      <van-cell title="默认上课地点" :value="settings.defaultLocation" is-link @click="showLocationDialog = true" />
      <van-cell title="课时预警阈值" :value="`${settings.lowHoursThreshold}课时`" is-link @click="showThresholdDialog = true" />
    </van-cell-group>
    
    <!-- 数据管理 -->
    <van-cell-group inset title="数据管理">
      <van-cell title="数据统计" is-link @click="showDataStats" />
      <van-cell title="导出数据" is-link @click="showExportMenu = true" />
      <van-cell title="清空数据" is-link @click="handleClearData" />
    </van-cell-group>
    
    <!-- 导出选项 -->
    <van-action-sheet
      v-model:show="showExportMenu"
      :actions="exportActions"
      cancel-text="取消"
      close-on-click-action
      @select="onExportSelect"
    />
    
    <!-- 账号管理 -->
    <van-cell-group inset title="账号管理">
      <van-cell title="切换账号" is-link @click="handleSwitchAccount" />
    </van-cell-group>
    
    <!-- 关于 -->
    <van-cell-group inset title="关于">
      <van-cell title="版本信息" value="v1.0.0" />
      <van-cell title="使用帮助" is-link @click="showHelp" />
      <van-cell title="意见反馈" is-link @click="showFeedback" />
    </van-cell-group>
    
    <!-- 课时长度设置 -->
    <van-dialog
      v-model:show="showDurationDialog"
      title="默认课时长度"
      show-cancel-button
      @confirm="handleDurationConfirm"
    >
      <van-field
        v-model="tempDuration"
        type="number"
        placeholder="请输入分钟数"
        label="分钟"
      />
    </van-dialog>
    
    <!-- 课时单价设置 -->
    <van-dialog
      v-model:show="showPriceDialog"
      title="默认课时单价"
      show-cancel-button
      @confirm="handlePriceConfirm"
    >
      <van-field
        v-model="tempPrice"
        type="number"
        placeholder="请输入单价"
        label="元"
      />
    </van-dialog>
    
    <!-- 上课地点设置 -->
    <van-dialog
      v-model:show="showLocationDialog"
      title="默认上课地点"
      show-cancel-button
      @confirm="handleLocationConfirm"
    >
      <van-field
        v-model="tempLocation"
        placeholder="请输入地点"
      />
    </van-dialog>
    
    <!-- 预警阈值设置 -->
    <van-dialog
      v-model:show="showThresholdDialog"
      title="课时预警阈值"
      show-cancel-button
      @confirm="handleThresholdConfirm"
    >
      <van-field
        v-model="tempThreshold"
        type="number"
        placeholder="请输入课时数"
        label="课时"
      />
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { useCourseStore } from '@/stores/course'
import { useIncomeStore } from '@/stores/income'
import { useSettingsStore } from '@/stores/settings'
import { showToast, showDialog, showConfirmDialog, showLoadingToast, closeToast } from 'vant'
import { exportStudents, exportCourses, exportIncome, exportAllData } from '@/utils/export'

const router = useRouter()
const authStore = useAuthStore()
const studentStore = useStudentStore()
const courseStore = useCourseStore()
const incomeStore = useIncomeStore()
const settingsStore = useSettingsStore()

const showDurationDialog = ref(false)
const showPriceDialog = ref(false)
const showLocationDialog = ref(false)
const showThresholdDialog = ref(false)
const showExportMenu = ref(false)

const tempDuration = ref('')
const tempPrice = ref('')
const tempLocation = ref('')
const tempThreshold = ref('')

const exportActions = [
  { name: '导出学生数据', icon: 'friends-o', value: 'students' },
  { name: '导出课程数据', icon: 'records', value: 'courses' },
  { name: '导出收益数据', icon: 'gold-coin-o', value: 'income' },
  { name: '导出所有数据', icon: 'apps-o', value: 'all' }
]

// 用户信息
const userName = computed(() => authStore.userName || '教师')
const userAccount = computed(() => authStore.user?.account || '')

// 设置
const settings = computed(() => settingsStore)

// 学生总数
const totalStudents = computed(() => studentStore.totalStudents)

// 已完成课程数
const completedCourses = computed(() => {
  return courseStore.courses.filter(c => c.status === 'completed').length
})

// 总收益
const totalIncome = computed(() => incomeStore.stats.total)

// 加载数据
const loadData = async () => {
  try {
    await Promise.all([
      studentStore.fetchStudents(),
      courseStore.fetchCourses(),
      incomeStore.fetchIncomeStats()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 跳转
const goToStudents = () => {
  router.push('/students')
}

const goToSchedule = () => {
  router.push('/schedule')
}

const goToIncome = () => {
  router.push('/income')
}

// 课时长度确认
const handleDurationConfirm = () => {
  if (!tempDuration.value || tempDuration.value <= 0) {
    showToast('请输入有效的分钟数')
    return
  }
  
  settingsStore.updateSettings({
    defaultDuration: parseInt(tempDuration.value)
  })
  showToast('设置成功')
}

// 课时单价确认
const handlePriceConfirm = () => {
  if (!tempPrice.value || tempPrice.value <= 0) {
    showToast('请输入有效的单价')
    return
  }
  
  settingsStore.updateSettings({
    defaultPrice: parseFloat(tempPrice.value)
  })
  showToast('设置成功')
}

// 上课地点确认
const handleLocationConfirm = () => {
  if (!tempLocation.value) {
    showToast('请输入地点')
    return
  }
  
  settingsStore.updateSettings({
    defaultLocation: tempLocation.value
  })
  showToast('设置成功')
}

// 预警阈值确认
const handleThresholdConfirm = () => {
  if (!tempThreshold.value || tempThreshold.value <= 0) {
    showToast('请输入有效的课时数')
    return
  }
  
  settingsStore.updateSettings({
    lowHoursThreshold: parseInt(tempThreshold.value)
  })
  showToast('设置成功')
}

// 数据统计
const showDataStats = () => {
  showDialog({
    title: '数据统计',
    message: `
      学生总数：${totalStudents.value}人
      已上课程：${completedCourses.value}节
      总收益：¥${totalIncome.value}
      课时预警：${studentStore.lowHoursStudents.length}人
    `,
    confirmButtonText: '知道了'
  })
}

// 导出数据选择
const onExportSelect = async (action) => {
  try {
    showLoadingToast({
      message: '准备导出...',
      forbidClick: true,
      duration: 0
    })
    
    // 确保数据已加载
    await Promise.all([
      studentStore.fetchStudents(),
      courseStore.fetchCourses(),
      incomeStore.fetchIncomeList()
    ])
    
    closeToast()
    
    switch (action.value) {
      case 'students':
        if (studentStore.students.length === 0) {
          showToast('暂无学生数据')
          return
        }
        exportStudents(studentStore.students)
        showToast('学生数据已导出')
        break
      
      case 'courses':
        if (courseStore.courses.length === 0) {
          showToast('暂无课程数据')
          return
        }
        exportCourses(courseStore.courses)
        showToast('课程数据已导出')
        break
      
      case 'income':
        if (incomeStore.incomeList.length === 0) {
          showToast('暂无收益数据')
          return
        }
        exportIncome(incomeStore.incomeList)
        showToast('收益数据已导出')
        break
      
      case 'all':
        await exportAllData({
          students: studentStore.students,
          courses: courseStore.courses,
          income: incomeStore.incomeList
        })
        showToast('所有数据已导出')
        break
    }
  } catch (error) {
    closeToast()
    console.error('导出失败:', error)
    showToast('导出失败')
  }
}

// 清空数据
const handleClearData = async () => {
  try {
    await showConfirmDialog({
      title: '确认清空',
      message: '清空后数据无法恢复，确定要清空所有数据吗？',
      confirmButtonText: '确定清空',
      confirmButtonColor: '#ee0a24'
    })
    
    localStorage.clear()
    showToast('已清空，请刷新页面')
    
    setTimeout(() => {
      location.reload()
    }, 1500)
  } catch {
    // 取消
  }
}

// 使用帮助
const showHelp = () => {
  showDialog({
    title: '使用帮助',
    message: `
      1. 添加学生并购买课时
      2. 在课表中创建课程
      3. 上课后进行签到
      4. 查看收益统计
      
      如有问题，请联系开发者
    `,
    confirmButtonText: '知道了'
  })
}

// 意见反馈
const showFeedback = () => {
  showDialog({
    title: '意见反馈',
    message: '感谢您的使用！\n如有建议或问题，欢迎反馈。',
    confirmButtonText: '知道了'
  })
}

// 切换账号
const handleSwitchAccount = async () => {
  try {
    await showConfirmDialog({
      title: '确认切换账号',
      message: '切换账号后将退出当前登录，确定要切换吗？',
      confirmButtonText: '确定切换'
    })
    
    // 执行登出
    await authStore.logout()
    
    // 跳转到登录页
    router.replace('/login')
  } catch {
    // 用户取消操作
  }
}

onMounted(() => {
  loadData()
})

// 监听设置弹窗打开，初始化临时值
const openDurationDialog = () => {
  tempDuration.value = settings.value.defaultDuration.toString()
  showDurationDialog.value = true
}

const openPriceDialog = () => {
  tempPrice.value = settings.value.defaultPrice.toString()
  showPriceDialog.value = true
}

const openLocationDialog = () => {
  tempLocation.value = settings.value.defaultLocation
  showLocationDialog.value = true
}

const openThresholdDialog = () => {
  tempThreshold.value = settings.value.lowHoursThreshold.toString()
  showThresholdDialog.value = true
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.profile-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 70px;
}

.user-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: $padding-xxl $padding-lg;
  color: white;
  display: flex;
  align-items: center;
  gap: $padding-lg;
  
  .avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
  }
  
  .info {
    flex: 1;
    
    .name {
      font-size: $font-size-xxl;
      margin-bottom: 4px;
    }
    
    .desc {
      font-size: $font-size-sm;
      opacity: 0.9;
    }
  }
}

.data-stats {
  display: flex;
  background: white;
  margin: -30px $padding-lg 0;
  border-radius: $border-radius-lg;
  box-shadow: $box-shadow-md;
  overflow: hidden;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: $padding-lg;
  cursor: pointer;
  transition: background 0.3s;
  
  &:not(:last-child) {
    border-right: 1px solid $border-color;
  }
  
  &:active {
    background: $background-color;
  }
  
  .value {
    font-size: $font-size-xl;
    font-weight: bold;
    color: $primary-color;
    margin-bottom: 4px;
  }
  
  .label {
    font-size: $font-size-sm;
    color: $text-color-secondary;
  }
}

:deep(.van-cell-group) {
  margin-top: $padding-lg;
}

:deep(.van-cell-group__title) {
  color: $text-color;
  font-weight: bold;
}

:deep(.van-dialog__message) {
  padding: $padding-lg;
  text-align: left;
  white-space: pre-line;
}
</style>

