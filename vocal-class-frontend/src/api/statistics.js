import request from './request'

/**
 * 获取首页统计
 * @returns {Promise}
 */
export function getDashboardStats() {
  return request({
    url: '/statistics/dashboard',
    method: 'get'
  })
}

/**
 * 获取课时预警
 * @param {Object} params - 查询参数 (threshold: 预警阈值)
 * @returns {Promise}
 */
export function getWarnings(params) {
  return request({
    url: '/statistics/warnings',
    method: 'get',
    params
  })
}

