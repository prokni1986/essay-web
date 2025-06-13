// backend/models/Exam.js

import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Tiêu đề là bắt buộc."] },
  description: { type: String },
  htmlContent: { type: String, required: [true, "Nội dung HTML là bắt buộc."] },
  subject: { type: String, required: true },
  year: { type: Number, required: true },
  province: { type: String },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  
  thumbnailUrl: {
    type: String, // Sẽ lưu URL ảnh từ Cloudinary
    required: false,
  },

  type: { // Loại đề thi: Chính thức / Thi thử / Đề ôn tập / Đề thi chuyên
    type: String,
    enum: ['Chính thức', 'Thi thử', 'Đề ôn tập', 'Đề thi chuyên'], // THÊM CÁC TÙY CHỌN MỚI
    default: 'Chính thức',
    required: false,
  },
  duration: { // Thời gian làm bài (phút)
    type: Number,
    required: false,
  },
  questions: { // Số lượng câu hỏi
    type: Number,
    required: false,
  },
  difficulty: { // Độ khó của đề thi
    type: String,
    enum: ['Dễ', 'Trung bình', 'Khó', 'Rất khó'],
    default: 'Trung bình',
    required: false,
  },
  grade: { // THÊM TRƯỜNG "LỚP"
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Các lớp phổ biến
    required: false,
  },

}, {
  timestamps: true,
});

const Exam = mongoose.model('Exam', ExamSchema);
export default Exam;