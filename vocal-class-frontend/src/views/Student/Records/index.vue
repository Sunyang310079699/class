<template>
  <div class="student-records-page">
    <van-nav-bar title="我的记录" fixed placeholder />
    
    <!-- Tab 切换 -->
    <van-tabs v-model:active="activeTab">
      <van-tab title="上课记录" name="courses">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <div class="records-list">
            <van-empty v-if="courseRecords.length === 0" description="暂无上课记录" />
            
            <div
              v-for="record in courseRecords"
              :key="record.id"
              class="record-item"
            >
              <div class="record-date">
                <div class="date">{{ formatDate(record.date) }}</div>
                <div class="time">{{ record.startTime }} - {{ record.endTime }}</div>
              </div>
              <div class="record-info">
                <div class="location">
                  <van-icon name="location-o" />
                  {{ record.location }}
                </div>
                <div class="duration">课时：{{ record.duration }}h</div>
                <div v-if="record.notes" class="notes">{{ record.notes }}</div>
              </div>
              <div class="record-status">
                <van-tag v-if="record.status === 'completed' && record.attendanceStatus === 'present'" type="success">已完成</van-tag>
                <van-tag v-else-if="record.status === 'completed' && record.attendanceStatus === 'leave'" type="warning">已请假</van-tag>
                <van-tag v-else-if="record.status === 'completed' && record.attendanceStatus === 'absent'" type="danger">旷课</van-tag>
                <van-tag v-else-if="record.status === 'pending'" type="warning">待上课</van-tag>
                <van-tag v-else type="default">已取消</van-tag>
              </div>
            </div>
          </div>
        </van-pull-refresh>
      </van-tab>
      
      <van-tab title="缴费记录" name="income">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <div class="records-list">
            <van-empty v-if="incomeRecords.length === 0" description="暂无缴费记录" />
            
            <div
              v-for="record in incomeRecords"
              :key="record.id"
              class="record-item income"
            >
              <div class="record-icon">💰</div>
              <div class="record-info">
                <div class="amount">+¥{{ record.amount }}</div>
                <div class="date">{{ record.date }}</div>
                <div class="note">{{ record.note }}</div>
              </div>
            </div>
          </div>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCourseStore } from '@/stores/course'
import { useIncomeStore } from '@/stores/income'
import { showToast } from 'vant'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const courseStore = useCourseStore()
const incomeStore = useIncomeStore()

const activeTab = ref('courses')
const refreshing = ref(false)
const courseRecords = ref([])
const incomeRecords = ref([])

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 加载数据
const loadData = async () => {
  try {
    // 加载上课记录（不需要传 studentId，后端会自动过滤）
    const courses = await courseStore.fetchCourses({})
    courseRecords.value = (courses.courses || []).sort((a, b) => {
      return dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    })
    
    // 加载缴费记录（不需要传 studentId，后端会自动过滤）
    const income = await incomeStore.fetchIncomeList({})
    console.log('缴费记录数据:', income)
    incomeRecords.value = (income.records || []).sort((a, b) => {
      return dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    })
    console.log('缴费记录数量:', incomeRecords.value.length)
  } catch (error) {
    console.error('加载记录失败:', error)
    showToast('加载失败')
  }
}

// 下拉刷新
const onRefresh = async () => {
  await loadData()
  refreshing.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.student-records-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 70px;
}

.records-list {
  padding: $padding-lg;
  display: flex;
  flex-direction: column;
  gap: $padding-md;
}

.record-item {
  background: white;
  border-radius: $border-radius-lg;
  padding: $padding-lg;
  box-shadow: $box-shadow-sm;
  display: flex;
  align-items: center;
  gap: $padding-md;
  
  &.income {
    .record-icon {
      font-size: 32px;
    }
    
    .record-info {
      flex: 1;
      
      .amount {
        font-size: $font-size-xl;
        font-weight: bold;
        color: $success-color;
        margin-bottom: 4px;
      }
      
      .date {
        font-size: $font-size-sm;
        color: $text-color-secondary;
        margin-bottom: 4px;
      }
      
      .note {
        font-size: $font-size-sm;
        color: $text-color-light;
      }
    }
  }
}

.record-date {
  text-align: center;
  min-width: 80px;
  
  .date {
    font-size: $font-size-md;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .time {
    font-size: $font-size-xs;
    color: $text-color-secondary;
  }
}

.record-info {
  flex: 1;
  
  .location {
    font-size: $font-size-md;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .duration {
    font-size: $font-size-sm;
    color: $text-color-secondary;
    margin-bottom: 4px;
  }
  
  .notes {
    font-size: $font-size-sm;
    color: $text-color-light;
  }
}
</style>

