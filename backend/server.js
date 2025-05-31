// file: server.js
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import essayRoutes from './routes/essayRoutes.js';
// import path from 'path'; // Not strictly needed if not serving static files from __dirname
// import { fileURLToPath } from 'url'; // Not strictly needed
import topicRoutes from './routes/topicRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js'; // <<<<<<< ADD THIS
import { v2 as cloudinary } from 'cloudinary';
dotenv.config();

// const __filename = fileURLToPath(import.meta.url); // Not strictly needed
// const __dirname = path.dirname(__filename); // Not strictly needed

const app = express();
const PORT = process.env.PORT || 5050;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:8080'
];
const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép các request không có origin (ví dụ: từ Postman, curl, hoặc server-to-server)
    // hoặc nếu origin nằm trong danh sách allowedOrigins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

console.log("✅ Cloudinary configured");

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch(error => console.error("❌ MongoDB Atlas connection error:", error.message));

app.use('/api/essays', essayRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/categories', categoryRoutes); // <<<<<<< ADD THIS

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});