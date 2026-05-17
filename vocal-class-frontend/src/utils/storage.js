/**
 * 本地存储工具
 */

/**
 * 设置本地存储
 * @param {String} key - 键名
 * @param {*} value - 值
 */
export function setStorage(key, value) {
  try {
    const data = JSON.stringify(value)
    localStorage.setItem(key, data)
  } catch (error) {
    console.error('setStorage error:', error)
  }
}

/**
 * 获取本地存储
 * @param {String} key - 键名
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
export function getStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (error) {
    console.error('getStorage error:', error)
    return defaultValue
  }
}

/**
 * 移除本地存储
 * @param {String} key - 键名
 */
export function removeStorage(key) {
  localStorage.removeItem(key)
}

/**
 * 清空本地存储
 */
export function clearStorage() {
  localStorage.clear()
}

