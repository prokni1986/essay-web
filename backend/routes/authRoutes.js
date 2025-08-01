// file: routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authenticateToken from '../config/authMiddleware.js'; // Đảm bảo đường dẫn này chính xác

const router = express.Router();

// 1. Đăng ký người dùng mới
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body; // <-- BỎ password2 ở đây

  // Kiểm tra các trường bắt buộc (chỉ username, email, password)
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng điền tất cả các trường.' });
  }

  // BỎ kiểm tra password !== password2 ở đây vì frontend đã xử lý
  // if (password !== password2) {
  //   return res.status(400).json({ message: 'Mật khẩu không khớp.' });
  // }

  // Mongoose Schema sẽ tự động validate minlength và email format
  // if (password.length < 6) {
  //   return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
  // }

  try {
    const newUser = new User({
      username: username.toLowerCase(), // Lưu username và email dưới dạng lowercase để đảm bảo tính duy nhất không phân biệt chữ hoa/thường
      email: email.toLowerCase(),
      password,
    });

    await newUser.save(); // Lệnh này sẽ kích hoạt validation và unique check của Mongoose

    res.status(201).json({ message: 'Đăng ký thành công! Vui lòng đăng nhập.' });

  } catch (err) {
    console.error("Register error:", err);

    // Xử lý lỗi trùng lặp (E11000 - từ unique: true trong Mongoose Schema)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]; // Lấy tên trường bị trùng (username hoặc email)
        const value = err.keyValue[field]; // Lấy giá trị bị trùng
        let message = '';
        if (field === 'email') {
            message = `Email '${value}' đã được sử dụng.`;
        } else if (field === 'username') {
            message = `Tên người dùng '${value}' đã được sử dụng.`;
        } else {
            message = `Giá trị '${value}' cho trường '${field}' đã tồn tại.`;
        }
        return res.status(400).json({ message }); // Trả về thông báo lỗi với cấu trúc { message: '...' }
    }

    // Xử lý lỗi validation từ Mongoose (ví dụ: required, minlength, match regex cho email)
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(error => error.message);
        // Nối các thông báo lỗi lại thành một chuỗi duy nhất
        return res.status(400).json({ message: messages.join(', ') }); // Trả về thông báo lỗi với cấu trúc { message: '...' }
    }

    // Xử lý các lỗi khác không xác định
    res.status(500).json({ message: 'Lỗi máy chủ, không thể đăng ký.' });
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