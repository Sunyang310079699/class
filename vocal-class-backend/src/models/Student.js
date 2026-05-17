const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '学生姓名为必填项'],
    trim: true,
    minlength: [2, '姓名至少2个字符'],
    maxlength: [10, '姓名最多10个字符']
  },
  phone: {
    type: String,
    required: [true, '联系电话为必填项'],
    unique: true,
    match: [/^1[3-9]\d{9}$/, '请输入有效的11位手机号码']
  },
  remainingHours: {
    type: Number,
    required: true,
    default: 0,
    min: [0, '剩余课时不能为负数']
  },
  notes: {
    type: String,
    default: '',
    maxlength: [200, '备注不能超过200字']
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
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
studentSchema.index({ phone: 1 }, { unique: true });
studentSchema.index({ name: 1 });
studentSchema.index({ remainingHours: 1 });
studentSchema.index({ isDeleted: 1 });

// 查询中间件：自动过滤已删除的记录
studentSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

// 实例方法：软删除
studentSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  return await this.save();
};

// 静态方法：检查课时预警
studentSchema.statics.getLowHoursStudents = async function(threshold = 3) {
  return await this.find({
    remainingHours: { $lt: threshold },
    isDeleted: false
  }).sort({ remainingHours: 1 });
};

// 转换为 JSON 时的格式化
studentSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.isDeleted;
    return ret;
  }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

