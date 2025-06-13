// file: server.js
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import initializePassport from './config/passportConfig.js';

// Import Routes
import essayRoutes from './routes/essayRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // THÊM MỚI
import { v2 as cloudinary } from 'cloudinary';
import examRoutes from './routes/examRoutes.js'; // <<<< Bằng dòng này
import newsRoutes from './routes/newsRoutes.js'
import tagRoutes from './routes/tagRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Cấu hình Cloudinary (nếu bạn cần cấu hình ở đây)
if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log("✅ Cloudinary configured via server.js");
} else {
  console.warn("⚠️ Cloudinary configuration not found in .env. Uploads might fail if not configured elsewhere.");
}

// Cấu hình CORS
const allowedOrigins = [
  process.env.FRONTEND_URL_VERCEL, // <<<< Biến môi trường cho URL Vercel của bạn
  process.env.FRONTEND_URL_LOCAL || 'http://localhost:8080', // Hoặc port local dev của bạn (ví dụ 3000, 8080)
  'https://essay-web-1.onrender.com',
  'https://essay-web-neon.vercel.app',
  
].filter(Boolean); // Loại bỏ các giá trị undefined/null

console.log("Allowed Origins for CORS:", allowedOrigins); // Log ra để kiểm tra

const corsOptions = {
  origin: function (origin, callback) {
    // Nếu không có origin (ví dụ: Postman trong một số trường hợp, hoặc server-to-server)
    // hoặc nếu origin nằm trong danh sách cho phép.
    // Trong production, bạn có thể muốn chặt chẽ hơn với việc !origin
    if (!origin || allowedOrigins.includes(origin)) {
      // console.log(`Allowing origin: ${origin}`); // Bật log này nếu cần debug kỹ
      callback(null, true);
    } else {
      console.error(`Blocked by CORS. Origin: ${origin}. Allowed origins:`, allowedOrigins);
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

// Khởi tạo và cấu hình Passport
app.use(passport.initialize());
initializePassport(passport);

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch(error => console.error("❌ MongoDB Atlas connection error:", error.message));

// Định tuyến (API Routes)
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/essays', essayRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes); // <<<< THÊM MỚI
app.use('/api/exams', examRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notices', noticeRoutes);
// Route cơ bản để kiểm tra server
app.get('/', (req, res) => {
  res.send('Essay Web API is running with Authentication! 🚀');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});