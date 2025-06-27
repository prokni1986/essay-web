// src/components/quiz/AdminExamForm.tsx
import React, { useState, useEffect } from 'react';
import { QuizAPI } from './QuizAPI';
import { InteractiveExam } from '@/types'; // SỬA LỖI: Import InteractiveExam từ '@/types'
import { cn } from '@/utils';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios'; // SỬA LỖI: Thêm import cho 'axios'

interface AdminExamFormProps {
  exam: InteractiveExam | null;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

const AdminExamForm: React.FC<AdminExamFormProps> = ({ exam, onSaveSuccess, onCancel }) => {
  const [title, setTitle] = useState(exam?.title || '');
  const [subject, setSubject] = useState(exam?.subject || '');
  const [description, setDescription] = useState(exam?.description || '');
  const [duration, setDuration] = useState(exam?.duration || 60);
  const [status, setStatus] = useState(exam?.status || 'draft');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (exam) {
      setTitle(exam.title);
      setSubject(exam.subject);
      setDescription(exam.description || '');
      setDuration(exam.duration);
      setStatus(exam.status);
    } else {
      setTitle('');
      setSubject('');
      setDescription('');
      setDuration(60);
      setStatus('draft');
    }
    setMessage(null);
    setIsError(false);
  }, [exam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);
    setIsSaving(true);

    if (!title || !subject || duration <= 0) {
      setMessage('Vui lòng điền đủ Tiêu đề, Môn học và Thời gian (phút > 0).');
      setIsError(true);
      setIsSaving(false);
      return;
    }

    const examData: Partial<InteractiveExam> = {
      title,
      subject,
      description,
      duration,
      status,
    };

    try {
      if (exam) {
        await QuizAPI.updateInteractiveExam(exam._id, examData);
        setMessage('Đề thi đã được cập nhật thành công!');
      } else {
        await QuizAPI.createInteractiveExam(examData);
        setMessage('Đề thi đã được tạo thành công!');
        setTitle('');
        setSubject('');
        setDescription('');
        setDuration(60);
        setStatus('draft');
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
      // Không cần toast ở đây vì QuizAPI đã xử lý toast.error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("p-4 border border-gray-200 rounded-md bg-white mb-6")}>
      <h3 className={cn("text-xl font-semibold mb-3")}>{exam ? 'Sửa Đề Thi Trắc Nghiệm' : 'Tạo Đề Thi Trắc Nghiệm Mới'}</h3>
      <input
        type="text"
        placeholder="Tiêu đề"
        className={cn("form-input mb-2")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Môn học"
        className={cn("form-input mb-2")}
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />
      <textarea
        placeholder="Mô tả"
        className={cn("form-textarea mb-2")}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <input
        type="number"
        placeholder="Thời gian (phút)"
        className={cn("form-input mb-2")}
        value={duration}
        onChange={(e) => setDuration(parseInt(e.target.value))}
        required
        min={1}
      />
      <label className={cn("block mb-2 text-gray-700 text-sm")}>Trạng thái:</label>
      <select
        className={cn("form-select mb-4")}
        value={status}
        onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
      >
        <option value="draft">Nháp</option>
        <option value="published">Công bố</option>
      </select>
      <div className={cn("flex space-x-2")}>
        <button
          type="submit"
          className={cn(
            "px-4 py-2 bg-blue-600 text-white rounded-md transition duration-200",
            isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          )}
          disabled={isSaving}
        >
          {isSaving ? 'Đang lưu...' : (exam ? 'Cập nhật' : 'Tạo đề')}
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

export default AdminExamForm;