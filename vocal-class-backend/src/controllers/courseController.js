const Course = require('../models/Course');
const Student = require('../models/Student');
const Settings = require('../models/Settings');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (dateStr, days) => {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
};

const diffDays = (fromDateStr, toDateStr) => {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((parseLocalDate(toDateStr) - parseLocalDate(fromDateStr)) / dayMs);
};

const formatCourse = (course) => {
  const courseObj = course.toJSON();
  courseObj.student = course.studentId ? {
    id: course.studentId._id || course.studentId,
    name: course.studentId.name,
    phone: course.studentId.phone,
    remainingHours: course.studentId.remainingHours
  } : null;
  courseObj.studentId = course.studentId?._id || course.studentId;
  return courseObj;
};

/**
 * 获取课程列表
 * GET /api/courses
 */
exports.getCourses = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate, 
    studentId, 
    status, 
    page = 1, 
    limit = 20 
  } = req.query;
  
  const query = {};
  
  // 权限控制：学生只能查看自己的课程
  if (req.user && req.user.role === 'student') {
    // 确保 studentId 存在
    if (req.user.studentId) {
      query.studentId = req.user.studentId;
      console.log('学生端查询课程，studentId:', req.user.studentId);
    } else {
      console.warn('学生账号缺少 studentId，无法查询课程');
      // 返回空结果
      return ApiResponse.success(res, {
        courses: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    }
  } else if (studentId) {
    // 教师可以查看指定学生的课程
    query.studentId = studentId;
  }
  
  // 日期范围筛选
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  
  // 状态筛选
  if (status) {
    query.status = status;
  }
  
  const skip = (page - 1) * limit;
  
  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate('studentId', 'name phone remainingHours')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Course.countDocuments(query)
  ]);
  
  // 格式化数据
  const formattedCourses = courses.map(course => {
    const courseObj = course.toJSON();
    courseObj.student = course.studentId ? {
      id: course.studentId._id,
      name: course.studentId.name,
      phone: course.studentId.phone,
      remainingHours: course.studentId.remainingHours
    } : null;
    // 保留 studentId 字段，方便前端使用
    courseObj.studentId = course.studentId?._id || course.studentId;
    return courseObj;
  });
  
  return ApiResponse.success(res, {
    courses: formattedCourses,
    total,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

/**
 * 获取课程详情
 * GET /api/courses/:id
 */
exports.getCourseDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id).populate('studentId', 'name phone remainingHours');

  if (!course) {
    return ApiResponse.notFound(res, '课程不存在');
  }

  return ApiResponse.success(res, formatCourse(course));
});

/**
 * 获取今日课程
 * GET /api/courses/today
 */
exports.getTodayCourses = asyncHandler(async (req, res) => {
  const courses = await Course.getTodayCourses();
  
  // 格式化数据
  const formattedCourses = courses.map(course => {
    const courseObj = course.toJSON();
    courseObj.student = course.studentId ? {
      id: course.studentId._id,
      name: course.studentId.name,
      remainingHours: course.studentId.remainingHours
    } : null;
    delete courseObj.studentId;
    return courseObj;
  });
  
  return ApiResponse.success(res, formattedCourses);
});

/**
 * 创建课程
 * POST /api/courses
 */
