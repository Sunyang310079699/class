import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)
dayjs.extend(isBetween)

/**
 * 格式化日期
 * @param {Date|String} date - 日期
 * @param {String} format - 格式
 * @returns {String}
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  return dayjs(date).format(format)
}

/**
 * 格式化时间
 * @param {Date|String} date - 日期
 * @returns {String}
 */
export function formatTime(date) {
  return dayjs(date).format('HH:mm')
}

/**
 * 格式化日期时间
 * @param {Date|String} date - 日期
 * @returns {String}
 */
export function formatDateTime(date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 相对时间
 * @param {Date|String} date - 日期
 * @returns {String}
 */
export function fromNow(date) {
  return dayjs(date).fromNow()
}

/**
 * 获取今天日期
 * @returns {String}
 */
export function getToday() {
  return dayjs().format('YYYY-MM-DD')
}

/**
 * 获取本周日期范围
 * @returns {Object}
 */
export function getThisWeek() {
  const start = dayjs().startOf('week')
  const end = dayjs().endOf('week')
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD')
  }
}

/**
 * 获取本月日期范围
 * @returns {Object}
 */
export function getThisMonth() {
  const start = dayjs().startOf('month')
  const end = dayjs().endOf('month')
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD')
  }
}

/**
 * 获取近一个月日期范围（从今天起往前30天）
 * @returns {Object}
 */
export function getRecentMonth() {
  const start = dayjs().subtract(30, 'day')
  const end = dayjs().add(30, 'day')
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD')
  }
}

/**
 * 判断是否是今天
 * @param {Date|String} date - 日期
 * @returns {Boolean}
 */
export function isToday(date) {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 时间是否冲突
 * @param {String} start1 - 开始时间1
 * @param {String} end1 - 结束时间1
 * @param {String} start2 - 开始时间2
 * @param {String} end2 - 结束时间2
 * @returns {Boolean}
 */
export function isTimeConflict(start1, end1, start2, end2) {
  const s1 = dayjs(`2000-01-01 ${start1}`)
  const e1 = dayjs(`2000-01-01 ${end1}`)
  const s2 = dayjs(`2000-01-01 ${start2}`)
  const e2 = dayjs(`2000-01-01 ${end2}`)
  
  return s1.isBefore(e2) && e1.isAfter(s2)
}

