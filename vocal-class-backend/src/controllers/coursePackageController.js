const CoursePackage = require('../models/CoursePackage');
const Student = require('../models/Student');
const IncomeRecord = require('../models/IncomeRecord');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * 购买课时包
 * POST /api/students/:studentId/course-packages
 */
exports.purchaseCoursePackage = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { hours, amount, purchaseDate, note = '' } = req.body;
  
  // 验证学生是否存在
  const student = await Student.findById(studentId);
  if (!student) {
    return ApiResponse.notFound(res, '学生不存在');
  }
  
  // 创建课时包记录
  const coursePackage = await CoursePackage.create({
    studentId,
    hours,
    amount,
    purchaseDate: purchaseDate || new Date(),
    note
  });
  
  // 增加学生的剩余课时
  student.remainingHours += hours;
  await student.save();
  
  // 创建收入记录
  const incomeRecord = await IncomeRecord.create({
    studentId,
    amount,
    type: 'course_package',
    date: purchaseDate || new Date(),
    note: note || `购买${hours}节课`,
    relatedId: coursePackage._id
  });
  
  return ApiResponse.created(res, {
    coursePackage,
    student: {
      id: student._id,
      name: student.name,
      remainingHours: student.remainingHours
    },
    income: incomeRecord
  }, '购买成功');
});

/**
 * 获取学生的课时包列表
 * GET /api/students/:studentId/course-packages
 */
exports.getCoursePackages = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  // 验证学生是否存在
  const student = await Student.findById(studentId);
  if (!student) {
    return ApiResponse.notFound(res, '学生不存在');
  }
  
  const coursePackages = await CoursePackage.find({ studentId })
    .sort({ purchaseDate: -1 });
  
  return ApiResponse.success(res, coursePackages);
});

