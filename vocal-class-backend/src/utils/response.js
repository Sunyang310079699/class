/**
 * 统一响应格式工具
 */

class ApiResponse {
  /**
   * 成功响应
   * @param {Object} res - Express response 对象
   * @param {*} data - 响应数据
   * @param {String} message - 响应消息
   * @param {Number} statusCode - HTTP 状态码
   */
  static success(res, data = null, message = 'success', statusCode = 200) {
    return res.status(statusCode).json({
      code: statusCode,
      message,
      data
    });
  }

  /**
   * 创建成功响应
   * @param {Object} res - Express response 对象
   * @param {*} data - 响应数据
   * @param {String} message - 响应消息
   */
  static created(res, data = null, message = '创建成功') {
    return this.success(res, data, message, 201);
  }

  /**
   * 错误响应
   * @param {Object} res - Express response 对象
   * @param {String} message - 错误消息
   * @param {Number} statusCode - HTTP 状态码
   * @param {Number} code - 业务错误码
   */
  static error(res, message = '请求失败', statusCode = 400, code = null) {
    return res.status(statusCode).json({
      code: code || statusCode,
      message,
      data: null
    });
  }

  /**
   * 参数验证失败
   * @param {Object} res - Express response 对象
   * @param {String} message - 错误消息
   */
  static validationError(res, message = '参数验证失败') {
    return this.error(res, message, 400, 1001);
  }

  /**
   * 资源不存在
   * @param {Object} res - Express response 对象
   * @param {String} message - 错误消息
   */
  static notFound(res, message = '资源不存在') {
    return this.error(res, message, 404, 1002);
  }

  /**
   * 服务器错误
   * @param {Object} res - Express response 对象
   * @param {String} message - 错误消息
   */
  static serverError(res, message = '服务器内部错误') {
    return this.error(res, message, 500, 5000);
  }

  /**
   * 未授权
   * @param {Object} res - Express response 对象
   * @param {String} message - 错误消息
   */
  static unauthorized(res, message = '未授权') {
    return this.error(res, message, 401, 2001);
  }
}

// 导出便捷函数
const sendSuccess = (res, data = null, message = 'success', statusCode = 200) => {
  return ApiResponse.success(res, data, message, statusCode);
};

const sendError = (res, message = '请求失败', statusCode = 400, code = null) => {
  return ApiResponse.error(res, message, statusCode, code);
};

module.exports = ApiResponse;
module.exports.sendSuccess = sendSuccess;
module.exports.sendError = sendError;

