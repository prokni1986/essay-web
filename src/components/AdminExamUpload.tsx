// src/components/AdminExamUpload.tsx
import React, { useState } from 'react';
import axios from 'axios'; // Import axios để sử dụng isAxiosError
import axiosInstance from '../lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

// Định nghĩa kiểu cho response lỗi từ API
interface ApiErrorResponse {
  message?: string;
}

const AdminExamUpload: React.FC = () => {
  // State cho các trường dữ liệu của một "Exam"
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState<number | ''>(new Date().getFullYear());
  const [province, setProvince] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !htmlContent || !subject || !year) {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc: Tiêu đề, Nội dung HTML, Môn học, và Năm.");
        return;
    }
    setIsLoading(true);
    try {
      // SỬA ĐỔI QUAN TRỌNG: Gọi đến API của "Exam", không phải "Essay"
      const response = await axiosInstance.post('/api/exams/create-html-post', {
        title,
        description,
        htmlContent,
        subject,
        year,
        province,
      });
      toast.success(response.data.message || 'Lưu đề thi thành công!');
      // Reset form sau khi thành công
      setTitle('');
      setDescription('');
      setSubject('');
      setYear(new Date().getFullYear());
      setProvince('');
      setHtmlContent('');
    } catch (error) { // SỬA LỖI: Bỏ type :any và xử lý lỗi một cách an toàn
      let errorMessage = 'Có lỗi không xác định xảy ra.';
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ApiErrorResponse;
        errorMessage = errorData?.message || error.message || 'Có lỗi từ server.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      console.error("Submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 text-white bg-gray-900 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Tạo Đề Thi Mới</h1>
      <p className="text-sm text-gray-400 mb-6">Dán toàn bộ code HTML của đề thi và lời giải vào ô bên dưới.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-300">Tiêu đề Đề thi (*)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-gray-700 border-gray-600"
                placeholder="VD: Đề thi tuyển sinh lớp 10 môn Toán - Thái Bình 2025"
              />
            </div>
             <div>
              <Label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-300">Mô tả ngắn (Tùy chọn)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-300">Môn học (*)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="bg-gray-700 border-gray-600"
                placeholder="VD: Toán"
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="year" className="block mb-2 text-sm font-medium text-gray-300">Năm (*)</Label>
                    <Input
                        id="year"
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        required
                        className="bg-gray-700 border-gray-600"
                        placeholder="VD: 2025"
                    />
                </div>
                <div>
                    <Label htmlFor="province" className="block mb-2 text-sm font-medium text-gray-300">Tỉnh/Thành phố (Tùy chọn)</Label>
                    <Input
                        id="province"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="bg-gray-700 border-gray-600"
                        placeholder="VD: Thái Bình"
                    />
                </div>
             </div>
        </div>

        <div>
          <Label htmlFor="htmlContent" className="block mb-2 text-sm font-medium text-gray-300">Nội dung HTML đầy đủ (*)</Label>
          <Textarea
            id="htmlContent"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            required
            className="bg-gray-700 border-gray-600 h-96 font-mono text-sm"
            placeholder="<html>...</html>"
          />
        </div>

        <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-2">
              {isLoading ? 'Đang lưu...' : 'Lưu Đề Thi'}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminExamUpload;

