import express from 'express';
const router = express.Router();

// Import các models và middleware cần thiết
import Exam from '../models/Exam.js';
import UserSubscription from '../models/UserSubscription.js';
import authenticateToken from '../config/authMiddleware.js';
import authenticateTokenOptional from '../config/authMiddlewareOptional.js';

// ===================================================================================
// 1. LẤY DANH SÁCH TẤT CẢ ĐỀ THI <<<< ĐÃ SỬA
// ===================================================================================
router.get('/', async (req, res) => {
    try {
        // SỬA ĐỔI: Bỏ phân trang, trả về toàn bộ danh sách tóm tắt.
        // Component AdminUploadExam sẽ tải toàn bộ danh sách một lần.
        const exams = await Exam.find({})
            .select('-htmlContent') // Vẫn tối ưu bằng cách không gửi nội dung HTML
            .sort({ year: -1, createdAt: -1 });
            
        res.json(exams); // Trả về trực tiếp mảng dữ liệu

    } catch (err) {
        console.error("Error fetching exams:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách đề thi." });
    }
});


// ===================================================================================
// 2. LẤY CHI TIẾT MỘT ĐỀ THI - Giữ nguyên logic gốc
// ===================================================================================
router.get('/:id', authenticateTokenOptional, async (req, res) => {
    try {
        // Lấy toàn bộ nội dung khi được hỏi, bao gồm cả htmlContent
        const exam = await Exam.findById(req.params.id).populate('topic');
        if (!exam) {
            return res.status(404).json({ message: "Không tìm thấy đề thi." });
        }

        // Logic kiểm tra quyền truy cập vẫn giữ nguyên
        let canViewFullContent = false;
        let subscriptionStatus = 'none';

        if (req.user && req.user.role === 'admin') {
             // Admin luôn có quyền xem toàn bộ nội dung
             canViewFullContent = true;
             subscriptionStatus = 'admin_access';
        } else if (req.user) {
            const userId = req.user.id;
            const fullAccessSub = await UserSubscription.findOne({ user: userId, hasFullAccess: true, isActive: true });
            if (fullAccessSub) {
                canViewFullContent = true;
                subscriptionStatus = 'full_access';
            } else {
                const specificExamSub = await UserSubscription.findOne({ user: userId, subscribedItem: exam._id, onModel: 'Exam', isActive: true });
                if (specificExamSub) {
                    canViewFullContent = true;
                    subscriptionStatus = 'subscribed_specific';
                }
            }
        }

        if (canViewFullContent) {
            res.json(exam); // Trả về toàn bộ object
        } else {
            // Đối với người dùng chưa đăng ký, trả về thông tin giới hạn
            res.json({
                _id: exam._id,
                title: exam.title,
                description: exam.description,
                subject: exam.subject,
                year: exam.year,
                province: exam.province,
                topic: exam.topic,
                canViewFullContent: false,
                htmlContent: null, // Không gửi nội dung đầy đủ
                message: "Bạn cần đăng ký để xem toàn bộ nội dung này."
            });
        }
    } catch (err) {
        console.error("Error fetching single exam:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết đề thi." });
    }
});


// ===================================================================================
// 3. TẠO MỘT ĐỀ THI MỚI - Logic kiểm tra quyền Admin giờ sẽ hoạt động
// ===================================================================================
router.post('/create-html-post', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
         return res.status(403).json({ message: "Truy cập bị từ chối. Yêu cầu quyền Admin." });
    }

    try {
        const { title, description, htmlContent, subject, year, province } = req.body;
        if (!title || !htmlContent || !subject || !year) {
            return res.status(400).json({ message: "Thiếu các thông tin bắt buộc." });
        }
        const newExam = new Exam({ title, description, htmlContent, subject, year, province });
        await newExam.save();
        res.status(201).json({ message: "Lưu đề thi thành công!", data: newExam });
    } catch (err) {
        console.error("Error creating new exam from HTML:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi tạo đề thi." });
    }
});


// ===================================================================================
// 4. CẬP NHẬT MỘT ĐỀ THI
// ===================================================================================
router.put('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
         return res.status(403).json({ message: "Truy cập bị từ chối. Yêu cầu quyền Admin." });
    }

    try {
        const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedExam) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi để cập nhật.' });
        }
        res.json({ message: "Cập nhật đề thi thành công!", data: updatedExam });
    } catch (err) {
        console.error("Error updating exam:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật đề thi." });
    }
});


// ===================================================================================
// 5. XÓA MỘT ĐỀ THI
// ===================================================================================
router.delete('/:id', authenticateToken, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Truy cập bị từ chối. Yêu cầu quyền Admin." });
    }

    try {
        const examId = req.params.id;
        const examToDelete = await Exam.findById(examId);
        if (!examToDelete) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi để xóa.' });
        }
        await UserSubscription.deleteMany({ subscribedItem: examId, onModel: 'Exam' });
        await Exam.findByIdAndDelete(examId);
        res.json({ message: `Đã xóa thành công đề thi: "${examToDelete.title}"` });
    } catch (err) {
        console.error("Error deleting exam:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi xóa đề thi." });
    }
});

export default router;
