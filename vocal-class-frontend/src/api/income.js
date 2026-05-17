import request from './request'

/**
 * 获取收益概览
 * @returns {Promise}
 */
export function getIncomeOverview() {
  return request({
    url: '/income/overview',
    method: 'get'
  })
}

/**
 * 获取收入明细列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getIncomeList(params) {
  return request({
    url: '/income/records',
    method: 'get',
    params
  })
}

/**
 * 创建收入记录
 * @param {Object} data - 收入数据
 * @returns {Promise}
 */
export function createIncome(data) {
  return request({
    url: '/income/records',
    method: 'post',
    data
  })
}

/**
 * 获取收益趋势
 * @param {Object} params - 查询参数 (type: month/year, year: 年份)
 * @returns {Promise}
 */
export function getIncomeTrend(params) {
  return request({
    url: '/income/trend',
    method: 'get',
    params
  })
}

/**
 * 获取收入统计（兼容旧接口，实际调用概览接口）
 * @returns {Promise}
 */
export function getIncomeStats() {
  return getIncomeOverview()
}

