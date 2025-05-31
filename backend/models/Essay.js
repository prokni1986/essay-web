// file: models/Essay.js
import mongoose from 'mongoose';

const EssaySchema = new mongoose.Schema({
  title: { // Giữ nguyên
    type: String,
    required: true,
  },
  outline: { // THÊM MỚI: Dàn ý
    type: String,
    required: false, // Hoặc true nếu bắt buộc
  },
  content: { // Đổi tên thành Bài luận 1 (hoặc giữ nguyên nếu đây là bài chính)
    type: String,
    required: true,
  },
  essay2: { // THÊM MỚI: Bài luận 2
    type: String,
    required: false,
  },
  essay3: { // THÊM MỚI: Bài luận 3
    type: String,
    required: false,
  },
  audioFiles: { // Giữ nguyên
    type: [String],
    required: false, // Thay đổi nếu cần, backend cho phép 0 file
  },
  topic: { // Giữ nguyên
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: false,
  },
}, {
  timestamps: true,
});

const Essay = mongoose.model('Essay', EssaySchema);
export default Essay;