// file: routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authenticateToken from '../config/authMiddleware.js'; // Đảm bảo đường dẫn này chính xác
// import authController from '../controllers/authController.js'; // Không cần nếu bạn nhúng logic trực tiếp như hiện tại

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
      // 'role' sẽ được tự động gán là 'user' từ User Model nếu không được cung cấp ở đây.
      // Nếu bạn muốn cho phép đăng ký admin qua API, bạn cần thêm logic kiểm tra ở đây.
    });

    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công! Vui lòng đăng nhập.' });

  } catch (err) {
    console.error("Register error:", err);
    if (err.code === 11000) { // Duplicate key error for unique fields
        const field = Object.keys(err.keyValue)[0];
        errors.push({ msg: `Giá trị '${err.keyValue[field]}' cho trường '${field}' đã tồn tại.` });
        return res.status(400).json({ errors });
    }
    res.status(500).json({ errors: [{ msg: 'Lỗi máy chủ, không thể đăng ký.' }] });
  }
});

// 2. Đăng nhập
router.post('/login', (req, res, next) => {
  // Passport.authenticate gọi chiến lược 'local' (được định nghĩa trong passportConfig.js)
  // { session: false } vì chúng ta dùng JWT, không dùng session dựa trên cookie
  passport.authenticate('local', { session: false }, (err, user, info) => {
    // Xử lý lỗi từ Passport.js hoặc LocalStrategy
    if (err) {
      console.error("Login passport authenticate error:", err);
      return next(err); // Chuyển lỗi tới middleware xử lý lỗi của Express
    }
    // Nếu người dùng không được tìm thấy hoặc mật khẩu không đúng
    if (!user) {
      return res.status(401).json({ message: info ? info.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' });
    }

    // Nếu xác thực thành công, tạo payload cho JWT
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role, // <-- QUAN TRỌNG: Bao gồm vai trò người dùng trong payload của JWT
                      // Điều này đảm bảo vai trò có thể được giải mã từ token sau này
    };

    // Đảm bảo JWT_SECRET đã được định nghĩa trong biến môi trường
    if (!process.env.JWT_SECRET) {
        console.error("Lỗi nghiêm trọng: JWT_SECRET chưa được định nghĩa trong .env!");
        return res.status(500).json({ message: "Lỗi cấu hình máy chủ: JWT_SECRET bị thiếu." });
    }

    // Ký (sign) JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }); // Token hết hạn sau 1 ngày

    // Trả về response thành công
    res.json({
      message: 'Đăng nhập thành công!',
      token: `Bearer ${token}`, // Gửi token về client với tiền tố Bearer
      user: { // Gửi thông tin user (không bao gồm mật khẩu)
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role, // <-- QUAN TRỌNG: Bao gồm vai trò người dùng trong object user trả về
                       // Đây là dữ liệu mà AuthProvider ở frontend sẽ nhận trực tiếp
      }
    });
  })(req, res, next); // Đảm bảo passport.authenticate được gọi với req, res, next
});


// 3. Lấy thông tin người dùng hiện tại (đã đăng nhập)
// Route này sẽ được gọi bởi frontend khi ứng dụng tải lần đầu để xác thực token
// và lấy thông tin user nếu token còn hợp lệ.
router.get('/me', authenticateToken, async (req, res) => {
  // Middleware `authenticateToken` đã chạy trước:
  // - Nếu token không hợp lệ hoặc thiếu, nó đã trả về lỗi 401 hoặc 403.
  // - Nếu token hợp lệ, nó đã tìm user (không bao gồm mật khẩu) và gán vào `req.user`.

  // Do đó, nếu request đến được đây, `req.user` chắc chắn tồn tại và hợp lệ.
  // req.user sẽ chứa các thuộc tính từ database, bao gồm 'role' nếu nó có trong DB.
  console.log("Fetching user profile in authRoutes /me:", req.user); // Log để debug

  // Kiểm tra req.user để tránh lỗi nếu có trường hợp nào đó req.user bị null (mặc dù authenticateToken đã xử lý)
  if (req.user) {
    res.status(200).json({
      user: { // Chỉ trả về các trường cần thiết, tránh gửi toàn bộ object mongoose document
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role, // <-- QUAN TRỌNG: Đảm bảo trả về vai trò ở đây
      }
    });
  } else {
    // Trường hợp này hiếm khi xảy ra nếu authenticateToken hoạt động đúng
    res.status(404).json({ message: 'Người dùng không tìm thấy.' });
  }
});

export default router;