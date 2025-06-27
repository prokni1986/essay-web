// src/types/models.ts
export interface Option {
    id: string;
    text: string;
    imageUrl?: string;
  }
  
  export interface Question {
    _id: string;
    interactiveExamId: string;
    questionText: string;
    questionNumber: number;
    questionImageUrl?: string;
    options: Option[];
    correctAnswer: string;
    explanation?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface InteractiveExam {
    _id: string;
    title: string;
    description?: string;
    subject: string;
    year?: number;
    province?: string;
    thumbnailUrl?: string;
    type?: 'Chính thức' | 'Thi thử' | 'Đề ôn tập' | 'Đề thi chuyên' | 'Đề chuyên đề';
    duration: number;
    difficulty?: 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';
    grade?: number;
    status: 'draft' | 'published';
    topic?: string; // ObjectId as string
    createdAt: string;
    updatedAt: string;
    questions?: Question[]; // Khi fetch chi tiết
  }
  
  export interface UserAnswerDetail {
    questionId: string;
    userAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    questionText: string;
    options: Option[];
    explanation?: string;
  }
  
  export interface UserSubmission {
    _id: string;
    userId: string;
    interactiveExamId: string;
    score: number;
    totalQuestions: number;
    userAnswers: { [key: string]: string | null };
    details: UserAnswerDetail[];
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Nếu bạn có AuthUser từ backend
  export interface AuthUser {
    _id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    token: string;
  }