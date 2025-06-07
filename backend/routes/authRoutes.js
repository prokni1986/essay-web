// file: routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authenticateToken from '../config/authMiddleware.js';

const router = express.Router();

// 1. Đăng ký người dùng mới (Giữ nguyên)
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

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công! Vui lòng đăng nhập.' });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ errors: [{ msg: 'Lỗi máy chủ, không thể đăng ký.' }] });
  }
});


// 2. Đăng nhập <<<< ĐÃ SỬA
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      console.error("Login passport authenticate error:", err);
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info ? info.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' });
    }

    // SỬA ĐỔI: Thêm `role` vào JWT payload
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role // Thêm dòng này để đưa vai trò vào token
    };

    if (!process.env.JWT_SECRET) {
        console.error("Lỗi nghiêm trọng: JWT_SECRET chưa được định nghĩa!");
        return res.status(500).json({ message: "Lỗi cấu hình máy chủ." });
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Đăng nhập thành công!',
      token: `Bearer ${token}`,
      user: { // Gửi thông tin user về client
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role // Cũng gửi role về để client có thể sử dụng nếu cần
      }
    });
  })(req, res, next);
});


// 3. Lấy thông tin người dùng hiện tại (Giữ nguyên)
router.get('/me', authenticateToken, async (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
