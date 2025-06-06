// file: routes/adminRoutes.js
import express from 'express';
import User from '../models/User.js';
import UserSubscription from '../models/UserSubscription.js';
import authenticateToken from '../config/authMiddleware.js';
// (Tùy chọn) Tạo một middleware riêng để kiểm tra vai trò admin
// import authenticateAdmin from '../config/adminAuthMiddleware.js';

const router = express.Router();

// Middleware kiểm tra vai trò Admin (ví dụ đơn giản)
// Trong thực tế, bạn nên có trường 'roles' trong User model
const ensureAdmin = async (req, res, next) => {
  if (req.user && req.user.email === process.env.ADMIN_EMAIL) { // Ví dụ: kiểm tra bằng email admin trong .env
    return next();
  }
  // Hoặc nếu bạn có trường roles:
  // if (req.user && req.user.roles && req.user.roles.includes('admin')) {
  //   return next();
  // }
  return res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền Admin.' });
};

// Route để lấy tất cả người dùng và subscription của họ
router.get('/users-subscriptions', authenticateToken, ensureAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean(); // Lấy tất cả user, bỏ password
    const subscriptions = await UserSubscription.find({})
                                      .populate('user', 'username email') // Populate thông tin user
                                      .populate('subscribedEssay', 'title') // Populate tên bài luận
                                      .sort({ createdAt: -1 })
                                      .lean();

    // Gộp thông tin subscription vào từng user
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

export default router;