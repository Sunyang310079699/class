import { defineStore } from 'pinia'
import {
  getStudents,
  getStudentDetail,
  createStudent,
  updateStudent,
  deleteStudent,
  purchaseCoursePackage,
  getMyInfo
} from '@/api/student'

export const useStudentStore = defineStore('student', {
  state: () => ({
    students: [],
    currentStudent: null,
    loading: false
  }),
  getters: {
    lowHoursStudents(state) {
      return state.students.filter(s => (s.remainingHours || 0) < 3)
    },
    totalStudents(state) {
      return state.students.length
    }
  },
  actions: {
    async fetchStudents(params = {}) {
      this.loading = true
      try {
        const data = await getStudents(params)
        this.students = data.students || []
        return data
      } finally {
        this.loading = false
      }
    },
    async fetchStudentDetail(id) {
      this.loading = true
      try {
        const data = await getStudentDetail(id)
        this.currentStudent = data
        return data
      } finally {
        this.loading = false
      }
    },
    async addStudent(payload) {
      const data = await createStudent(payload)
      this.students.push(data)
      return data
    },
    async editStudent(id, payload) {
      const data = await updateStudent(id, payload)
      const idx = this.students.findIndex(s => s.id === id || s._id === id)
      if (idx !== -1) {
        this.students[idx] = data
      }
      if (this.currentStudent && (this.currentStudent.id === id || this.currentStudent._id === id)) {
        this.currentStudent = data
      }
      return data
    },
    async removeStudent(id) {
      await deleteStudent(id)
      this.students = this.students.filter(s => s.id !== id && s._id !== id)
    },
    async buyCoursePackage(studentId, payload) {
      const data = await purchaseCoursePackage(studentId, payload)
      await this.fetchStudentDetail(studentId)
      return data
    },
    // 学生端：获取自己的信息
    async fetchMyInfo() {
      this.loading = true
      try {
        const data = await getMyInfo()
        this.currentStudent = data
        return data
      } finally {
        this.loading = false
      }
    }
  }
})


