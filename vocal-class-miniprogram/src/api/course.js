import { request } from './request'

// 获取课程列表
export function getCourses(params = {}) {
  return request({
    url: '/courses',
    method: 'GET',
    data: params
  })
}

// 获取今日课程
export function getTodayCourses() {
  return request({
    url: '/courses/today',
    method: 'GET'
  })
}

// 获取课程详情
export function getCourseDetail(id) {
  return request({
    url: `/courses/${id}`,
    method: 'GET'
  })
}

// 创建课程
export function createCourse(data) {
  return request({
    url: '/courses',
    method: 'POST',
    data
  })
}

// 更新课程
export function updateCourse(id, data) {
  return request({
    url: `/courses/${id}`,
    method: 'PUT',
    data
  })
}

// 删除课程
export function deleteCourse(id) {
  return request({
    url: `/courses/${id}`,
    method: 'DELETE'
  })
}

// 取消课程
export function cancelCourse(id, data) {
  return request({
    url: `/courses/${id}/cancel`,
    method: 'POST',
    data
  })
}

// 课程签到
export function checkInCourse(id, data) {
  return request({
    url: `/courses/${id}/attendance`,
    method: 'POST',
    data
  })
}


