// file: routes/adminRoutes.js
import express from 'express';
import User from '../models/User.js';
import UserSubscription from '../models/UserSubscription.js';
import authenticateToken from '../config/authMiddleware.js';
import { isAdmin } from '../config/adminMiddleware.js'; // <-- THÊM DÒNG NÀY ĐỂ IMPORT isAdmin

const router = express.Router();

// Middleware kiểm tra quyền Admin (CŨ - ĐÃ BỊ LOẠI BỎ)
// const ensureAdmin = async (req, res, next) => { ... };


// Route để lấy tất cả người dùng và subscription của họ
router.get('/users-subscriptions', authenticateToken, isAdmin, async (req, res) => { // <-- Dùng isAdmin
  try {
    const users = await User.find({}).select('-password').lean();
    const subscriptions = await UserSubscription.find({})
                                      .populate('user', 'username email')
                                      .populate('subscribedItem', 'title')
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
router.put('/subscriptions/:subId/toggle-active', authenticateToken, isAdmin, async (req, res) => { // <-- Dùng isAdmin
    try {
        const sub = await UserSubscription.findById(req.params.subId);
        if (!sub) {
            return res.status(404).json({ message: 'Không tìm thấy gói đăng ký.' });
        }
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
router.delete('/subscriptions/:subId', authenticateToken, isAdmin, async (req, res) => { // <-- Dùng isAdmin
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