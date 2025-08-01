// backend/models/Lecture.js
import mongoose from 'mongoose';

const customSlugify = (str) => {
  if (!str) return '';
  // 1. Chuyển đổi sang chữ thường
  str = str.toLowerCase();
  // 2. Thay thế các ký tự có dấu
  str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
  str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
  str = str.replace(/[ìíịỉĩ]/g, "i");
  str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
  str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
  str = str.replace(/[ỳýỵỷỹ]/g, "y");
  str = str.replace(/đ/g, "d");
  // 3. Thay thế các ký tự đặc biệt và khoảng trắng bằng dấu gạch ngang
  str = str.replace(/[^a-z0-9]+/g, '-');
  // 4. Loại bỏ các dấu gạch ngang thừa
  str = str.replace(/^-+|-+$/g, '');
  return str;
};

const lectureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên bài giảng là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tên bài giảng không được quá 200 ký tự']
  },
  // <<<< THÊM TRƯỜNG SLUG Ở ĐÂY >>>>
  slug: {
    type: String,
    unique: true,
    index: true,
    required: [true, 'Slug là bắt buộc cho bài giảng']
  },
  // <<<< KẾT THÚC THAY ĐỔI TRƯỜNG SLUG >>>>
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
  imagePublicId: {
    type: String,
    required: false
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

// Middleware (pre-save hook) để tự động tạo hoặc cập nhật slug
lectureSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = customSlugify(this.name);
  }
  next();
});

export default mongoose.model('Lecture', lectureSchema);