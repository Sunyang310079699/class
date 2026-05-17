const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/auth');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validator');

// 登录
router.post(
  '/login',
  [
    body('account').notEmpty().withMessage('账号不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
  ],
  validate,
  authController.login
);

// 登出
router.post('/logout', authenticate, authController.logout);

// 获取当前用户信息
router.get('/me', authenticate, authController.getMe);

// 修改密码
router.put(
  '/password',
  authenticate,
  [
    body('oldPassword').notEmpty().withMessage('旧密码不能为空'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码长度至少6位')
  ],
  validate,
  authController.changePassword
);

// 创建教师账号（仅用于初始化，生产环境应移除或添加权限控制）
router.post(
  '/create-teacher',
  [
    body('account').notEmpty().withMessage('账号不能为空'),
    body('password').isLength({ min: 6 }).withMessage('密码长度至少6位')
  ],
  validate,
  authController.createTeacher
);

module.exports = router;

