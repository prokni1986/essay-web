// file: routes/subscriptionRoutes.js
import express from 'express';
import authenticateToken from '../config/authMiddleware.js'; // Middleware xác thực
import UserSubscription from '../models/UserSubscription.js';
import Essay from '../models/Essay.js'; // Để kiểm tra essay tồn tại

const router = express.Router();

// 1. Subscribe một bài luận cụ thể
router.post('/essay/:essayId', authenticateToken, async (req, res) => {
  const essayId = req.params.essayId;
  const userId = req.user.id; // Lấy từ authenticateToken

  try {
    const essay = await Essay.findById(essayId);
    if (!essay) {
      return res.status(404).json({ message: "Bài luận không tồn tại." });
    }

    // Kiểm tra xem đã có full access chưa
    const hasFull = await UserSubscription.findOne({ user: userId, hasFullAccess: true, isActive: true });
    if (hasFull) {
      return res.status(400).json({ message: "Bạn đã có quyền truy cập toàn bộ, không cần subscribe lẻ." });
    }

    // Kiểm tra xem đã subscribe bài này chưa
    const existingSub = await UserSubscription.findOne({ user: userId, subscribedEssay: essayId, isActive: true });
    if (existingSub) {
      return res.status(400).json({ message: `Bạn đã subscribe bài luận '${essay.title}' rồi.` });
    }

    // TODO: Nếu có thanh toán, đây là lúc xử lý hoặc chuyển hướng.
    // Hiện tại, tạo subscription miễn phí và vĩnh viễn (endDate: null)
    const newSubscription = new UserSubscription({
      user: userId,
      subscribedEssay: essayId,
      planType: 'single_essay_free', // Ví dụ
      // endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Ví dụ: 30 ngày
    });
    await newSubscription.save();
    res.status(201).json({ message: `Subscribe thành công bài luận: ${essay.title}`, subscription: newSubscription });

  } catch (error) {
    console.error("Error subscribing to essay:", error);
    if (error.code === 11000) { // Duplicate key error
         return res.status(400).json({ message: "Bạn đã có một gói đăng ký tương tự đang hoạt động." });
    }
    res.status(500).json({ message: "Lỗi máy chủ khi đăng ký bài luận." });
  }
});

// 2. Subscribe quyền truy cập toàn bộ
router.post('/full-access', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Kiểm tra xem đã có full access chưa
    const existingFullAccess = await UserSubscription.findOne({ user: userId, hasFullAccess: true, isActive: true });
    if (existingFullAccess) {
      return res.status(400).json({ message: "Bạn đã có quyền truy cập toàn bộ rồi." });
    }

    // TODO: Xử lý thanh toán nếu cần.
    // Tạo subscription full access
    const newFullSubscription = new UserSubscription({
      user: userId,
      hasFullAccess: true,
      planType: 'full_access_free', // Ví dụ
      // endDate: ...
    });
    await newFullSubscription.save();

    // (Tùy chọn) Hủy các subscription lẻ trước đó nếu người dùng nâng cấp lên full access
    // await UserSubscription.updateMany({ user: userId, subscribedEssay: { $ne: null }, isActive: true }, { isActive: false });

    res.status(201).json({ message: "Đăng ký quyền truy cập toàn bộ thành công!", subscription: newFullSubscription });

  } catch (error) {
    console.error("Error subscribing to full access:", error);
     if (error.code === 11000) {
         return res.status(400).json({ message: "Bạn đã có một gói đăng ký tương tự đang hoạt động." });
    }
    res.status(500).json({ message: "Lỗi máy chủ khi đăng ký gói full access." });
  }
});

// 3. Lấy thông tin subscription của người dùng hiện tại
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await UserSubscription.find({ user: req.user.id, isActive: true })
                                      .populate('subscribedEssay', 'title'); // Populate tên bài luận nếu có
    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy thông tin subscription." });
  }
});

export default router;