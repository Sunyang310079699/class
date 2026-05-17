const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');

// 生成 JWT Token
const generateToken = (userId, role, account) => {
  return jwt.sign(
    { userId, role, account },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * 登录
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { account, password, role } = req.body;

  // 参数验证
  if (!account || !password) {
    return sendError(res, '账号和密码不能为空', 400);
  }

  // 查找用户（需要包含密码字段）
  const user = await User.findOne({ account }).select('+password');
  
  if (!user) {
    return sendError(res, '账号或密码错误', 401);
  }

  // 检查账号是否激活
  if (!user.isActive) {
    return sendError(res, '账号已被禁用', 403);
  }

  // 检查账号是否被锁定
  if (user.isLocked()) {
    const lockTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    return sendError(res, `账号已被锁定，请${lockTime}分钟后再试`, 423);
  }

  // 验证角色（如果指定了角色）
  if (role && user.role !== role) {
    await user.incLoginAttempts();
    return sendError(res, '账号类型不匹配', 403);
  }

  // 验证密码
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    await user.incLoginAttempts();
    return sendError(res, '账号或密码错误', 401);
  }

  // 登录成功，重置登录失败次数
  await user.resetLoginAttempts();
  
  // 更新最后登录时间
  user.lastLoginAt = new Date();
  await user.save();

  // 生成 Token
  const token = generateToken(user._id, user.role, user.account);

  // 返回用户信息（不包含密码）
  const userData = user.toJSON();
  
  // 如果是学生账号，填充学生信息
  if (user.role === 'student' && user.studentId) {
    const Student = require('../models/Student');
    const student = await Student.findById(user.studentId);
    if (student) {
      userData.student = student.toJSON();
    }
  }

  sendSuccess(res, {
    token,
    user: userData
  }, '登录成功');
});

/**
 * 登出
 * POST /api/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
  // JWT 是无状态的，客户端删除 token 即可
  // 这里可以记录登出日志或实现 token 黑名单
  sendSuccess(res, null, '登出成功');
});

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
exports.getMe = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return sendError(res, '用户不存在', 404);
  }

  const userData = user.toJSON();
  
  // 如果是学生账号，填充学生信息
  if (user.role === 'student' && user.studentId) {
    const Student = require('../models/Student');
    const student = await Student.findById(user.studentId);
    if (student) {
      userData.student = student.toJSON();
    }
  }

  sendSuccess(res, userData);
});

/**
 * 修改密码
 * PUT /api/auth/password
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return sendError(res, '旧密码和新密码不能为空', 400);
  }

  if (newPassword.length < 6) {
    return sendError(res, '新密码长度至少6位', 400);
  }

  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    return sendError(res, '用户不存在', 404);
  }

  // 验证旧密码
  const isPasswordValid = await user.comparePassword(oldPassword);
  if (!isPasswordValid) {
    return sendError(res, '旧密码错误', 401);
  }

  // 更新密码
  user.password = newPassword;
  await user.save();

  sendSuccess(res, null, '密码修改成功');
});

/**
 * 创建教师账号（初始化用）
 * POST /api/auth/create-teacher
 */
exports.createTeacher = asyncHandler(async (req, res) => {
  const { account, password, name } = req.body;

  if (!account || !password) {
    return sendError(res, '账号和密码不能为空', 400);
  }

  // 检查账号是否已存在
  const existingUser = await User.findOne({ account });
  if (existingUser) {
    return sendError(res, '该账号已存在', 400);
  }

  const user = await User.create({
    account,
    password,
    role: 'teacher',
    phone: account, // 教师账号使用手机号作为账号
    name: name || '教师',
    isActive: true
  });

  sendSuccess(res, user.toJSON(), '教师账号创建成功');
});

