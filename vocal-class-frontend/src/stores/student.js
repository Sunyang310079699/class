import { defineStore } from 'pinia'
import { getStudents, getStudentDetail, createStudent, updateStudent, deleteStudent, getMyInfo } from '@/api/student'

export const useStudentStore = defineStore('student', {
  state: () => ({
    students: [],
    currentStudent: null,
    loading: false
  }),
  
  getters: {
    // 获取课时不足的学生
    lowHoursStudents: (state) => {
      return state.students.filter(s => s.remainingHours < 3)
    },
    
    // 获取学生总数
    totalStudents: (state) => state.students.length,
    
    // 根据 ID 获取学生
    getStudentById: (state) => (id) => {
      return state.students.find(s => s.id === id)
    }
  },
  
  actions: {
    // 获取学生列表
    async fetchStudents(params = {}) {
      this.loading = true
      try {
        const data = await getStudents(params)
        this.students = data.students || []
        return data
      } catch (error) {
        console.error('获取学生列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取学生详情
    async fetchStudentDetail(id) {
      this.loading = true
      try {
        const data = await getStudentDetail(id)
        this.currentStudent = data
        return data
      } catch (error) {
        console.error('获取学生详情失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 添加学生
    async addStudent(studentData) {
      try {
        const data = await createStudent(studentData)
        this.students.push(data)
        return data
      } catch (error) {
        console.error('添加学生失败:', error)
        throw error
      }
    },
    
    // 更新学生
    async updateStudent(id, studentData) {
      try {
        const data = await updateStudent(id, studentData)
        const index = this.students.findIndex(s => s.id === id)
        if (index !== -1) {
          this.students[index] = data
        }
        return data
      } catch (error) {
        console.error('更新学生失败:', error)
        throw error
      }
    },
    
    // 删除学生
    async removeStudent(id) {
      try {
        await deleteStudent(id)
        const index = this.students.findIndex(s => s.id === id)
        if (index !== -1) {
          this.students.splice(index, 1)
        }
      } catch (error) {
        console.error('删除学生失败:', error)
        throw error
      }
    },
    
    // 学生端：获取自己的信息
    async fetchMyInfo() {
      this.loading = true
      try {
        const data = await getMyInfo()
        this.currentStudent = data
        return data
      } catch (error) {
        console.error('获取我的信息失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

