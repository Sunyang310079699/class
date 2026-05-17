const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { courseValidation } = require('../middlewares/validator');
const { authenticate, authorize } = require('../middlewares/auth');

// 课程管理路由
// 获取课程列表（教师和学生都可以查看，但学生只能看自己的）
router.get('/', authenticate, courseController.getCourses);
router.get('/today', authenticate, courseController.getTodayCourses);
router.get('/:id', authenticate, courseValidation.getId, courseController.getCourseDetail);
router.post('/', authenticate, authorize('teacher'), courseValidation.create, courseController.createCourse);
router.post('/generate-next-week', authenticate, authorize('teacher'), courseController.generateNextWeekCourses);
router.put('/:id', authenticate, authorize('teacher'), courseValidation.update, courseController.updateCourse);
router.post('/:id/cancel', authenticate, authorize('teacher'), courseValidation.getId, courseController.cancelCourse);
router.post('/:id/attendance', authenticate, authorize('teacher'), courseValidation.attendance, courseController.attendanceCourse);

module.exports = router;

