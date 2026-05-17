const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId('000000000000000000000001')
  },
  defaultCourseDuration: {
    type: Number,
    required: true,
    default: 1, // 1课时=45分钟
    min: [0.5, '课时长度必须大于0']
  },
  defaultHourlyRate: {
    type: Number,
    required: true,
    default: 200,
    min: [0, '课时单价不能为负数']
  },
  defaultLocation: {
    type: String,
    default: '音乐工作室'
  },
  warningThreshold: {
    type: Number,
    required: true,
    default: 3,
    min: [0, '预警阈值不能为负数']
  },
  teacherName: {
    type: String,
    default: ''
  },
  teacherPhone: {
    type: String,
    default: ''
  },
  wechatOpenId: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: false, updatedAt: true }
});

// 静态方法：获取或创建设置
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findById('000000000000000000000001');
  
  if (!settings) {
    settings = await this.create({
      _id: new mongoose.Types.ObjectId('000000000000000000000001'),
      defaultCourseDuration: 1, // 1课时=45分钟
      defaultHourlyRate: 200,
      defaultLocation: '音乐工作室',
      warningThreshold: 3,
      teacherName: '',
      teacherPhone: '',
      wechatOpenId: ''
    });
  }
  
  return settings;
};

// 静态方法：更新设置
settingsSchema.statics.updateSettings = async function(updates) {
  const settings = await this.getSettings();
  Object.assign(settings, updates);
  settings.updatedAt = new Date();
  return await settings.save();
};

// 转换为 JSON 时的格式化
settingsSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;

