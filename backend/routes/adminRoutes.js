// file: routes/adminRoutes.js
import express from 'express';
import User from '../models/User.js';
import UserSubscription from '../models/UserSubscription.js';
import authenticateToken from '../config/authMiddleware.js';

const router = express.Router();

// Middleware kiểm tra quyền Admin
const ensureAdmin = async (req, res, next) => {
  // --- DEBUG ---
  console.log("--- Bắt đầu kiểm tra Admin ---");
  console.log("Email từ token (req.user.email):", req.user ? req.user.email : 'req.user không tồn tại hoặc không có email');
  console.log("Email Admin từ .env (process.env.ADMIN_EMAIL):", process.env.ADMIN_EMAIL);
  console.log("So sánh bằng === :", req.user ? (req.user.email === process.env.ADMIN_EMAIL) : 'false');
  console.log("--- Kết thúc kiểm tra Admin ---");
  // --- END DEBUG ---

  if (req.user && req.user.email === process.env.ADMIN_EMAIL) {
    return next();
  }
  return res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền Admin.' });
};
// Route để lấy tất cả người dùng và subscription của họ
router.get('/users-subscriptions', authenticateToken, ensureAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();
    const subscriptions = await UserSubscription.find({})
                                      .populate('user', 'username email')
                                      .populate('subscribedItem', 'title') // << Sửa đổi: Sử dụng 'subscribedItem'
                                      .sort({ createdAt: -1 })
                                      .lean();

    const usersWithSubscriptions = users.map(user => {
      const userSubs = subscriptions.filter(sub => sub.user && sub.user._id.toString() === user._id.toString());
      return {
        ...user,
        subscriptions: userSubs,
      };
    });

    res.json(usersWithSubscriptions);
  } catch (error) {
    console.error("Error fetching users and subscriptions:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách người dùng và subscriptions." });
  }
});

// ===================================================================================
// CHỨC NĂNG MỚI: THAY ĐỔI TRẠNG THÁI SUBSCRIPTION (Active/Inactive)
// ===================================================================================
router.put('/subscriptions/:subId/toggle-active', authenticateToken, ensureAdmin, async (req, res) => {
    try {
        const sub = await UserSubscription.findById(req.params.subId);
        if (!sub) {
            return res.status(404).json({ message: 'Không tìm thấy gói đăng ký.' });
        }
        // Đảo ngược trạng thái isActive
        sub.isActive = !sub.isActive;
        await sub.save();
        res.json({ message: `Đã cập nhật trạng thái gói đăng ký thành ${sub.isActive ? 'Active' : 'Inactive'}.`, subscription: sub });
    } catch (error) {
        console.error("Error toggling subscription status:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật trạng thái." });
    }
});

// ===================================================================================
// CHỨC NĂNG MỚI: XÓA VĨNH VIỄN MỘT SUBSCRIPTION
// ===================================================================================
router.delete('/subscriptions/:subId', authenticateToken, ensureAdmin, async (req, res) => {
    try {
        const subToDelete = await UserSubscription.findByIdAndDelete(req.params.subId);
        if (!subToDelete) {
            return res.status(404).json({ message: 'Không tìm thấy gói đăng ký để xóa.' });
        }
        res.json({ message: 'Đã xóa gói đăng ký thành công.' });
    } catch (error) {
        console.error("Error deleting subscription:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi xóa gói đăng ký." });
    }
});


export default router;
