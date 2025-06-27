// backend/routes/interactiveExamRoutes.js
import express from 'express';
import { getPublishedInteractiveExams, getInteractiveExamDetails, submitInteractiveExam, getSubmissionResults } from '../controllers/interactiveExamController.js';
import authenticateToken from '../config/authMiddleware.js';
const router = express.Router();

router.get('/', getPublishedInteractiveExams); // Lấy danh sách đề thi trắc nghiệm công khai
router.get('/:id', getInteractiveExamDetails); // Lấy chi tiết đề thi trắc nghiệm

router.post('/submit', authenticateToken, submitInteractiveExam); // <-- Dùng tên đã import
router.get('/submissions/:id', authenticateToken, getSubmissionResults); // <-- Dùng tên đã import

export default router;