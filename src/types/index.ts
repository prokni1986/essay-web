// src/types/index.ts

// Định nghĩa cho Option của câu hỏi
export interface Option {
    id: string; // Ví dụ: 'A', 'B', 'C', 'D' hoặc '1', '2', '3', '4'
    text: string; // Nội dung văn bản của lựa chọn
    imageUrl?: string; // URL hình ảnh (tùy chọn)
  }
  
  // Định nghĩa cho một câu hỏi
  export interface Question {
    _id: string; // ID của MongoDB
    interactiveExamId: string; // ID của đề thi trắc nghiệm mà câu hỏi này thuộc về
    questionText: string; // Nội dung câu hỏi
    questionNumber: number; // Số thứ tự câu hỏi trong đề
    questionImageUrl?: string; // URL hình ảnh của câu hỏi (tùy chọn)
    options: Option[]; // Mảng các lựa chọn
    correctAnswer: string; // ID của lựa chọn đúng
    explanation?: string; // Giải thích đáp án (tùy chọn)
    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
  }
  
  // Định nghĩa cho đề thi trắc nghiệm tương tác
  export interface InteractiveExam {
    _id: string; // ID của MongoDB
    title: string; // Tiêu đề đề thi
    description?: string; // Mô tả đề thi
    subject: string; // Môn học
    year?: number; // Năm của đề thi
    province?: string; // Tỉnh/thành phố
    thumbnailUrl?: string; // URL ảnh thumbnail
    type?: 'Chính thức' | 'Thi thử' | 'Đề ôn tập' | 'Đề thi chuyên' | 'Đề chuyên đề'; // Loại đề thi
    duration: number; // Thời gian làm bài (phút)
    difficulty?: 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó'; // Độ khó
    grade?: number; // Lớp
    status: 'draft' | 'published'; // Trạng thái
    topic?: string; // ID của Topic (nếu có liên kết)
    createdAt: string;
    updatedAt: string;
    questions?: Question[]; // Các câu hỏi, chỉ có khi fetch chi tiết
  }
  
  // Định nghĩa chi tiết cho từng câu trả lời trong bài nộp
  // Định nghĩa chi tiết cho từng câu trả lời trong bài nộp
export interface UserAnswerDetail {
  questionId: string; // ID của câu hỏi
  userAnswer: string | null; // ID lựa chọn của người dùng (null nếu không trả lời)
  correctAnswer: string; // ID lựa chọn đúng
  isCorrect: boolean; // Đúng hay sai
  questionText: string; // Nội dung câu hỏi (để hiển thị nhanh)
  options: Option[]; // Các lựa chọn của câu hỏi (để hiển thị nhanh)
  explanation?: string; // Giải thích đáp án (để hiển thị nhanh)
  questionNumber: number; // <-- THÊM DÒNG NÀY ĐỂ KHẮC PHỤC LỖI
}
  
  // Định nghĩa cho bài nộp của người dùng
  export interface UserSubmission {
    _id: string; // ID của MongoDB
    userId: string; // ID của người dùng
    interactiveExamId: string; // ID của đề thi trắc nghiệm đã làm
    score: number; // Điểm số
    totalQuestions: number; // Tổng số câu hỏi
    userAnswers: { [key: string]: string | null }; // Map các câu trả lời {questionId: selectedOptionId}
    details: UserAnswerDetail[]; // Chi tiết từng câu
    submittedAt: string; // Thời gian nộp bài
    createdAt: string;
    updatedAt: string;
  }
  
  // Định nghĩa cho User Profile từ backend (sau khi xác thực Firebase Auth và lấy profile từ MongoDB)
  export interface BackendUser {
    _id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
  }