// backend/routes/lectureCategoryRoutes.js
import express from 'express';
import { getLectureCategories, getLectureCategoryById, createLectureCategory, updateLectureCategory, deleteLectureCategory } from '../controllers/lectureCategoryController.js';
// const { protect, authorize } = require('../middleware/authMiddleware'); // Nếu bạn có middleware xác thực/phân quyền

const router = express.Router();

router.route('/')
  .get(getLectureCategories)
  .post(createLectureCategory); // , protect, authorize('admin')

router.route('/:id')
  .get(getLectureCategoryById)
  .put(updateLectureCategory)    // Đã sửa lỗi chính tả: updateCategory -> updateLectureCategory
  .delete(deleteLectureCategory); // Đã sửa lỗi chính tả: deleteCategory -> deleteLectureCategory

export default router;