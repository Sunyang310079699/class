const express = require('express');
const router = express.Router();
const coursePackageController = require('../controllers/coursePackageController');
const { coursePackageValidation } = require('../middlewares/validator');

// 课时包管理路由（嵌套在学生路由下）
router.post(
  '/:studentId/course-packages',
  coursePackageValidation.create,
  coursePackageController.purchaseCoursePackage
);

router.get(
  '/:studentId/course-packages',
  coursePackageController.getCoursePackages
);

module.exports = router;

