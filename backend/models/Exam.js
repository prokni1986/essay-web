import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
  title: { // Ví dụ: "Đề thi tuyển sinh lớp 10 môn Toán - Thái Bình 2025"
    type: String,
    required: [true, "Tiêu đề đề thi là bắt buộc."],
  },
  description: { // Mô tả ngắn gọn
    type: String,
    required: false,
  },
  htmlContent: { // Trường để lưu toàn bộ HTML của đề thi và lời giải
    type: String,
    required: [true, "Nội dung HTML là bắt buộc."],
  },
  subject: { // Ví dụ: "Toán", "Ngữ Văn", "Tiếng Anh"
    type: String,
    required: true,
  },
  year: { // Ví dụ: 2025
    type: Number,
    required: true,
  },
  province: { // Ví dụ: "Thái Bình", "Hà Nội"
    type: String,
    required: false,
  },
  // Bạn vẫn có thể giữ lại topic nếu muốn phân loại chi tiết hơn
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: false,
  },
}, {
  timestamps: true,
});

const Exam = mongoose.model('Exam', ExamSchema);
export default Exam;