// src/components/quiz/AdminExamUploadForm.tsx
import React, { useState } from 'react';
import { QuizAPI } from './QuizAPI';
import { cn } from '@/utils';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';

// KHÔNG CẦN THÊM: import { renderMathInText } from '@/utils/mathUtils';
// KHÔNG CẦN THÊM: import 'katex/dist/katex.min.css';
// KHÔNG CẦN THÊM: import { Option as OptionType } from '@/types'; // Không cần nếu không render Math


interface AdminExamUploadFormProps {
  onUploadSuccess: () => void;
  onCancel: () => void;
}

const AdminExamUploadForm: React.FC<AdminExamUploadFormProps> = ({ onUploadSuccess, onCancel }) => {
  const [jsonContent, setJsonContent] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);
    setIsUploading(true);

    if (!jsonContent.trim()) {
      setMessage('Vui lòng dán nội dung JSON.');
      setIsError(true);
      setIsUploading(false);
      return;
    }

    try {
      const jsonData = JSON.parse(jsonContent);
      await QuizAPI.uploadInteractiveExamJson(jsonData);
      setMessage('Đề thi đã được upload thành công!');
      setIsError(false);
      setJsonContent('');
      onUploadSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const apiError = err as AxiosError<{ message?: string }>;
        setMessage(`Lỗi khi upload: ${apiError.response?.data?.message || apiError.message}`);
      } else if (err instanceof Error) {
        setMessage(`Lỗi khi upload: ${err.message}`);
      } else {
        setMessage('Đã xảy ra lỗi không xác định.');
      }
      setIsError(true);
    } finally {
      setIsUploading(false);
    }
  };

  const placeholderText = `{
  "examInfo": {
    "title": "Đề thi thử Toán 2024",
    "subject": "Toán",
    "duration": 90,
    "status": "draft"
  },
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "Căn bậc hai số học của số $$a$$ không âm là:",
      "options": [
        {"id": "A", "text": "$$\\sqrt{a}$$"},
        {"id": "B", "text": "$$\\pm\\sqrt{a}$$"}
      ],
      "correctAnswer": "A",
      "explanation": "Căn bậc hai số học của một số không âm $a$ là số $\\sqrt{a}$ không âm."
    }
  ]
}`;

  return (
    <form onSubmit={handleSubmit} className={cn("p-4 border border-gray-200 rounded-md bg-white mb-6")}>
      <h3 className={cn("text-xl font-semibold mb-3")}>Upload Đề Thi Trắc Nghiệm từ JSON</h3>
      <textarea
        placeholder={placeholderText}
        rows={15}
        className={cn("form-textarea font-mono text-sm mb-4")}
        value={jsonContent}
        onChange={(e) => setJsonContent(e.target.value)}
      ></textarea>
      
      {/* KHÔNG CẦN THÊM: Xem trước LaTeX */}
      {/* {jsonContent && (
        <div className={cn("mb-3 p-3 border rounded-md bg-gray-50")}>
          <p className={cn("text-sm font-medium text-gray-700")}>Xem trước nội dung JSON:</p>
          <div className={cn("mt-1 text-base")}>
            {(() => {
                try {
                    const parsed = JSON.parse(jsonContent);
                    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                        const firstQuestion = parsed.questions[0];
                        return (
                            <div>
                                <p className={cn("font-medium")}>Câu hỏi đầu tiên:</p>
                                <p><strong>{firstQuestion.questionText || ''}</strong></p>
                                {firstQuestion.options?.map((opt: OptionType) => (
                                    <p key={opt.id}>{opt.id}. {opt.text || ''}</p>
                                ))}
                            </div>
                        );
                    }
                    return <pre>{JSON.stringify(parsed, null, 2)}</pre>;
                } catch (e) {
                    return <p className={cn("text-red-500")}>JSON không hợp lệ.</p>;
                }
            })()}
          </div>
        </div>
      )} */}

      <div className={cn("flex space-x-2")}>
        <button
          type="submit"
          className={cn(
            "px-4 py-2 bg-blue-600 text-white rounded-md transition duration-200",
            isUploading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          )}
          disabled={isUploading}
        >
          {isUploading ? 'Đang tải lên...' : 'Upload JSON'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={cn("px-4 py-2 bg-gray-400 text-white rounded-md", "hover:bg-gray-500 transition duration-200")}
        >
          Hủy
        </button>
      </div>
      {message && (
        <p className={cn(`text-sm mt-2 ${isError ? 'text-red-600' : 'text-green-600'}`)}>{message}</p>
      )}
    </form>
  );
};

export default AdminExamUploadForm;