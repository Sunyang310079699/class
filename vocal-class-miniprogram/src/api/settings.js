import { request } from './request'

// 获取系统设置
export function getSettings() {
  return request({
    url: '/settings',
    method: 'GET'
  })
}

// 更新系统设置
export function updateSettings(data) {
  return request({
    url: '/settings',
    method: 'PUT',
    data
  })
}


