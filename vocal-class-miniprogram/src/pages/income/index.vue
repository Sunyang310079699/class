<template>
  <scroll-view class="page" scroll-y>
    <view class="stats-card">
      <view class="total">
        <text class="label">总收益</text>
        <text class="amount">¥{{ overview.total || 0 }}</text>
      </view>
      <view class="grid">
        <view class="item">
          <text class="value">¥{{ overview.today || 0 }}</text>
          <text class="text">今日</text>
        </view>
        <view class="item">
          <text class="value">¥{{ overview.week || 0 }}</text>
          <text class="text">本周</text>
        </view>
        <view class="item">
          <text class="value">¥{{ overview.month || 0 }}</text>
          <text class="text">本月</text>
        </view>
        <view class="item">
          <text class="value">¥{{ overview.year || 0 }}</text>
          <text class="text">本年</text>
        </view>
      </view>
    </view>

    <view class="filter-bar">
      <picker mode="date" fields="month" :value="month" @change="onMonthChange">
        <view class="filter-item">
          <text class="filter-label">月份</text>
          <text class="filter-value">{{ monthText }}</text>
        </view>
      </picker>
    </view>

    <scroll-view class="list" scroll-y>
      <view v-if="records.length === 0" class="empty">
        <text>当前筛选条件暂无收益记录</text>
      </view>
      <view
        v-for="item in records"
        :key="item.id"
        class="income-item"
      >
        <view class="left">
          <view class="icon" :class="item.type">
            <text v-if="item.type === 'course_package'">📦</text>
            <text v-else-if="item.type === 'course'">🎓</text>
            <text v-else>💰</text>
          </view>
          <view class="info">
            <text class="title">
              {{ item.studentName || '其他' }}
            </text>
            <text class="note">
              {{ item.note || (item.type === 'course_package' ? '课时包购买' : '其他收入') }}
            </text>
            <text class="date">{{ item.date }}</text>
          </view>
        </view>
        <view class="right">
          <text class="amount">+¥{{ item.amount }}</text>
          <text class="tag" :class="item.type === 'course_package' ? 'primary' : 'success'">
            {{ mapType(item.type) }}
          </text>
        </view>
      </view>
    </scroll-view>
  </scroll-view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useIncomeStore } from '@/stores/income'
import dayjs from 'dayjs'

const incomeStore = useIncomeStore()

const month = ref(dayjs().format('YYYY-MM'))

const overview = computed(() => incomeStore.overview)
const allRecords = computed(() => incomeStore.records)

const monthText = computed(() => {
  const d = dayjs(month.value + '-01')
  return d.format('YYYY年MM月')
})

const records = computed(() => {
  if (!month.value) return allRecords.value
  const [y, m] = month.value.split('-')
  return allRecords.value.filter((item) => {
    const d = dayjs(item.date)
    return d.year() === Number(y) && d.month() + 1 === Number(m)
  })
})

function mapType(type) {
  if (type === 'course_package') return '课时收益'
  if (type === 'course') return '上课收益'
  return '其他收入'
}

function onMonthChange(e) {
  month.value = e.detail.value
}

async function loadData() {
  await Promise.all([incomeStore.fetchOverview(), incomeStore.fetchRecords()])
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

.stats-card {
  margin: 24rpx 24rpx 16rpx;
  padding: 32rpx 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #a17fff 0%, #8b5fff 100%);
  color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.total .label {
  font-size: 26rpx;
  opacity: 0.9;
}

.total .amount {
  margin-top: 12rpx;
  font-size: 40rpx;
  font-weight: 600;
}

.grid {
  margin-top: 24rpx;
  display: flex;
  justify-content: space-between;
}

.grid .item {
  flex: 1;
  text-align: center;
}

.grid .value {
  font-size: 26rpx;
  font-weight: 500;
}

.grid .text {
  margin-top: 4rpx;
  font-size: 22rpx;
  opacity: 0.9;
}

.filter-bar {
  margin: 0 24rpx 8rpx;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  background-color: #ffffff;
}

.filter-item {
  display: flex;
  justify-content: space-between;
}

.filter-label {
  font-size: 26rpx;
  color: #646566;
}

.filter-value {
  font-size: 26rpx;
  color: #323233;
}

.list {
  max-height: calc(100vh - 260rpx);
  padding: 0 24rpx 24rpx;
}

.empty {
  padding: 40rpx 0;
  text-align: center;
  color: #969799;
}

.income-item {
  margin-top: 16rpx;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.left {
  display: flex;
  align-items: center;
}

.icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  font-size: 32rpx;
  color: #ffffff;
}

.icon.course_package {
  background: linear-gradient(135deg, #ffb366 0%, #ff9a3d 100%);
}

.icon.course {
  background: linear-gradient(135deg, #00d4aa 0%, #00c896 100%);
}

.icon.other {
  background: linear-gradient(135deg, #ff8585 0%, #ff6b6b 100%);
}

.info .title {
  font-size: 28rpx;
  color: #323233;
}

.info .note {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #646566;
}

.info .date {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #c8c9cc;
}

.right {
  text-align: right;
}

.right .amount {
  font-size: 28rpx;
  font-weight: 600;
  color: #07c160;
}

.right .tag {
  margin-top: 6rpx;
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 22rpx;
  border-radius: 999rpx;
  color: #ffffff;
}

.right .tag.primary {
  background-color: #8b5fff;
}

.right .tag.success {
  background-color: #07c160;
}
</style>


