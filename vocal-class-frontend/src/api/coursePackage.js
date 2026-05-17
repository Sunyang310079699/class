import request from './request'

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
 * 获取学生的课时包列表
 * @param {String} studentId - 学生ID
 * @returns {Promise}
 */
export function getCoursePackages(studentId) {
  return request({
    url: `/students/${studentId}/course-packages`,
    method: 'get'
  })
}

