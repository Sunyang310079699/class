import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getMe, changePassword as changePasswordApi } from '@/api/auth'
import { showToast } from 'vant'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: false
  }),
  
  getters: {
    // 是否为教师
    isTeacher: (state) => state.user?.role === 'teacher',
    
    // 是否为学生
    isStudent: (state) => state.user?.role === 'student',
    
    // 当前用户ID
    currentUserId: (state) => state.user?.id,
    
    // 学生ID（仅学生账号有）
    studentId: (state) => state.user?.studentId,
    
    // 用户名称
    userName: (state) => state.user?.name || state.user?.account
  },
  
  actions: {
    /**
     * 登录
     * @param {String} account - 账号（手机号）
     * @param {String} password - 密码
     * @param {String} role - 角色（可选，不传则后端自动判断）
     */
    async login(account, password, role) {
      try {
        // request 拦截器已经返回了 data，所以 response 就是 data
        // role 参数可选，如果不传则后端根据账号自动判断类型
        const data = await loginApi({ account, password, ...(role ? { role } : {}) })
        
        // 保存登录状态
        this.token = data.token
        this.user = data.user
        this.isAuthenticated = true
        
        // 持久化到 localStorage
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        
        console.log('登录成功，用户信息:', {
          token: this.token,
          user: this.user,
          isTeacher: this.isTeacher,
          isStudent: this.isStudent
        })
        
        showToast('登录成功')
        return data
      } catch (error) {
        const message = error.response?.data?.message || error.message || '登录失败'
        showToast(message)
        throw error
      }
    },
    
    /**
     * 登出
     */
    async logout() {
      try {
        if (this.token) {
          await logoutApi()
        }
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        // 清除状态
        this.token = ''
        this.user = null
        this.isAuthenticated = false
        
        // 清除 localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },
    
    /**
     * 检查登录状态
     */
    checkAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          this.token = token
          this.user = JSON.parse(user)
          this.isAuthenticated = true
          return true
        } catch (error) {
          console.error('解析用户信息失败:', error)
          this.logout()
          return false
        }
      }
      
      return false
    },
    
    /**
     * 获取当前用户信息（刷新用户信息）
     */
    async fetchUserInfo() {
      try {
        // request 拦截器已经返回了 data，所以 response 就是 data
        const data = await getMe()
        this.user = data
        localStorage.setItem('user', JSON.stringify(this.user))
        return data
      } catch (error) {
        // Token 可能已过期，清除登录状态
        if (error.response?.status === 401) {
          this.logout()
        }
        throw error
      }
    },
    
    /**
     * 修改密码
     */
    async updatePassword(oldPassword, newPassword) {
      try {
        await changePasswordApi({ oldPassword, newPassword })
        showToast('密码修改成功')
        return true
      } catch (error) {
        const message = error.response?.data?.message || error.message || '密码修改失败'
        showToast(message)
        throw error
      }
    }
  }
})

