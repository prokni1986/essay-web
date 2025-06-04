// file: config/authMiddlewareOptional.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticateTokenOptional = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    req.user = null; // Không có user
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    req.user = user; // Gán user nếu token hợp lệ
    next();
  } catch (err) {
    req.user = null; // Token không hợp lệ hoặc hết hạn, coi như không có user
    next();
  }
};

export default authenticateTokenOptional;