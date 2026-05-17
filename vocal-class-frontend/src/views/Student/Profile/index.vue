<template>
  <div class="student-profile-page">
    <van-nav-bar title="个人中心" fixed placeholder />
    
    <!-- 用户信息 -->
    <div class="user-info">
      <div class="avatar">{{ userName.charAt(0) }}</div>
      <div class="info">
        <h2 class="name">{{ userName }}</h2>
        <p class="account">账号：{{ authStore.user?.account }}</p>
      </div>
    </div>
    
    <!-- 我的课时 -->
    <van-cell-group inset title="我的课时">
      <van-cell title="剩余课时" :value="`${studentInfo?.remainingHours || 0} 课时`" />
    </van-cell-group>
    
    <!-- 我的记录 -->
    <van-cell-group inset title="我的记录">
      <van-cell title="上课记录" is-link @click="goToRecords" />
      <van-cell title="缴费记录" is-link @click="goToRecords" />
    </van-cell-group>
    
    <!-- 账号管理 -->
    <van-cell-group inset title="账号管理">
      <van-cell title="修改密码" is-link @click="showPasswordDialog = true" />
      <van-cell title="切换账号" is-link @click="handleLogout" />
    </van-cell-group>
    
    <!-- 修改密码弹窗 -->
    <van-dialog
      v-model:show="showPasswordDialog"
      title="修改密码"
      show-cancel-button
      @confirm="handleChangePassword"
    >
      <van-form>
        <van-field
          v-model="passwordForm.oldPassword"
          name="oldPassword"
          label="旧密码"
          type="password"
          placeholder="请输入旧密码"
          required
        />
        <van-field
          v-model="passwordForm.newPassword"
          name="newPassword"
          label="新密码"
          type="password"
          placeholder="请输入新密码（至少6位）"
          required
        />
        <van-field
          v-model="passwordForm.confirmPassword"
          name="confirmPassword"
          label="确认密码"
          type="password"
          placeholder="请再次输入新密码"
          required
        />
      </van-form>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useStudentStore } from '@/stores/student'
import { showToast, showDialog, showConfirmDialog } from 'vant'

const router = useRouter()
const authStore = useAuthStore()
const studentStore = useStudentStore()

const studentInfo = ref(null)
const showPasswordDialog = ref(false)

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const userName = computed(() => authStore.userName)

// 加载数据
const loadData = async () => {
  try {
    // 使用学生端 API 获取自己的信息
    const student = await studentStore.fetchMyInfo()
    studentInfo.value = student
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 跳转到记录页
const goToRecords = () => {
  router.push('/student/records')
}

// 修改密码
const handleChangePassword = async () => {
  const { oldPassword, newPassword, confirmPassword } = passwordForm.value
  
  if (!oldPassword || !newPassword || !confirmPassword) {
    showToast('请填写完整信息')
    return
  }
  
  if (newPassword.length < 6) {
    showToast('新密码长度至少6位')
    return
  }
  
  if (newPassword !== confirmPassword) {
    showToast('两次输入的密码不一致')
    return
  }
  
  try {
    await authStore.updatePassword(oldPassword, newPassword)
    showPasswordDialog.value = false
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    // 错误已在 store 中处理
  }
}

// 切换账号
const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认切换账号',
      message: '切换账号后将退出当前登录，确定吗？'
    })
    
    await authStore.logout()
    router.push('/login')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.student-profile-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 70px;
}

.user-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: $padding-xxl $padding-lg;
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
    
    .account {
      font-size: $font-size-sm;
      opacity: 0.9;
    }
  }
}

:deep(.van-cell-group) {
  margin-top: $padding-lg;
}

:deep(.van-dialog__message) {
  padding: $padding-lg;
}
</style>

