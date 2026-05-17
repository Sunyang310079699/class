const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const { incomeValidation } = require('../middlewares/validator');
const { authenticate, authorize } = require('../middlewares/auth');

// 收益统计路由
// 收益概览和趋势 - 仅教师可访问
router.get('/overview', authenticate, authorize('teacher'), incomeController.getIncomeOverview);
router.get('/trend', authenticate, authorize('teacher'), incomeController.getIncomeTrend);
// 收入记录 - 教师可以查看所有，学生只能查看自己的
router.get('/records', authenticate, incomeController.getIncomeRecords);
// 添加收入 - 仅教师可操作
router.post('/records', authenticate, authorize('teacher'), incomeValidation.create, incomeController.addIncomeRecord);

module.exports = router;

