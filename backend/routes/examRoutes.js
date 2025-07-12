// file: routes/examRoutes.js (Đã loại bỏ chức năng tạo Thumbnail)

import express from 'express';
const router = express.Router();

// Import các models và middleware cần thiết
import Exam from '../models/Exam.js';
import UserSubscription from '../models/UserSubscription.js';
import authenticateToken from '../config/authMiddleware.js';
import authenticateTokenOptional from '../config/authMiddlewareOptional.js';
import { isAdmin } from '../config/adminMiddleware.js';

// Đã xóa bỏ hàm generateAndUploadThumbnail và các import liên quan (cloudinary, puppeteer)

// ===================================================================
// === ROUTE CÔNG KHAI (PUBLIC ROUTES) ===
// ===================================================================

// Lấy danh sách tất cả đề thi (không có nội dung)
router.get('/', async (req, res) => {
    try {
        const exams = await Exam.find({})
                                .select('-htmlContent -solutionHtml -__v') 
                                .sort({ year: -1, createdAt: -1 });
        res.json(exams);
    } catch (err) {
        console.error("Error fetching exams list:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách đề thi." });
    }
});

// Lấy danh sách các lớp học độc nhất
router.get('/grades', async (req, res) => {
  try {
    const grades = await Exam.distinct('grade');
    const cleanGrades = grades.filter(grade => grade !== null && grade !== undefined).sort((a, b) => a - b);
    res.json(cleanGrades);
  } catch (err) {
    console.error("Error fetching distinct grades:", err);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách các lớp." });
  }
});


// Lấy chi tiết một đề thi theo id
router.get('/:id', authenticateTokenOptional, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate('topic');
        if (!exam) return res.status(404).json({ message: "Không tìm thấy đề thi." });

        let canViewFullContent = false;
        if (req.user) {
            const fullAccessSub = await UserSubscription.findOne({ user: req.user.id, hasFullAccess: true, isActive: true });
            if (fullAccessSub) canViewFullContent = true;
            else {
                const specificExamSub = await UserSubscription.findOne({ user: req.user.id, subscribedItem: exam._id, onModel: 'Exam', isActive: true });
                if (specificExamSub) canViewFullContent = true;
            }
        }
        
        if (canViewFullContent) {
            res.json({ ...exam.toObject(), canViewFullContent: true });
        } else {
            res.json({
                _id: exam._id,
                title: exam.title,
                description: exam.description,
                subject: exam.subject,
                year: exam.year,
                province: exam.province,
                topic: exam.topic,
                canViewFullContent: false,
                previewContent: exam.description || "Vui lòng đăng ký để xem nội dung đầy đủ.",
                htmlContent: null,
                solutionHtml: null,
                type: exam.type,
                duration: exam.duration,
                questions: exam.questions,
                difficulty: exam.difficulty,
                grade: exam.grade,
            });
        }
    } catch (err) {
        console.error("Error fetching exam details:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết đề thi." });
    }
});


// ===================================================================
// === ROUTE CHO ADMIN (CẦN XÁC THỰC VÀ QUYỀN ADMIN) ===
// ===================================================================

// TẠO MỚI NHIỀU ĐỀ THI TỪ DỮ LIỆU CSV
router.post(
    '/create-bulk-csv',
    authenticateToken,
    isAdmin,
    async (req, res) => {
        const examsData = req.body;
        if (!Array.isArray(examsData) || examsData.length === 0) {
            return res.status(400).json({ message: 'Dữ liệu gửi lên không hợp lệ hoặc rỗng.' });
        }

        const createdExams = [];
        const failedExams = [];

        for (const examData of examsData) {
            try {
                const { title, description, htmlContent, solutionHtml, subject, year, province, type, duration, questions, difficulty, grade } = examData;
                if (!title || !htmlContent || !subject || !year) {
                    failedExams.push({ title: title || 'Không có tiêu đề', reason: 'Thiếu trường thông tin bắt buộc.' });
                    continue;
                }

                const newExam = new Exam({
                    title, description, htmlContent, solutionHtml, subject,
                    year: Number(year), province, type,
                    duration: Number(duration) || undefined,
                    questions: Number(questions) || undefined,
                    difficulty,
                    grade: Number(grade) || undefined,
                });

                const savedExam = await newExam.save();
                createdExams.push(savedExam);
            } catch (err) {
                console.error("Lỗi khi tạo đề thi từ CSV:", err);
                failedExams.push({ title: examData.title || 'Không có tiêu đề', reason: 'Lỗi server khi lưu.' });
            }
        }
        res.status(201).json({
            message: `Hoàn tất! Tạo thành công ${createdExams.length} đề thi. Thất bại ${failedExams.length} đề thi.`,
            created: createdExams.map(e => e.title),
            failed: failedExams
        });
    }
);

// TẠO MỚI MỘT ĐỀ THI
router.post(
    '/create-html-post',
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            const { title, description, htmlContent, solutionHtml, subject, year, province, type, duration, questions, difficulty, grade } = req.body;
            if (!title || !htmlContent || !subject || !year) {
                return res.status(400).json({ message: 'Thiếu các trường thông tin bắt buộc: Tiêu đề, Nội dung HTML, Môn học, Năm.' });
            }

            const newExam = new Exam({
                title, description, htmlContent, solutionHtml, subject,
                year: Number(year), province, type,
                duration: Number(duration) || undefined,
                questions: Number(questions) || undefined,
                difficulty,
                grade: Number(grade) || undefined,
            });

            await newExam.save();
            res.status(201).json(newExam);
        } catch(err) {
            console.error("Error creating exam:", err);
            res.status(500).json({ message: "Lỗi máy chủ khi tạo đề thi mới." });
        }
    }
);

// CẬP NHẬT MỘT ĐỀ THI
router.put(
    '/:id',
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            const { title, description, htmlContent, solutionHtml, subject, year, province, type, duration, questions, difficulty, grade } = req.body;
            const exam = await Exam.findById(req.params.id);
            if (!exam) {
                return res.status(404).json({ message: 'Không tìm thấy đề thi để cập nhật.' });
            }

            exam.title = title;
            exam.description = description;
            exam.subject = subject;
            exam.year = Number(year);
            exam.province = province;
            exam.type = type;
            exam.duration = Number(duration) || undefined;
            exam.questions = Number(questions) || undefined;
            exam.difficulty = difficulty;
            exam.grade = Number(grade) || undefined;
            exam.solutionHtml = solutionHtml;
            exam.htmlContent = htmlContent;

            await exam.save();
            res.status(200).json(exam);
        } catch(err) {
            console.error("Error updating exam:", err);
            res.status(500).json({ message: "Lỗi máy chủ khi cập nhật đề thi." });
        }
    }
);

// XÓA MỘT ĐỀ THI
router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const examToDelete = await Exam.findByIdAndDelete(req.params.id);
      if (!examToDelete) {
        return res.status(404).json({ message: 'Không tìm thấy đề thi để xóa.' });
      }
      res.status(200).json({ message: 'Đã xóa đề thi thành công.' });
    } catch (error) {
      console.error("Server error deleting exam:", error);
      res.status(500).json({ message: 'Lỗi máy chủ khi xóa đề thi.' });
    }
  }
);

export default router;