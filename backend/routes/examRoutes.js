import express from 'express';
const router = express.Router();

// Import các models và middleware cần thiết
import Exam from '../models/Exam.js';
import UserSubscription from '../models/UserSubscription.js';
import authenticateToken from '../config/authMiddleware.js'; // Bảo vệ các route cần đăng nhập
import authenticateTokenOptional from '../config/authMiddlewareOptional.js'; // Cho phép khách xem preview

// ===================================================================================
// 1. LẤY DANH SÁCH TẤT CẢ ĐỀ THI (CÓ PHÂN TRANG) <<<< ĐÃ SỬA
// ===================================================================================
router.get('/', async (req, res) => {
    try {
        // Lấy các tham số phân trang từ query string, với giá trị mặc định
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Lấy tổng số đề thi để tính toán số trang
        const totalExams = await Exam.countDocuments({});
        const totalPages = Math.ceil(totalExams / limit);

        // Lấy dữ liệu đề thi theo phân trang
        // Tối ưu: Không gửi htmlContent nặng nề khi chỉ lấy danh sách
        const exams = await Exam.find({})
            .select('-htmlContent')
            .sort({ year: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        // Trả về dữ liệu cùng với thông tin phân trang
        res.json({
            data: exams,
            currentPage: page,
            totalPages: totalPages,
            totalExams: totalExams,
        });

    } catch (err) {
        console.error("Error fetching exams:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách đề thi." });
    }
});


// ===================================================================================
// 2. LẤY CHI TIẾT MỘT ĐỀ THI (VỚI LOGIC KIỂM TRA QUYỀN) - Giữ nguyên logic gốc
// ===================================================================================
router.get('/:id', authenticateTokenOptional, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate('topic');
        if (!exam) {
            return res.status(404).json({ message: "Không tìm thấy đề thi." });
        }

        let canViewFullContent = false;
        let subscriptionStatus = 'none';
        const previewContentText = exam.description || "Vui lòng đăng ký để xem nội dung đầy đủ của đề thi và lời giải.";

        if (req.user) {
            const userId = req.user.id;
            const fullAccessSub = await UserSubscription.findOne({ user: userId, hasFullAccess: true, isActive: true });

            if (fullAccessSub) {
                canViewFullContent = true;
                subscriptionStatus = 'full_access';
            } else {
                const specificExamSub = await UserSubscription.findOne({
                    user: userId,
                    subscribedItem: exam._id,
                    onModel: 'Exam',
                    isActive: true
                });
                if (specificExamSub) {
                    canViewFullContent = true;
                    subscriptionStatus = 'subscribed_specific';
                }
            }
        }

        if (canViewFullContent) {
            res.json({ ...exam.toObject(), canViewFullContent: true, subscriptionStatus: subscriptionStatus });
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
                previewContent: previewContentText,
                subscriptionStatus: subscriptionStatus,
                htmlContent: null,
                message: "Bạn cần đăng ký để xem toàn bộ nội dung này."
            });
        }
    } catch (err) {
        console.error("Error fetching single exam:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết đề thi." });
    }
});


// ===================================================================================
// 3. TẠO MỘT ĐỀ THI MỚI - Giữ nguyên logic gốc
// ===================================================================================
router.post('/create-html-post', authenticateToken, async (req, res) => {
    // BẢO MẬT: Giả định middleware `authenticateToken` đã thêm `req.user` và `req.user.role`
    if (req.user.role !== 'admin') {
         return res.status(403).json({ message: "Truy cập bị từ chối. Yêu cầu quyền Admin." });
    }

    try {
        const { title, description, htmlContent, subject, year, province } = req.body;
        
        if (!title || !htmlContent || !subject || !year) {
            return res.status(400).json({ message: "Thiếu các thông tin bắt buộc (title, htmlContent, subject, year)." });
        }

        const newExam = new Exam({
            title,
            description,
            htmlContent,
            subject,
            year,
            province
        });

        await newExam.save();
        res.status(201).json({ message: "Lưu đề thi thành công!", data: newExam });
    } catch (err) {
        console.error("Error creating new exam from HTML:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Lỗi máy chủ khi tạo đề thi." });
    }
});


// ===================================================================================
// 4. CẬP NHẬT MỘT ĐỀ THI - Giữ nguyên logic gốc
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
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật đề thi." });
    }
});


// ===================================================================================
// 5. XÓA MỘT ĐỀ THI <<<< ĐÃ SỬA
// ===================================================================================
router.delete('/:id', authenticateToken, async (req, res) => {
    // 1. BẢO MẬT: Kiểm tra quyền Admin (giả định `req.user.role` được cung cấp bởi middleware)
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Truy cập bị từ chối. Yêu cầu quyền Admin." });
    }

    try {
        const examId = req.params.id;

        // Tìm đề thi để đảm bảo nó tồn tại trước khi xóa
        const examToDelete = await Exam.findById(examId);
        if (!examToDelete) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi để xóa.' });
        }

        // 2. DỌN DẸP DỮ LIỆU: Xóa tất cả các gói đăng ký liên quan đến đề thi này
        await UserSubscription.deleteMany({ subscribedItem: examId, onModel: 'Exam' });

        // 3. XÓA ĐỀ THI: Sau khi dọn dẹp xong mới xóa đề thi
        await Exam.findByIdAndDelete(examId);

        res.json({ message: `Đã xóa thành công đề thi: "${examToDelete.title}" và các gói đăng ký liên quan.` });

    } catch (err) {
        console.error("Error deleting exam:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi xóa đề thi." });
    }
});


export default router;