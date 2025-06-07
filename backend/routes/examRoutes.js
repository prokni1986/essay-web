// file: routes/examRoutes.js

import express from 'express';
const router = express.Router();

// Import các models và middleware cần thiết
import Exam from '../models/Exam.js';
import UserSubscription from '../models/UserSubscription.js';
import authenticateTokenOptional from '../config/authMiddlewareOptional.js';
// import multer from 'multer'; // Bạn có thể cần cho các route upload/update sau này

// Lấy danh sách tất cả đề thi (có thể thêm phân trang, lọc sau)
router.get('/', async (req, res) => {
    try {
        // Tối ưu: Không gửi htmlContent khi lấy danh sách
        const exams = await Exam.find({}).select('-htmlContent').sort({ year: -1, createdAt: -1 });
        res.json(exams);
    } catch (err) {
        console.error("Error fetching exams:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách đề thi." });
    }
});

// Lấy chi tiết một đề thi theo id - ĐÃ HOÀN THIỆN LOGIC KIỂM TRA QUYỀN
router.get('/:id', authenticateTokenOptional, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate('topic');
        if (!exam) {
            return res.status(404).json({ message: "Không tìm thấy đề thi." });
        }

        // <<<< BẮT ĐẦU LOGIC KIỂM TRA QUYỀN >>>>
        let canViewFullContent = false;
        let subscriptionStatus = 'none'; // Các trạng thái: 'none', 'subscribed_specific', 'full_access'
        
        // Tạo nội dung xem trước cơ bản từ mô tả hoặc một phần nội dung
        const previewContentText = exam.description || "Vui lòng đăng ký để xem nội dung đầy đủ của đề thi và lời giải.";

        // Nếu người dùng đã đăng nhập (có token hợp lệ)
        if (req.user) {
            const userId = req.user.id;

            // 1. Kiểm tra quyền truy cập toàn bộ (Full Access)
            const fullAccessSub = await UserSubscription.findOne({
                user: userId,
                hasFullAccess: true,
                isActive: true
            });

            if (fullAccessSub) {
                canViewFullContent = true;
                subscriptionStatus = 'full_access';
            } else {
                // 2. Nếu không có, kiểm tra subscription cho đề thi cụ thể này
                const specificExamSub = await UserSubscription.findOne({
                    user: userId,
                    subscribedItem: exam._id, // ID của đề thi
                    onModel: 'Exam',         // Quan trọng: Chỉ định model là 'Exam'
                    isActive: true
                });

                if (specificExamSub) {
                    canViewFullContent = true;
                    subscriptionStatus = 'subscribed_specific';
                }
            }
        }
        
        // <<<< KẾT THÚC LOGIC KIỂM TRA QUYỀN >>>>

        // Trả về dữ liệu dựa trên quyền truy cập
        if (canViewFullContent) {
            // Nếu có quyền, trả về toàn bộ dữ liệu
            res.json({
                ...exam.toObject(),
                canViewFullContent: true,
                subscriptionStatus: subscriptionStatus,
            });
        } else {
            // Nếu không có quyền, chỉ trả về thông tin cơ bản và preview
            res.json({
                _id: exam._id,
                title: exam.title,
                description: exam.description,
                subject: exam.subject,
                year: exam.year,
                province: exam.province,
                topic: exam.topic,
                canViewFullContent: false,
                previewContent: previewContentText, // Nội dung xem trước
                subscriptionStatus: subscriptionStatus,
                htmlContent: null, // QUAN TRỌNG: Không gửi nội dung đầy đủ
                message: "Bạn cần đăng ký để xem toàn bộ nội dung này."
            });
        }

    } catch (err) {
        console.error("Error fetching single exam:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết đề thi." });
    }
});


// Thêm các route khác cho Exam (POST, PUT, DELETE) ở đây nếu cần
// Ví dụ: Route tạo mới đề thi
/*
router.post('/', authenticateToken, async (req, res) => {
    // Thêm logic kiểm tra quyền admin ở đây
    try {
        const { title, description, htmlContent, subject, year, province } = req.body;
        const newExam = new Exam({ title, description, htmlContent, subject, year, province });
        await newExam.save();
        res.status(201).json(newExam);
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
});
*/

export default router;