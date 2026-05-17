import { defineStore } from 'pinia'
import { getCourses, getCourseDetail, createCourse, updateCourse, deleteCourse, checkInCourse, cancelCourse } from '@/api/course'

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: [],
    currentCourse: null,
    loading: false
  }),
  
  getters: {
    // 获取今日课程
    todayCourses: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.courses.filter(c => c.date === today)
    },
    
    // 获取待签到课程
    pendingCourses: (state) => {
      return state.courses.filter(c => c.status === 'pending')
    },
    
    // 获取已完成课程
    completedCourses: (state) => {
      return state.courses.filter(c => c.status === 'completed')
    }
  },
  
  actions: {
    // 获取课程列表
    async fetchCourses(params = {}) {
      this.loading = true
      try {
        const data = await getCourses(params)
        console.log('courseStore.fetchCourses 返回数据:', data)
        
        // 处理课程数据，添加 studentName 字段以便兼容视图
        const courses = (data.courses || []).map(course => {
          const processedCourse = {
            ...course,
            studentName: course.student?.name || course.studentName || '未知学生',
            // 确保 studentId 字段存在
            studentId: course.studentId || course.student?.id
          }
          console.log('处理后的课程:', processedCourse.id, 'studentId:', processedCourse.studentId)
          return processedCourse
        })
        
        this.courses = courses
        console.log('courseStore 课程总数:', courses.length)
        return { ...data, courses }
      } catch (error) {
        console.error('获取课程列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取课程详情
    async fetchCourseDetail(id) {
      this.loading = true
      try {
        const data = await getCourseDetail(id)
        // 处理课程数据，添加 studentName 字段以便兼容视图
        const course = {
          ...data,
          studentName: data.student?.name || data.studentName || '未知学生',
          studentId: data.student?.id || data.studentId
        }
        this.currentCourse = course
        return course
      } catch (error) {
        console.error('获取课程详情失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 创建课程
    async addCourse(courseData) {
      try {
        const data = await createCourse(courseData)
        // 处理课程数据，添加 studentName 字段以便兼容视图
        const course = {
          ...data,
          studentName: data.student?.name || data.studentName || '未知学生',
          studentId: data.student?.id || data.studentId || courseData.studentId
        }
        this.courses.push(course)
        return course
      } catch (error) {
        console.error('创建课程失败:', error)
        throw error
      }
    },
    
    // 更新课程
    async updateCourse(id, courseData) {
      try {
        const data = await updateCourse(id, courseData)
        const rawCourse = data.course || data
        // 处理课程数据，添加 studentName 字段以便兼容视图
        const course = {
          ...rawCourse,
          studentName: rawCourse.student?.name || rawCourse.studentName || this.courses.find(c => c.id === id)?.studentName || '未知学生',
          studentId: rawCourse.student?.id || rawCourse.studentId || this.courses.find(c => c.id === id)?.studentId,
          updatedFutureCount: data.updatedFutureCount || 0
        }
        const index = this.courses.findIndex(c => c.id === id)
        if (index !== -1) {
          this.courses[index] = course
        }
        return course
      } catch (error) {
        console.error('更新课程失败:', error)
        throw error
      }
    },
    
    // 删除课程
    async removeCourse(id) {
      try {
        await deleteCourse(id)
        const index = this.courses.findIndex(c => c.id === id)
        if (index !== -1) {
          this.courses.splice(index, 1)
        }
      } catch (error) {
        console.error('删除课程失败:', error)
        throw error
      }
    },
    
    // 签到
    async checkIn(id, attendanceData = { attendanceStatus: 'present' }) {
      try {
        const result = await checkInCourse(id, attendanceData)
        const index = this.courses.findIndex(c => c.id === id)
        if (index !== -1 && result.course) {
          // 处理课程数据，添加 studentName 字段以便兼容视图
          const course = {
            ...result.course,
            studentName: result.course.student?.name || result.course.studentName || this.courses[index].studentName || '未知学生',
            studentId: result.course.student?.id || result.course.studentId || this.courses[index].studentId
          }
          this.courses[index] = course
        }
        return result
      } catch (error) {
        console.error('签到失败:', error)
        throw error
      }
    },
    
    // 取消课程
    async cancelCourse(id, reason = '') {
      try {
        const data = await cancelCourse(id, { reason })
        // 处理课程数据，添加 studentName 字段以便兼容视图
        const course = {
          ...data,
          studentName: data.student?.name || data.studentName || this.courses.find(c => c.id === id)?.studentName || '未知学生',
          studentId: data.student?.id || data.studentId || this.courses.find(c => c.id === id)?.studentId
        }
        const index = this.courses.findIndex(c => c.id === id)
        if (index !== -1) {
          this.courses[index] = course
        }
        return course
      } catch (error) {
        console.error('取消课程失败:', error)
        throw error
      }
    }
  }
})

