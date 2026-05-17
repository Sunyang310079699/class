/**
 * 表单验证工具
 */

/**
 * 验证手机号
 * @param {String} phone - 手机号
 * @returns {Boolean}
 */
export function validatePhone(phone) {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证姓名
 * @param {String} name - 姓名
 * @returns {Boolean}
 */
export function validateName(name) {
  return name && name.length >= 2 && name.length <= 10
}

/**
 * 验证正整数
 * @param {Number} num - 数字
 * @returns {Boolean}
 */
export function validatePositiveInteger(num) {
  return Number.isInteger(num) && num > 0
}

/**
 * 验证正数
 * @param {Number} num - 数字
 * @returns {Boolean}
 */
export function validatePositiveNumber(num) {
  return !isNaN(num) && num > 0
}

