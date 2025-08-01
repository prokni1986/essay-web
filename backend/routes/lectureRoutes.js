// backend/routes/lectureRoutes.js
import express from 'express';
import { getLectures, getLectureById, createLecture, updateLecture, deleteLecture, getLectureBySlug } from '../controllers/lectureController.js';
// import authenticateToken from '../config/authMiddleware.js'; // Nếu bạn có auth middleware
// import { isAdmin } from '../config/adminMiddleware.js'; // Nếu bạn có admin middleware

import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(getLectures)
  // Áp dụng middleware bảo vệ và kiểm tra admin nếu cần
  // .post(authenticateToken, isAdmin, upload.single('image'), createLecture);
  .post(upload.single('image'), createLecture); // Tạm thời bỏ authenticateToken, isAdmin để dễ test

// Route mới để lấy bài giảng bằng slug
router.route('/slug/:slug')
  .get(getLectureBySlug);

router.route('/:id')
  .get(getLectureById)
  // Áp dụng middleware bảo vệ và kiểm tra admin nếu cần
  // .put(authenticateToken, isAdmin, upload.single('image'), updateLecture)
  // .delete(authenticateToken, isAdmin, deleteLecture);
  .put(upload.single('image'), updateLecture)
  .delete(deleteLecture);

export default router;