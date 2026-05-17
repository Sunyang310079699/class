const express = require('express');
const router = express.Router();

// 导入所有路由模块
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const coursePackageRoutes = require('./coursePackageRoutes');
const courseRoutes = require('./courseRoutes');
const incomeRoutes = require('./incomeRoutes');
const statisticsRoutes = require('./statisticsRoutes');
const settingsRoutes = require('./settingsRoutes');

// 注册路由
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/students', coursePackageRoutes); // 课时包路由嵌套在学生下
router.use('/courses', courseRoutes);
router.use('/income', incomeRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/settings', settingsRoutes);

// 健康检查
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Vocal Class API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

