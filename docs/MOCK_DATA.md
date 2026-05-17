# Mock 数据说明文档

## 文档说明

本文档详细说明前端开发阶段使用的 Mock 数据结构和接口模拟方案。

---

## 一、Mock 方案选择

### 1.1 为什么使用 Mock 数据？

1. **前后端分离开发** - 前端无需等待后端接口完成
2. **独立调试** - 不依赖后端服务，随时可以开发
3. **数据可控** - 可以模拟各种场景和边界情况
4. **快速演示** - 快速搭建可演示的原型

### 1.2 Mock 技术方案

**方案一：Mock.js + localStorage（推荐）**
- ✅ 数据持久化
- ✅ 完整的业务逻辑
- ✅ 随时切换真实接口
- ✅ 开发体验好

**方案二：MSW (Mock Service Worker)**
- ✅ 真实的网络请求
- ✅ 支持 GraphQL
- ❌ 配置相对复杂

**方案三：JSON Server**
- ✅ 快速搭建 REST API
- ❌ 需要独立运行服务
- ❌ 切换真实接口麻烦

**本项目采用方案一**

---

## 二、Mock 数据结构

### 2.1 学生数据

```javascript
// src/api/mock/students.js

export const mockStudents = [
  {
    id: 's001',
    name: '王小明',
    phone: '13800138001',
    remainingHours: 10,
    notes: '音域较宽，适合练习高音部分',
    isDeleted: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-15T08:30:00.000Z'
  },
  {
    id: 's002',
    name: '李梅',
    phone: '13800138002',
    remainingHours: 5,
    notes: '声音甜美，需加强气息练习',
    isDeleted: false,
    createdAt: '2025-01-05T00:00:00.000Z',
    updatedAt: '2025-01-20T09:00:00.000Z'
  },
  {
    id: 's003',
    name: '张华',
    phone: '13800138003',
    remainingHours: 2,
    notes: '进步明显，继续保持',
    isDeleted: false,
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-22T14:20:00.000Z'
  },
  {
    id: 's004',
    name: '刘芳',
    phone: '13800138004',
    remainingHours: 15,
    notes: '基础扎实，可以挑战难度曲目',
    isDeleted: false,
    createdAt: '2025-01-12T00:00:00.000Z',
    updatedAt: '2025-01-23T10:15:00.000Z'
  },
  {
    id: 's005',
    name: '陈强',
    phone: '13800138005',
    remainingHours: 8,
    notes: '男中音，音色浑厚',
    isDeleted: false,
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-25T11:00:00.000Z'
  },
  {
    id: 's006',
    name: '赵敏',
    phone: '13800138006',
    remainingHours: 12,
    notes: '节奏感好，乐感强',
    isDeleted: false,
    createdAt: '2025-01-18T00:00:00.000Z',
    updatedAt: '2025-01-26T15:30:00.000Z'
  },
  {
    id: 's007',
    name: '孙丽',
    phone: '13800138007',
    remainingHours: 1,
    notes: '课时即将用完，提醒续费',
    isDeleted: false,
    createdAt: '2025-01-20T00:00:00.000Z',
    updatedAt: '2025-01-27T09:45:00.000Z'
  },
  {
    id: 's008',
    name: '周杰',
    phone: '13800138008',
    remainingHours: 20,
    notes: '新学员，刚购买课时包',
    isDeleted: false,
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2025-02-01T10:00:00.000Z'
  }
];
```

### 2.2 课时包数据

```javascript
// src/api/mock/course-packages.js

export const mockCoursePackages = [
  {
    id: 'cp001',
    studentId: 's001',
    hours: 10,
    amount: 2000,
    purchaseDate: '2025-01-01',
    note: '首次购买',
    createdAt: '2025-01-01T10:00:00.000Z'
  },
  {
    id: 'cp002',
    studentId: 's002',
    hours: 10,
    amount: 2000,
    purchaseDate: '2025-01-05',
    note: '续费',
    createdAt: '2025-01-05T11:00:00.000Z'
  },
  {
    id: 'cp003',
    studentId: 's003',
    hours: 5,
    amount: 1000,
    purchaseDate: '2025-01-10',
    note: '体验课包',
    createdAt: '2025-01-10T14:00:00.000Z'
  },
  // ... 更多数据
];
```

