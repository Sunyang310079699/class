import { request } from './request'

// 获取学生列表
export function getStudents(params = {}) {
  return request({
    url: '/students',
    method: 'GET',
    data: params
  })
}

// 获取学生详情
export function getStudentDetail(id) {
  return request({
    url: `/students/${id}`,
    method: 'GET'
  })
}

// 创建学生
export function createStudent(data) {
  return request({
    url: '/students',
    method: 'POST',
    data
  })
}

// 更新学生
export function updateStudent(id, data) {
  return request({
    url: `/students/${id}`,
    method: 'PUT',
    data
  })
}

// 删除学生
export function deleteStudent(id) {
  return request({
    url: `/students/${id}`,
    method: 'DELETE'
  })
}

// 购买课时包
export function purchaseCoursePackage(studentId, data) {
  return request({
    url: `/students/${studentId}/course-packages`,
    method: 'POST',
    data
  })
}

// 学生端：获取自己的信息
export function getMyInfo() {
  return request({
    url: '/students/me/info',
    method: 'GET'
  })
}


