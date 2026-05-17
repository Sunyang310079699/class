const Student = require('../models/Student');
const Course = require('../models/Course');
const IncomeRecord = require('../models/IncomeRecord');
const Settings = require('../models/Settings');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * 获取首页统计数据
 * GET /api/statistics/dashboard
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = today.toISOString().split('T')[0];
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // 先获取系统设置
  const settings = await Settings.getSettings();
  
  // 并行查询所有统计数据
  const [
    todayCourses,
    pendingCourses,
    totalStudents,
    lowHoursStudents,
    monthCourses
  ] = await Promise.all([
    // 今日课程数
    Course.countDocuments({ 
      date: todayStr,
      status: { $ne: 'cancelled' }
    }),
    
    // 待上课程数
    Course.countDocuments({ status: 'pending' }),
    
    // 学生总数
    Student.countDocuments({ isDeleted: false }),
    
    // 课时预警学生数
    Student.countDocuments({ 
      remainingHours: { $lt: settings.warningThreshold },
      isDeleted: false 
    }),
    
    // 本月已完成课程数（只统计出席的课程，排除请假和旷课）
    Course.countDocuments({ 
      date: { $gte: monthStart.toISOString().split('T')[0] },
      status: 'completed',
      attendanceStatus: 'present'
    })
  ]);
  
  // 本月收益 = 本月已完成课程数 × 课时单价
  const monthIncome = monthCourses * settings.defaultHourlyRate;
  
  return ApiResponse.success(res, {
    monthIncome, // 本月收益（根据课程数计算）
    todayCourses,
    pendingCourses,
    lowHoursStudents,
    totalStudents,
    monthCourses
  });
});

/**
 * 获取课时预警列表
 * GET /api/statistics/warnings
 */
exports.getWarnings = asyncHandler(async (req, res) => {
  const { threshold } = req.query;
  
  let warningThreshold;
  if (threshold) {
    warningThreshold = parseInt(threshold);
  } else {
    const settings = await Settings.getSettings();
    warningThreshold = settings.warningThreshold;
  }
  
  const students = await Student.getLowHoursStudents(warningThreshold);
  
  return ApiResponse.success(res, students);
});

