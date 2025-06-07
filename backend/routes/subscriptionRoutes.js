// file: routes/subscriptionRoutes.js
import express from 'express';
import authenticateToken from '../config/authMiddleware.js';
import UserSubscription from '../models/UserSubscription.js';
import Essay from '../models/Essay.js'; // Vẫn cần để đăng ký Essay
import Exam from '../models/Exam.js';   // <<<< THÊM MỚI: Để đăng ký Exam

const router = express.Router();

// 1. Subscribe một BÀI LUẬN (Essay) cụ thể - ĐÃ CẬP NHẬT
router.post('/essay/:essayId', authenticateToken, async (req, res) => {
  const essayId = req.params.essayId;
  const userId = req.user.id;

  try {
    const essay = await Essay.findById(essayId);
    if (!essay) {
      return res.status(404).json({ message: "Bài luận không tồn tại." });
    }

    const hasFull = await UserSubscription.findOne({ user: userId, hasFullAccess: true, isActive: true });
    if (hasFull) {
      return res.status(400).json({ message: "Bạn đã có quyền truy cập toàn bộ, không cần đăng ký lẻ." });
    }

    // Sửa đổi logic kiểm tra: dùng subscribedItem và onModel
    const existingSub = await UserSubscription.findOne({ user: userId, subscribedItem: essayId, onModel: 'Essay', isActive: true });
    if (existingSub) {
      return res.status(400).json({ message: `Bạn đã đăng ký bài luận '${essay.title}' rồi.` });
    }

    // Sửa đổi logic tạo mới
    const newSubscription = new UserSubscription({
      user: userId,
      subscribedItem: essayId, // Dùng trường mới
      onModel: 'Essay',      // Ghi rõ loại model
      planType: 'single_essay_free',
    });
    await newSubscription.save();
    res.status(201).json({ message: `Đăng ký thành công bài luận: ${essay.title}`, subscription: newSubscription });

  } catch (error) {
    console.error("Error subscribing to essay:", error);
    if (error.code === 11000) {
         return res.status(400).json({ message: "Bạn đã có một gói đăng ký tương tự đang hoạt động." });
    }
    res.status(500).json({ message: "Lỗi máy chủ khi đăng ký bài luận." });
  }
});


// 2. THÊM MỚI: Subscribe một ĐỀ THI (Exam) cụ thể
router.post('/exam/:examId', authenticateToken, async (req, res) => {
  const examId = req.params.examId;
  const userId = req.user.id;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Đề thi không tồn tại." });
    }

    const hasFull = await UserSubscription.findOne({ user: userId, hasFullAccess: true, isActive: true });
    if (hasFull) {
      return res.status(400).json({ message: "Bạn đã có quyền truy cập toàn bộ, không cần đăng ký lẻ." });
    }

    const existingSub = await UserSubscription.findOne({ user: userId, subscribedItem: examId, onModel: 'Exam', isActive: true });
    if (existingSub) {
      return res.status(400).json({ message: `Bạn đã đăng ký đề thi '${exam.title}' rồi.` });
    }

    const newSubscription = new UserSubscription({
      user: userId,
      subscribedItem: examId,
      onModel: 'Exam',
      planType: 'single_exam_free',
    });
    await newSubscription.save();
    res.status(201).json({ message: `Đăng ký thành công đề thi: ${exam.title}`, subscription: newSubscription });

  } catch (error) {
    console.error("Error subscribing to exam:", error);
    if (error.code === 11000) {
         return res.status(400).json({ message: "Bạn đã có một gói đăng ký tương tự đang hoạt động." });
    }
    res.status(500).json({ message: "Lỗi máy chủ khi đăng ký đề thi." });
  }
});


// 3. Subscribe quyền truy cập toàn bộ (Full Access) - Giữ nguyên, không thay đổi
router.post('/full-access', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const existingFullAccess = await UserSubscription.findOne({ user: userId, hasFullAccess: true, isActive: true });
    if (existingFullAccess) {
      return res.status(400).json({ message: "Bạn đã có quyền truy cập toàn bộ rồi." });
    }

    const newFullSubscription = new UserSubscription({
      user: userId,
      hasFullAccess: true,
      planType: 'full_access_free',
      isActive: true
    });
    await newFullSubscription.save();
    res.status(201).json({ message: "Đăng ký quyền truy cập toàn bộ thành công!", subscription: newFullSubscription });

  } catch (error) {
    console.error("Error subscribing to full access:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Lỗi: Bạn đã có một gói đăng ký tương tự đang hoạt động hoặc đã tồn tại." });
    }
    res.status(500).json({ message: "Lỗi máy chủ khi đăng ký gói full access." });
  }
});

// 4. Lấy thông tin subscription của người dùng hiện tại - ĐÃ CẬP NHẬT
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await UserSubscription.find({ user: req.user.id, isActive: true })
                                      // Sử dụng populate với refPath để lấy thông tin chi tiết
                                      // từ 'Essay' hoặc 'Exam' model một cách linh hoạt.
                                      .populate({
                                        path: 'subscribedItem',
                                        select: 'title' // Chỉ lấy trường title
                                      });
    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy thông tin subscription." });
  }
});

export default router;