// backend/models/LectureCategory.js
import mongoose from 'mongoose'; // Thay đổi require thành import

const lectureCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên chuyên mục bài giảng là bắt buộc'],
    unique: true,
    trim: true,
    maxlength: [100, 'Tên chuyên mục bài giảng không được quá 100 ký tự']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả chuyên mục không được quá 500 ký tự']
  }
}, { timestamps: true });

export default mongoose.model('LectureCategory', lectureCategorySchema); // Thay đổi module.exports thành export default