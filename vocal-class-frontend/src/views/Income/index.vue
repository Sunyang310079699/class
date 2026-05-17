<template>
  <div class="income-page">
    <van-nav-bar title="收益统计" fixed placeholder />
    
    <!-- 收益类型页签 -->
    <van-tabs v-model:active="incomeTypeTab" class="income-type-tabs">
      <!-- 上课收益页签 -->
      <van-tab title="上课收益" name="course">
        <!-- 收益概览 -->
        <div class="stats-overview">
          <div class="total-card">
            <div class="label">上课总收益</div>
            <div class="amount">¥{{ stats.courseIncome?.total || 0 }}</div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="value">¥{{ stats.courseIncome?.today || 0 }}</div>
              <div class="label">今日</div>
            </div>
            <div class="stat-item">
              <div class="value">¥{{ stats.courseIncome?.week || 0 }}</div>
              <div class="label">本周</div>
            </div>
            <div class="stat-item">
              <div class="value">¥{{ stats.courseIncome?.month || 0 }}</div>
              <div class="label">本月</div>
            </div>
            <div class="stat-item">
              <div class="value">¥{{ stats.courseIncome?.year || 0 }}</div>
              <div class="label">本年</div>
            </div>
          </div>
        </div>
        
        <!-- 切换视图 -->
        <van-tabs v-model:active="activeTab" class="view-tabs">
          <van-tab title="明细" name="list">
            <!-- 筛选栏 -->
            <div class="filter-bar">
              <van-dropdown-menu>
                <van-dropdown-item v-model="filterMonth" :options="monthOptions" @change="handleFilter" />
                <van-dropdown-item v-model="filterStudent" :options="studentOptions" @change="handleFilter" />
              </van-dropdown-menu>
            </div>
        
            <!-- 收入明细 -->
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh-container">
              <div class="income-list">
                <van-empty v-if="filteredCourseIncomeList.length === 0" description="暂无上课收益记录" />
                
                <div
                  v-for="item in filteredCourseIncomeList"
                  :key="item.id"
                  class="income-item"
                >
                  <div class="item-left">
                    <div class="icon course">
                      🎓
                    </div>
                    <div class="info">
                      <div class="student-name">{{ item.studentName }}</div>
                      <div class="note">{{ item.note }}</div>
                      <div class="date">{{ item.date }}</div>
                    </div>
                  </div>
                  <div class="item-right">
                    <div class="amount">+¥{{ item.amount }}</div>
                    <van-tag type="success">上课收益</van-tag>
                  </div>
                </div>
              </div>
            </van-pull-refresh>
          </van-tab>
          
          <van-tab title="图表" name="chart">
            <!-- 图表展示 -->
            <div class="chart-section">
              <!-- 月度收入柱状图 -->
              <MonthlyIncomeChart 
                :data="courseIncomeList" 
                title="上课月度收益统计"
                height="300px"
              />
              
              <!-- 年度收入趋势图 -->
              <YearlyIncomeTrendChart 
                :data="courseIncomeList" 
                title="上课年度收益趋势"
                height="280px"
              />
              
              <!-- 学生消费占比饼图 -->
              <StudentContributionChart 
                :data="courseIncomeList" 
                title="学生上课收益占比"
                height="350px"
              />
            </div>
          </van-tab>
        </van-tabs>
      </van-tab>
      
      <!-- 课时收益页签 -->
      <van-tab title="课时收益" name="package">
        <!-- 收益概览 -->
        <div class="stats-overview">
          <div class="total-card">
            <div class="label">课时总收益</div>
            <div class="amount">¥{{ stats.packageIncome?.total || 0 }}</div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="value">¥{{ stats.packageIncome?.today || 0 }}</div>
              <div class="label">今日</div>
            </div>
            <div class="stat-item">
              <div class="value">¥{{ stats.packageIncome?.week || 0 }}</div>
              <div class="label">本周</div>
            </div>
            <div class="stat-item">
              <div class="value">¥{{ stats.packageIncome?.month || 0 }}</div>
              <div class="label">本月</div>
            </div>
            <div class="stat-item">
              <div class="value">¥{{ stats.packageIncome?.year || 0 }}</div>
              <div class="label">本年</div>
            </div>
          </div>
        </div>
        
        <!-- 切换视图 -->
        <van-tabs v-model:active="activeTab" class="view-tabs">
          <van-tab title="明细" name="list">
            <!-- 筛选栏 -->
            <div class="filter-bar">
              <van-dropdown-menu>
                <van-dropdown-item v-model="filterMonth" :options="monthOptions" @change="handleFilter" />
                <van-dropdown-item v-model="filterStudent" :options="studentOptions" @change="handleFilter" />
              </van-dropdown-menu>
            </div>
        
            <!-- 收入明细 -->
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh-container">
              <div class="income-list">
                <van-empty v-if="filteredPackageIncomeList.length === 0" description="暂无课时收益记录" />
                
                <div
                  v-for="item in filteredPackageIncomeList"
                  :key="item.id"
                  class="income-item"
                >
                  <div class="item-left">
                    <div class="icon course_package">
                      📦
                    </div>
                    <div class="info">
                      <div class="student-name">{{ item.studentName }}</div>
                      <div class="note">{{ item.note }}</div>
                      <div class="date">{{ item.date }}</div>
                    </div>
                  </div>
                  <div class="item-right">
                    <div class="amount">+¥{{ item.amount }}</div>
                    <van-tag type="primary">课时收益</van-tag>
                  </div>
                </div>
              </div>
            </van-pull-refresh>
          </van-tab>
          
          <van-tab title="图表" name="chart">
            <!-- 图表展示 -->
            <div class="chart-section">
              <!-- 月度收入柱状图 -->
              <MonthlyIncomeChart 
                :data="packageIncomeList" 
                title="课时月度收益统计"
                height="300px"
              />
              
              <!-- 年度收入趋势图 -->
              <YearlyIncomeTrendChart 
                :data="packageIncomeList" 
                title="课时年度收益趋势"
                height="280px"
              />
              
              <!-- 学生消费占比饼图 -->
              <StudentContributionChart 
                :data="packageIncomeList" 
                title="学生课时收益占比"
                height="350px"
              />
            </div>
          </van-tab>
        </van-tabs>
      </van-tab>
    </van-tabs>
    
    <!-- 添加收入按钮 -->
    <van-button
      type="primary"
      size="large"
      round
      class="add-btn"
      @click="showAddIncome = true"
    >
      <van-icon name="plus" />
      添加收入
    </van-button>
    
    <!-- 添加收入弹窗 -->
    <van-dialog
      v-model:show="showAddIncome"
      title="添加收入"
      show-cancel-button
      @confirm="handleAddIncome"
    >
      <van-form>
        <van-field
          v-model="studentName"
          name="student"
          label="选择学生"
          placeholder="点击选择学生（选填）"
          readonly
          @click="showStudentPicker = true"
        />
        
        <van-field
          v-model="incomeForm.amount"
          name="amount"
          label="金额"
          placeholder="请输入金额"
          type="number"
          required
        />
        
        <van-field
          v-model="incomeForm.date"
          name="date"
          label="日期"
          placeholder="点击选择日期"
          readonly
          @click="showDatePicker = true"
        />
        
        <van-field
          v-model="incomeForm.note"
          name="note"
          label="备注"
          placeholder="请输入备注说明"
          required
        />
      </van-form>
    </van-dialog>
    
    <!-- 学生选择器 -->
    <van-popup v-model:show="showStudentPicker" position="bottom">
      <van-picker
        :columns="studentColumns"
        @confirm="onStudentConfirm"
        @cancel="showStudentPicker = false"
      />
    </van-popup>
    
    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useIncomeStore } from '@/stores/income'
