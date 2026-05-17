const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { settingsValidation } = require('../middlewares/validator');

// 系统设置路由
router.get('/', settingsController.getSettings);
router.put('/', settingsValidation.update, settingsController.updateSettings);

module.exports = router;