exports.createCourse = asyncHandler(async (req, res) => {
  const { 
    studentId, 
    date, 
    startTime, 
    endTime, 
    duration, 
    location, 
    notes,
    courseType = 'regular' // 默认为常规课程
  } = req.body;
  
  // 验证学生是否存在
  const student = await Student.findById(studentId);
  if (!student) {
    return ApiResponse.notFound(res, '学生不存在');
  }
  
  // 检查时间冲突
  const hasConflict = await Course.checkTimeConflict(date, startTime, endTime);
  if (hasConflict) {
    return ApiResponse.error(res, '该时间段已有课程安排', 400, 1004);
  }
  
  // 获取默认设置
  const settings = await Settings.getSettings();
  
  const course = await Course.create({
    studentId,
    date,
    startTime,
    endTime,
    duration: duration || settings.defaultCourseDuration,
    location: location || settings.defaultLocation,
    notes: notes || '',
    courseType
  });
  
  // 如果是常规课程，根据剩余课时从下周开始逐周生成同一时间的课程
  const generatedCourses = [];
  if (courseType === 'regular') {
    try {
      const courseDuration = duration || settings.defaultCourseDuration;
      const totalSchedulableCourses = Math.floor(student.remainingHours / courseDuration);
      const futureCourseCount = Math.max(totalSchedulableCourses - 1, 0);
      
      for (let weekOffset = 1; weekOffset <= futureCourseCount; weekOffset++) {
        const targetDateStr = addDays(date, weekOffset * 7);
        
        // 检查该时间段是否已有课程
        const hasConflict = await Course.checkTimeConflict(
          targetDateStr, 
          startTime, 
          endTime
        );
        
        if (!hasConflict) {
          try {
            const generatedCourse = await Course.create({
              studentId,
              date: targetDateStr,
              startTime,
              endTime,
              duration: courseDuration,
              location: location || settings.defaultLocation,
              notes: notes || '',
              courseType: 'regular'
            });
            generatedCourses.push(generatedCourse);
          } catch (error) {
            console.error(`生成课程失败 ${targetDateStr}:`, error);
          }
        }
      }
    } catch (error) {
      // 如果生成课程失败，不影响当前课程的创建
      console.error('生成常规课程失败:', error);
    }
  }
  
  return ApiResponse.created(res, {
    course,
    generatedCourses: generatedCourses.map(c => c.toJSON()),
    generatedCount: generatedCourses.length
  }, generatedCourses.length > 0 
    ? `创建成功，已自动生成后续 ${generatedCourses.length} 节常规课程`
    : '创建成功');
});

/**
 * 更新课程
 * PUT /api/courses/:id
 */
