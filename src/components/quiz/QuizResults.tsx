// src/components/quiz/QuizResults.tsx
import React, { useState, useEffect } from 'react';
import { QuizAPI } from './QuizAPI';
import { UserSubmission, UserAnswerDetail } from '@/types';
import { cn } from '@/utils';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

// Không cần renderMathInText ở đây nếu bạn đã quyết định loại bỏ việc render công thức
// và chỉ hiển thị text thô. Nếu bạn có ý định dùng lại, hãy import từ utils/mathUtils
// và đảm bảo mathUtils.ts không có lỗi.
// Không cần BlockMath, InlineMath nếu không dùng trực tiếp ở đây
// Không cần import 'katex/dist/katex.min.css'; nếu nó đã được import ở App.tsx/index.tsx

interface QuizResultsProps {
  submissionId: string;
  onDoAnotherExam: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ submissionId, onDoAnotherExam }) => {
  const [submission, setSubmission] = useState<UserSubmission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await QuizAPI.getSubmissionResults(submissionId);
        setSubmission(data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const apiError = err as AxiosError<{ message?: string }>;
          setError(apiError.response?.data?.message || apiError.message);
          toast.error(apiError.response?.data?.message || 'Không thể tải kết quả bài làm.');
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
    fetchResults();
  }, [submissionId]);

  if (loading) {
    return <div className={cn("text-center p-4 text-gray-700")}>Đang tải kết quả...</div>;
  }

  if (error) {
    return <div className={cn("text-center p-4 text-red-500")}>Lỗi: {error}</div>;
  }

  if (!submission) {
    return <div className={cn("text-center p-4 text-gray-700")}>Không tìm thấy kết quả bài làm.</div>;
  }

  return (
    <div className={cn("p-6 border rounded-lg shadow-md bg-white")}>
      <h3 className={cn("text-2xl font-semibold mb-4 text-green-700")}>Kết quả bài làm</h3>
      <p className={cn("text-xl font-bold mb-4 text-gray-800")}>
        Bạn đã đạt được: <span className={cn("text-blue-600")}>{submission.score}</span> / <span className={cn("text-gray-500")}>{submission.totalQuestions}</span> điểm
      </p>

      <div className={cn("space-y-4")}>
        {submission.details
            .sort((a, b) => a.questionNumber - b.questionNumber) // Sắp xếp theo questionNumber
            .map((detail, index) => (
          <div
            key={detail.questionId}
            className={cn(
              "p-4 border rounded-md",
              detail.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            )}
          >
            <p className={cn("font-semibold mb-2")}>
                Câu {detail.questionNumber}: {detail.questionText} {/* Sử dụng text thô */}
            </p>

            
            {detail.options.map(option => {
                const isUserAnswer = option.id === detail.userAnswer;
                const isCorrectAnswer = option.id === detail.correctAnswer;
                const isWrongAnswer = isUserAnswer && !detail.isCorrect;

                return (
                  <p
                    key={option.id}
                    className={cn(
                      "ml-4",
                      isUserAnswer && detail.isCorrect && "text-green-600 font-medium",
                      isWrongAnswer && "text-red-600 font-medium",
                      isCorrectAnswer && !isUserAnswer && "text-green-700 font-bold",
                      !isUserAnswer && !isCorrectAnswer && "text-gray-700"
                    )}
                  >
                    {option.id}. {option.text}
                    {option.imageUrl && (
                      <img
                        src={option.imageUrl}
                        alt="Hình ảnh lựa chọn"
                        className={cn("inline-block ml-2 max-h-16 rounded-sm")}
                      />
                    )}
                    {isCorrectAnswer && !detail.isCorrect && (
                      <span className="ml-2 text-green-700 text-sm">(Đáp án đúng)</span>
                    )}
                  </p>
                );
              })}
          </div>
        ))}
      </div>

      <button
        onClick={onDoAnotherExam}
        className={cn(
          "mt-8 px-6 py-3 bg-blue-600 text-white rounded-md",
          "hover:bg-blue-700 transition duration-200"
        )}
      >
        Làm đề khác
      </button>
    </div>
  );
};

export default QuizResults;