import { useStudentStore } from '@/stores/student'
import { getToday } from '@/utils/date'
import { showToast } from 'vant'
import dayjs from 'dayjs'
import MonthlyIncomeChart from '@/components/Charts/MonthlyIncomeChart.vue'
import YearlyIncomeTrendChart from '@/components/Charts/YearlyIncomeTrendChart.vue'
import StudentContributionChart from '@/components/Charts/StudentContributionChart.vue'

const incomeStore = useIncomeStore()
const studentStore = useStudentStore()

const incomeTypeTab = ref('course') // 收益类型页签：course（上课收益）或 package（课时收益）
const activeTab = ref('list')
const refreshing = ref(false)
const filterMonth = ref('all')
const filterStudent = ref('all')
const showAddIncome = ref(false)
const showStudentPicker = ref(false)
const showDatePicker = ref(false)
const selectedDate = ref(new Date())

const incomeForm = ref({
  studentId: '',
  amount: '',
  date: getToday(),
  note: ''
})

// 统计数据
const stats = computed(() => incomeStore.stats)

// 收入列表
const incomeList = computed(() => incomeStore.incomeList)

// 购买课时收益列表
const packageIncomeList = computed(() => {
  return incomeList.value.filter(item => item.type === 'course_package')
})

// 上课收益列表
const courseIncomeList = computed(() => {
  return incomeList.value.filter(item => item.type === 'course')
})

