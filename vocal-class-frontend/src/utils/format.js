/**
 * 格式化工具
 */

/**
 * 格式化金额
 * @param {Number} amount - 金额
 * @returns {String}
 */
export function formatMoney(amount) {
  return `¥${Number(amount).toFixed(2)}`
}

/**
 * 格式化课时
 * @param {Number} hours - 课时
 * @returns {String}
 */
export function formatHours(hours) {
  return `${hours}课时`
}

/**
 * 格式化手机号
 * @param {String} phone - 手机号
 * @returns {String}
 */
export function formatPhone(phone) {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 截取文本
 * @param {String} text - 文本
 * @param {Number} length - 长度
 * @returns {String}
 */
export function truncateText(text, length = 20) {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

