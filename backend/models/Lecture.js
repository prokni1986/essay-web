// backend/models/Lecture.js
import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên bài giảng là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tên bài giảng không được quá 200 ký tự']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả bài giảng không được quá 500 ký tự']
  },
  imageUrl: {
    type: String,
    trim: true,
    default: 'https://via.placeholder.com/400x225?text=Bài+Giảng'
  },
  imagePublicId: { // <<<< THÊM TRƯỜNG NÀY
    type: String,
    required: false // Không bắt buộc, vì có thể không có ảnh
  },
  videoUrl: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  lectureCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'LectureCategory',
    required: [true, 'Bài giảng phải thuộc về một chuyên mục']
  },
  grade: {
    type: Number,
    required: [true, 'Lớp là bắt buộc cho bài giảng'],
    min: [1, 'Lớp phải lớn hơn hoặc bằng 1'],
    max: [12, 'Lớp phải nhỏ hơn hoặc bằng 12']
  }
}, { timestamps: true });

export default mongoose.model('Lecture', lectureSchema);