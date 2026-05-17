const Settings = require('../models/Settings');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * 获取系统设置
 * GET /api/settings
 */
exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  return ApiResponse.success(res, settings);
});

/**
 * 更新系统设置
 * PUT /api/settings
 */
exports.updateSettings = asyncHandler(async (req, res) => {
  const updates = req.body;
  
  const settings = await Settings.updateSettings(updates);
  
  return ApiResponse.success(res, settings, '更新成功');
});

