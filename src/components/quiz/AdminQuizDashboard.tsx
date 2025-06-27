// src/components/quiz/AdminQuizDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { QuizAPI } from './QuizAPI'; // QuizAPI vẫn ở cùng cấp
import { InteractiveExam, Question } from '@/types';
import AdminExamForm from '@/components/quiz/AdminExamForm'; // <-- SỬA ĐƯỜNG DẪN TẠI ĐÂY
import AdminQuestionForm from '@/components/quiz/AdminQuestionForm'; // <-- SỬA ĐƯỜNG DẪN TẠI ĐÂY
import AdminExamUploadForm from '@/components/quiz/AdminExamUploadForm'; // <-- SỬA ĐƯỜNG DẪN TẠI ĐÂY
import { cn } from '@/utils';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';

const AdminQuizDashboard: React.FC = () => {
  const [exams, setExams] = useState<InteractiveExam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditExamModalOpen, setIsEditExamModalOpen] = useState<boolean>(false);
  const [currentExamToEdit, setCurrentExamToEdit] = useState<InteractiveExam | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [currentQuestionToEdit, setCurrentQuestionToEdit] = useState<Question | null>(null);
  const [questionModalMode, setQuestionModalMode] = useState<'add' | 'edit'>('add');
  const [activeExamIdForQuestion, setActiveExamIdForQuestion] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);


  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await QuizAPI.getAllInteractiveExamsAdmin();
      setExams(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleCreateExamSuccess = () => {
    fetchExams();
    setShowCreateForm(false);
  };

  const handleUploadExamSuccess = () => {
    fetchExams();
    setShowUploadForm(false);
  };

  // --- Exam Actions ---
  const handleEditExam = useCallback(async (examId: string) => {
    try {
      const exam = await QuizAPI.getInteractiveExamDetails(examId);
      setCurrentExamToEdit(exam);
      const questions = await QuizAPI.getQuestionsByInteractiveExamId(examId);
      setExamQuestions(questions || []);
      setIsEditExamModalOpen(true);
      setActiveExamIdForQuestion(examId);
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            const apiError = err as AxiosError<{ message?: string }>;
            toast.error(`Lỗi khi tải đề thi để sửa: ${apiError.response?.data?.message || apiError.message}`);
        } else if (err instanceof Error) {
            toast.error(`Lỗi khi tải đề thi để sửa: ${err.message}`);
        } else {
            toast.error('Đã xảy ra lỗi không xác định khi tải đề thi.');
        }
    }
  }, []);

  const handleDeleteExam = useCallback(async (examId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đề thi này và TẤT CẢ câu hỏi, bài làm liên quan?")) {
      try {
        await QuizAPI.deleteInteractiveExam(examId);
        fetchExams();
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            const apiError = err as AxiosError<{ message?: string }>;
            toast.error(`Lỗi khi xóa đề thi: ${apiError.response?.data?.message || apiError.message}`);
        } else if (err instanceof Error) {
            toast.error(`Lỗi khi xóa đề thi: ${err.message}`);
        } else {
            toast.error('Đã xảy ra lỗi không xác định khi xóa đề thi.');
        }
      }
    }
  }, [fetchExams]);

  const handlePublishExam = useCallback(async (examId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn CÔNG BỐ đề thi này? Học sinh sẽ thấy và có thể làm bài.")) {
      try {
        await QuizAPI.updateInteractiveExam(examId, { status: 'published' });
        fetchExams();
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            const apiError = err as AxiosError<{ message?: string }>;
            toast.error(`Lỗi khi công bố đề thi: ${apiError.response?.data?.message || apiError.message}`);
        } else if (err instanceof Error) {
            toast.error(`Lỗi khi công bố đề thi: ${err.message}`);
        } else {
            toast.error('Đã xảy ra lỗi không xác định khi công bố đề thi.');
        }
      }
    }
  }, [fetchExams]);

  const handleDraftExam = useCallback(async (examId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn CHUYỂN NHÁP đề thi này? Học sinh sẽ không còn thấy đề thi.")) {
      try {
        await QuizAPI.updateInteractiveExam(examId, { status: 'draft' });
        fetchExams();
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            const apiError = err as AxiosError<{ message?: string }>;
            toast.error(`Lỗi khi chuyển nháp đề thi: ${apiError.response?.data?.message || apiError.message}`);
        } else if (err instanceof Error) {
            toast.error(`Lỗi khi chuyển nháp đề thi: ${err.message}`);
        } else {
            toast.error('Đã xảy ra lỗi không xác định khi chuyển nháp đề thi.');
        }
      }
    }
  }, [fetchExams]);


  // --- Question Actions (trong modal sửa đề thi) ---
  const handleAddQuestion = useCallback(() => {
    setQuestionModalMode('add');
    setCurrentQuestionToEdit(null);
    setIsQuestionModalOpen(true);
  }, []);

  const handleEditQuestion = useCallback(async (questionId: string) => {
    try {
        const question = examQuestions.find(q => q._id === questionId);
        if (question) {
            setCurrentQuestionToEdit(question);
            setQuestionModalMode('edit');
            setIsQuestionModalOpen(true);
        } else {
            toast.error("Không tìm thấy câu hỏi trong danh sách hiện tại.");
        }
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            const apiError = err as AxiosError<{ message?: string }>;
            toast.error(`Lỗi khi tải câu hỏi để sửa: ${apiError.response?.data?.message || apiError.message}`);
        } else if (err instanceof Error) {
            toast.error(`Lỗi khi tải câu hỏi để sửa: ${err.message}`);
        } else {
            toast.error('Đã xảy ra lỗi không xác định khi tải câu hỏi.');
        }
    }
  }, [examQuestions]);

  const handleDeleteQuestion = useCallback(async (questionId: string) => {
    if (!activeExamIdForQuestion || !window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    try {
      await QuizAPI.deleteQuestion(questionId);
      setExamQuestions(prev => prev.filter(q => q._id !== questionId));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
            const apiError = err as AxiosError<{ message?: string }>;
            toast.error(`Lỗi khi xóa câu hỏi: ${apiError.response?.data?.message || apiError.message}`);
        } else if (err instanceof Error) {
            toast.error(`Lỗi khi xóa câu hỏi: ${err.message}`);
        } else {
            toast.error('Đã xảy ra lỗi không xác định khi xóa câu hỏi.');
        }
    }
  }, [activeExamIdForQuestion]);

  const handleQuestionSaveSuccess = useCallback(async () => {
    if (activeExamIdForQuestion) {
      const updatedQuestions = await QuizAPI.getQuestionsByInteractiveExamId(activeExamIdForQuestion);
      setExamQuestions(updatedQuestions.sort((a,b) => a.questionNumber - b.questionNumber));
    }
    setIsQuestionModalOpen(false);
  }, [activeExamIdForQuestion]);


  if (loading) {
    return <div className={cn("text-center p-4 text-gray-700")}>Đang tải bảng điều khiển admin...</div>;
  }

  if (error) {
    return <div className={cn("text-center p-4 text-red-500")}>Lỗi: {error}</div>;
  }

  return (
    <div className={cn("admin-container bg-yellow-50 p-6 rounded-lg shadow-md")}>
      <h2 className={cn("text-2xl font-bold mb-6 text-orange-700 text-center")}>Quản trị Đề Thi Trắc Nghiệm</h2>

      <div className={cn("flex space-x-4 mb-6")}>
        <button
          onClick={() => { setShowCreateForm(true); setShowUploadForm(false); }}
          className={cn("px-4 py-2 bg-green-600 text-white rounded-md", "hover:bg-green-700 transition duration-200")}
        >
          Tạo Đề Mới
        </button>
        <button
          onClick={() => { setShowUploadForm(true); setShowCreateForm(false); }}
          className={cn("px-4 py-2 bg-purple-600 text-white rounded-md", "hover:bg-purple-700 transition duration-200")}
        >
          Upload JSON
        </button>
      </div>

      {showCreateForm && (
        <AdminExamForm
          exam={null}
          onSaveSuccess={handleCreateExamSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {showUploadForm && (
        <AdminExamUploadForm
          onUploadSuccess={handleUploadExamSuccess}
          onCancel={() => setShowUploadForm(false)}
        />
      )}

      <h3 className={cn("text-xl font-semibold mb-4 mt-6")}>Các Đề Thi Trắc Nghiệm Hiện Có</h3>
      <div id="admin-interactive-exam-list" className={cn("space-y-4")}>
        {exams.length === 0 ? (
          <p className={cn("text-center text-gray-600")}>Chưa có đề thi trắc nghiệm nào.</p>
        ) : (
          exams.map(exam => (
            <div key={exam._id} className={cn(
              "p-4 border rounded-md shadow-sm",
              exam.status === 'published' ? 'bg-green-50' : 'bg-gray-50'
            )}>
              <h4 className={cn("text-lg font-semibold")}>{exam.title} ({exam.status === 'published' ? 'Đã công bố' : 'Nháp'})</h4>
              <p className={cn("text-sm text-gray-600")}>Môn: {exam.subject} | Thời gian: {exam.duration} phút</p>
              <p className={cn("text-xs text-gray-500")}>ID: {exam._id}</p>
              <div className={cn("mt-2 flex space-x-2")}>
                <button
                  onClick={() => handleEditExam(exam._id)}
                  className={cn("px-3 py-1 bg-yellow-500 text-white rounded-md text-sm", "hover:bg-yellow-600")}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteExam(exam._id)}
                  className={cn("px-3 py-1 bg-red-500 text-white rounded-md text-sm", "hover:bg-red-600")}
                >
                  Xóa
                </button>
                {exam.status === 'draft' ? (
                  <button
                    onClick={() => handlePublishExam(exam._id)}
                    className={cn("px-3 py-1 bg-green-500 text-white rounded-md text-sm", "hover:bg-green-600")}
                  >
                    Công bố
                  </button>
                ) : (
                  <button
                    onClick={() => handleDraftExam(exam._id)}
                    className={cn("px-3 py-1 bg-gray-500 text-white rounded-md text-sm", "hover:bg-gray-600")}
                  >
                    Chuyển nháp
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal sửa đề thi */}
      {isEditExamModalOpen && currentExamToEdit && (
        <div className={cn("fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50")}>
          <div className={cn("bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl relative")}>
            <button
              className={cn("absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl font-bold")}
              onClick={() => setIsEditExamModalOpen(false)}
            >
              &times;
            </button>
            <AdminExamForm
              exam={currentExamToEdit}
              onSaveSuccess={() => {
                setIsEditExamModalOpen(false);
                fetchExams();
              }}
              onCancel={() => setIsEditExamModalOpen(false)}
            />

            <h4 className={cn("text-xl font-bold mt-6 mb-4")}>Quản lý Câu Hỏi</h4>
            <button
              onClick={handleAddQuestion}
              className={cn("px-4 py-2 bg-green-600 text-white rounded-md", "hover:bg-green-700 transition duration-200 mb-4")}
            >
              Thêm Câu Hỏi Mới
            </button>

            <div id="questions-management-container" className={cn("space-y-4")}>
              {examQuestions.length === 0 ? (
                <p className={cn("text-gray-600")}>Chưa có câu hỏi nào cho đề thi này.</p>
              ) : (
                examQuestions.map(q => (
                  <div key={q._id} className={cn("p-3 border rounded-md bg-white shadow-sm flex justify-between items-center")}>
                    <p className={cn("text-md font-medium")}>Câu {q.questionNumber}: {q.questionText.substring(0, 50)}...</p>
                    <div className={cn("flex space-x-2")}>
                      <button
                        onClick={() => handleEditQuestion(q._id)}
                        className={cn("px-3 py-1 bg-yellow-500 text-white rounded-md text-sm", "hover:bg-yellow-600")}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className={cn("px-3 py-1 bg-red-500 text-white rounded-md text-sm", "hover:bg-red-600")}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa Câu Hỏi */}
      {isQuestionModalOpen && activeExamIdForQuestion && (
        <div className={cn("fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50")}>
          <div className={cn("bg-white rounded-lg p-6 w-full max-w-xl shadow-xl relative")}>
            <button
              className={cn("absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl font-bold")}
              onClick={() => setIsQuestionModalOpen(false)}
            >
              &times;
            </button>
            <AdminQuestionForm
              mode={questionModalMode}
              examId={activeExamIdForQuestion}
              question={currentQuestionToEdit}
              onSaveSuccess={handleQuestionSaveSuccess}
              onCancel={() => setIsQuestionModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizDashboard;
