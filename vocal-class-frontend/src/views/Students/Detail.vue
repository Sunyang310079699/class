<template>
  <div class="student-detail-page">
    <van-nav-bar
      title="学生详情"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <van-icon name="edit" @click="showEditDialog" />
      </template>
    </van-nav-bar>
    
    <div v-if="student" class="detail-content">
      <!-- 学生信息卡片 -->
      <div class="info-card">
        <div class="avatar">{{ student.name.charAt(0) }}</div>
        <div class="info">
          <h2 class="name">{{ student.name }}</h2>
          <div class="phone">{{ student.phone }}</div>
        </div>
        <div class="hours-badge" :class="{ warning: student.remainingHours < 3 }">
          <div class="hours">{{ student.remainingHours }}</div>
          <div class="label">剩余课时</div>
        </div>
      </div>
      
      <!-- 备注 -->
      <div v-if="student.notes" class="notes-section">
        <van-cell-group inset title="备注信息">
          <van-cell>
            {{ student.notes }}
          </van-cell>
        </van-cell-group>
      </div>
      
      <!-- 操作按钮 -->
      <div class="actions">
        <van-button
          type="primary"
          size="large"
          round
          block
          @click="showPurchaseDialog"
        >
          <van-icon name="bag-o" />
          购买课时
        </van-button>
        
        <van-button
          type="success"
          size="large"
          round
          block
          @click="goToAddCourse"
        >
          <van-icon name="plus" />
          安排课程
        </van-button>
      </div>
      
      <!-- 课时包记录 -->
      <van-cell-group inset title="课时包记录">
        <van-empty v-if="!student.coursePackages || student.coursePackages.length === 0" description="暂无记录" />
        <van-cell
          v-for="pkg in student.coursePackages"
          :key="pkg.id"
          :title="`购买 ${pkg.hours} 课时`"
          :label="pkg.purchaseDate"
        >
          <template #value>
            <span class="amount">¥{{ pkg.amount }}</span>
          </template>
        </van-cell>
      </van-cell-group>
      
      <!-- 上课记录 -->
      <van-cell-group inset title="上课记录">
        <van-empty v-if="!student.recentCourses || student.recentCourses.length === 0" description="暂无记录" />
        <van-cell
          v-for="course in student.recentCourses"
          :key="course.id"
          :title="`${course.date} ${course.startTime}`"
          :label="`${course.duration} 课时 · ${course.location}`"
        >
          <template #value>
            <van-tag v-if="course.status === 'completed' && course.attendanceStatus === 'present'" type="success">已完成</van-tag>
            <van-tag v-else-if="course.status === 'completed' && course.attendanceStatus === 'leave'" type="warning">已请假</van-tag>
            <van-tag v-else-if="course.status === 'completed' && course.attendanceStatus === 'absent'" type="danger">旷课</van-tag>
            <van-tag v-else-if="course.status === 'pending'" type="warning">待上课</van-tag>
            <van-tag v-else type="default">已取消</van-tag>
          </template>
        </van-cell>
      </van-cell-group>
      
      <!-- 删除按钮 -->
      <div class="danger-zone">
        <van-button
          type="danger"
          size="small"
          plain
          @click="handleDelete"
        >
          删除学生
        </van-button>
      </div>
    </div>
    
    <!-- 购买课时弹窗 -->
    <van-dialog
      v-model:show="showPurchase"
      title="购买课时"
      show-cancel-button
      @confirm="handlePurchaseConfirm"
    >
      <van-form>
        <van-field
          v-model="purchaseForm.hours"
          name="hours"
          label="课时数"
          placeholder="请输入课时数"
          type="number"
          :rules="[{ required: true, message: '请输入课时数' }]"
        />
        
        <van-field
          v-model="purchaseForm.amount"
          name="amount"
          label="支付金额"
          placeholder="请输入金额"
          type="number"
          :rules="[{ required: true, message: '请输入金额' }]"
        />
        
        <van-field
          v-model="purchaseForm.purchaseDate"
          name="purchaseDate"
          label="购买日期"
          placeholder="点击选择日期"
          readonly
          @click="showDatePicker = true"
        />
        
        <van-field
          v-model="purchaseForm.note"
          name="note"
          label="备注"
          type="textarea"
          placeholder="选填"
          rows="2"
        />
      </van-form>
    </van-dialog>
    
    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
    
    <!-- 编辑学生弹窗 -->
    <van-dialog
      v-model:show="showEdit"
      title="编辑学生"
      show-cancel-button
      @confirm="handleEditConfirm"
    >
      <van-form>
        <van-field
          v-model="editForm.name"
          name="name"
          label="姓名"
          placeholder="请输入姓名"
        />
        
        <van-field
          v-model="editForm.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          type="tel"
        />
        
        <van-field
          v-model="editForm.notes"
          name="notes"
          label="备注"
          type="textarea"
          placeholder="请输入备注"
          rows="3"
        />
      </van-form>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/student'
