// src/pages/QuizPage.tsx
import React, { useState, useEffect } from 'react';
import QuizList from '@/components/quiz/QuizList';
import QuizTaker from '@/components/quiz/QuizTaker';
import QuizResults from '@/components/quiz/QuizResults';
import { useAuth } from '@/hooks/useAuth'; // <-- Đảm bảo đúng đường dẫn useAuth
import { cn } from '@/utils';

const QuizPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'list' | 'taker' | 'results'>('list');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    // Tải danh sách quiz khi component mount hoặc khi auth thay đổi
    // Mặc định luôn hiển thị danh sách quiz
    setCurrentView('list');
  }, [isAuthenticated, authLoading]); // Phụ thuộc vào isAuthenticated và authLoading để phản ứng với trạng thái đăng nhập

  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
    setCurrentView('taker');
  };

  const handleExamSubmitted = (subId: string) => {
    setSubmissionId(subId);
    setCurrentView('results');
  };

  const handleBackToList = () => {
    setSelectedExamId(null);
    setSubmissionId(null);
    setCurrentView('list');
  };

  if (authLoading) {
    return <div className={cn("text-center p-4 text-gray-700")}>Đang kiểm tra xác thực...</div>;
  }

  return (
    <div className={cn("quiz-page-container p-4")}>
      <h1 className={cn("text-3xl font-bold mb-6 text-center text-blue-800")}>Mục Đề Thi Trắc Nghiệm Trực Tuyến</h1>

      {currentView === 'list' && (
        <QuizList onSelectExam={handleSelectExam} />
      )}

      {currentView === 'taker' && selectedExamId && (
        <QuizTaker
          examId={selectedExamId}
          onExamSubmitted={handleExamSubmitted}
          onBackToList={handleBackToList}
        />
      )}

      {currentView === 'results' && submissionId && (
        <QuizResults
          submissionId={submissionId}
          onDoAnotherExam={handleBackToList}
        />
      )}
    </div>
  );
};

export default QuizPage;