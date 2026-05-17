import Mock from 'mockjs'
import { mockStudents, mockCoursePackages } from './students'
import { mockCourses } from './courses'
import { mockIncomeRecords } from './income'

// 延迟响应时间（模拟真实网络）
Mock.setup({
  timeout: '200-600'
})

// 响应模板
const success = (data) => ({
  code: 200,
  message: 'success',
  data
})

const error = (message) => ({
  code: 400,
  message,
  data: null
})

// 初始化本地存储
const initLocalStorage = () => {
  if (!localStorage.getItem('mock_students')) {
    localStorage.setItem('mock_students', JSON.stringify(mockStudents))
  }
  if (!localStorage.getItem('mock_course_packages')) {
    localStorage.setItem('mock_course_packages', JSON.stringify(mockCoursePackages))
  }
  if (!localStorage.getItem('mock_courses')) {
    localStorage.setItem('mock_courses', JSON.stringify(mockCourses))
  }
  if (!localStorage.getItem('mock_income')) {
    localStorage.setItem('mock_income', JSON.stringify(mockIncomeRecords))
  }
}

initLocalStorage()

// 生成唯一 ID
const generateId = (prefix) => {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`
}

const addDays = (dateStr, days) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  const nextYear = date.getFullYear()
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  const nextDay = String(date.getDate()).padStart(2, '0')
  return `${nextYear}-${nextMonth}-${nextDay}`
}

const diffDays = (fromDateStr, toDateStr) => {
  const [fromYear, fromMonth, fromDay] = fromDateStr.split('-').map(Number)
  const [toYear, toMonth, toDay] = toDateStr.split('-').map(Number)
  const from = new Date(fromYear, fromMonth - 1, fromDay)
  const to = new Date(toYear, toMonth - 1, toDay)
  return Math.round((to - from) / (24 * 60 * 60 * 1000))
}

const hasCourseConflict = (courses, date, startTime, endTime, excludeIds = []) => {
  return courses.some(course => {
    if (excludeIds.includes(course.id) || course.status === 'cancelled' || course.date !== date) {
      return false
    }
    return course.startTime < endTime && course.endTime > startTime
  })
}

// ==================== 学生相关接口 ====================

// 获取学生列表
Mock.mock(/\/api\/students(\?.*)?$/, 'get', (options) => {
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]')
  const url = new URL('http://localhost' + options.url)
  const keyword = url.searchParams.get('keyword')
  
  let filtered = students.filter(s => !s.isDeleted)
  
  if (keyword) {
    filtered = filtered.filter(s => 
      s.name.includes(keyword) || s.phone.includes(keyword)
    )
  }
  
  return success({
    students: filtered,
    total: filtered.length
  })
})

// 获取学生详情
Mock.mock(/\/api\/students\/[^\/]+$/, 'get', (options) => {
  const id = options.url.split('/').pop().split('?')[0]
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]')
  const student = students.find(s => s.id === id && !s.isDeleted)
  
  if (!student) {
    return error('学生不存在')
  }
  
  // 获取课时包记录
  const packages = JSON.parse(localStorage.getItem('mock_course_packages') || '[]')
  const coursePackages = packages.filter(p => p.studentId === id)
  
  // 获取上课记录
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]')
  const recentCourses = courses
    .filter(c => c.studentId === id && c.status === 'completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20)
  
  return success({
    ...student,
    coursePackages,
    recentCourses
  })
})

// 创建学生
Mock.mock('/api/students', 'post', (options) => {
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]')
  const body = JSON.parse(options.body)
  
  const newStudent = {
    id: generateId('s'),
    name: body.name,
    phone: body.phone,
    remainingHours: body.initialHours || 0,
    notes: body.notes || '',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  students.push(newStudent)
  localStorage.setItem('mock_students', JSON.stringify(students))
  
  return success(newStudent)
})

// 更新学生
Mock.mock(/\/api\/students\/[^\/]+$/, 'put', (options) => {
  const id = options.url.split('/').pop()
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]')
  const index = students.findIndex(s => s.id === id)
  
  if (index === -1) {
    return error('学生不存在')
  }
  
  const body = JSON.parse(options.body)
  students[index] = {
    ...students[index],
    ...body,
    updatedAt: new Date().toISOString()
  }
  
  localStorage.setItem('mock_students', JSON.stringify(students))
  
  return success(students[index])
})

// 删除学生
Mock.mock(/\/api\/students\/[^\/]+$/, 'delete', (options) => {
  const id = options.url.split('/').pop()
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]')
  const index = students.findIndex(s => s.id === id)
  
  if (index === -1) {
    return error('学生不存在')
  }
  
  students[index].isDeleted = true
  students[index].updatedAt = new Date().toISOString()
  
  localStorage.setItem('mock_students', JSON.stringify(students))
  
  return success(null)
})

// 购买课时包
Mock.mock('/api/students/purchase', 'post', (options) => {
  const body = JSON.parse(options.body)
  const { studentId, hours, amount, purchaseDate, note } = body
  
  // 更新学生剩余课时
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]')
  const studentIndex = students.findIndex(s => s.id === studentId)
  
  if (studentIndex === -1) {
    return error('学生不存在')
  }
  
  students[studentIndex].remainingHours += hours
  students[studentIndex].updatedAt = new Date().toISOString()
  localStorage.setItem('mock_students', JSON.stringify(students))
  
  // 创建课时包记录
  const packages = JSON.parse(localStorage.getItem('mock_course_packages') || '[]')
  const newPackage = {
    id: generateId('cp'),
    studentId,
    hours,
    amount,
    purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
    note: note || '',
    createdAt: new Date().toISOString()
  }
  packages.push(newPackage)
  localStorage.setItem('mock_course_packages', JSON.stringify(packages))
  
  // 创建收入记录
  const income = JSON.parse(localStorage.getItem('mock_income') || '[]')
  const newIncome = {
    id: generateId('i'),
    studentId,
    studentName: students[studentIndex].name,
    amount,
    type: 'course_package',
    date: purchaseDate || new Date().toISOString().split('T')[0],
    note: `购买${hours}节课`,
    relatedId: newPackage.id,
    createdAt: new Date().toISOString()
  }
  income.push(newIncome)
  localStorage.setItem('mock_income', JSON.stringify(income))
  
  return success({
    student: students[studentIndex],
    package: newPackage,
    income: newIncome
  })
})

// ==================== 课程相关接口 ====================

// 获取课程列表
Mock.mock(/\/api\/courses(\?.*)?$/, 'get', (options) => {
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]')
  const url = new URL('http://localhost' + options.url)
  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')
  const status = url.searchParams.get('status')
  const studentId = url.searchParams.get('studentId')
  
  let filtered = courses
  
  if (startDate) {
    filtered = filtered.filter(c => c.date >= startDate)
  }
  if (endDate) {
    filtered = filtered.filter(c => c.date <= endDate)
  }
  if (status) {
    filtered = filtered.filter(c => c.status === status)
  }
  if (studentId) {
    filtered = filtered.filter(c => c.studentId === studentId)
  }
  
  // 添加学生信息
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]')
  filtered = filtered.map(course => {
    const student = students.find(s => s.id === course.studentId)
    return {
      ...course,
      studentName: student ? student.name : '未知学生'
    }
  })
  
  return success({
    courses: filtered,
    total: filtered.length
  })
})

// 获取课程详情
Mock.mock(/\/api\/courses\/[^\/]+$/, 'get', (options) => {
  const id = options.url.split('/').pop().split('?')[0]
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]')
  const course = courses.find(c => c.id === id)
  
  if (!course) {
    return error('课程不存在')
  }
  
  // 添加学生信息
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]')
  const student = students.find(s => s.id === course.studentId)
  
  return success({
    ...course,
    studentName: student ? student.name : '未知学生'
  })
})

// 创建课程
Mock.mock('/api/courses', 'post', (options) => {
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]')
  const body = JSON.parse(options.body)
  
  const newCourse = {
    id: generateId('c'),
    studentId: body.studentId,
    date: body.date,
    startTime: body.startTime,
    endTime: body.endTime,
    duration: body.duration || 1,
    location: body.location || '音乐工作室',
    status: 'pending',
    attendanceStatus: 'none',
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  courses.push(newCourse)
  localStorage.setItem('mock_courses', JSON.stringify(courses))
  
  return success(newCourse)
})

// 更新课程
Mock.mock(/\/api\/courses\/[^\/]+$/, 'put', (options) => {
  const id = options.url.split('/').pop()
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]')
  const index = courses.findIndex(c => c.id === id)
  
  if (index === -1) {
    return error('课程不存在')
  }
  
  const body = JSON.parse(options.body)
  const { updateFutureCourses, ...courseBody } = body
  const currentCourse = courses[index]
  const newDate = body.date || currentCourse.date
  const newStartTime = body.startTime || currentCourse.startTime
  const newEndTime = body.endTime || currentCourse.endTime
  const newDuration = body.duration !== undefined ? body.duration : currentCourse.duration
  const shouldUpdateFutureCourses = Boolean(updateFutureCourses)
    && currentCourse.courseType === 'regular'
    && (body.courseType || currentCourse.courseType) === 'regular'
    && (!body.studentId || body.studentId === currentCourse.studentId)
  const futureCourses = shouldUpdateFutureCourses
    ? courses.filter(course => 
        course.id !== id &&
        course.studentId === currentCourse.studentId &&
        course.courseType === 'regular' &&
        course.status === 'pending' &&
        course.startTime === currentCourse.startTime &&
        course.endTime === currentCourse.endTime &&
        diffDays(currentCourse.date, course.date) > 0 &&
        diffDays(currentCourse.date, course.date) % 7 === 0
      )
    : []
  const affectedIds = [id, ...futureCourses.map(course => course.id)]
  const dateOffset = diffDays(currentCourse.date, newDate)

  if (hasCourseConflict(courses, newDate, newStartTime, newEndTime, affectedIds)) {
    return error('该时间段已有课程安排')
  }

  if (shouldUpdateFutureCourses) {
    const futureHasConflict = futureCourses.some(course => {
      const futureDate = body.date ? addDays(course.date, dateOffset) : course.date
      return hasCourseConflict(courses, futureDate, newStartTime, newEndTime, affectedIds)
    })

    if (futureHasConflict) {
      return error('后续课程调整后与已有课程冲突，请检查时间安排')
    }
  }

  courses[index] = {
    ...currentCourse,
    ...courseBody,
    date: newDate,
    startTime: newStartTime,
    endTime: newEndTime,
    duration: newDuration,
    updatedAt: new Date().toISOString()
  }

  if (shouldUpdateFutureCourses) {
    futureCourses.forEach(course => {
      const futureIndex = courses.findIndex(item => item.id === course.id)
      courses[futureIndex] = {
        ...courses[futureIndex],
        date: body.date ? addDays(courses[futureIndex].date, dateOffset) : courses[futureIndex].date,
        startTime: newStartTime,
        endTime: newEndTime,
        duration: newDuration,
        updatedAt: new Date().toISOString()
      }
    })
  }
  
  localStorage.setItem('mock_courses', JSON.stringify(courses))
  
  return success({
    course: courses[index],
    updatedFutureCount: shouldUpdateFutureCourses ? futureCourses.length : 0
  })
})

// 删除课程
Mock.mock(/\/api\/courses\/[^\/]+$/, 'delete', (options) => {
  const id = options.url.split('/').pop()
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]')
  const index = courses.findIndex(c => c.id === id)
  
  if (index === -1) {
    return error('课程不存在')
  }
  
  courses.splice(index, 1)
  localStorage.setItem('mock_courses', JSON.stringify(courses))
  
  return success(null)
})

// 签到
Mock.mock(/\/api\/courses\/[^\/]+\/checkin$/, 'post', (options) => {
  const id = options.url.split('/')[3]
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]')
  const courseIndex = courses.findIndex(c => c.id === id)
  
  if (courseIndex === -1) {
    return error('课程不存在')
  }
  
  const course = courses[courseIndex]
  
  if (course.status === 'completed') {
    return error('课程已签到')
  }
  
  // 扣除学生课时
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]')
  const studentIndex = students.findIndex(s => s.id === course.studentId)
  
  if (studentIndex === -1) {
    return error('学生不存在')
  }
  
  if (students[studentIndex].remainingHours < course.duration) {
    return error('课时不足，请先充值')
  }
  
  students[studentIndex].remainingHours -= course.duration
  students[studentIndex].updatedAt = new Date().toISOString()
  localStorage.setItem('mock_students', JSON.stringify(students))
  
  // 更新课程状态
  courses[courseIndex].status = 'completed'
  courses[courseIndex].attendanceStatus = 'present'
  courses[courseIndex].updatedAt = new Date().toISOString()
  localStorage.setItem('mock_courses', JSON.stringify(courses))
  
  return success({
    course: courses[courseIndex],
    student: students[studentIndex]
  })
})

// ==================== 收入相关接口 ====================

// 获取收入列表
Mock.mock(/\/api\/income(\?.*)?$/, 'get', (options) => {
  const income = JSON.parse(localStorage.getItem('mock_income') || '[]')
  const url = new URL('http://localhost' + options.url)
  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')
  const studentId = url.searchParams.get('studentId')
  
  let filtered = income
  
  if (startDate) {
    filtered = filtered.filter(i => i.date >= startDate)
  }
  if (endDate) {
    filtered = filtered.filter(i => i.date <= endDate)
  }
  if (studentId) {
    filtered = filtered.filter(i => i.studentId === studentId)
  }
  
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  return success({
    list: filtered,
    total: filtered.length
  })
})

// 获取收入统计
Mock.mock('/api/income/stats', 'get', () => {
  const income = JSON.parse(localStorage.getItem('mock_income') || '[]')
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  // 计算今日收入
  const todayIncome = income
    .filter(i => i.date === today)
    .reduce((sum, i) => sum + i.amount, 0)
  
  // 计算本周收入
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekIncome = income
    .filter(i => i.date >= weekStartStr)
    .reduce((sum, i) => sum + i.amount, 0)
  
  // 计算本月收入
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartStr = monthStart.toISOString().split('T')[0]
  const monthIncome = income
    .filter(i => i.date >= monthStartStr)
    .reduce((sum, i) => sum + i.amount, 0)
  
  // 计算本年收入
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const yearStartStr = yearStart.toISOString().split('T')[0]
  const yearIncome = income
    .filter(i => i.date >= yearStartStr)
    .reduce((sum, i) => sum + i.amount, 0)
  
  // 计算总收入
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0)
  
  return success({
    today: todayIncome,
    week: weekIncome,
    month: monthIncome,
    year: yearIncome,
    total: totalIncome
  })
})

// 创建收入记录
Mock.mock('/api/income', 'post', (options) => {
  const income = JSON.parse(localStorage.getItem('mock_income') || '[]')
  const body = JSON.parse(options.body)
  
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]')
  const student = students.find(s => s.id === body.studentId)
  
  const newIncome = {
    id: generateId('i'),
    studentId: body.studentId,
    studentName: student ? student.name : body.studentName || '其他',
    amount: body.amount,
    type: body.type || 'other',
    date: body.date || new Date().toISOString().split('T')[0],
    note: body.note || '',
    relatedId: body.relatedId || null,
    createdAt: new Date().toISOString()
  }
  
  income.push(newIncome)
  localStorage.setItem('mock_income', JSON.stringify(income))
  
  return success(newIncome)
})

// 如果使用 Mock 数据，初始化
if (import.meta.env.VITE_USE_MOCK === 'true') {
  console.log('Mock 数据已启用')
}

export default Mock

