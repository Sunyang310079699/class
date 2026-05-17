const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Course');
const CoursePackage = require('../models/CoursePackage');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * 获取学生列表
 * GET /api/students
 */
exports.getStudents = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 20 } = req.query;
  
  const query = { isDeleted: false };
  
  // 搜索功能
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { phone: { $regex: keyword, $options: 'i' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const [students, total] = await Promise.all([
    Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Student.countDocuments(query)
  ]);
  
  return ApiResponse.success(res, {
    students,
    total,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

/**
 * 获取学生详情
 * GET /api/students/:id
 */
exports.getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const student = await Student.findById(id);
  
  if (!student) {
    return ApiResponse.notFound(res, '学生不存在');
  }
  
  // 获取课时包记录
  const coursePackages = await CoursePackage.find({ studentId: id })
    .sort({ purchaseDate: -1 })
    .limit(10);
  
  // 获取最近的课程记录
  const recentCourses = await Course.find({ 
    studentId: id,
    status: { $ne: 'cancelled' }
  })
    .sort({ date: -1, startTime: -1 })
    .limit(10);
  
  const studentData = student.toJSON();
  studentData.coursePackages = coursePackages;
  studentData.recentCourses = recentCourses;
  
  return ApiResponse.success(res, studentData);
});

/**
 * 创建学生
 * POST /api/students
 */
exports.createStudent = asyncHandler(async (req, res) => {
  // 支持 initialHours 和 remainingHours 两种字段名（兼容前端）
  const { name, phone, remainingHours, initialHours, notes = '' } = req.body;
  const hours = remainingHours !== undefined ? remainingHours : (initialHours !== undefined ? initialHours : 0);
  
  // 检查手机号是否已存在
  const existingStudent = await Student.findOne({ phone, isDeleted: false });
  if (existingStudent) {
    return ApiResponse.error(res, '该手机号已被使用', 400, 1005);
  }
  
  const student = await Student.create({
    name,
    phone,
    remainingHours: hours,
    notes
  });
  
  // 自动为学生创建登录账号
  let accountInfo = null;
  try {
    const user = await User.createStudentAccount(student);
    const password = User.generateStudentPassword(student.name, student.phone);
    accountInfo = {
      account: user.account,
      password: password,
      role: 'student'
    };
    console.log(`✅ 为学生 ${student.name} 创建账号成功:`);
    console.log(`   账号: ${accountInfo.account}`);
    console.log(`   密码: ${accountInfo.password}`);
  } catch (error) {
    // 如果创建账号失败，记录详细错误
    console.error('❌ 为学生创建账号失败:', error.message);
    console.error('错误详情:', error);
    
    // 如果账号已存在，记录警告但不影响学生创建
    if (error.message.includes('已注册账号')) {
      console.warn(`⚠️  学生 ${student.name} 的账号已存在，跳过创建`);
    } else {
      // 其他错误也记录，但不阻止学生创建
      console.error('账号创建失败，但学生已创建成功');
    }
  }
  
  // 返回学生信息和账号信息
  const studentData = student.toJSON();
  if (accountInfo) {
    studentData.accountInfo = accountInfo;
  }
  
  return ApiResponse.created(res, studentData, accountInfo ? '创建成功，账号已自动生成' : '创建成功');
});

/**
 * 更新学生信息
 * PUT /api/students/:id
 */
exports.updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, phone, notes } = req.body;
  
  const student = await Student.findById(id);
  
  if (!student) {
    return ApiResponse.notFound(res, '学生不存在');
  }
  
  // 如果更新手机号，检查是否重复
  if (phone && phone !== student.phone) {
    const existingStudent = await Student.findOne({ 
      phone, 
      isDeleted: false,
      _id: { $ne: id }
    });
    if (existingStudent) {
      return ApiResponse.error(res, '该手机号已被使用', 400, 1005);
    }
  }
  
  // 更新字段
  if (name) student.name = name;
  if (phone) student.phone = phone;
  if (notes !== undefined) student.notes = notes;
  
  await student.save();
  
  return ApiResponse.success(res, student, '更新成功');
});

/**
 * 删除学生（软删除）
 * DELETE /api/students/:id
 */
exports.deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const student = await Student.findById(id);
  
  if (!student) {
    return ApiResponse.notFound(res, '学生不存在');
  }
  
  await student.softDelete();
  
  return ApiResponse.success(res, null, '删除成功');
});

/**
 * 学生端：获取自己的信息
 * GET /api/students/me/info
 */
exports.getMyInfo = asyncHandler(async (req, res) => {
  const studentId = req.user.studentId;
  
  if (!studentId) {
    return ApiResponse.error(res, '学生信息不存在', 404);
  }
  
  const student = await Student.findById(studentId);
  
  if (!student) {
    return ApiResponse.notFound(res, '学生不存在');
  }
  
  // 获取课时包记录
  const coursePackages = await CoursePackage.find({ studentId })
    .sort({ purchaseDate: -1 });
  
  // 获取课程记录
  const courses = await Course.find({ 
    studentId,
    status: { $ne: 'cancelled' }
  })
    .sort({ date: -1, startTime: -1 });
  
  const studentData = student.toJSON();
  studentData.coursePackages = coursePackages;
  studentData.courses = courses;
  
  return ApiResponse.success(res, studentData);
});