// 过滤购买课时收益列表
const filteredPackageIncomeList = computed(() => {
  let list = packageIncomeList.value
  
  // 按月份筛选
  if (filterMonth.value !== 'all') {
    const [year, month] = filterMonth.value.split('-')
    list = list.filter(item => {
      const date = dayjs(item.date)
      return date.year() === parseInt(year) && date.month() + 1 === parseInt(month)
    })
  }
  
  // 按学生筛选
  if (filterStudent.value !== 'all') {
    list = list.filter(item => item.studentId === filterStudent.value)
  }
  
  return list
})

// 过滤上课收益列表
const filteredCourseIncomeList = computed(() => {
  let list = courseIncomeList.value
  
  // 按月份筛选
  if (filterMonth.value !== 'all') {
    const [year, month] = filterMonth.value.split('-')
    list = list.filter(item => {
      const date = dayjs(item.date)
      return date.year() === parseInt(year) && date.month() + 1 === parseInt(month)
    })
  }
  
  // 按学生筛选
  if (filterStudent.value !== 'all') {
    list = list.filter(item => item.studentId === filterStudent.value)
  }
  
  return list
})

// 月份选项
const monthOptions = computed(() => {
  const options = [{ text: '全部月份', value: 'all' }]
  
  // 生成最近6个月
  for (let i = 0; i < 6; i++) {
    const date = dayjs().subtract(i, 'month')
    options.push({
      text: date.format('YYYY年MM月'),
      value: date.format('YYYY-MM')
    })
  }
  
  return options
})

// 学生选项
const studentOptions = computed(() => {
  const options = [{ text: '全部学生', value: 'all' }]
  
  studentStore.students.forEach(s => {
    options.push({
      text: s.name,
      value: s.id
    })
  })
  
  return options
})

// 学生选择列表
const studentColumns = computed(() => {
  const columns = [{ text: '其他', value: '' }]
  studentStore.students.forEach(s => {
    columns.push({
      text: s.name,
      value: s.id
    })
  })
  return columns
})

// 选中的学生名称
const studentName = computed(() => {
  if (!incomeForm.value.studentId) return ''
  const student = studentStore.students.find(s => s.id === incomeForm.value.studentId)
  return student ? student.name : ''
})

// 加载数据
const loadData = async () => {
  try {
    await Promise.all([
      incomeStore.fetchIncomeList(),
      incomeStore.fetchIncomeStats(),
      studentStore.fetchStudents()
    ])
  } catch (error) {
    showToast('加载失败')
  }
}

// 下拉刷新
const onRefresh = async () => {
  await loadData()
  refreshing.value = false
  showToast('刷新成功')
}

