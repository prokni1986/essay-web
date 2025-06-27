// backend/models/Question.js
import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: false,
  }
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  interactiveExamId: { // THAY ĐỔI: Liên kết với InteractiveExam
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InteractiveExam',
    required: true,
  },
  questionText: {
    type: String,
    required: [true, "Nội dung câu hỏi là bắt buộc."],
    trim: true,
  },
  questionNumber: { // Thứ tự câu hỏi trong đề thi (để hiển thị đúng)
    type: Number,
    required: [true, "Thứ tự câu hỏi là bắt buộc."],
    min: [1, "Thứ tự câu hỏi phải lớn hơn 0."],
  },
  questionImageUrl: {
    type: String,
    required: false,
  },
  options: {
    type: [OptionSchema],
    validate: {
      validator: function(v) {
        return v && v.length >= 2;
      },
      message: 'Một câu hỏi phải có ít nhất 2 lựa chọn.'
    },
    required: [true, "Lựa chọn cho câu hỏi là bắt buộc."],
  },
  correctAnswer: {
    type: String,
    required: [true, "Đáp án đúng là bắt buộc."],
    trim: true,
  },
  explanation: {
    type: String,
    required: false,
  },
  // Có thể thêm trường 'scoreValue' nếu mỗi câu có điểm khác nhau
  // scoreValue: { type: Number, default: 1 }
}, {
  timestamps: true,
});

// Đảm bảo thứ tự câu hỏi duy nhất trong cùng một InteractiveExam
QuestionSchema.index({ interactiveExamId: 1, questionNumber: 1 }, { unique: true });

const Question = mongoose.model('Question', QuestionSchema);
export default Question;