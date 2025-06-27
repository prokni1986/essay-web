// backend/models/InteractiveExam.js
import mongoose from 'mongoose';

const InteractiveExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Tiêu đề đề thi trắc nghiệm là bắt buộc."],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    required: false,
  },
  subject: { // Môn học (ví dụ: "Toán", "Tiếng Anh")
    type: String,
    required: [true, "Môn học là bắt buộc."],
    trim: true,
  },
  year: { // Năm của đề thi (ví dụ: 2024)
    type: Number,
    required: false,
  },
  province: { // Tỉnh/thành phố của đề thi
    type: String,
    trim: true,
    required: false,
  },
  thumbnailUrl: { // URL ảnh đại diện cho đề thi trắc nghiệm
    type: String,
    required: false,
  },
  type: { // Loại đề thi: Chính thức / Thi thử / Đề ôn tập / Đề thi chuyên
    type: String,
    enum: ['Chính thức', 'Thi thử', 'Đề ôn tập', 'Đề thi chuyên', 'Đề chuyên đề'],
    default: 'Thi thử', // Mặc định là thi thử cho đề tương tác
    required: false,
  },
  duration: { // Thời gian làm bài (phút)
    type: Number,
    required: [true, "Thời gian làm bài là bắt buộc."],
    min: [1, "Thời gian làm bài phải lớn hơn 0 phút."],
  },
  difficulty: { // Độ khó của đề thi
    type: String,
    enum: ['Dễ', 'Trung bình', 'Khó', 'Rất khó'],
    default: 'Trung bình',
    required: false,
  },
  grade: { // Lớp áp dụng cho đề thi
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    required: false,
  },
  status: { // Trạng thái: 'draft' (nháp), 'published' (đã công bố)
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  // Có thể thêm liên kết tới Topic nếu muốn phân loại sâu hơn
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: false,
  },
  // Số lượng câu hỏi có thể được tính toán động, hoặc lưu trữ để truy xuất nhanh
  // questionCount: { type: Number, default: 0 } // Sẽ cập nhật khi thêm/xóa câu hỏi
}, {
  timestamps: true,
});

const InteractiveExam = mongoose.model('InteractiveExam', InteractiveExamSchema);
export default InteractiveExam;