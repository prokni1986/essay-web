// backend/routes/lectureRoutes.js
import express from 'express';
import { getLectures, getLectureById, createLecture, updateLecture, deleteLecture } from '../controllers/lectureController.js';
// const { protect, authorize } = require('../middleware/authMiddleware');

import multer from 'multer'; // <<<< Import Multer

const router = express.Router();

// Cấu hình Multer để lưu trữ file trong bộ nhớ (memory storage)
// hoặc một thư mục tạm thời trên đĩa (disk storage)
// Memory storage là tiện lợi cho Cloudinary vì bạn không cần quản lý file cục bộ
const upload = multer({ storage: multer.memoryStorage() }); // <<<< Cấu hình Multer

// Áp dụng middleware upload.single('image') cho các route POST/PUT
router.route('/')
  .get(getLectures)
  .post(upload.single('image'), createLecture); // <<<< Thêm upload.single('image')

router.route('/:id')
  .get(getLectureById)
  .put(upload.single('image'), updateLecture)    // <<<< Thêm upload.single('image')
  .delete(deleteLecture);

export default router;