const mongoose = require('mongoose');

const incomeRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, '学生ID为必填项']
  },
  amount: {
    type: Number,
    required: [true, '金额为必填项'],
    min: [0, '金额不能为负数']
  },
  type: {
    type: String,
    required: true,
    enum: ['course', 'course_package', 'other']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// 索引
incomeRecordSchema.index({ studentId: 1, date: -1 });
incomeRecordSchema.index({ date: -1 });
incomeRecordSchema.index({ type: 1 });

// 静态方法：获取时间段内的总收入
incomeRecordSchema.statics.getTotalIncome = async function(startDate, endDate) {
  const match = {};
  
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// 静态方法：获取指定类型和时间段的收益
incomeRecordSchema.statics.getIncomeByType = async function(type, startDate, endDate) {
  const match = { type };
  
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// 静态方法：获取收益概览（区分购买课时收益和上课收益）
incomeRecordSchema.statics.getIncomeOverview = async function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  // 计算购买课时收益（course_package）
  const [
    todayPackageIncome,
    weekPackageIncome,
    monthPackageIncome,
    yearPackageIncome,
    totalPackageIncome
  ] = await Promise.all([
    this.getIncomeByType('course_package', today, null),
    this.getIncomeByType('course_package', weekStart, null),
    this.getIncomeByType('course_package', monthStart, null),
    this.getIncomeByType('course_package', yearStart, null),
    this.getIncomeByType('course_package', null, null)
  ]);

  // 计算上课收益（course）
  const [
    todayCourseIncome,
    weekCourseIncome,
    monthCourseIncome,
    yearCourseIncome,
    totalCourseIncome
  ] = await Promise.all([
    this.getIncomeByType('course', today, null),
    this.getIncomeByType('course', weekStart, null),
    this.getIncomeByType('course', monthStart, null),
    this.getIncomeByType('course', yearStart, null),
    this.getIncomeByType('course', null, null)
  ]);

  // 总收益 = 购买课时收益（上课收益已包含在购买课时收益中，不计入总收益）
  // 上课收益仅用于统计上课情况，不重复计入总收益

  return {
    // 总收益 = 购买课时收益（上课收益已包含在内）
    today: todayPackageIncome,
    week: weekPackageIncome,
    month: monthPackageIncome,
    year: yearPackageIncome,
    total: totalPackageIncome,
    // 购买课时收益
    packageIncome: {
      today: todayPackageIncome,
      week: weekPackageIncome,
      month: monthPackageIncome,
      year: yearPackageIncome,
      total: totalPackageIncome
    },
    // 上课收益（仅用于统计，不计入总收益）
    courseIncome: {
      today: todayCourseIncome,
      week: weekCourseIncome,
      month: monthCourseIncome,
      year: yearCourseIncome,
      total: totalCourseIncome
    }
  };
};

// 转换为 JSON 时的格式化
incomeRecordSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const IncomeRecord = mongoose.model('IncomeRecord', incomeRecordSchema);

module.exports = IncomeRecord;

