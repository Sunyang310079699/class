import request from './request'

/**
 * 获取课程列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getCourses(params) {
  return request({
    url: '/courses',
    method: 'get',
    params
  })
}

/**
 * 获取今日课程
 * @returns {Promise}
 */
export function getTodayCourses() {
  return request({
    url: '/courses/today',
    method: 'get'
  })
}

/**
 * 获取课程详情
 * @param {String} id - 课程ID
 * @returns {Promise}
 */
export function getCourseDetail(id) {
  return request({
    url: `/courses/${id}`,
    method: 'get'
  })
}

/**
 * 创建课程
 * @param {Object} data - 课程数据
 * @returns {Promise}
 */
export function createCourse(data) {
  return request({
    url: '/courses',
    method: 'post',
    data
  })
}

/**
 * 更新课程
 * @param {String} id - 课程ID
 * @param {Object} data - 课程数据
 * @returns {Promise}
 */
export function updateCourse(id, data) {
  return request({
    url: `/courses/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除课程
 * @param {String} id - 课程ID
 * @returns {Promise}
 */
export function deleteCourse(id) {
  return request({
    url: `/courses/${id}`,
    method: 'delete'
  })
}

/**
 * 取消课程
 * @param {String} id - 课程ID
 * @param {Object} data - 取消原因
 * @returns {Promise}
 */
export function cancelCourse(id, data) {
  return request({
    url: `/courses/${id}/cancel`,
    method: 'post',
    data
  })
}

/**
 * 课程签到
 * @param {String} id - 课程ID
 * @param {Object} data - 签到数据
 * @returns {Promise}
 */
export function checkInCourse(id, data) {
  return request({
    url: `/courses/${id}/attendance`,
    method: 'post',
    data
  })
}

/**
 * 生成下周常规课程
 * @returns {Promise}
 */
export function generateNextWeekCourses() {
  return request({
    url: '/courses/generate-next-week',
    method: 'post'
  })
}

