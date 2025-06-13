// file: models/Notice.js
import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Tiêu đề là bắt buộc."],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  // THÊM MỚI: Thêm trường tỉnh/thành phố
  province: {
    type: String,
    trim: true,
    index: true, // Thêm index để lọc nhanh hơn
  },
  type: {
    type: String,
    required: true,
    enum: ['exam_schedule', 'admission_notice'],
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Thêm text index để tìm kiếm theo từ khóa trên nhiều trường
noticeSchema.index({ title: 'text', description: 'text' });

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;