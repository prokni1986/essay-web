// backend/routes/adminInteractiveExamRoutes.js
import express from 'express';
import {
  getAllInteractiveExamsAdmin, createInteractiveExam, updateInteractiveExam, deleteInteractiveExam,
  getInteractiveExamQuestionsAdmin, addQuestionToInteractiveExam, updateQuestion, deleteQuestion,
  uploadInteractiveExamFromFile
} from '../controllers/adminInteractiveExamController.js';
import authenticateToken from '../config/authMiddleware.js'; // <-- default import cho authenticateToken
import { isAdmin } from '../config/adminMiddleware.js'; // <-- named import cho isAdmin

const router = express.Router();

// Áp dụng middleware
router.route('/')
  .get(authenticateToken, isAdmin, getAllInteractiveExamsAdmin) // <-- Sử dụng authenticateToken và isAdmin
  .post(authenticateToken, isAdmin, createInteractiveExam);

router.route('/:id')
  .put(authenticateToken, isAdmin, updateInteractiveExam) // <-- Sử dụng authenticateToken và isAdmin
  .delete(authenticateToken, isAdmin, deleteInteractiveExam); // <-- Sử dụng authenticateToken và isAdmin

router.route('/:interactiveExamId/questions')
  .get(authenticateToken, isAdmin, getInteractiveExamQuestionsAdmin) // <-- Sử dụng authenticateToken và isAdmin
  .post(authenticateToken, isAdmin, addQuestionToInteractiveExam); // <-- Sử dụng authenticateToken và isAdmin

router.route('/questions/:questionId')
  .put(authenticateToken, isAdmin, updateQuestion) // <-- Sử dụng authenticateToken và isAdmin
  .delete(authenticateToken, isAdmin, deleteQuestion); // <-- Sử dụng authenticateToken và isAdmin

router.post('/upload', authenticateToken, isAdmin, uploadInteractiveExamFromFile); // <-- Sử dụng authenticateToken và isAdmin

export default router;