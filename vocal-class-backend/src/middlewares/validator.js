const { body, param, query, validationResult } = require('express-validator');
const ApiResponse = require('../utils/response');

/**
 * 验证结果处理中间件
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map(err => err.msg).join(', ');
    return ApiResponse.validationError(res, message);
  }
  next();
};

/**
 * 学生验证规则
 */
const studentValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 10 })
      .withMessage('学生姓名必须为2-10个字符'),
    body('phone')
      .matches(/^1[3-9]\d{9}$/)
      .withMessage('请输入有效的11位手机号码'),
    body('remainingHours')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('剩余课时不能为负数'),
    body('initialHours')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('初始课时不能为负数'),
    body('notes')
      .optional()
      .isLength({ max: 200 })
      .withMessage('备注不能超过200字'),
    handleValidationErrors
  ],
  update: [
    param('id').isMongoId().withMessage('无效的学生ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 10 })
      .withMessage('学生姓名必须为2-10个字符'),
    body('phone')
      .optional()
      .matches(/^1[3-9]\d{9}$/)
      .withMessage('请输入有效的11位手机号码'),
    body('notes')
      .optional()
      .isLength({ max: 200 })
      .withMessage('备注不能超过200字'),
    handleValidationErrors
  ],
  getId: [
    param('id').isMongoId().withMessage('无效的学生ID'),
    handleValidationErrors
  ]
};

/**
 * 课时包验证规则
 */
const coursePackageValidation = {
  create: [
    param('studentId').isMongoId().withMessage('无效的学生ID'),
    body('hours')
      .isInt({ min: 1 })
      .withMessage('课时数必须为正整数'),
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('金额必须大于等于0'),
    body('purchaseDate')
      .optional()
      .isISO8601()
      .withMessage('无效的日期格式'),
    body('note')
      .optional()
      .isString()
      .withMessage('备注必须为字符串'),
    handleValidationErrors
  ]
};

/**
 * 课程验证规则
 */
const courseValidation = {
  create: [
    body('studentId').isMongoId().withMessage('无效的学生ID'),
    body('date')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('日期格式必须为 YYYY-MM-DD'),
    body('startTime')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('开始时间格式必须为 HH:mm'),
    body('endTime')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('结束时间格式必须为 HH:mm'),
    body('duration')
      .optional()
      .isFloat({ min: 0.5 })
      .withMessage('课时长度必须大于0'),
    body('location')
      .optional()
      .isString(),
    body('notes')
      .optional()
      .isString(),
    body('courseType')
      .optional()
      .isIn(['regular', 'temporary'])
      .withMessage('课程类型必须为: regular, temporary'),
    body('updateFutureCourses')
      .optional()
      .isBoolean()
      .withMessage('后续课程同步选项必须为布尔值'),
    handleValidationErrors
  ],
  update: [
    param('id').isMongoId().withMessage('无效的课程ID'),
    body('studentId')
      .optional()
      .isMongoId()
      .withMessage('无效的学生ID'),
    body('date')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('日期格式必须为 YYYY-MM-DD'),
    body('startTime')
      .optional()
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('开始时间格式必须为 HH:mm'),
    body('endTime')
      .optional()
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('结束时间格式必须为 HH:mm'),
    body('duration')
      .optional()
      .isFloat({ min: 0.5 })
      .withMessage('课时长度必须大于0'),
    body('location')
      .optional()
      .isString(),
    body('notes')
      .optional()
      .isString(),
    body('courseType')
      .optional()
      .isIn(['regular', 'temporary'])
      .withMessage('课程类型必须为: regular, temporary'),
    handleValidationErrors
  ],
  attendance: [
    param('id').isMongoId().withMessage('无效的课程ID'),
    body('attendanceStatus')
      .isIn(['present', 'absent', 'leave'])
      .withMessage('签到状态必须为: present, absent, leave'),
    body('notes')
      .optional()
      .isString(),
    handleValidationErrors
  ],
  getId: [
    param('id').isMongoId().withMessage('无效的课程ID'),
    handleValidationErrors
  ]
};

/**
 * 收入记录验证规则
 */
const incomeValidation = {
  create: [
    body('studentId').isMongoId().withMessage('无效的学生ID'),
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('金额必须大于等于0'),
    body('type')
      .isIn(['course', 'course_package', 'other'])
      .withMessage('类型必须为: course, course_package, other'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('无效的日期格式'),
    body('note')
      .optional()
      .isString(),
    handleValidationErrors
  ]
};

/**
 * 设置验证规则
 */
const settingsValidation = {
  update: [
    body('defaultCourseDuration')
      .optional()
      .isFloat({ min: 0.5 })
      .withMessage('课时长度必须大于0'),
    body('defaultHourlyRate')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('课时单价不能为负数'),
    body('warningThreshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('预警阈值不能为负数'),
    body('defaultLocation')
      .optional()
      .isString(),
    body('teacherName')
      .optional()
      .isString(),
    body('teacherPhone')
      .optional()
      .isString(),
    handleValidationErrors
  ]
};

/**
 * 通用验证中间件
 */
const validate = handleValidationErrors;

module.exports = {
  validate,
  handleValidationErrors,
  studentValidation,
  coursePackageValidation,
  courseValidation,
  incomeValidation,
  settingsValidation
};

