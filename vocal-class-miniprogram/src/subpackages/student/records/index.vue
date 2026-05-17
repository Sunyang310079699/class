<template>
  <scroll-view class="page" scroll-y>
    <view class="tabs">
      <view
        class="tab"
        :class="{ active: activeTab === 'courses' }"
        @tap="activeTab = 'courses'"
      >
        上课记录
      </view>
      <view
        class="tab"
        :class="{ active: activeTab === 'income' }"
        @tap="activeTab = 'income'"
      >
        缴费记录
      </view>
    </view>

    <view v-if="activeTab === 'courses'" class="list">
      <view v-if="courseRecords.length === 0" class="empty">
        <text>暂无上课记录</text>
      </view>
      <view
        v-for="r in courseRecords"
        :key="r.id"
        class="record-card"
      >
        <view class="date">
          <text class="main">{{ r.date }}</text>
          <text class="sub">{{ r.startTime }} - {{ r.endTime }}</text>
        </view>
        <view class="info">
          <text class="location">{{ r.location }}</text>
          <text v-if="r.notes" class="notes">{{ r.notes }}</text>
        </view>
        <view class="status">
          <text v-if="r.status === 'completed' && r.attendanceStatus === 'present'" class="tag success">
            已完成
          </text>
          <text v-else-if="r.status === 'completed' && r.attendanceStatus === 'leave'" class="tag warning">
            请假
          </text>
          <text v-else-if="r.status === 'completed' && r.attendanceStatus === 'absent'" class="tag danger">
            旷课
          </text>
          <text v-else-if="r.status === 'pending'" class="tag warning">
            待上课
          </text>
          <text v-else class="tag default">
            已取消
          </text>
        </view>
      </view>
    </view>

    <view v-else class="list">
      <view v-if="incomeRecords.length === 0" class="empty">
        <text>暂无缴费记录</text>
      </view>
      <view
        v-for="r in incomeRecords"
        :key="r.id"
        class="record-card income"
      >
        <view class="icon">💰</view>
        <view class="info">
          <text class="amount">+¥{{ r.amount }}</text>
          <text class="date">{{ r.date }}</text>
          <text class="notes">{{ r.note || '课时购买' }}</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCourseStore } from '@/stores/course'
import { useIncomeStore } from '@/stores/income'
import dayjs from 'dayjs'

const courseStore = useCourseStore()
const incomeStore = useIncomeStore()

const activeTab = ref('courses')
const courseRecords = ref([])
const incomeRecords = ref([])

async function loadData() {
  const courseData = await courseStore.fetchCourses({})
  courseRecords.value = (courseData.courses || []).sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  )
  const incomeData = await incomeStore.fetchRecords({})
  incomeRecords.value = (incomeData.records || []).sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  )
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.tabs {
  margin: 16rpx 24rpx 8rpx;
  padding: 4rpx;
  border-radius: 999rpx;
  background-color: #ffffff;
  display: flex;
}

.tab {
  flex: 1;
  text-align: center;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #646566;
}

.tab.active {
  background: linear-gradient(135deg, #ff8b7b 0%, #ff6b6b 100%);
  color: #ffffff;
}

.list {
  padding: 0 24rpx 24rpx;
}

.empty {
  padding: 40rpx 0;
  text-align: center;
  color: #969799;
}

.record-card {
  margin-top: 12rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.record-card.income .icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffb366 0%, #ff9a3d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.record-card .date {
  width: 160rpx;
}

.record-card .date .main {
  font-size: 26rpx;
}

.record-card .date .sub {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #969799;
}

.record-card .info {
  flex: 1;
}

.record-card.income .amount {
  font-size: 30rpx;
  font-weight: 600;
  color: #07c160;
}

.record-card.income .date {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #969799;
}

.record-card.income .notes {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #323233;
}

.record-card .location {
  font-size: 26rpx;
  color: #323233;
}

.record-card .notes {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #969799;
}

.status {
  justify-content: center;
  align-items: center;
  display: flex;
}

.tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.tag.success {
  background-color: #e8f9e8;
  color: #07c160;
}

.tag.warning {
  background-color: #fff7cc;
  color: #ff9a3d;
}

.tag.danger {
  background-color: #ffe7e7;
  color: #ee0a24;
}

.tag.default {
  background-color: #f2f3f5;
  color: #646566;
}
</style>


