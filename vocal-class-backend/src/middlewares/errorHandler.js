const ApiResponse = require('../utils/response');

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    return ApiResponse.validationError(res, message);
  }

  // Mongoose Cast 错误（无效的 ObjectId）
  if (err.name === 'CastError') {
    return ApiResponse.validationError(res, `无效的 ${err.path}: ${err.value}`);
  }

  // MongoDB 重复键错误
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} 已存在，请使用其他值`;
    return ApiResponse.error(res, message, 400, 1005);
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Token 无效', 401, 2003);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token 已过期', 401, 2002);
  }

  // 自定义业务错误
  if (err.statusCode) {
    return ApiResponse.error(res, err.message, err.statusCode, err.code);
  }

  // 默认服务器错误
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : '服务器内部错误';
  
  return ApiResponse.serverError(res, message);
};

module.exports = errorHandler;

