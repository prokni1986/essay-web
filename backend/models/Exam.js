// backend/models/Exam.js

import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Tiêu đề là bắt buộc."] },
  description: { type: String },
  htmlContent: { type: String, required: [true, "Nội dung HTML là bắt buộc."] },
  
  // MỚI: Thêm trường cho gợi ý lời giải dưới dạng HTML
  solutionHtml: { 
    type: String, 
    required: false // Lời giải có thể được cập nhật sau, nên không bắt buộc
  },

  subject: { type: String, required: true },
  year: { type: Number, required: true },
  province: { type: String },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  
  thumbnailUrl: {
    type: String, 
    required: false,
  },

  type: { 
    type: String,
    enum: ['Chính thức', 'Thi thử', 'Đề ôn tập', 'Đề thi chuyên'],
    default: 'Chính thức',
    required: false,
  },
  duration: { 
    type: Number,
    required: false,
  },
  questions: {
    type: Number,
    required: false,
  },
  difficulty: {
    type: String,
    enum: ['Dễ', 'Trung bình', 'Khó', 'Rất khó'],
    default: 'Trung bình',
    required: false,
  },
  grade: { 
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    required: false,
  },

}, {
  timestamps: true,
});

const Exam = mongoose.model('Exam', ExamSchema);
export default Exam;