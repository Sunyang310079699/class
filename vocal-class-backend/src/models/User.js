const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { pinyin } = require('pinyin-pro');

const userSchema = new mongoose.Schema({
  account: {
    type: String,
    required: [true, '账号为必填项'],
    unique: true,
    trim: true,
    match: [/^1[3-9]\d{9}$/, '账号必须是有效的11位手机号码']
  },
  password: {
    type: String,
    required: [true, '密码为必填项'],
    select: false // 默认查询时不返回密码字段
  },
  role: {
    type: String,
    required: true,
    enum: ['teacher', 'student'],
    default: 'student'
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null // 仅学生账号有此字段
  },
  phone: {
    type: String,
    required: true,
    match: [/^1[3-9]\d{9}$/, '请输入有效的11位手机号码']
  },
  name: {
    type: String,
    default: '' // 仅学生账号有姓名
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
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

// 索引（account已在schema中定义为unique，无需重复创建）
userSchema.index({ role: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ phone: 1 });

// 密码加密中间件（保存前）
userSchema.pre('save', async function(next) {
  // 如果密码未修改，跳过加密
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // 加密密码
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 实例方法：验证密码
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// 实例方法：检查账号是否被锁定
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// 实例方法：增加登录失败次数
userSchema.methods.incLoginAttempts = async function() {
  // 如果已解锁或锁定时间已过，重置登录尝试次数
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // 如果登录失败次数达到5次，锁定账号30分钟
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30分钟
  }
  
  return await this.updateOne(updates);
};

// 实例方法：重置登录失败次数
userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// 静态方法：生成学生账号密码
// 规则：姓名拼音首字母（小写）+ 手机号
// 例如：董阳洋 -> dyy18210868081
userSchema.statics.generateStudentPassword = function(studentName, phone) {
  // 将中文姓名转换为拼音首字母
  // 例如：董阳洋 -> dyy
  // 使用 pinyin-pro 的 pattern: 'first' 获取每个字的首字母
  let pinyinInitials = '';
  
  // 遍历每个字符，获取拼音首字母
  for (let i = 0; i < studentName.length; i++) {
    const char = studentName[i];
    // 如果是中文字符，获取拼音首字母
    if (/[\u4e00-\u9fa5]/.test(char)) {
      try {
        const pinyinChar = pinyin(char, { pattern: 'first', toneType: 'none' });
        pinyinInitials += pinyinChar.toLowerCase();
      } catch (error) {
        // 如果转换失败，跳过该字符
        console.warn(`无法转换字符 "${char}" 的拼音首字母:`, error.message);
      }
    } else if (/[a-zA-Z]/.test(char)) {
      // 如果是英文字母，直接使用（转小写）
      pinyinInitials += char.toLowerCase();
    }
    // 其他字符（如数字、标点）跳过
  }
  
  // 如果没有获取到任何首字母，使用默认值
  if (!pinyinInitials) {
    console.warn(`无法从姓名 "${studentName}" 获取拼音首字母，使用默认值`);
    pinyinInitials = 'user';
  }
  
  return pinyinInitials + phone;
};

// 静态方法：创建学生账号
userSchema.statics.createStudentAccount = async function(student) {
  const account = student.phone;
  const password = this.generateStudentPassword(student.name, student.phone);
  
  // 检查账号是否已存在
  const existingUser = await this.findOne({ account });
  if (existingUser) {
    throw new Error('该手机号已注册账号');
  }
  
  // 确保 studentId 正确
  const studentId = student._id || student.id;
  if (!studentId) {
    throw new Error('学生ID不存在，无法创建账号');
  }
  
  const user = await this.create({
    account,
    password,
    role: 'student',
    studentId: studentId,
    phone: student.phone,
    name: student.name
  });
  
  console.log(`✅ 学生账号创建成功: 账号=${account}, 密码=${password}`);
  
  return user;
};

// 转换为 JSON 时的格式化
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

