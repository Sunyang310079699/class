import request from './request'

/**
 * 获取系统设置
 * @returns {Promise}
 */
export function getSettings() {
  return request({
    url: '/settings',
    method: 'get'
  })
}

/**
 * 更新系统设置
 * @param {Object} data - 设置数据
 * @returns {Promise}
 */
export function updateSettings(data) {
  return request({
    url: '/settings',
    method: 'put',
    data
  })
}