exports.updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    studentId,
    date,
    startTime,
    endTime,
    duration,
    notes,
    location,
    courseType,
    updateFutureCourses = false
  } = req.body;
  
  const course = await Course.findById(id);
  
  if (!course) {
    return ApiResponse.notFound(res, '课程不存在');
  }
  
  // 只有待上课的课程可以修改
  if (course.status !== 'pending') {
    return ApiResponse.error(res, '只能修改待上课的课程', 400);
  }

  if (studentId) {
    const student = await Student.findById(studentId);
    if (!student) {
      return ApiResponse.notFound(res, '学生不存在');
    }
  }
  
  // 如果修改了时间，检查时间冲突
  const newDate = date || course.date;
  const newStartTime = startTime || course.startTime;
  const newEndTime = endTime || course.endTime;
  const newDuration = duration !== undefined ? duration : course.duration;
  const originalDate = course.date;
  const originalStartTime = course.startTime;
  const originalStudentId = course.studentId;
  const finalStudentId = studentId || String(originalStudentId);
  const finalCourseType = courseType || course.courseType;
  const shouldUpdateFutureCourses = Boolean(updateFutureCourses) 
    && course.courseType === 'regular'
    && finalCourseType === 'regular'
    && String(finalStudentId) === String(originalStudentId);
  const futureCourses = shouldUpdateFutureCourses
    ? await Course.find({
        studentId: originalStudentId,
        courseType: 'regular',
        status: 'pending',
        startTime: originalStartTime,
        endTime: course.endTime,
        $or: [
          { date: { $gt: originalDate } },
          { date: originalDate, startTime: { $gt: originalStartTime } }
        ]
      }).sort({ date: 1, startTime: 1 })
    : [];
  const sameSeriesFutureCourses = futureCourses.filter(item => {
    const offsetDays = diffDays(originalDate, item.date);
    return offsetDays > 0 && offsetDays % 7 === 0;
  });
  const affectedCourseIds = [course._id, ...sameSeriesFutureCourses.map(item => item._id)];
  
  if (date || startTime || endTime) {
    const hasConflict = await Course.checkTimeConflict(
      newDate, 
      newStartTime, 
      newEndTime, 
      affectedCourseIds
    );
    if (hasConflict) {
      return ApiResponse.error(res, '该时间段已有课程安排', 400, 1004);
    }
  }

  const dateOffset = diffDays(originalDate, newDate);
  if (shouldUpdateFutureCourses && (date || startTime || endTime)) {
    for (const futureCourse of sameSeriesFutureCourses) {
      const futureDate = date ? addDays(futureCourse.date, dateOffset) : futureCourse.date;
      const hasConflict = await Course.checkTimeConflict(
        futureDate,
        newStartTime,
        newEndTime,
        affectedCourseIds
      );
      if (hasConflict) {
        return ApiResponse.error(res, '后续课程调整后与已有课程冲突，请检查时间安排', 400, 1004);
      }
    }
  }
  
  // 更新字段
  if (studentId) course.studentId = studentId;
  if (date) course.date = date;
  if (startTime) course.startTime = startTime;
  if (endTime) course.endTime = endTime;
  if (duration !== undefined) course.duration = newDuration;
  if (notes !== undefined) course.notes = notes;
  if (location !== undefined) course.location = location;
  if (courseType) course.courseType = courseType;
  
  await course.save();

  if (shouldUpdateFutureCourses && sameSeriesFutureCourses.length > 0 && (date || startTime || endTime || duration !== undefined)) {
    for (const futureCourse of sameSeriesFutureCourses) {
      if (date) futureCourse.date = addDays(futureCourse.date, dateOffset);
      if (startTime) futureCourse.startTime = newStartTime;
      if (endTime) futureCourse.endTime = newEndTime;
      if (duration !== undefined) futureCourse.duration = newDuration;
      await futureCourse.save();
    }
  }

  await course.populate('studentId', 'name phone remainingHours');
  
  return ApiResponse.success(res, {
    course: formatCourse(course),
    updatedFutureCount: shouldUpdateFutureCourses ? sameSeriesFutureCourses.length : 0
  }, '更新成功');
});

/**
 * 取消课程
 * POST /api/courses/:id/cancel
 */
exports.cancelCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = '' } = req.body;
  
  const course = await Course.findById(id);
  
  if (!course) {
    return ApiResponse.notFound(res, '课程不存在');
  }
  
  if (course.status !== 'pending') {
    return ApiResponse.error(res, '只能取消待上课的课程', 400);
  }
  
  course.status = 'cancelled';
  if (reason) {
    course.notes = course.notes 
      ? `${course.notes}\n取消原因: ${reason}` 
      : `取消原因: ${reason}`;
  }
  
  await course.save();
  
  return ApiResponse.success(res, course, '取消成功');
});

/**
 * 课程签到
 * POST /api/courses/:id/attendance
 */
