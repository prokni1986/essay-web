// file: routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authenticateToken from '../config/authMiddleware.js'; // <<<< ĐẢM BẢO IMPORT ĐÚNG ĐƯỜNG DẪN

const router = express.Router();

// 1. Đăng ký người dùng mới
router.post('/register', async (req, res) => {
  const { username, email, password, password2 } = req.body;
  let errors = [];

  if (!username || !email || !password || !password2) {
    errors.push({ msg: 'Vui lòng điền tất cả các trường.' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Mật khẩu không khớp.' });
  }

  if (password && password.length < 6) {
    errors.push({ msg: 'Mật khẩu phải có ít nhất 6 ký tự.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      errors.push({ msg: 'Email đã được sử dụng.' });
      return res.status(400).json({ errors });
    }
    user = await User.findOne({ username: username.toLowerCase() });
    if (user) {
      errors.push({ msg: 'Username đã được sử dụng.' });
      return res.status(400).json({ errors });
    }

    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công! Vui lòng đăng nhập.' });

  } catch (err) {
    console.error("Register error:", err);
    // Phân tích lỗi cụ thể hơn nếu là lỗi từ Mongoose (ví dụ: duplicate key)
    if (err.code === 11000) { // Lỗi duplicate key của MongoDB
        const field = Object.keys(err.keyValue)[0];
        errors.push({ msg: `Giá trị '${err.keyValue[field]}' cho trường '${field}' đã tồn tại.` });
        return res.status(400).json({ errors });
    }
    res.status(500).json({ errors: [{ msg: 'Lỗi máy chủ, không thể đăng ký.' }] });
  }
});

// 2. Đăng nhập
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      console.error("Login passport authenticate error:", err);
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Đăng nhập thất bại.' });
    }
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      // roles: user.roles // nếu có
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Đăng nhập thành công!',
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        // roles: user.roles
      }
    });
  })(req, res, next);
});


// 3. Lấy thông tin người dùng hiện tại <<<< BỎ COMMENT VÀ SỬA
router.get('/me', authenticateToken, async (req, res) => { // Bỏ comment dòng này
  // req.user đã được gán bởi middleware authenticateToken và đã được select('-password')
  if (!req.user) {
    // Dòng này gần như sẽ không bao giờ được thực thi nếu authenticateToken làm việc đúng
    // vì middleware sẽ trả về lỗi trước nếu user không tìm thấy hoặc token không hợp lệ.
    return res.status(404).json({ message: "Không tìm thấy thông tin người dùng từ token." });
  }
  res.status(200).json({ user: req.user }); // Trả về user
});

export default router;