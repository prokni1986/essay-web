// backend/controllers/adminInteractiveExamController.js
import InteractiveExam from '../models/InteractiveExam.js'; // SỬ DỤNG MODEL MỚI
import Question from '../models/Question.js';
import UserSubmission from '../models/UserSubmission.js';
import mongoose from 'mongoose';

// @desc    Get all interactive exams (for admin, including drafts)
// @route   GET /api/admin/interactive-exams
// @access  Private/Admin
const getAllInteractiveExamsAdmin = async (req, res) => {
  try {
    const exams = await InteractiveExam.find({}).sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new interactive exam
// @route   POST /api/admin/interactive-exams
// @access  Private/Admin
const createInteractiveExam = async (req, res) => {
  const { title, description, subject, year, province, thumbnailUrl, type, duration, difficulty, grade, status, topic } = req.body;
  try {
    const exam = await InteractiveExam.create({
      title, description, subject, year, province, thumbnailUrl, type, duration, difficulty, grade, status, topic
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an interactive exam
// @route   PUT /api/admin/interactive-exams/:id
// @access  Private/Admin
const updateInteractiveExam = async (req, res) => {
  const { title, description, subject, year, province, thumbnailUrl, type, duration, difficulty, grade, status, topic } = req.body;
  try {
    const exam = await InteractiveExam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy đề thi trắc nghiệm.' });
    }

    // Cập nhật các trường
    exam.title = title !== undefined ? title : exam.title;
    exam.description = description !== undefined ? description : exam.description;
    exam.subject = subject !== undefined ? subject : exam.subject;
    exam.year = year !== undefined ? year : exam.year;
    exam.province = province !== undefined ? province : exam.province;
    exam.thumbnailUrl = thumbnailUrl !== undefined ? thumbnailUrl : exam.thumbnailUrl;
    exam.type = type !== undefined ? type : exam.type;
    exam.duration = duration !== undefined ? duration : exam.duration;
    exam.difficulty = difficulty !== undefined ? difficulty : exam.difficulty;
    exam.grade = grade !== undefined ? grade : exam.grade;
    exam.status = status !== undefined ? status : exam.status;
    exam.topic = topic !== undefined ? topic : exam.topic; // Có thể set null

    const updatedExam = await exam.save();
    res.json(updatedExam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an interactive exam and its questions and submissions
// @route   DELETE /api/admin/interactive-exams/:id
// @access  Private/Admin
const deleteInteractiveExam = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const exam = await InteractiveExam.findById(req.params.id).session(session);
    if (!exam) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Không tìm thấy đề thi trắc nghiệm.' });
    }

    await exam.deleteOne({ session }); // Xóa đề thi chính
    await Question.deleteMany({ interactiveExamId: req.params.id }).session(session); // THAY ĐỔI: interactiveExamId
    await UserSubmission.deleteMany({ interactiveExamId: req.params.id }).session(session); // THAY ĐỔI: interactiveExamId

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Đề thi trắc nghiệm và các dữ liệu liên quan đã được xóa thành công.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get questions for a specific interactive exam
// @route   GET /api/admin/interactive-exams/:interactiveExamId/questions
// @access  Private/Admin
const getInteractiveExamQuestionsAdmin = async (req, res) => {
  try {
    const questions = await Question.find({ interactiveExamId: req.params.interactiveExamId }).sort({ questionNumber: 1 }); // THAY ĐỔI
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a question to an interactive exam
// @route   POST /api/admin/interactive-exams/:interactiveExamId/questions
// @access  Private/Admin
const addQuestionToInteractiveExam = async (req, res) => {
  const { questionText, questionNumber, questionImageUrl, options, correctAnswer, explanation } = req.body;
  try {
    const exam = await InteractiveExam.findById(req.params.interactiveExamId);
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy đề thi trắc nghiệm.' });
    }
    const question = await Question.create({
      interactiveExamId: req.params.interactiveExamId, // THAY ĐỔI
      questionText, questionNumber, questionImageUrl, options, correctAnswer, explanation
    });

    // Tùy chọn: cập nhật questionCount trong InteractiveExam
    // await InteractiveExam.findByIdAndUpdate(req.params.interactiveExamId, { $inc: { questionCount: 1 } });

    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/admin/questions/:questionId (route này không thay đổi vì questionId là độc lập)
// @access  Private/Admin
const updateQuestion = async (req, res) => {
  const { questionText, questionNumber, questionImageUrl, options, correctAnswer, explanation } = req.body;
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
    }

    question.questionText = questionText !== undefined ? questionText : question.questionText;
    question.questionNumber = questionNumber !== undefined ? questionNumber : question.questionNumber;
    question.questionImageUrl = questionImageUrl !== undefined ? questionImageUrl : question.questionImageUrl;
    question.options = options !== undefined ? options : question.options;
    question.correctAnswer = correctAnswer !== undefined ? correctAnswer : question.correctAnswer;
    question.explanation = explanation !== undefined ? explanation : question.explanation;

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/admin/questions/:questionId (route này không thay đổi vì questionId là độc lập)
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
    }
    await question.deleteOne();

    // Tùy chọn: cập nhật questionCount trong InteractiveExam
    // await InteractiveExam.findByIdAndUpdate(question.interactiveExamId, { $inc: { questionCount: -1 } });

    res.json({ message: 'Câu hỏi đã được xóa.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload interactive exam from JSON/CSV/Excel
// @route   POST /api/admin/interactive-exams/upload
// @access  Private/Admin
const uploadInteractiveExamFromFile = async (req, res) => {
    const { examInfo, questions } = req.body;

    if (!examInfo || !examInfo.title || !examInfo.subject || !examInfo.duration || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: 'Dữ liệu upload không hợp lệ. Cần có examInfo (title, subject, duration) và mảng questions.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Tạo đề thi trắc nghiệm mới
        const newInteractiveExam = new InteractiveExam({
            title: examInfo.title,
            description: examInfo.description || '',
            subject: examInfo.subject,
            year: examInfo.year || null,
            province: examInfo.province || '',
            thumbnailUrl: examInfo.thumbnailUrl || '',
            type: examInfo.type || 'Thi thử',
            duration: examInfo.duration,
            difficulty: examInfo.difficulty || 'Trung bình',
            grade: examInfo.grade || null,
            status: examInfo.status || 'draft',
            topic: examInfo.topic || null
        });
        await newInteractiveExam.save({ session });

        // 2. Thêm các câu hỏi
        const questionDocs = questions.map(q => ({
            interactiveExamId: newInteractiveExam._id, // THAY ĐỔI
            questionText: q.questionText,
            questionNumber: q.questionNumber,
            questionImageUrl: q.questionImageUrl || '',
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || ''
        }));

        await Question.insertMany(questionDocs, { session });

        await session.commitTransaction();
        res.status(201).json({ message: 'Đề thi trắc nghiệm và các câu hỏi đã được tải lên thành công!', interactiveExamId: newInteractiveExam._id });

    } catch (error) {
        await session.abortTransaction();
        console.error("Error uploading interactive exam:", error);
        res.status(500).json({ message: `Lỗi khi tải đề thi trắc nghiệm: ${error.message}` });
    } finally {
        session.endSession();
    }
};

export {
  getAllInteractiveExamsAdmin,
  createInteractiveExam,
  updateInteractiveExam,
  deleteInteractiveExam,
  getInteractiveExamQuestionsAdmin,
  addQuestionToInteractiveExam,
  updateQuestion,
  deleteQuestion,
  uploadInteractiveExamFromFile
};