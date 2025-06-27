// src/components/quiz/QuizList.tsx
import React, { useState, useEffect } from 'react';
import { QuizAPI } from './QuizAPI';
import { InteractiveExam } from '@/types';
import { cn } from '@/utils';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

// Không cần import KaTeX hay renderMathInText ở đây nếu QuizList chỉ hiển thị tiêu đề/mô tả

interface QuizListProps {
  onSelectExam: (examId: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({ onSelectExam }) => {
  const [exams, setExams] = useState<InteractiveExam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await QuizAPI.getInteractiveExams();
        setExams(data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const apiError = err as AxiosError<{ message?: string }>;
          setError(apiError.response?.data?.message || apiError.message);
          toast.error(apiError.response?.data?.message || 'Lỗi khi tải danh sách đề thi.');
        } else if (err instanceof Error) {
          setError(err.message);
          toast.error(err.message || 'Lỗi không xác định.');
        } else {
          setError('Đã xảy ra lỗi không xác định.');
          toast.error('Đã xảy ra lỗi không xác định.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return <div className={cn("text-center p-4 text-gray-700")}>Đang tải đề thi...</div>;
  }

  if (error) {
    return <div className={cn("text-center p-4 text-red-500")}>Lỗi: {error}</div>;
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6")}>
      {exams.length === 0 ? (
        <p className={cn("col-span-full text-center text-gray-600")}>Hiện chưa có đề thi trắc nghiệm nào được công bố.</p>
      ) : (
        exams.map((exam) => (
          <div
            key={exam._id}
            className={cn(
              "bg-white border border-gray-200 rounded-lg p-6 shadow-md cursor-pointer",
              "hover:shadow-lg transition-shadow duration-200"
            )}
            onClick={() => onSelectExam(exam._id)}
          >
            <h3 className={cn("text-xl font-semibold text-blue-700 mb-2")}>{exam.title}</h3>
            <p className={cn("text-gray-600 text-sm mb-3")}>Môn: {exam.subject} | Thời gian: {exam.duration} phút</p>
            <p className={cn("text-gray-700 text-sm")}>{exam.description || 'Không có mô tả.'}</p>
            <button className={cn(
              "mt-4 px-4 py-2 bg-blue-500 text-white rounded-md",
              "hover:bg-blue-600 transition duration-200"
            )}>
              Làm bài
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default QuizList;