exports.attendanceCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { attendanceStatus, notes } = req.body;
  
  const course = await Course.findById(id).populate('studentId');
  
  if (!course) {
    return ApiResponse.notFound(res, '课程不存在');
  }
  
  if (course.status !== 'pending') {
    return ApiResponse.error(res, '只能对待上课的课程进行签到', 400);
  }
  
  const student = course.studentId;
  
  // 如果是出席或旷课，先检查课时是否充足
  if (attendanceStatus === 'present' || attendanceStatus === 'absent') {
    if (student.remainingHours < course.duration) {
      return ApiResponse.error(res, '学生课时不足', 400, 1003);
    }
  }
  
  // 更新课程状态
  course.status = 'completed';
  course.attendanceStatus = attendanceStatus;
  if (notes) course.notes = notes;
  await course.save();
  
  // 如果是出席或旷课，扣除课时
  if (attendanceStatus === 'present' || attendanceStatus === 'absent') {
    student.remainingHours -= course.duration;
    await student.save();
    
    // 自动创建收入记录（课程数 × 课时单价）
    const settings = await Settings.getSettings();
    const IncomeRecord = require('../models/IncomeRecord');
    await IncomeRecord.create({
      studentId: student._id,
      amount: course.duration * settings.defaultHourlyRate,
      type: 'course',
      date: new Date(course.date),
      note: `课程收入（${course.duration}课时）`,
      relatedId: course._id
    });
  }
  
  // 获取系统设置检查预警
  const settings = await Settings.getSettings();
  let warning = null;
  
  if (student.remainingHours < settings.warningThreshold) {
    warning = `学生课时不足 ${settings.warningThreshold} 节，请提醒续费`;
  }
  
  return ApiResponse.success(res, {
    course: course.toJSON(),
    student: {
      id: student._id,
      name: student.name,
      remainingHours: student.remainingHours
    },
    warning
  }, '签到成功');
});

/**
 * 生成下周常规课程
 * POST /api/courses/generate-next-week
 */
exports.generateNextWeekCourses = asyncHandler(async (req, res) => {
  const today = new Date();
  const currentWeekStart = new Date(today);
  const currentDayOfWeek = today.getDay() || 7; // 周日按 7 处理
  currentWeekStart.setDate(today.getDate() - currentDayOfWeek + 1); // 本周一
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // 本周日
  
  // 查找本周的常规课程（已完成或待上课）
  const currentWeekCourses = await Course.find({
    date: {
      $gte: formatLocalDate(currentWeekStart),
      $lte: formatLocalDate(currentWeekEnd)
    },
    courseType: 'regular',
    status: { $in: ['pending', 'completed'] }
  }).populate('studentId');
  
  const createdCourses = [];
  const skippedCourses = [];
  
  // 获取默认设置
  const settings = await Settings.getSettings();
  
  for (const course of currentWeekCourses) {
    const student = course.studentId;
    const studentId = student._id || student;
    
    // 重新获取学生信息，确保获取最新的剩余课时
    const currentStudent = await Student.findById(studentId);
    if (!currentStudent) {
      skippedCourses.push({
        student: student.name || '未知学生',
        date: course.date,
        reason: '学生不存在'
      });
      continue;
    }
    
    // 检查学生剩余课时是否足够
    if (currentStudent.remainingHours < course.duration) {
      skippedCourses.push({
        student: currentStudent.name,
        date: course.date,
        reason: `剩余课时不足（当前：${currentStudent.remainingHours}课时，需要：${course.duration}课时）`
      });
      continue;
    }
    
    const nextWeekDateStr = addDays(course.date, 7);
    
    // 检查下周同一时间段是否已有课程
    const hasConflict = await Course.checkTimeConflict(
      nextWeekDateStr,
      course.startTime,
      course.endTime
    );
    
    if (!hasConflict) {
      try {
        const nextWeekCourse = await Course.create({
          studentId: studentId,
          date: nextWeekDateStr,
          startTime: course.startTime,
          endTime: course.endTime,
          duration: course.duration,
          location: course.location || settings.defaultLocation,
          notes: course.notes || '',
          courseType: 'regular'
        });
        createdCourses.push(nextWeekCourse);
      } catch (error) {
        skippedCourses.push({
          student: currentStudent.name,
          date: course.date,
          reason: error.message
        });
      }
    } else {
      skippedCourses.push({
        student: currentStudent.name,
        date: course.date,
        reason: '下周同一时间段已有课程'
      });
    }
  }
  
  return ApiResponse.success(res, {
    created: createdCourses.length,
    skipped: skippedCourses.length,
    createdCourses,
    skippedCourses
  }, `成功生成 ${createdCourses.length} 节下周课程，跳过 ${skippedCourses.length} 节`);
});

