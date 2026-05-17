import { defineStore } from 'pinia'
import { login as loginApi, getProfile, logout as logoutApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    userType: '', // 'teacher' | 'student'
    userId: '',
    userInfo: null
  }),
  actions: {
    restoreFromStorage() {
      try {
        const token = uni.getStorageSync('token')
        const user = uni.getStorageSync('user')
        if (token && user) {
          this.token = token
          this.userType = user.userType || user.role || ''
          this.userId = user.userId || user.id || ''
          this.userInfo = user
        }
      } catch (e) {
        // ignore
      }
    },

    async login(form) {
      // form: { account, password, role? }
      const data = await loginApi(form)
      const { token, user } = data

      this.token = token
      this.userType = user.role || user.userType || ''
      this.userId = user.id || user.userId || ''
      this.userInfo = user

      uni.setStorageSync('token', token)
      uni.setStorageSync('user', user)

      if (this.userType === 'teacher') {
        uni.reLaunch({ url: '/pages/home/index' })
      } else {
        uni.reLaunch({ url: '/subpackages/student/home/index' })
      }
    },

    async fetchProfile() {
      const data = await getProfile()
      if (!data) return
      const user = data
      this.userType = user.role || user.userType || this.userType
      this.userId = user.id || user.userId || this.userId
      this.userInfo = user
      uni.setStorageSync('user', user)
    },

    async logout() {
      try {
        if (this.token) {
          await logoutApi()
        }
      } catch (e) {
        // ignore
      } finally {
        this.token = ''
        this.userType = ''
        this.userId = ''
        this.userInfo = null
        uni.removeStorageSync('token')
        uni.removeStorageSync('user')
        uni.reLaunch({ url: '/pages/login/index' })
      }
    }
  }
})


