<template>
  <div class="add-student-page">
    <van-nav-bar
      title="添加学生"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          name="name"
          label="姓名"
          placeholder="请输入学生姓名"
          :rules="[{ required: true, message: '请输入学生姓名' }]"
        />
        
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          type="tel"
          maxlength="11"
          :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]"
        />
        
        <van-field
          v-model="form.initialHours"
          name="initialHours"
          label="初始课时"
          placeholder="选填，默认0"
          type="number"
        />
        
        <van-field
          v-model="form.notes"
          name="notes"
          label="备注"
          type="textarea"
          placeholder="请输入备注信息（选填）"
          rows="3"
          maxlength="200"
          show-word-limit
        />
      </van-cell-group>
      
      <div class="submit-btn">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/student'
import { showToast, showDialog, showConfirmDialog } from 'vant'

const router = useRouter()
const studentStore = useStudentStore()

const form = ref({
  name: '',
  phone: '',
  initialHours: '',
  notes: ''
})

const loading = ref(false)

const onClickLeft = () => {
  router.back()
}

const onSubmit = async () => {
  loading.value = true
  
  try {
    // 将 initialHours 转换为 remainingHours 以匹配后端 API
    const data = {
      name: form.value.name,
      phone: form.value.phone,
      remainingHours: form.value.initialHours ? parseInt(form.value.initialHours) : 0,
      notes: form.value.notes
    }
    
    const student = await studentStore.addStudent(data)
    
    // 显示账号信息（如果已创建）
    if (student.accountInfo) {
      try {
        await showDialog({
          title: '✅ 学生创建成功',
          message: `
学生信息已创建成功！

登录账号信息：
账号：${student.accountInfo.account}
密码：${student.accountInfo.password}

请告知学生使用此账号登录系统。
          `,
          confirmButtonText: '知道了',
          allowHtml: false
        })
      } catch {
        // 用户关闭对话框
      }
    } else {
      showToast('学生创建成功')
    }
    
    // 询问是否购买课时
    if (data.remainingHours === 0) {
      try {
        await showConfirmDialog({
          title: '提示',
          message: '是否立即购买课时包？',
          confirmButtonText: '去购买',
          cancelButtonText: '稍后'
        })
        
        // 跳转到学生详情页，并打开购买课时弹窗
        router.replace({
          path: `/students/${student.id}`,
          query: { action: 'purchase' }
        })
      } catch {
        // 取消，返回列表
        router.back()
      }
    } else {
      router.back()
    }
  } catch (error) {
    showToast('添加失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.add-student-page {
  min-height: 100vh;
  background: $background-color;
}

.submit-btn {
  padding: $padding-lg;
}
</style>