// 筛选
const handleFilter = () => {
  // 筛选逻辑在 computed 中处理
}

// 学生选择确认
const onStudentConfirm = ({ selectedOptions }) => {
  incomeForm.value.studentId = selectedOptions[0].value
  showStudentPicker.value = false
}

// 日期选择确认
const onDateConfirm = (value) => {
  const year = value.selectedValues[0]
  const month = value.selectedValues[1].toString().padStart(2, '0')
  const day = value.selectedValues[2].toString().padStart(2, '0')
  incomeForm.value.date = `${year}-${month}-${day}`
  showDatePicker.value = false
}

// 添加收入
const handleAddIncome = async () => {
  if (!incomeForm.value.amount || !incomeForm.value.note) {
    showToast('请填写完整信息')
    return
  }
  
  try {
    const data = {
      ...incomeForm.value,
      amount: parseFloat(incomeForm.value.amount),
      type: 'other'
    }
    
    if (!data.studentId) {
      data.studentName = '其他'
    }
    
    await incomeStore.addIncome(data)
    await incomeStore.fetchIncomeStats()
    
    showToast('添加成功')
    
    // 重置表单
    incomeForm.value = {
      studentId: '',
      amount: '',
      date: getToday(),
      note: ''
    }
    
    showAddIncome.value = false
  } catch (error) {
    showToast('添加失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.income-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 90px;
}

.income-type-tabs {
  background: white;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  :deep(.van-tabs__nav) {
    background: white;
    flex-shrink: 0;
  }
  
  :deep(.van-tab) {
    flex: 1;
  }
  
  :deep(.van-tabs__content) {
    background: $background-color;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  :deep(.van-tabs__track) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  :deep(.van-tab__panel) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.view-tabs {
  background: white;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  :deep(.van-tabs__nav) {
    background: white;
    flex-shrink: 0;
  }
  
  :deep(.van-tab) {
    flex: 1;
  }
  
  :deep(.van-tabs__content) {
    background: $background-color;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  :deep(.van-tabs__track) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  :deep(.van-tab__panel) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.stats-overview {
  background: $income-gradient;
  padding: $padding-xxl $padding-lg;
  color: white;
}

.total-card {
  text-align: center;
  margin-bottom: $padding-xl;
  
  .label {
    font-size: $font-size-md;
    opacity: 0.9;
    margin-bottom: $padding-sm;
  }
  
  .amount {
    font-size: 40px;
    font-weight: bold;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $padding-lg;
}

.stat-item {
  text-align: center;
  
  .value {
    font-size: $font-size-lg;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .label {
    font-size: $font-size-xs;
    opacity: 0.9;
  }
}

.filter-bar {
  background: white;
  
  :deep(.van-dropdown-menu__bar) {
    box-shadow: none;
  }
}

.income-list {
  padding: $padding-lg;
  display: flex;
  flex-direction: column;
  gap: $padding-md;
}

.income-item {
  background: white;
  border-radius: $border-radius-lg;
  padding: $padding-lg;
  box-shadow: $box-shadow-sm;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-left {
  display: flex;
  gap: $padding-md;
  flex: 1;
  
  .icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    
    &.course_package {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    &.course {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
    
    &.other {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
  }
  
  .info {
    flex: 1;
    
    .student-name {
      font-size: $font-size-md;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .note {
      font-size: $font-size-sm;
      color: $text-color-secondary;
      margin-bottom: 4px;
    }
    
    .date {
      font-size: $font-size-xs;
      color: $text-color-light;
    }
  }
}

.item-right {
  text-align: right;
  
  .amount {
    font-size: $font-size-xl;
    font-weight: bold;
    color: $success-color;
    margin-bottom: 4px;
  }
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

:deep(.van-dialog__message) {
  padding: $padding-lg;
}

.pull-refresh-container {
  flex: 1;
  overflow: auto;
  height: 100%;
}

.chart-section {
  padding: $padding-lg;
  overflow-y: auto;
  height: 100%;
  
  :deep(.chart-container) {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>

