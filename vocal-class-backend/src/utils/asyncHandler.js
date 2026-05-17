/**
 * 异步错误处理包装器
 * 用于包装 async/await 路由处理器，自动捕获错误
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;

