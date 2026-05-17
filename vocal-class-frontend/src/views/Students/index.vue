<template>
  <div class="students-page">
    <van-nav-bar title="学生管理" fixed placeholder />
    
    <!-- 搜索栏 -->
    <van-search
      v-model="searchKeyword"
      placeholder="搜索学生姓名或手机号"
      @search="handleSearch"
      @clear="handleSearch"
    />
    
    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="label">学生总数</span>
        <span class="value">{{ students.length }}</span>
      </div>
      <div class="stat-item">
        <span class="label">课时预警</span>
        <span class="value warning">{{ lowHoursCount }}</span>
      </div>
      <van-switch 
        v-model="showOnlyLowHours" 
        size="20px"
        active-color="#ff976a"
      />
      <span class="filter-label">只看预警</span>
    </div>
    
    <!-- 课时预警提示 -->
    <van-notice-bar
      v-if="lowHoursCount > 0 && !showOnlyLowHours"
      left-icon="warning-o"
      color="#ff976a"
      background="#fff3e0"
      @click="showOnlyLowHours = true"
    >
      有 {{ lowHoursCount }} 位学生课时不足，点击查看
    </van-notice-bar>
    
    <!-- 学生列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="students-list">
        <van-empty v-if="filteredStudents.length === 0" description="暂无学生" />
        
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="student-card"
          @click="goToDetail(student.id)"
        >
          <div class="student-header">
            <div class="avatar">
              {{ student.name.charAt(0) }}
            </div>
            <div class="student-info">
              <div class="name">{{ student.name }}</div>
              <div class="phone">{{ formatPhone(student.phone) }}</div>
            </div>
            <div class="hours-info" :class="{ warning: student.remainingHours < 3 }">
              <div class="hours">{{ student.remainingHours }}</div>
              <div class="label">剩余课时</div>
            </div>
          </div>
          
          <div v-if="student.notes" class="student-notes">
            {{ student.notes }}
          </div>
          
          <div class="student-actions">
            <van-button
              size="small"
              type="primary"
              plain
              @click.stop="handlePurchase(student)"
            >
              购买课时
            </van-button>
            <van-button
              size="small"
              type="primary"
              @click.stop="goToAddCourse(student)"
            >
              安排课程
            </van-button>
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
      @click="goToAdd"
    >
      <van-icon name="plus" />
      添加学生
    </van-button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStudentStore } from '@/stores/student'
import { formatPhone } from '@/utils/format'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const studentStore = useStudentStore()

const searchKeyword = ref('')
const refreshing = ref(false)
const showOnlyLowHours = ref(false)

// 学生列表
const students = computed(() => studentStore.students)

// 过滤后的学生列表
const filteredStudents = computed(() => {
  let result = students.value
  
  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(keyword) ||
      s.phone.includes(keyword)
    )
  }
  
  // 课时不足筛选
  if (showOnlyLowHours.value) {
    result = result.filter(s => s.remainingHours < 3)
  }
  
  return result
})

// 课时不足的学生数量
const lowHoursCount = computed(() => {
  return students.value.filter(s => s.remainingHours < 3).length
})

// 加载数据
const loadData = async () => {
  try {
    await studentStore.fetchStudents()
  } catch (error) {
    showToast('加载失败')
  }
}

// 搜索
const handleSearch = () => {
  // 搜索逻辑在 computed 中处理
}

// 下拉刷新
const onRefresh = async () => {
  await loadData()
  refreshing.value = false
  showToast('刷新成功')
}

// 跳转到详情
const goToDetail = (id) => {
  router.push(`/students/${id}`)
}

// 跳转到添加学生
const goToAdd = () => {
  router.push('/students/add')
}

// 购买课时
const handlePurchase = (student) => {
  router.push({
    path: `/students/${student.id}`,
    query: { action: 'purchase' }
  })
}

// 安排课程
const goToAddCourse = (student) => {
  router.push({
    path: '/schedule/add',
    query: { studentId: student.id }
  })
}

// 监听路由参数
watch(() => route.query.filter, (filter) => {
  if (filter === 'lowHours') {
    showOnlyLowHours.value = true
  }
}, { immediate: true })

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.students-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 90px;
}

.stats-bar {
  display: flex;
  align-items: center;
  background: white;
  padding: $padding-md $padding-lg;
  gap: $padding-md;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: $padding-sm;
    
    .label {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
    
    .value {
      font-size: $font-size-xl;
      font-weight: bold;
      color: $primary-color;
      
      &.warning {
        color: $warning-color;
      }
    }
  }
  
  .filter-label {
    font-size: $font-size-sm;
    color: $text-color-secondary;
  }
}

.students-list {
  padding: $padding-lg;
  display: flex;
  flex-direction: column;
  gap: $padding-md;
}

.student-card {
  background: white;
  border-radius: $border-radius-lg;
  padding: $padding-lg;
  box-shadow: $box-shadow-sm;
  cursor: pointer;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
  }
}

.student-header {
  display: flex;
  align-items: center;
  gap: $padding-md;
  margin-bottom: $padding-md;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xl;
  font-weight: bold;
}

.student-info {
  flex: 1;
  
  .name {
    font-size: $font-size-lg;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .phone {
    font-size: $font-size-sm;
    color: $text-color-secondary;
  }
}

.hours-info {
  text-align: center;
  padding: $padding-sm $padding-md;
  background: $background-color;
  border-radius: $border-radius-sm;
  
  &.warning {
    background: #fff3e0;
    
    .hours {
      color: $warning-color;
    }
  }
  
  .hours {
    font-size: $font-size-xl;
    font-weight: bold;
    color: $success-color;
  }
  
  .label {
    font-size: $font-size-xs;
    color: $text-color-secondary;
    margin-top: 2px;
  }
}

.student-notes {
  font-size: $font-size-sm;
  color: $text-color-secondary;
  line-height: 1.5;
  margin-bottom: $padding-md;
  padding: $padding-sm;
  background: $background-color;
  border-radius: $border-radius-sm;
}

.student-actions {
  display: flex;
  gap: $padding-sm;
  
  :deep(.van-button) {
    flex: 1;
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
</style>

