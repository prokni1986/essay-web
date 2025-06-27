// backend/controllers/authController.js
import User from '../models/User.js'; // Đường dẫn tới model User của bạn
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Tải biến môi trường (như JWT_SECRET)

// Hàm tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Token hết hạn sau 1 ngày
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body; // Thêm 'role' nếu bạn cho phép đăng ký vai trò trực tiếp

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Người dùng với email này đã tồn tại.' });
    }

    // Tạo người dùng mới
    const newUser = await User.create({
      username,
      email,
      password,
      // Gán vai trò mặc định là 'user' nếu không được cung cấp hoặc không hợp lệ
      role: role && ['user', 'admin'].includes(role) ? role : 'user',
    });

    if (newUser) {
      res.status(201).json({
        message: 'Đăng ký thành công!',
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
        token: generateToken(newUser._id),
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ.' });
    }
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng:", error);
    res.status(500).json({ message: error.message || 'Lỗi server khi đăng ký.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm người dùng bằng email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email chưa được đăng ký.' });
    }

    // So sánh mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu không đúng.' });
    }

    // Trả về thông tin người dùng và token
    res.json({
      message: 'Đăng nhập thành công!',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role, // Đảm bảo trả về vai trò
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập người dùng:", error);
    res.status(500).json({ message: error.message || 'Lỗi server khi đăng nhập.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me (hoặc /api/auth/profile)
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user được gán từ middleware xác thực (authenticateToken)
  // user (req.user) từ middleware đã bao gồm 'role'
  console.log("Fetching user profile in authController:", req.user); // Debug log

  if (req.user) {
    res.json({
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role, // Quan trọng: trả về vai trò
      },
    });
  } else {
    res.status(404).json({ message: 'Người dùng không tìm thấy.' });
  }
};

export { registerUser, authUser, getUserProfile };