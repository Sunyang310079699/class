const IncomeRecord = require('../models/IncomeRecord');
const Student = require('../models/Student');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * 获取收益概览
 * GET /api/income/overview
 */
exports.getIncomeOverview = asyncHandler(async (req, res) => {
  const overview = await IncomeRecord.getIncomeOverview();
  return ApiResponse.success(res, overview);
});

/**
 * 获取收入明细
 * GET /api/income/records
 */
exports.getIncomeRecords = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate, 
    studentId, 
    type, 
    page = 1, 
    limit = 20 
  } = req.query;
  
  const query = {};
  
  // 权限控制：学生只能查看自己的缴费记录
  const isStudent = req.user && req.user.role === 'student';
  
  if (isStudent) {
    query.studentId = req.user.studentId;
    // 学生端只显示缴费记录（课时包购买和其他缴费），不显示课程收入
    query.type = { $in: ['course_package', 'other'] };
  } else if (studentId) {
    // 教师可以查看指定学生的记录
    query.studentId = studentId;
  }
  
  // 日期范围筛选
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  // 类型筛选（教师端可以指定类型，学生端已在上面的权限控制中过滤）
  if (type && !isStudent) {
    query.type = type;
  }
  
  const skip = (page - 1) * limit;
  
  const [records, total] = await Promise.all([
    IncomeRecord.find(query)
      .populate('studentId', 'name phone')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    IncomeRecord.countDocuments(query)
  ]);
  
  // 格式化数据
  const formattedRecords = records.map(record => {
    const recordObj = record.toJSON();
    recordObj.student = record.studentId ? {
      id: record.studentId._id,
      name: record.studentId.name,
      phone: record.studentId.phone
    } : null;
    // 保留 studentId 字段，方便前端使用
    recordObj.studentId = record.studentId?._id || record.studentId;
    return recordObj;
  });
  
  return ApiResponse.success(res, {
    records: formattedRecords,
    total,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

/**
 * 添加其他收入
 * POST /api/income/records
 */
exports.addIncomeRecord = asyncHandler(async (req, res) => {
  const { studentId, amount, type, date, note = '' } = req.body;
  
  // 验证学生是否存在
  const student = await Student.findById(studentId);
  if (!student) {
    return ApiResponse.notFound(res, '学生不存在');
  }
  
  const incomeRecord = await IncomeRecord.create({
    studentId,
    amount,
    type,
    date: date || new Date(),
    note
  });
  
  return ApiResponse.created(res, incomeRecord, '添加成功');
});

/**
 * 获取收益趋势
 * GET /api/income/trend
 */
exports.getIncomeTrend = asyncHandler(async (req, res) => {
  const { type = 'month', year } = req.query;
  
  const currentYear = year ? parseInt(year) : new Date().getFullYear();
  
  if (type === 'month') {
    // 月度趋势（当年每月）
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);
    
    const result = await IncomeRecord.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // 填充所有月份
    const labels = ['1月', '2月', '3月', '4月', '5月', '6月', 
                    '7月', '8月', '9月', '10月', '11月', '12月'];
    const values = new Array(12).fill(0);
    
    result.forEach(item => {
      values[item._id - 1] = item.total;
    });
    
    return ApiResponse.success(res, { labels, values });
    
  } else if (type === 'year') {
    // 年度趋势（最近几年）
    const years = [];
    const currentYearNum = new Date().getFullYear();
    for (let i = 4; i >= 0; i--) {
      years.push(currentYearNum - i);
    }
    
    const result = await IncomeRecord.aggregate([
      {
        $match: {
          date: { 
            $gte: new Date(years[0], 0, 1),
            $lte: new Date(years[years.length - 1], 11, 31, 23, 59, 59)
          }
        }
      },
      {
        $group: {
          _id: { $year: '$date' },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const values = new Array(years.length).fill(0);
    result.forEach(item => {
      const index = years.indexOf(item._id);
      if (index !== -1) {
        values[index] = item.total;
      }
    });
    
    const labels = years.map(y => `${y}年`);
    
    return ApiResponse.success(res, { labels, values });
  }
  
  return ApiResponse.error(res, '无效的趋势类型');
});

