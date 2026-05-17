import { defineStore } from 'pinia'
import {
  getCourses,
  getTodayCourses,
  getCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  checkInCourse,
  cancelCourse
} from '@/api/course'

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: [],
    todayCourses: [],
    currentCourse: null,
    loading: false
  }),
  getters: {
    pendingCourses(state) {
      return state.courses.filter(c => c.status === 'pending')
    },
    completedCourses(state) {
      return state.courses.filter(c => c.status === 'completed')
    }
  },
  actions: {
    normalizeCourse(course) {
      return {
        ...course,
        id: course.id || course._id,
        studentName: course.student?.name || course.studentName || '未知学生',
        studentId: course.student?.id || course.studentId
      }
    },
    async fetchCourses(params = {}) {
      this.loading = true
      try {
        const data = await getCourses(params)
        const list = (data.courses || []).map(this.normalizeCourse)
        this.courses = list
        return { ...data, courses: list }
      } finally {
        this.loading = false
      }
    },
    async fetchTodayCourses() {
      this.loading = true
      try {
        const data = await getTodayCourses()
        const list = (data || []).map(this.normalizeCourse)
        this.todayCourses = list
        return list
      } finally {
        this.loading = false
      }
    },
    async fetchCourseDetail(id) {
      this.loading = true
      try {
        const data = await getCourseDetail(id)
        const course = this.normalizeCourse(data)
        this.currentCourse = course
        return course
      } finally {
        this.loading = false
      }
    },
    async addCourse(payload) {
      const data = await createCourse(payload)
      const course = this.normalizeCourse(data)
      this.courses.push(course)
      return course
    },
    async editCourse(id, payload) {
      const data = await updateCourse(id, payload)
      const course = this.normalizeCourse(data)
      const idx = this.courses.findIndex(c => c.id === id)
      if (idx !== -1) {
        this.courses[idx] = course
      }
      if (this.currentCourse && this.currentCourse.id === id) {
        this.currentCourse = course
      }
      return course
    },
    async removeCourse(id) {
      await deleteCourse(id)
      this.courses = this.courses.filter(c => c.id !== id)
    },
    async signCourse(id, attendanceData = { attendanceStatus: 'present' }) {
      const result = await checkInCourse(id, attendanceData)
      if (result.course) {
        const course = this.normalizeCourse(result.course)
        const idx = this.courses.findIndex(c => c.id === id)
        if (idx !== -1) {
          this.courses[idx] = course
        }
      }
      return result
    },
    async cancelCourse(id, reason = '') {
      const data = await cancelCourse(id, { reason })
      const course = this.normalizeCourse(data)
      const idx = this.courses.findIndex(c => c.id === id)
      if (idx !== -1) {
        this.courses[idx] = course
      }
      return course
    }
  }
})


