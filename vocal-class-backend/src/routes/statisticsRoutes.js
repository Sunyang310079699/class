const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

// 统计数据路由
router.get('/dashboard', statisticsController.getDashboardStats);
router.get('/warnings', statisticsController.getWarnings);

module.exports = router;