### 2.3 课程数据

```javascript
// src/api/mock/courses.js

export const mockCourses = [
  {
    id: 'c001',
    studentId: 's001',
    date: '2025-02-20',
    startTime: '14:00',
    endTime: '15:00',
    duration: 1,
    location: '音乐工作室',
    status: 'pending',
    attendanceStatus: 'none',
    notes: '练习曲目：茉莉花',
    createdAt: '2025-02-01T10:00:00.000Z',
    updatedAt: '2025-02-01T10:00:00.000Z'
  },
  {
    id: 'c002',
    studentId: 's002',
    date: '2025-02-20',
    startTime: '15:30',
    endTime: '16:30',
    duration: 1,
    location: '音乐工作室',
    status: 'pending',
    attendanceStatus: 'none',
    notes: '声音练习',
    createdAt: '2025-02-01T10:05:00.000Z',
    updatedAt: '2025-02-01T10:05:00.000Z'
  },
  {
    id: 'c003',
    studentId: 's003',
    date: '2025-02-21',
    startTime: '10:00',
    endTime: '11:00',
    duration: 1,
    location: '音乐工作室',
    status: 'completed',
    attendanceStatus: 'present',
    notes: '表现优秀',
    createdAt: '2025-02-01T10:10:00.000Z',
    updatedAt: '2025-02-21T11:00:00.000Z'
  },
  // ... 更多数据
];
```

### 2.4 收入记录数据

```javascript
// src/api/mock/income.js

export const mockIncomeRecords = [
  {
    id: 'i001',
    studentId: 's001',
    amount: 2000,
    type: 'course_package',
    date: '2025-01-01',
    note: '购买10节课',
    relatedId: 'cp001',
    createdAt: '2025-01-01T10:00:00.000Z'
  },
  {
    id: 'i002',
    studentId: 's002',
    amount: 2000,
    type: 'course_package',
    date: '2025-01-05',
    note: '续费10节课',
    relatedId: 'cp002',
    createdAt: '2025-01-05T11:00:00.000Z'
  },
  {
    id: 'i003',
    studentId: 's001',
    amount: 50,
    type: 'other',
    date: '2025-01-10',
    note: '教材费',
    relatedId: null,
    createdAt: '2025-01-10T14:00:00.000Z'
  },
  // ... 更多数据
];
```

---

## 三、Mock 接口实现

### 3.1 Mock 初始化

`src/api/mock/index.js`：

