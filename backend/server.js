// file: server.js
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport'; // <<<< KHÔI PHỤC LẠI
import initializePassport from './config/passportConfig.js'; // <<<< KHÔI PHỤC LẠI

// Import Routes
import essayRoutes from './routes/essayRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js'; // <<<< KHÔI PHỤC LẠI
import subscriptionRoutes from './routes/subscriptionRoutes.js'; // <<<< KHÔI PHỤC LẠI

// Cloudinary - Bạn có thể giữ lại nếu cần cấu hình global hoặc đã loại bỏ nếu chỉ dùng trong routes
import { v2 as cloudinary } from 'cloudinary'; // <<<< KHÔI PHỤC LẠI (nếu cần thiết ở đây)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Cấu hình Cloudinary (nếu bạn cần cấu hình ở đây thay vì trong các file route riêng lẻ)
// Đảm bảo các biến môi trường CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET đã được set trong .env
if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Sử dụng https
  });
  console.log("✅ Cloudinary configured via server.js");
} else {
  console.warn("⚠️ Cloudinary configuration not found in .env. Uploads might fail if not configured elsewhere.");
}


// Cấu hình CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:8080', // Hoặc port của React dev server của bạn (3000, 5173, etc.)
  'https://essay-web-1.onrender.com',
  'https://vercel.com/tonys-projects-fa0649a2/essay-web'
  // Thêm các origin khác nếu cần
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin && process.env.NODE_ENV !== 'production') { // Cho phép request không có origin (Postman, mobile apps) trong dev
        return callback(null, true);
    }
    if (allowedOrigins.some(allowed => origin && origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.error('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middlewares cơ bản
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Khởi tạo và cấu hình Passport <<<< KHÔI PHỤC LẠI
app.use(passport.initialize());
initializePassport(passport);

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch(error => console.error("❌ MongoDB Atlas connection error:", error.message));

// Định tuyến (API Routes)
app.use('/api/auth', authRoutes);                   // <<<< KHÔI PHỤC LẠI
app.use('/api/subscriptions', subscriptionRoutes);  // <<<< KHÔI PHỤC LẠI
app.use('/api/essays', essayRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/categories', categoryRoutes);

// Route cơ bản để kiểm tra server
app.get('/', (req, res) => {
  res.send('Essay Web API is running with Authentication! 🚀');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});