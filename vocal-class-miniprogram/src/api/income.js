import { request } from './request'

// 获取收益概览
export function getIncomeOverview() {
  return request({
    url: '/income/overview',
    method: 'GET'
  })
}

// 获取收入明细列表
export function getIncomeList(params = {}) {
  return request({
    url: '/income/records',
    method: 'GET',
    data: params
  })
}

// 创建收入记录（其他收入）
export function createIncome(data) {
  return request({
    url: '/income/records',
    method: 'POST',
    data
  })
}

// 获取收益趋势
export function getIncomeTrend(params = {}) {
  return request({
    url: '/income/trend',
    method: 'GET',
    data: params
  })
}


