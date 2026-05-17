import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 显示加载提示
    if (config.loading !== false) {
      showLoadingToast({
        message: '加载中...',
        forbidClick: true,
        duration: 0
      })
    }
    
    return config
  },
  error => {
    closeToast()
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    closeToast()
    
    const { code, message, data } = response.data
    
    // 200和201都视为成功响应
    if (code === 200 || code === 201) {
      return data
    } else {
      showToast(message || '请求失败')
      return Promise.reject(new Error(message))
    }
  },
  error => {
    closeToast()
    
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          // Token 过期或无效，清除登录状态
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          // 跳转到登录页（避免循环跳转）
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          showToast('未授权，请重新登录')
          break
        case 403:
          showToast('拒绝访问')
          break
        case 404:
          showToast('请求地址不存在')
          break
        case 500:
          showToast('服务器错误')
          break
        default:
          showToast('网络错误')
      }
    } else {
      showToast('网络连接失败')
    }
    
    return Promise.reject(error)
  }
)

export default request