import { purchaseCoursePackage } from '@/api/student'
import { showToast, showDialog, showConfirmDialog } from 'vant'
import { getToday } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()

const studentId = route.params.id

const student = ref(null)
const showPurchase = ref(false)
const showEdit = ref(false)
const showDatePicker = ref(false)

const selectedDate = ref(new Date())

const purchaseForm = ref({
  hours: '',
  amount: '',
  purchaseDate: getToday(),
  note: ''
})

const editForm = ref({
  name: '',
  phone: '',
  notes: ''
})

// 加载学生详情
const loadData = async () => {
  try {
    student.value = await studentStore.fetchStudentDetail(studentId)
    
    // 如果有 action 参数，自动打开对应弹窗
    if (route.query.action === 'purchase') {
      showPurchase.value = true
    }
  } catch (error) {
    showToast('加载失败')
    router.back()
  }
}

// 返回
const onClickLeft = () => {
  router.back()
}

// 显示购买课时弹窗
const showPurchaseDialog = () => {
  purchaseForm.value = {
    hours: '',
    amount: '',
    purchaseDate: getToday(),
    note: ''
  }
  showPurchase.value = true
}

// 确认购买课时
const handlePurchaseConfirm = async () => {
  if (!purchaseForm.value.hours || !purchaseForm.value.amount) {
    showToast('请填写完整信息')
    return
  }
  
  try {
    await purchaseCoursePackage(studentId, {
      hours: parseInt(purchaseForm.value.hours),
      amount: parseFloat(purchaseForm.value.amount),
      purchaseDate: purchaseForm.value.purchaseDate,
      note: purchaseForm.value.note
    })
    
    showToast('购买成功')
    await loadData()
    showPurchase.value = false
  } catch (error) {
    showToast('购买失败')
  }
}

// 日期选择确认
const onDateConfirm = (value) => {
  const year = value.selectedValues[0]
  const month = value.selectedValues[1].toString().padStart(2, '0')
  const day = value.selectedValues[2].toString().padStart(2, '0')
  purchaseForm.value.purchaseDate = `${year}-${month}-${day}`
  showDatePicker.value = false
}

// 显示编辑弹窗
const showEditDialog = () => {
  editForm.value = {
    name: student.value.name,
    phone: student.value.phone,
    notes: student.value.notes || ''
  }
  showEdit.value = true
}

// 确认编辑
const handleEditConfirm = async () => {
  try {
    await studentStore.updateStudent(studentId, editForm.value)
    showToast('修改成功')
    await loadData()
    showEdit.value = false
  } catch (error) {
    showToast('修改失败')
  }
}

// 安排课程
const goToAddCourse = () => {
  router.push({
    path: '/schedule/add',
    query: { studentId: studentId }
  })
}

// 删除学生
const handleDelete = async () => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '删除后数据无法恢复，确定要删除该学生吗？',
      confirmButtonText: '确定删除',
      confirmButtonColor: '#ee0a24'
    })
    
    await studentStore.removeStudent(studentId)
    showToast('删除成功')
    router.back()
  } catch (error) {
    if (error !== 'cancel') {
      showToast('删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})

// 监听路由变化
watch(() => route.query.action, (action) => {
  if (action === 'purchase') {
    showPurchaseDialog()
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.student-detail-page {
  min-height: 100vh;
  background: $background-color;
}

.detail-content {
  padding: $padding-lg;
  padding-bottom: 80px;
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: $border-radius-lg;
  padding: $padding-xl;
  color: white;
  display: flex;
  align-items: center;
  gap: $padding-lg;
  box-shadow: $box-shadow-md;
  margin-bottom: $padding-lg;
  
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
      margin-bottom: $padding-xs;
    }
    
    .phone {
      font-size: $font-size-md;
      opacity: 0.9;
    }
  }
  
  .hours-badge {
    text-align: center;
    padding: $padding-md;
    background: rgba(255, 255, 255, 0.2);
    border-radius: $border-radius-md;
    
    &.warning {
      background: rgba(255, 152, 106, 0.3);
    }
    
    .hours {
      font-size: 28px;
      font-weight: bold;
    }
    
    .label {
      font-size: $font-size-xs;
      margin-top: 4px;
      opacity: 0.9;
    }
  }
}

.notes-section {
  margin-bottom: $padding-lg;
}

.actions {
  display: flex;
  gap: $padding-md;
  margin-bottom: $padding-lg;
  
  :deep(.van-button) {
    flex: 1;
  }
}

.amount {
  color: $danger-color;
  font-weight: bold;
}

.danger-zone {
  margin-top: $padding-xxl;
  text-align: center;
  padding: $padding-lg 0;
}

:deep(.van-dialog__message) {
  padding: $padding-lg;
}

:deep(.van-cell-group__title) {
  color: $text-color;
  font-weight: bold;
}
</style>

