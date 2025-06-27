// src/components/quiz/QuizTaker.tsx
import React, { useState, useEffect } from 'react';
import { QuizAPI } from './QuizAPI';
import { InteractiveExam, Question } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

// KHÔNG CẦN THÊM: import { renderMathInText } from '@/utils/mathUtils';
// KHÔNG CẦN THÊM: import 'katex/dist/katex.min.css';


interface QuizTakerProps {
  examId: string;
  onExamSubmitted: (submissionId: string) => void;
  onBackToList: () => void;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ examId, onExamSubmitted, onBackToList }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [exam, setExam] = useState<InteractiveExam | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string | null }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchExamDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await QuizAPI.getInteractiveExamDetails(examId);
        setExam(data);
        const initialAnswers: { [key: string]: string | null } = {};
        data.questions?.forEach(q => {
          initialAnswers[q._id] = null;
        });
        setUserAnswers(initialAnswers);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const apiError = err as AxiosError<{ message?: string }>;
          setError(apiError.response?.data?.message || apiError.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Đã xảy ra lỗi không xác định.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExamDetails();
  }, [examId]);

  const handleOptionChange = (questionId: string, optionId: string) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!exam || isSubmitting || authLoading) return;

    if (!isAuthenticated || !user) {
      toast.error("Bạn cần đăng nhập để nộp bài.");
      return;
    }

    const confirmed = window.confirm("Bạn có chắc chắn muốn nộp bài?");
    if (!confirmed) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const submissionResult = await QuizAPI.submitInteractiveExam(exam._id, userAnswers);
      onExamSubmitted(submissionResult.submissionId);
    }
     catch (err: unknown) {
      if (axios.isAxiosError(err)) {
            const apiError = err as AxiosError<{ message?: string }>;
            setError(apiError.response?.data?.message || apiError.message);
            toast.error(`Đã xảy ra lỗi khi nộp bài: ${apiError.response?.data?.message || apiError.message}`);
        } else if (err instanceof Error) {
            setError(err.message);
            toast.error(`Đã xảy ra lỗi khi nộp bài: ${err.message}`);
        } else {
            setError('Đã xảy ra lỗi không xác định khi nộp bài.');
            toast.error('Đã xảy ra lỗi không xác định khi nộp bài.');
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return <div className={cn("text-center p-4 text-gray-700")}>Đang tải đề thi...</div>;
  }

  if (error) {
    return <div className={cn("text-center p-4 text-red-500")}>Lỗi: {error}</div>;
  }

  if (!exam) {
    return <div className={cn("text-center p-4 text-gray-700")}>Không tìm thấy đề thi.</div>;
  }

  return (
    <div className={cn("p-6 border rounded-lg shadow-md bg-white")}>
      <h3 className={cn("text-2xl font-semibold mb-4 text-blue-700")}>{exam.title}</h3>
      <p className={cn("text-gray-600 mb-6")}>Thời gian làm bài: {exam.duration} phút</p>

      <div id="interactive-questions-container" className={cn("space-y-8")}>
        {exam.questions?.map((q, index) => (
          <div key={q._id} className={cn("mb-6 p-4 border rounded-md bg-gray-50")}>
            <p className={cn("font-semibold text-lg mb-3")}>
                Câu {q.questionNumber || (index + 1)}. {q.questionText} {/* THAY renderMathInText(q.questionText) BẰNG q.questionText */}
            </p>
            {q.questionImageUrl && (
              <img src={q.questionImageUrl} alt="Hình ảnh câu hỏi" className={cn("my-3 max-w-full h-auto rounded-md")} />
            )}
            <div className={cn("options-group space-y-2")}>
              {q.options.map(option => (
                <label key={option.id} className={cn("block cursor-pointer p-2 hover:bg-gray-100 rounded-md")}>
                  <input
                    type="radio"
                    name={`question-${q._id}`}
                    value={option.id}
                    className={cn("mr-2 accent-blue-500")}
                    checked={userAnswers[q._id] === option.id}
                    onChange={() => handleOptionChange(q._id, option.id)}
                  />
                  {option.text} {/* THAY renderMathInText(option.text) BẰNG option.text */}
                  {option.imageUrl && (
                    <img src={option.imageUrl} alt="Hình ảnh lựa chọn" className={cn("inline-block ml-2 max-h-16 rounded-sm")} />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={cn("mt-8 flex justify-end space-x-4")}>
        <button
          onClick={handleSubmit}
          className={cn(
            "px-6 py-3 bg-blue-600 text-white rounded-md transition duration-200",
            isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          )}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
        </button>
        <button
          onClick={onBackToList}
          className={cn(
            "px-6 py-3 bg-gray-400 text-white rounded-md",
            "hover:bg-gray-500 transition duration-200"
          )}
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default QuizTaker;