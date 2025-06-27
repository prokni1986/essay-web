// backend/models/UserSubmission.js
import mongoose from 'mongoose';

const UserAnswerDetailSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  userAnswer: {
    type: String,
    required: false,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [{ id: String, text: String, imageUrl: String }],
    required: true,
  },
  explanation: {
    type: String,
    required: false,
  },
  questionNumber: { // Thêm trường này nếu chưa có
    type: Number,
    required: true,
  }
}, { _id: false });

const UserSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interactiveExamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InteractiveExam',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 0,
  },
  userAnswers: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  details: {
    type: [UserAnswerDetailSchema],
    default: [],
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});


const UserSubmission = mongoose.model('UserSubmission', UserSubmissionSchema);
export default UserSubmission;