import request from './request'

/**
 * 登录
 * @param {Object} data - 登录数据 { account, password, role }
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 登出
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 获取当前用户信息
 */
export function getMe() {
  return request({
    url: '/auth/me',
    method: 'get'
  })
}

/**
 * 修改密码
 * @param {Object} data - 密码数据 { oldPassword, newPassword }
 */
export function changePassword(data) {
  return request({
    url: '/auth/password',
    method: 'put',
    data
  })
}

