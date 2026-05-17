<template>
  <scroll-view class="page" scroll-y>
    <view v-if="student" class="card">
      <view class="row">
        <text class="label">姓名</text>
        <text class="value">{{ student.name }}</text>
      </view>
      <view class="row">
        <text class="label">电话</text>
        <text class="value">{{ student.phone }}</text>
      </view>
      <view class="row">
        <text class="label">剩余课时</text>
        <text
          class="value"
          :class="{ low: (student.remainingHours || 0) < 3 }"
        >
          {{ student.remainingHours || 0 }} 课时
        </text>
      </view>
      <view v-if="student.notes" class="row">
        <text class="label">备注</text>
        <text class="value">{{ student.notes }}</text>
      </view>
    </view>

    <view class="card">
      <view class="row-title">
        <text class="title">购买课时</text>
      </view>
      <view class="row">
        <text class="label">课时数</text>
        <input
          v-model.number="purchase.hours"
          class="input"
          type="number"
          placeholder="请输入正整数"
          placeholder-class="placeholder"
        />
      </view>
      <view class="row">
        <text class="label">金额</text>
        <input
          v-model.number="purchase.amount"
          class="input"
          type="number"
          placeholder="请输入支付金额"
          placeholder-class="placeholder"
        />
      </view>
      <view class="row">
        <text class="label">日期</text>
        <picker mode="date" :value="purchase.purchaseDate" @change="onDateChange">
          <view class="picker-value">
            {{ purchase.purchaseDate || '选择日期' }}
          </view>
        </picker>
      </view>
      <view class="row">
        <text class="label">备注</text>
        <textarea
          v-model="purchase.note"
          class="textarea"
          maxlength="100"
          placeholder="可选"
          placeholder-class="placeholder"
        />
      </view>
      <button class="buy-btn" @tap="handlePurchase">确认购买</button>
    </view>

    <view v-if="student?.coursePackages?.length" class="card">
      <view class="row-title">
        <text class="title">课时包记录</text>
      </view>
      <view
        v-for="pkg in student.coursePackages"
        :key="pkg.id"
        class="pkg-item"
      >
        <text class="pkg-main">{{ pkg.hours }} 课时 · ¥{{ pkg.amount }}</text>
        <text class="pkg-sub">{{ pkg.purchaseDate }} {{ pkg.note }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useStudentStore } from '@/stores/student'

const studentStore = useStudentStore()

const student = computed(() => studentStore.currentStudent)
const purchase = reactive({
  hours: 0,
  amount: 0,
  purchaseDate: '',
  note: ''
})

function onDateChange(e) {
  purchase.purchaseDate = e.detail.value
}

function validatePurchase() {
  if (!purchase.hours || purchase.hours <= 0) {
    uni.showToast({ title: '请输入购买课时数', icon: 'none' })
    return false
  }
  if (!purchase.amount || purchase.amount <= 0) {
    uni.showToast({ title: '请输入正确的金额', icon: 'none' })
    return false
  }
  if (!purchase.purchaseDate) {
    uni.showToast({ title: '请选择购买日期', icon: 'none' })
    return false
  }
  return true
}

async function handlePurchase() {
  if (!student.value) return
  if (!validatePurchase()) return
  try {
    await studentStore.buyCoursePackage(student.value.id || student.value._id, purchase)
    uni.showToast({ title: '购买成功', icon: 'success' })
  } catch (e) {
    // 统一错误处理
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  const id = current.options.id
  if (id) {
    studentStore.fetchStudentDetail(id)
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
  box-sizing: border-box;
}

.card {
  margin-bottom: 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
}

.row {
  margin-bottom: 16rpx;
}

.row:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 26rpx;
  color: #969799;
}

.value {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #323233;
}

.value.low {
  color: #ee0a24;
}

.row-title {
  margin-bottom: 16rpx;
}

.title {
  font-size: 30rpx;
  font-weight: 500;
  color: #323233;
}

.input {
  margin-top: 8rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 20rpx;
  border-radius: 16rpx;
  background-color: #f7f8fa;
  font-size: 26rpx;
}

.picker-value {
  margin-top: 8rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 20rpx;
  border-radius: 16rpx;
  background-color: #f7f8fa;
  font-size: 26rpx;
  color: #323233;
}

.textarea {
  margin-top: 8rpx;
  min-height: 140rpx;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  background-color: #f7f8fa;
  font-size: 26rpx;
}

.placeholder {
  color: #c8c9cc;
}

.buy-btn {
  margin-top: 24rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #a17fff 0%, #8b5fff 100%);
  color: #ffffff;
  font-size: 28rpx;
}

.pkg-item {
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.pkg-item:last-child {
  border-bottom-width: 0;
}

.pkg-main {
  display: block;
  font-size: 28rpx;
  color: #323233;
}

.pkg-sub {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #969799;
}
</style>


