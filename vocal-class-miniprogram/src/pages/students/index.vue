<template>
  <view class="page">
    <view class="search-bar">
      <input
        v-model="keyword"
        class="search-input"
        type="text"
        placeholder="按姓名或电话搜索学生"
        placeholder-class="placeholder"
        @confirm="loadList"
      />
      <button class="search-btn" size="mini" @tap="loadList">搜索</button>
    </view>

    <scroll-view class="list" scroll-y>
      <view
        v-for="item in students"
        :key="item.id || item._id"
        class="student-item"
        @tap="openDetail(item)"
      >
        <view class="left">
          <text class="name">{{ item.name }}</text>
          <text class="phone">{{ item.phone }}</text>
        </view>
        <view class="right">
          <text
            class="hours"
            :class="{ low: (item.remainingHours || 0) < lowHoursThreshold }"
          >
            剩余 {{ item.remainingHours || 0 }} 课时
          </text>
        </view>
      </view>
      <view v-if="!students.length" class="empty">
        <text>暂无学生，请先添加学生</text>
      </view>
    </scroll-view>

    <button class="add-btn" @tap="goAdd">添加学生</button>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from '@/stores/student'
import { useSettingsStore } from '@/stores/settings'

const studentStore = useStudentStore()
const settingsStore = useSettingsStore()

const keyword = ref('')

const students = computed(() => studentStore.students)
const lowHoursThreshold = computed(() => settingsStore.lowHoursThreshold || 3)

async function loadList() {
  await studentStore.fetchStudents({
    keyword: keyword.value
  })
}

function openDetail(student) {
  const id = student.id || student._id
  if (!id) return
  uni.navigateTo({
    url: `/pages/students/detail?id=${id}`
  })
}

function goAdd() {
  uni.navigateTo({
    url: '/pages/students/add'
  })
}

onMounted(() => {
  loadList()
  settingsStore.fetchSettings()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx 24rpx 120rpx;
  box-sizing: border-box;
}

.search-bar {
  display: flex;
  margin-bottom: 16rpx;
}

.search-input {
  flex: 1;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 24rpx;
  border-radius: 32rpx;
  background-color: #ffffff;
  font-size: 26rpx;
}

.placeholder {
  color: #c8c9cc;
}

.search-btn {
  margin-left: 12rpx;
  padding: 0 24rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
  background-color: #1989fa;
  color: #ffffff;
  font-size: 26rpx;
}

.list {
  max-height: calc(100vh - 220rpx);
}

.student-item {
  margin-top: 16rpx;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name {
  font-size: 30rpx;
  color: #323233;
}

.phone {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: #969799;
}

.hours {
  font-size: 24rpx;
  color: #07c160;
}

.hours.low {
  color: #ee0a24;
}

.empty {
  padding: 40rpx 0;
  text-align: center;
  color: #969799;
}

.add-btn {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #ff8b7b 0%, #ff6b6b 100%);
  color: #ffffff;
  font-size: 30rpx;
}
</style>


