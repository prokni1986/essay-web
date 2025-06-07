// src/components/AdminHtmlUpload.tsx
import React, { useState } from 'react';
import axios from 'axios'; // <<<< THÊM IMPORT axios để sử dụng isAxiosError
import axiosInstance from '../lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// (Tùy chọn nhưng khuyến khích) Định nghĩa kiểu cho response lỗi từ API
interface ApiErrorResponse {
  message?: string;
}

const AdminExamUpload: React.FC = () => {
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // API endpoint này nên được cập nhật để khớp với logic mới của bạn,
      // ví dụ: '/api/exams/create' hoặc '/api/essays/create'
      const response = await axiosInstance.post('/api/essays/create-html-post', {
        title,
        htmlContent,
        // Thêm các trường khác nếu cần, ví dụ: subject, year
      });
      toast.success(response.data.message || 'Lưu thành công!');
      setTitle('');
      setHtmlContent('');
    } catch (error) { // <<<< SỬA LẠI: Bỏ type :any
      let errorMessage = 'Có lỗi không xác định xảy ra.';
      if (axios.isAxiosError(error)) { // Kiểm tra nếu là lỗi từ Axios
        const errorData = error.response?.data as ApiErrorResponse;
        errorMessage = errorData?.message || error.message || 'Có lỗi từ server.';
      } else if (error instanceof Error) { // Xử lý các lỗi JavaScript thông thường
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      console.error("Submit error:", error); // Log lỗi đầy đủ để debug
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Tạo Bài Đăng Mới từ HTML</h1>
      <p className="text-sm text-gray-400 mb-6">Trang này dùng để đăng nội dung cho cả "Bài luận" và "Đề thi". Vui lòng đảm bảo API endpoint trong code là chính xác.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-300">Tiêu đề</label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="bg-gray-700 border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="htmlContent" className="block mb-2 text-sm font-medium text-gray-300">Dán code HTML vào đây</label>
          <Textarea
            id="htmlContent"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            required
            className="bg-gray-700 border-gray-600 h-96 font-mono text-sm" // Dùng font-mono để dễ nhìn code
            placeholder="<html>...</html>"
          />
        </div>
        <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
          {isLoading ? 'Đang lưu...' : 'Lưu Bài Đăng'}
        </Button>
      </form>
    </div>
  );
};

export default AdminExamUpload;