import { API_BASE_URL } from '@/config/env'

function getToken() {
  try {
    const token = uni.getStorageSync('token')
    return token || ''
  } catch (e) {
    return ''
  }
}

export function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    loading = true
  } = options

  if (loading) {
    uni.showLoading({ title: '加载中...', mask: true })
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: API_BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: getToken() ? `Bearer ${getToken()}` : ''
      },
      success(res) {
        const body = res.data || {}
        const { code, message, data: payload } = body

        if (code === 200 || code === 201) {
          resolve(payload)
        } else if (code === 401) {
          // 认证失败，清理登录态并跳转登录
          uni.removeStorageSync('token')
          uni.removeStorageSync('user')
          uni.showToast({
            title: message || '未授权，请重新登录',
            icon: 'none'
          })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/index' })
          }, 800)
          reject(new Error(message || '未授权'))
        } else {
          uni.showToast({
            title: message || '请求失败',
            icon: 'none'
          })
          reject(new Error(message || '请求失败'))
        }
      },
      fail(err) {
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      },
      complete() {
        if (loading) {
          uni.hideLoading()
        }
      }
    })
  })
}


