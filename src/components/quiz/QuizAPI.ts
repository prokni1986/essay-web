// src/components/quiz/QuizAPI.ts
import axios, { AxiosError } from 'axios';
import axiosInstance from '@/lib/axiosInstance';
import { InteractiveExam, Question, UserSubmission } from '@/types';
import { toast } from 'sonner';

interface SubmissionResult {
  submissionId: string;
  score: number;
  totalQuestions: number;
  message: string;
}

const getAuthToken = async (): Promise<string | null> => {
    return localStorage.getItem('authToken');
};

const handleAxiosError = (error: AxiosError) => {
    let errorMessage = 'Đã xảy ra lỗi không xác định.';
    if (error.response) {
        const responseData = error.response.data as { message?: string };
        if (responseData && responseData.message) {
            errorMessage = responseData.message;
        } else {
            errorMessage = `Lỗi từ server: ${error.response.status} ${error.response.statusText}`;
        }
    } else if (error.request) {
        errorMessage = 'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.';
    } else {
        errorMessage = `Lỗi khi gửi yêu cầu: ${error.message}`;
    }
    toast.error(errorMessage);
    throw new Error(errorMessage);
};

export const QuizAPI = {
  async getInteractiveExams(): Promise<InteractiveExam[]> {
    try {
      const response = await axiosInstance.get<InteractiveExam[]>('/api/interactive-exams');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi tải danh sách đề thi.');
      }
      throw error;
    }
  },

  async getInteractiveExamDetails(examId: string): Promise<InteractiveExam> {
    try {
      const response = await axiosInstance.get<InteractiveExam>(`/api/interactive-exams/${examId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi tải chi tiết đề thi.');
      }
      throw error;
    }
  },

  async submitInteractiveExam(
    interactiveExamId: string,
    userAnswers: { [questionId: string]: string | null }
  ): Promise<SubmissionResult> {
    try {
      const response = await axiosInstance.post<SubmissionResult>('/api/interactive-exams/submit', {
        interactiveExamId,
        userAnswers,
      });
      toast.success(response.data.message || 'Bài làm đã được nộp thành công!');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi nộp bài.');
      }
      throw error;
    }
  },

  async getSubmissionResults(submissionId: string): Promise<UserSubmission> {
    try {
      const response = await axiosInstance.get<UserSubmission>(`/api/interactive-exams/submissions/${submissionId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi tải kết quả bài làm.');
      }
      throw error;
    }
  },

  async getAllInteractiveExamsAdmin(): Promise<InteractiveExam[]> {
    try {
      const response = await axiosInstance.get<InteractiveExam[]>('/api/admin/interactive-exams');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi tải danh sách đề thi admin.');
      }
      throw error;
    }
  },

  async createInteractiveExam(examData: Partial<InteractiveExam>): Promise<InteractiveExam> {
    try {
      const response = await axiosInstance.post<InteractiveExam>('/api/admin/interactive-exams', examData);
      toast.success('Đề thi đã được tạo thành công!');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi tạo đề thi.');
      }
      throw error;
    }
  },

  async updateInteractiveExam(examId: string, examData: Partial<InteractiveExam>): Promise<InteractiveExam> {
    try {
      const response = await axiosInstance.put<InteractiveExam>(`/api/admin/interactive-exams/${examId}`, examData);
      toast.success('Đề thi đã được cập nhật thành công!');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi cập nhật đề thi.');
      }
      throw error;
    }
  },

  async deleteInteractiveExam(examId: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete<{ message: string }>(`/api/admin/interactive-exams/${examId}`);
      toast.success(response.data.message || 'Đề thi đã được xóa thành công!');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi xóa đề thi.');
      }
      throw error;
    }
  },

  async getQuestionsByInteractiveExamId(interactiveExamId: string): Promise<Question[]> {
    try {
      const response = await axiosInstance.get<Question[]>(`/api/admin/interactive-exams/${interactiveExamId}/questions`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi tải câu hỏi của đề thi.');
      }
      throw error;
    }
  },

  async addQuestionToInteractiveExam(
    interactiveExamId: string,
    questionData: Omit<Question, '_id' | 'interactiveExamId' | 'createdAt' | 'updatedAt'>
  ): Promise<Question> {
    try {
      const response = await axiosInstance.post<Question>(`/api/admin/interactive-exams/${interactiveExamId}/questions`, questionData);
      toast.success('Câu hỏi đã được thêm thành công!');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi thêm câu hỏi.');
      }
      throw error;
    }
  },

  async updateQuestion(
    questionId: string,
    questionData: Partial<Omit<Question, '_id' | 'interactiveExamId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Question> {
    try {
      const response = await axiosInstance.put<Question>(`/api/admin/interactive-exams/questions/${questionId}`, questionData);
      toast.success('Câu hỏi đã được cập nhật thành công!');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi cập nhật câu hỏi.');
      }
      throw error;
    }
  },

  async deleteQuestion(questionId: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete<{ message: string }>(`/api/admin/interactive-exams/questions/${questionId}`);
      toast.success(response.data.message || 'Câu hỏi đã được xóa.');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi xóa câu hỏi.');
      }
      throw error;
    }
  },

  async uploadInteractiveExamJson(jsonData: object): Promise<{ message: string; interactiveExamId: string }> {
    try {
      const response = await axiosInstance.post<{ message: string; interactiveExamId: string }>('/api/admin/interactive-exams/upload', jsonData);
      toast.success(response.data.message || 'Đề thi đã được upload từ JSON thành công!');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          handleAxiosError(error);
      } else {
          toast.error('Lỗi không xác định khi upload đề thi từ JSON.');
      }
      throw error;
    }
  },
};