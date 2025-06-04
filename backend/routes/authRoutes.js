// file: routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Đường dẫn tới model User

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
    // Không tự động đăng nhập hoặc trả về token ở đây, yêu cầu người dùng đăng nhập sau khi đăng ký
    res.status(201).json({ message: 'Đăng ký thành công! Vui lòng đăng nhập.' });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ errors: [{ msg: 'Lỗi máy chủ, không thể đăng ký.' }] });
  }
});

// 2. Đăng nhập
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Đăng nhập thất bại.' });
    }
    // Nếu thành công, tạo JWT
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      // roles: user.roles // nếu có
    };
    // Ký và tạo token
    // Đảm bảo bạn có JWT_SECRET trong file .env
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }); // Token hết hạn sau 1 ngày

    res.json({
      message: 'Đăng nhập thành công!',
      token: `Bearer ${token}`, // Gửi token về client
      user: { // Gửi thông tin user (không bao gồm mật khẩu)
        id: user.id,
        username: user.username,
        email: user.email,
        // roles: user.roles
      }
    });
  })(req, res, next);
});


// 3. Lấy thông tin người dùng hiện tại (Protected Route - ví dụ)
// Bạn sẽ cần một middleware để bảo vệ route này
// router.get('/me', authenticateToken, (req, res) => {
//   res.json(req.user); // req.user được set bởi middleware authenticateToken
// });

export default router;