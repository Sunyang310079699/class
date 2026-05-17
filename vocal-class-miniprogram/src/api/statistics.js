import { request } from './request'

// 首页仪表盘统计
export function getDashboardStats() {
  return request({
    url: '/statistics/dashboard',
    method: 'GET'
  })
}

// 课时预警列表
export function getWarnings(params = {}) {
  return request({
    url: '/statistics/warnings',
    method: 'GET',
    data: params
  })
}


