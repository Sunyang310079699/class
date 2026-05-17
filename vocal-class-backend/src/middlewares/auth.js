const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * JWT 认证中间件
 * 验证请求中的 Token，并将用户信息添加到 req.user
 */
exports.authenticate = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, '未提供认证令牌', 401);
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证 token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    // 查找用户
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return sendError(res, '用户不存在', 401);
    }

    if (!user.isActive) {
      return sendError(res, '账号已被禁用', 403);
    }

    // 将用户信息添加到请求对象
    req.user = {
      userId: user._id,
      role: user.role,
      account: user.account,
      studentId: user.studentId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, '无效的认证令牌', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, '认证令牌已过期', 401);
    }
    return sendError(res, '认证失败', 401);
  }
};

/**
 * 权限验证中间件
 * 检查用户是否有指定角色权限
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, '请先登录', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, '权限不足', 403);
    }

    next();
  };
};

/**
 * 学生权限验证中间件
 * 确保学生只能访问自己的数据
 */
exports.studentOnly = (req, res, next) => {
  if (!req.user) {
    return sendError(res, '请先登录', 401);
  }

  if (req.user.role !== 'student') {
    return sendError(res, '此功能仅限学生账号', 403);
  }

  // 确保学生只能访问自己的数据
  if (req.params.studentId && req.params.studentId !== req.user.studentId.toString()) {
    return sendError(res, '无权访问其他学生的数据', 403);
  }

  next();
};

