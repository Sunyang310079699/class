import { request } from './request'

// 账号密码登录
// 为兼容后端现有实现，这里使用 /auth/login，并传入 account/password/role
export function login(data) {
  // data: { account, password, role?: 'teacher' | 'student' }
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

// 获取当前登录用户信息
export function getProfile() {
  return request({
    url: '/auth/me',
    method: 'GET',
    loading: false
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'POST',
    loading: false
  })
}


