const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { studentValidation } = require('../middlewares/validator');
const { authenticate, authorize, studentOnly } = require('../middlewares/auth');

// 学生管理路由 - 需要教师权限
router.get('/', authenticate, authorize('teacher'), studentController.getStudents);
router.get('/:id', authenticate, authorize('teacher'), studentValidation.getId, studentController.getStudentById);
router.post('/', authenticate, authorize('teacher'), studentValidation.create, studentController.createStudent);
router.put('/:id', authenticate, authorize('teacher'), studentValidation.update, studentController.updateStudent);
router.delete('/:id', authenticate, authorize('teacher'), studentValidation.getId, studentController.deleteStudent);

// 学生端：获取自己的信息
router.get('/me/info', authenticate, studentOnly, studentController.getMyInfo);

module.exports = router;

