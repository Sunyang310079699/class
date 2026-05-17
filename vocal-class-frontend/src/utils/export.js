/**
 * 数据导出工具
 * 支持导出为CSV格式（可被Excel打开）
 */

/**
 * 将数据转换为CSV格式
 * @param {Array} data - 数据数组
 * @param {Array} headers - 表头配置 [{key: 'name', label: '姓名'}]
 * @returns {string} CSV字符串
 */
export function convertToCSV(data, headers) {
  if (!data || data.length === 0) {
    return ''
  }
  
  // 添加BOM头，解决中文乱码问题
  let csv = '\uFEFF'
  
  // 添加表头
  const headerLabels = headers.map(h => h.label)
  csv += headerLabels.join(',') + '\n'
  
  // 添加数据行
  data.forEach(row => {
    const values = headers.map(h => {
      let value = row[h.key] || ''
      
      // 处理特殊字符
      value = String(value)
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`
      }
      
      return value
    })
    csv += values.join(',') + '\n'
  })
  
  return csv
}

/**
 * 下载CSV文件
 * @param {string} csvContent - CSV内容
 * @param {string} filename - 文件名
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * 导出学生数据
 * @param {Array} students - 学生列表
 */
export function exportStudents(students) {
  const headers = [
    { key: 'name', label: '姓名' },
    { key: 'phone', label: '联系电话' },
    { key: 'remainingHours', label: '剩余课时' },
    { key: 'notes', label: '备注' },
    { key: 'createdAt', label: '创建时间' }
  ]
  
  const data = students.map(s => ({
    ...s,
    createdAt: new Date(s.createdAt).toLocaleString('zh-CN')
  }))
  
  const csv = convertToCSV(data, headers)
  const filename = `学生数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`
  downloadCSV(csv, filename)
}

/**
 * 导出课程数据
 * @param {Array} courses - 课程列表
 */
export function exportCourses(courses) {
  const headers = [
    { key: 'date', label: '日期' },
    { key: 'studentName', label: '学生姓名' },
    { key: 'startTime', label: '开始时间' },
    { key: 'endTime', label: '结束时间' },
    { key: 'duration', label: '课时' },
    { key: 'location', label: '地点' },
    { key: 'status', label: '状态' },
    { key: 'notes', label: '备注' }
  ]
  
  const data = courses.map(c => ({
    ...c,
    status: c.status === 'pending' ? '待上课' : c.status === 'completed' ? '已完成' : '已取消'
  }))
  
  const csv = convertToCSV(data, headers)
  const filename = `课程数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`
  downloadCSV(csv, filename)
}

/**
 * 导出收益数据
 * @param {Array} incomeList - 收益列表
 */
export function exportIncome(incomeList) {
  const headers = [
    { key: 'date', label: '日期' },
    { key: 'studentName', label: '学生姓名' },
    { key: 'amount', label: '金额' },
    { key: 'type', label: '类型' },
    { key: 'note', label: '备注' }
  ]
  
  const data = incomeList.map(i => ({
    ...i,
    type: i.type === 'course_package' ? '课时包' : '其他'
  }))
  
  const csv = convertToCSV(data, headers)
  const filename = `收益数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`
  downloadCSV(csv, filename)
}

/**
 * 导出所有数据（打包）
 * @param {Object} allData - 所有数据 {students, courses, income}
 */
export async function exportAllData(allData) {
  const { students, courses, income } = allData
  
  // 由于浏览器限制，分别导出
  if (students && students.length > 0) {
    exportStudents(students)
    await sleep(500)
  }
  
  if (courses && courses.length > 0) {
    exportCourses(courses)
    await sleep(500)
  }
  
  if (income && income.length > 0) {
    exportIncome(income)
  }
}

/**
 * 辅助函数：延迟
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

