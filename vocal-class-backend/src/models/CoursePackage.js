const mongoose = require('mongoose');

const coursePackageSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, '学生ID为必填项']
  },
  hours: {
    type: Number,
    required: [true, '课时数为必填项'],
    min: [1, '课时数必须大于0']
  },
  amount: {
    type: Number,
    required: [true, '支付金额为必填项'],
    min: [0, '金额不能为负数']
  },
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// 索引
coursePackageSchema.index({ studentId: 1, purchaseDate: -1 });

// 转换为 JSON 时的格式化
coursePackageSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const CoursePackage = mongoose.model('CoursePackage', coursePackageSchema);

module.exports = CoursePackage;

