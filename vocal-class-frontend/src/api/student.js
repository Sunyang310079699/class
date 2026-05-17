import request from './request'

/**
 * 获取学生列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getStudents(params) {
  return request({
    url: '/students',
    method: 'get',
    params
  })
}

/**
 * 获取学生详情
 * @param {String} id - 学生ID
 * @returns {Promise}
 */
export function getStudentDetail(id) {
  return request({
    url: `/students/${id}`,
    method: 'get'
  })
}

/**
 * 创建学生
 * @param {Object} data - 学生数据
 * @returns {Promise}
 */
export function createStudent(data) {
  return request({
    url: '/students',
    method: 'post',
    data
  })
}

/**
 * 更新学生
 * @param {String} id - 学生ID
 * @param {Object} data - 学生数据
 * @returns {Promise}
 */
export function updateStudent(id, data) {
  return request({
    url: `/students/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除学生
 * @param {String} id - 学生ID
 * @returns {Promise}
 */
export function deleteStudent(id) {
  return request({
    url: `/students/${id}`,
    method: 'delete'
  })
}

/**
 * 购买课时包
 * @param {String} studentId - 学生ID
 * @param {Object} data - 课时包数据
 * @returns {Promise}
 */
export function purchaseCoursePackage(studentId, data) {
  return request({
    url: `/students/${studentId}/course-packages`,
    method: 'post',
    data
  })
}

/**
 * 学生端：获取自己的信息
 * @returns {Promise}
 */
export function getMyInfo() {
  return request({
    url: '/students/me/info',
    method: 'get'
  })
}

