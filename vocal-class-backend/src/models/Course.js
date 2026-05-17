const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, '学生ID为必填项']
  },
  date: {
    type: String,
    required: [true, '上课日期为必填项'],
    match: [/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD']
  },
  startTime: {
    type: String,
    required: [true, '开始时间为必填项'],
    match: [/^\d{2}:\d{2}$/, '时间格式必须为 HH:mm']
  },
  endTime: {
    type: String,
    required: [true, '结束时间为必填项'],
    match: [/^\d{2}:\d{2}$/, '时间格式必须为 HH:mm']
  },
  duration: {
    type: Number,
    required: true,
    default: 1,
    min: [0.5, '课时长度必须大于0']
  },
  location: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  attendanceStatus: {
    type: String,
    required: true,
    enum: ['none', 'present', 'absent', 'leave'],
    default: 'none'
  },
  courseType: {
    type: String,
    required: true,
    enum: ['regular', 'temporary'],
    default: 'regular'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
courseSchema.index({ studentId: 1, date: 1, startTime: 1 });
courseSchema.index({ date: 1, startTime: 1, status: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ createdAt: -1 });

// 静态方法：检查时间冲突
courseSchema.statics.checkTimeConflict = async function(date, startTime, endTime, excludeId = null) {
  const query = {
    date,
    status: { $ne: 'cancelled' },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };

  if (excludeId) {
    const excludeIds = Array.isArray(excludeId) ? excludeId : [excludeId];
    query._id = { $nin: excludeIds };
  }

  const conflicts = await this.find(query);
  return conflicts.length > 0;
};

// 静态方法：获取今日课程
courseSchema.statics.getTodayCourses = async function() {
  const today = new Date().toISOString().split('T')[0];
  return await this.find({
    date: today,
    status: { $ne: 'cancelled' }
  }).populate('studentId').sort({ startTime: 1 });
};

// 转换为 JSON 时的格式化
courseSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