```javascript
import Mock from 'mockjs';
import { mockStudents } from './students';
import { mockCourses } from './courses';
import { mockIncomeRecords } from './income';

// 延迟响应时间（模拟真实网络）
Mock.setup({
  timeout: '200-600'
});

// 响应模板
const success = (data) => ({
  code: 200,
  message: 'success',
  data
});

const error = (message) => ({
  code: 400,
  message,
  data: null
});

// 初始化本地存储
const initLocalStorage = () => {
  if (!localStorage.getItem('mock_students')) {
    localStorage.setItem('mock_students', JSON.stringify(mockStudents));
  }
  if (!localStorage.getItem('mock_courses')) {
    localStorage.setItem('mock_courses', JSON.stringify(mockCourses));
  }
  if (!localStorage.getItem('mock_income')) {
    localStorage.setItem('mock_income', JSON.stringify(mockIncomeRecords));
  }
};

initLocalStorage();

// ==================== 学生相关接口 ====================

// 获取学生列表
Mock.mock(/\/api\/students(\?.*)?$/, 'get', (options) => {
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]');
  const url = new URL('http://localhost' + options.url);
  const keyword = url.searchParams.get('keyword');
  
  let filtered = students.filter(s => !s.isDeleted);
  
  if (keyword) {
    filtered = filtered.filter(s => 
      s.name.includes(keyword) || s.phone.includes(keyword)
    );
  }
  
  return success({
    students: filtered,
    total: filtered.length
  });
});

// 获取学生详情
Mock.mock(/\/api\/students\/\w+$/, 'get', (options) => {
  const id = options.url.split('/').pop();
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]');
  const student = students.find(s => s.id === id);
  
  if (!student) {
    return error('学生不存在');
  }
  
  // 获取课时包记录
  const packages = JSON.parse(localStorage.getItem('mock_course_packages') || '[]');
  const coursePackages = packages.filter(p => p.studentId === id);
  
  // 获取上课记录
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
  const recentCourses = courses
    .filter(c => c.studentId === id && c.status === 'completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);
  
  return success({
    ...student,
    coursePackages,
    recentCourses
  });
});

// 创建学生
Mock.mock('/api/students', 'post', (options) => {
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]');
  const body = JSON.parse(options.body);
  
  // 检查手机号是否重复
  if (students.some(s => s.phone === body.phone && !s.isDeleted)) {
    return error('手机号已存在');
  }
  
  const newStudent = {
    id: 's' + Date.now(),
    ...body,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  students.push(newStudent);
  localStorage.setItem('mock_students', JSON.stringify(students));
  
  return success(newStudent);
});

// 更新学生
Mock.mock(/\/api\/students\/\w+$/, 'put', (options) => {
  const id = options.url.split('/').pop();
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]');
  const index = students.findIndex(s => s.id === id);
  
  if (index === -1) {
    return error('学生不存在');
  }
  
  const body = JSON.parse(options.body);
  students[index] = {
    ...students[index],
    ...body,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('mock_students', JSON.stringify(students));
  
  return success(students[index]);
});

// 删除学生（软删除）
Mock.mock(/\/api\/students\/\w+$/, 'delete', (options) => {
  const id = options.url.split('/').pop();
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]');
  const index = students.findIndex(s => s.id === id);
  
  if (index === -1) {
    return error('学生不存在');
  }
  
  students[index].isDeleted = true;
  students[index].updatedAt = new Date().toISOString();
  
  localStorage.setItem('mock_students', JSON.stringify(students));
  
  return success(null);
});

// ==================== 课程相关接口 ====================

// 获取课程列表
Mock.mock(/\/api\/courses(\?.*)?$/, 'get', (options) => {
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]');
  const url = new URL('http://localhost' + options.url);
  
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  const studentId = url.searchParams.get('studentId');
  const status = url.searchParams.get('status');
  
  let filtered = courses;
  
  if (startDate) {
    filtered = filtered.filter(c => c.date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(c => c.date <= endDate);
  }
  if (studentId) {
    filtered = filtered.filter(c => c.studentId === studentId);
  }
  if (status) {
    filtered = filtered.filter(c => c.status === status);
  }
  
  // 附加学生信息
  const result = filtered.map(c => {
    const student = students.find(s => s.id === c.studentId);
    return {
      ...c,
      student: student ? { id: student.id, name: student.name } : null
    };
  });
  
  return success({
    courses: result,
    total: result.length
  });
});

// 获取今日课程
Mock.mock('/api/courses/today', 'get', () => {
  const today = new Date().toISOString().split('T')[0];
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]');
  
  const todayCourses = courses
    .filter(c => c.date === today)
    .map(c => {
      const student = students.find(s => s.id === c.studentId);
      return {
        ...c,
        student: student ? {
          id: student.id,
          name: student.name,
          remainingHours: student.remainingHours
        } : null
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  return success(todayCourses);
});

// 创建课程
Mock.mock('/api/courses', 'post', (options) => {
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
  const body = JSON.parse(options.body);
  
  // 检查时间冲突
  const hasConflict = courses.some(c => 
    c.date === body.date && 
    c.status !== 'cancelled' &&
    (
      (body.startTime >= c.startTime && body.startTime < c.endTime) ||
      (body.endTime > c.startTime && body.endTime <= c.endTime) ||
      (body.startTime <= c.startTime && body.endTime >= c.endTime)
    )
  );
  
  if (hasConflict) {
    return error('该时间段已有课程安排');
  }
  
  const newCourse = {
    id: 'c' + Date.now(),
    ...body,
    status: 'pending',
    attendanceStatus: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  courses.push(newCourse);
  localStorage.setItem('mock_courses', JSON.stringify(courses));
  
  return success(newCourse);
});

// 课程签到
Mock.mock(/\/api\/courses\/\w+\/attendance$/, 'post', (options) => {
  const id = options.url.split('/')[3];
  const courses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
  const students = JSON.parse(localStorage.getItem('mock_students') || '[]');
  const body = JSON.parse(options.body);
  
  const courseIndex = courses.findIndex(c => c.id === id);
  if (courseIndex === -1) {
    return error('课程不存在');
  }
  
  const course = courses[courseIndex];
  const studentIndex = students.findIndex(s => s.id === course.studentId);
  
  if (studentIndex === -1) {
    return error('学生不存在');
  }
  
  // 更新课程状态
  courses[courseIndex].status = 'completed';
  courses[courseIndex].attendanceStatus = body.attendanceStatus;
  courses[courseIndex].notes = body.notes || course.notes;
  courses[courseIndex].updatedAt = new Date().toISOString();
  
  // 扣除课时（如果是出席或旷课）
  if (body.attendanceStatus === 'present' || body.attendanceStatus === 'absent') {
    students[studentIndex].remainingHours -= course.duration;
    students[studentIndex].updatedAt = new Date().toISOString();
  }
  
  localStorage.setItem('mock_courses', JSON.stringify(courses));
  localStorage.setItem('mock_students', JSON.stringify(students));
  
  const warning = students[studentIndex].remainingHours < 3 
    ? '学生课时不足 3 节，请提醒续费' 
    : null;
  
  return success({
    course: courses[courseIndex],
    student: {
      id: students[studentIndex].id,
      name: students[studentIndex].name,
      remainingHours: students[studentIndex].remainingHours
    },
    warning
  });
});

// ==================== 收益相关接口 ====================

// 获取收益概览
Mock.mock('/api/income/overview', 'get', () => {
  const records = JSON.parse(localStorage.getItem('mock_income') || '[]');
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const todayIncome = records
    .filter(r => r.date === today)
    .reduce((sum, r) => sum + r.amount, 0);
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekIncome = records
    .filter(r => new Date(r.date) >= weekStart)
    .reduce((sum, r) => sum + r.amount, 0);
  
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthIncome = records
    .filter(r => new Date(r.date) >= monthStart)
    .reduce((sum, r) => sum + r.amount, 0);
  
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearIncome = records
    .filter(r => new Date(r.date) >= yearStart)
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalIncome = records.reduce((sum, r) => sum + r.amount, 0);
  
  return success({
    today: todayIncome,
    week: weekIncome,
    month: monthIncome,
    year: yearIncome,
    total: totalIncome
  });
});

export default Mock;
```

---

## 四、使用说明

### 4.1 在 main.js 中引入

```javascript
// src/main.js
import { createApp } from 'vue';
import App from './App.vue';

// 开发环境启用 Mock
if (import.meta.env.VITE_USE_MOCK === 'true') {
  import('./api/mock');
}

createApp(App).mount('#app');
```

### 4.2 切换 Mock/真实接口

修改 `.env.development`：

```env
# 使用 Mock
VITE_USE_MOCK=true

# 使用真实接口
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 4.3 数据重置

在浏览器控制台执行：

```javascript
// 重置所有 Mock 数据
localStorage.removeItem('mock_students');
localStorage.removeItem('mock_courses');
localStorage.removeItem('mock_income');
localStorage.removeItem('mock_course_packages');

// 刷新页面
location.reload();
```

---

## 五、最佳实践

1. **数据一致性** - Mock 数据结构与后端 API 文档完全一致
2. **业务逻辑完整** - 包含签到扣课时、课时预警等业务逻辑
3. **错误模拟** - 模拟各种错误情况（重复、冲突、不存在等）
4. **延迟模拟** - 模拟真实网络延迟
5. **数据持久化** - 使用 localStorage 保存数据

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-21

