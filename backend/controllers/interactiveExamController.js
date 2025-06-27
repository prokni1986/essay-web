// backend/controllers/interactiveExamController.js
import InteractiveExam from '../models/InteractiveExam.js'; // SỬ DỤNG MODEL MỚI
import Question from '../models/Question.js';
import UserSubmission from '../models/UserSubmission.js';
import mongoose from 'mongoose';

// @desc    Get all published interactive exams
// @route   GET /api/interactive-exams
// @access  Public
const getPublishedInteractiveExams = async (req, res) => {
  try {
    const exams = await InteractiveExam.find({ status: 'published' }).sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get interactive exam details (questions without correct answers)
// @route   GET /api/interactive-exams/:id
// @access  Public
const getInteractiveExamDetails = async (req, res) => {
  try {
    const exam = await InteractiveExam.findById(req.params.id);
    if (!exam || exam.status !== 'published') {
      return res.status(404).json({ message: 'Đề thi trắc nghiệm không tồn tại hoặc chưa được công bố.' });
    }

    const questions = await Question.find({ interactiveExamId: req.params.id }) // THAY ĐỔI: interactiveExamId
      .select('-correctAnswer -explanation') // Loại bỏ đáp án đúng và giải thích
      .sort({ questionNumber: 1 });

    res.json({ ...exam.toObject(), questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit an interactive exam
// @route   POST /api/interactive-exams/submit
// @access  Private (User)
const submitInteractiveExam = async (req, res) => {
  const { interactiveExamId, userAnswers } = req.body;
  const userId = req.user._id;

  try {
    const exam = await InteractiveExam.findById(interactiveExamId);
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy đề thi trắc nghiệm.' });
    }

    // Đảm bảo bạn lấy được 'questionNumber' khi query Questions
    const questions = await Question.find({ interactiveExamId: interactiveExamId })
      .select('questionText options correctAnswer explanation questionNumber'); // <-- ĐẢM BẢO questionNumber CÓ TRONG SELECT
    if (questions.length === 0) {
      return res.status(400).json({ message: 'Đề thi trắc nghiệm không có câu hỏi nào.' });
    }

    let score = 0;
    const submissionDetails = [];

    for (const q of questions) {
      const userAnswer = userAnswers[q._id.toString()];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) {
        score++;
      }

      submissionDetails.push({
        questionId: q._id,
        userAnswer: userAnswer || null,
        correctAnswer: q.correctAnswer,
        isCorrect: isCorrect,
        questionText: q.questionText,
        options: q.options,
        explanation: q.explanation,
        questionNumber: q.questionNumber, // <-- THÊM DÒNG NÀY VÀO ĐÂY
      });
    }

    const userSubmission = await UserSubmission.create({
      userId,
      interactiveExamId,
      score,
      totalQuestions: questions.length,
      userAnswers,
      details: submissionDetails,
    });

    res.status(201).json({
      submissionId: userSubmission._id,
      score: userSubmission.score,
      totalQuestions: userSubmission.totalQuestions,
      message: 'Bài làm của bạn đã được nộp thành công!'
    });
  } catch (error) {
    console.error("Lỗi khi nộp bài thi:", error);
    if (error.code === 11000) {
        return res.status(400).json({ message: "Lỗi lưu trữ: Có thể bạn đã nộp bài quá nhanh hoặc có vấn đề về index." });
    }
    // Debug log để xem chi tiết lỗi validation
    if (error.name === 'ValidationError') {
        console.error("Validation Error Details:", error.errors);
    }
    res.status(500).json({ message: error.message || 'Lỗi server khi nộp bài.' });
  }
};

// @desc    Get submission results by ID
// @route   GET /api/interactive-exams/submissions/:id
// @access  Private (User - only own submission)
const getSubmissionResults = async (req, res) => {
  try {
    const submission = await UserSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả bài làm.' });
    }
    if (submission.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập kết quả này.' });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getPublishedInteractiveExams, getInteractiveExamDetails, submitInteractiveExam, getSubmissionResults };