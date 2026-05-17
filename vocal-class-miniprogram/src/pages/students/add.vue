<template>
  <view class="page">
    <view class="form-card">
      <view class="form-item">
        <text class="label">学生姓名</text>
        <input
          v-model="form.name"
          class="input"
          type="text"
          placeholder="请输入 2-10 个字符的姓名"
          placeholder-class="placeholder"
        />
      </view>
      <view class="form-item">
        <text class="label">联系电话</text>
        <input
          v-model="form.phone"
          class="input"
          type="number"
          placeholder="请输入 11 位手机号"
          placeholder-class="placeholder"
        />
      </view>
      <view class="form-item">
        <text class="label">初始课时</text>
        <input
          v-model.number="form.remainingHours"
          class="input"
          type="number"
          placeholder="默认为 0"
          placeholder-class="placeholder"
        />
      </view>
      <view class="form-item">
        <text class="label">备注</text>
        <textarea
          v-model="form.notes"
          class="textarea"
          maxlength="200"
          placeholder="可选，最多 200 字"
          placeholder-class="placeholder"
        />
      </view>
    </view>

    <button class="submit-btn" @tap="handleSubmit">保存</button>
  </view>
</template>

<script setup>
import { reactive } from 'vue'
import { useStudentStore } from '@/stores/student'

const studentStore = useStudentStore()

const form = reactive({
  name: '',
  phone: '',
  remainingHours: 0,
  notes: ''
})

function validate() {
  if (!form.name || form.name.length < 2 || form.name.length > 10) {
    uni.showToast({ title: '姓名长度需为 2-10 个字符', icon: 'none' })
    return false
  }
  if (!/^1\d{10}$/.test(form.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return false
  }
  if (form.remainingHours < 0) {
    uni.showToast({ title: '初始课时不能为负数', icon: 'none' })
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate()) return
  try {
    await studentStore.addStudent(form)
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 600)
  } catch (e) {
    // 错误已统一处理
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 24rpx;
  box-sizing: border-box;
}

.form-card {
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
}

.form-item {
  margin-bottom: 24rpx;
}

.label {
  display: block;
  margin-bottom: 8rpx;
  font-size: 26rpx;
  color: #323233;
}

.input {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 20rpx;
  border-radius: 16rpx;
  background-color: #f7f8fa;
  font-size: 26rpx;
}

.textarea {
  min-height: 160rpx;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  background-color: #f7f8fa;
  font-size: 26rpx;
}

.placeholder {
  color: #c8c9cc;
}

.submit-btn {
  margin-top: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #ff8b7b 0%, #ff6b6b 100%);
  color: #ffffff;
  font-size: 30rpx;
}
</style>


