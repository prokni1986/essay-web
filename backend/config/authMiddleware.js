// file: config/authMiddleware.js (hoặc middleware/authenticateToken.js)
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Đường dẫn tới model User

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Token không được cung cấp. Truy cập bị từ chối.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Lấy thông tin user từ DB mà không bao gồm mật khẩu
    // và gán vào req.user để các route sau có thể sử dụng
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
        return res.status(403).json({ message: 'Người dùng không tồn tại.' });
    }
    req.user = user; // Gán thông tin user (không có password) vào request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token đã hết hạn.' });
    }
    console.error("Token verification error:", err);
    return res.status(403).json({ message: 'Token không hợp lệ.' });
  }
};

export default authenticateToken;