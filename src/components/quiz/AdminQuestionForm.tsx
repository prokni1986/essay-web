// src/components/quiz/AdminQuestionForm.tsx
import React, { useState, useEffect } from 'react';
import { QuizAPI } from './QuizAPI';
import { Question, Option } from '@/types';
import { cn } from '@/utils';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';

// KHÔNG CẦN THÊM: import { renderMathInText } from '@/utils/mathUtils';
// KHÔNG CẦN THÊM: import 'katex/dist/katex.min.css';


interface AdminQuestionFormProps {
  mode: 'add' | 'edit';
  examId: string;
  question: Question | null;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

const AdminQuestionForm: React.FC<AdminQuestionFormProps> = ({ mode, examId, question, onSaveSuccess, onCancel }) => {
  const [questionNumber, setQuestionNumber] = useState(question?.questionNumber || 1);
  const [questionText, setQuestionText] = useState(question?.questionText || '');
  const [questionImageUrl, setQuestionImageUrl] = useState(question?.questionImageUrl || '');
  const [options, setOptions] = useState<Option[]>(question?.options || [{ id: 'A', text: '' }, { id: 'B', text: '' }]);
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || '');
  const [explanation, setExplanation] = useState(question?.explanation || '');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (mode === 'edit' && question) {
      setQuestionNumber(question.questionNumber);
      setQuestionText(question.questionText);
      setQuestionImageUrl(question.questionImageUrl || '');
      setOptions(question.options);
      setCorrectAnswer(question.correctAnswer);
      setExplanation(question.explanation || '');
    } else {
      setQuestionNumber(1);
      setQuestionText('');
      setQuestionImageUrl('');
      setOptions([{ id: 'A', text: '' }, { id: 'B', text: '' }]);
      setCorrectAnswer('');
      setExplanation('');
    }
    setMessage(null);
    setIsError(false);
  }, [mode, question]);

  const handleOptionChange = (index: number, field: keyof Option, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const addOption = () => {
    const nextId = String.fromCharCode(65 + options.length);
    setOptions([...options, { id: nextId, text: '' }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);
    setIsSaving(true);

    if (!questionText || questionNumber <= 0 || options.length < 2 || !correctAnswer) {
      setMessage('Vui lòng điền đủ nội dung câu hỏi, số thứ tự (phải > 0), ít nhất 2 lựa chọn và đáp án đúng.');
      setIsError(true);
      setIsSaving(false);
      return;
    }
    if (!options.some(opt => opt.id === correctAnswer)) {
      setMessage('Đáp án đúng phải là một ID của lựa chọn đã nhập.');
      setIsError(true);
      setIsSaving(false);
      return;
    }

    const questionData: Omit<Question, '_id' | 'interactiveExamId' | 'createdAt' | 'updatedAt'> = {
      questionNumber,
      questionText,
      questionImageUrl: questionImageUrl || undefined,
      options: options.map(opt => ({ ...opt, imageUrl: opt.imageUrl || undefined })),
      correctAnswer,
      explanation: explanation || undefined,
    };

    try {
      if (mode === 'edit' && question) {
        await QuizAPI.updateQuestion(question._id, questionData);
        setMessage('Câu hỏi đã được cập nhật thành công!');
      } else {
        await QuizAPI.addQuestionToInteractiveExam(examId, questionData);
        setMessage('Câu hỏi đã được thêm thành công!');
        setQuestionNumber(1);
        setQuestionText('');
        setQuestionImageUrl('');
        setOptions([{ id: 'A', text: '' }, { id: 'B', text: '' }]);
        setCorrectAnswer('');
        setExplanation('');
      }
      setIsError(false);
      onSaveSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const apiError = err as AxiosError<{ message?: string }>;
        setMessage(`Lỗi: ${apiError.response?.data?.message || apiError.message}`);
      } else if (err instanceof Error) {
        setMessage(`Lỗi: ${err.message}`);
      } else {
        setMessage('Đã xảy ra lỗi không xác định.');
      }
      setIsError(true);
      toast.error(`Lỗi khi lưu câu hỏi: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("p-4 border border-gray-200 rounded-md bg-white")}>
      <h3 className={cn("text-xl font-semibold mb-3")}>{mode === 'edit' ? 'Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}</h3>

      <label className={cn("block mb-2 text-gray-700 text-sm")}>Số thứ tự câu hỏi:</label>
      <input
        type="number"
        className={cn("form-input mb-3")}
        value={questionNumber}
        onChange={(e) => setQuestionNumber(parseInt(e.target.value))}
        required
        min={1}
      />

      <label className={cn("block mb-2 text-gray-700 text-sm")}>Nội dung câu hỏi:</label>
      <textarea
        className={cn("form-textarea mb-3")}
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        required
      ></textarea>

      {/* KHÔNG CẦN THÊM: Xem trước LaTeX */}
      {/* {questionText && (
        <div className={cn("mb-3 p-3 border rounded-md bg-gray-50")}>
          <p className={cn("text-sm font-medium text-gray-700")}>Xem trước nội dung câu hỏi:</p>
          <div className={cn("mt-1 text-base")}>{renderMathInText(questionText)}</div>
        </div>
      )} */}

      <label className={cn("block mb-2 text-gray-700 text-sm")}>URL ảnh câu hỏi (tùy chọn):</label>
      <input
        type="text"
        className={cn("form-input mb-3")}
        value={questionImageUrl}
        onChange={(e) => setQuestionImageUrl(e.target.value)}
        placeholder="https://example.com/image.jpg"
      />

      <h4 className={cn("text-lg font-semibold mb-3")}>Các lựa chọn:</h4>
      <div className={cn("space-y-3 mb-4")}>
        {options.map((option, index) => (
          <div key={index} className={cn("flex items-center space-x-2")}>
            <input
              type="text"
              value={option.id}
              onChange={(e) => handleOptionChange(index, 'id', e.target.value)}
              placeholder="ID (ví dụ: A, B)"
              className={cn("w-24 p-2 border rounded text-sm")}
              required
            />
            <input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
              placeholder="Nội dung lựa chọn"
              className={cn("flex-grow p-2 border rounded text-sm")}
              required
            />
            <input
              type="text"
              value={option.imageUrl || ''}
              onChange={(e) => handleOptionChange(index, 'imageUrl', e.target.value)}
              placeholder="URL ảnh lựa chọn (tùy chọn)"
              className={cn("flex-grow p-2 border rounded text-sm")}
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              className={cn("px-3 py-1 bg-red-400 text-white rounded-md text-xs", "hover:bg-red-500")}
            >
              Xóa
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addOption}
        className={cn("px-3 py-1 bg-gray-400 text-white rounded-md", "hover:bg-gray-500 transition duration-200 text-sm mb-4")}
      >
        Thêm lựa chọn
      </button>

      <label className={cn("block mt-4 mb-2 text-gray-700 text-sm")}>Đáp án đúng (ID của lựa chọn, ví dụ: A):</label>
      <input
        type="text"
        className={cn("form-input mb-3")}
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(e.target.value)}
        placeholder="Ví dụ: A"
        required
      />

      <label className={cn("block mb-2 text-gray-700 text-sm")}>Giải thích đáp án (tùy chọn):</label>
      <textarea
        className={cn("form-textarea mb-4")}
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
      ></textarea>
      {/* KHÔNG CẦN THÊM: Xem trước LaTeX */}
      {/* {explanation && (
        <div className={cn("mb-3 p-3 border rounded-md bg-gray-50")}>
          <p className={cn("text-sm font-medium text-gray-700")}>Xem trước giải thích:</p>
          <div className={cn("mt-1 text-base")}>{renderMathInText(explanation)}</div>
        </div>
      )} */}

      <div className={cn("flex space-x-2")}>
        <button
          type="submit"
          className={cn(
            "px-5 py-2 bg-blue-600 text-white rounded-md transition duration-200",
            isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          )}
          disabled={isSaving}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu Câu Hỏi'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={cn("px-5 py-2 bg-gray-400 text-white rounded-md", "hover:bg-gray-500 transition duration-200")}
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

export default AdminQuestionForm;