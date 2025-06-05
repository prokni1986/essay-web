// file: routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authenticateToken from '../config/authMiddleware.js'; // Đảm bảo đường dẫn này chính xác

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
    if (err.code === 11000) {
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
      return next(err); // Nên để Express xử lý lỗi này
    }
    if (!user) {
      return res.status(401).json({ message: info ? info.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' });
    }
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      // roles: user.roles // nếu có
    };
    // Đảm bảo JWT_SECRET đã được định nghĩa trong biến môi trường
    if (!process.env.JWT_SECRET) {
        console.error("Lỗi nghiêm trọng: JWT_SECRET chưa được định nghĩa!");
        return res.status(500).json({ message: "Lỗi cấu hình máy chủ." });
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Đăng nhập thành công!',
      token: `Bearer ${token}`, // Gửi token về client với tiền tố Bearer
      user: { // Gửi thông tin user (không bao gồm mật khẩu)
        id: user.id,
        username: user.username,
        email: user.email,
        // roles: user.roles
      }
    });
  })(req, res, next);
});


// 3. Lấy thông tin người dùng hiện tại (đã đăng nhập)
// Route này sẽ được gọi bởi frontend khi ứng dụng tải lần đầu để xác thực token
// và lấy thông tin user nếu token còn hợp lệ.
router.get('/me', authenticateToken, async (req, res) => {
  // Middleware `authenticateToken` đã chạy trước:
  // - Nếu token không hợp lệ hoặc thiếu, nó đã trả về lỗi 401 hoặc 403.
  // - Nếu token hợp lệ, nó đã tìm user, loại bỏ password và gán vào `req.user`.

  // Do đó, nếu request đến được đây, `req.user` chắc chắn tồn tại và hợp lệ.
  res.status(200).json({ user: req.user });
});

export default router;