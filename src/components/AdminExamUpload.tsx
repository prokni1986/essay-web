// src/components/AdminExamUpload.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2 } from 'lucide-react';

// Define the axios instance.
const axiosInstance = axios.create();

// =================================================================================
// AUTHENTICATION INTERCEPTOR
// This interceptor will automatically add the Authorization header to every request
// if a token is found in localStorage. This is crucial for accessing protected API routes.
// Your login logic should save the token to localStorage like this:
// localStorage.setItem('authToken', 'your-jwt-token');
// =================================================================================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Định nghĩa kiểu cho một đề thi
interface Exam {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  year: number;
  province?: string;
  htmlContent: string;
  createdAt: string;
}

// Định nghĩa kiểu cho response lỗi từ API
interface ApiErrorResponse {
  message?: string;
}

const AdminExamUpload: React.FC = () => {
  // State cho danh sách đề thi
  const [exams, setExams] = useState<Exam[]>([]);
  
  // State cho đề thi đang được chỉnh sửa
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // State cho form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState<number | ''>(new Date().getFullYear());
  const [province, setProvince] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  // State cho trạng thái loading, fetching và lỗi API
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Exam | null>(null);

  // Hàm lấy danh sách đề thi từ API
  const fetchExams = async () => {
    setIsFetching(true);
    setApiError(null);
    try {
      const response = await axiosInstance.get('/api/exams');
      
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        const errorMessage = 'Lỗi Cấu Hình Server: API trả về một trang HTML thay vì dữ liệu JSON. Điều này thường xảy ra khi routing của server không được cấu hình đúng hoặc yêu cầu thiếu xác thực. Vui lòng kiểm tra lại file cấu hình server (ví dụ: vercel.json) và đảm bảo bạn đã đăng nhập với quyền admin.';
        console.error("API Error: Server responded with an HTML page instead of JSON for the /api/exams endpoint.");
        toast.error('Lỗi cấu hình server hoặc xác thực.');
        setApiError(errorMessage);
        setExams([]);
        return; 
      }

      if (Array.isArray(response.data)) {
        const sortedExams = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setExams(sortedExams);
      } else {
        const errorMessage = 'Dữ liệu nhận được từ server không hợp lệ (không phải là một mảng).';
        console.error("API response for /api/exams is not an array:", response.data);
        toast.error(errorMessage);
        setApiError(errorMessage);
        setExams([]);
      }
    } catch (error) {
      let errorMessage = 'Không thể tải danh sách đề thi. Vui lòng kiểm tra kết nối, cấu hình API và quyền truy cập.';
      if (axios.isAxiosError(error) && error.response?.status === 401) {
          errorMessage = 'Lỗi xác thực: Bạn không có quyền truy cập. Vui lòng đăng nhập lại.';
      }
      toast.error(errorMessage);
      setApiError(errorMessage);
      console.error("Fetch exams error:", error);
      setExams([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setYear(new Date().getFullYear());
    setProvince('');
    setHtmlContent('');
    setEditingExam(null);
  };

  const handleEditClick = (exam: Exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setDescription(exam.description || '');
    setSubject(exam.subject);
    setYear(exam.year);
    setProvince(exam.province || '');
    setHtmlContent(exam.htmlContent);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !htmlContent || !subject || !year) {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc: Tiêu đề, Nội dung HTML, Môn học, và Năm.");
        return;
    }
    setIsLoading(true);

    const examData = {
      title,
      description,
      htmlContent,
      subject,
      year: Number(year),
      province,
    };

    try {
      if (editingExam) {
        await axiosInstance.put(`/api/exams/${editingExam._id}`, examData);
        toast.success('Cập nhật đề thi thành công!');
      } else {
        await axiosInstance.post('/api/exams/create-html-post', examData);
        toast.success('Lưu đề thi thành công!');
      }
      resetForm();
      fetchExams();
    } catch (error) {
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

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setIsLoading(true);
    try {
      await axiosInstance.delete(`/api/exams/${deleteConfirm._id}`);
      toast.success('Đã xóa đề thi thành công!');
      setDeleteConfirm(null);
      fetchExams();
    } catch (error) {
      toast.error('Xóa đề thi thất bại.');
      console.error("Delete error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 text-white bg-gray-900 rounded-lg space-y-12">
      {/* --- Section Form --- */}
      <div>
        <h1 className="text-3xl font-bold mb-4">{editingExam ? 'Chỉnh Sửa Đề Thi' : 'Tạo Đề Thi Mới'}</h1>
        <p className="text-sm text-gray-400 mb-6">
          {editingExam ? `Bạn đang chỉnh sửa đề: "${editingExam.title}"` : 'Dán toàn bộ code HTML của đề thi và lời giải vào ô bên dưới.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-300">Tiêu đề Đề thi (*)</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-gray-800 border-gray-600 focus:ring-yellow-500 focus:border-yellow-500" placeholder="VD: Đề thi tuyển sinh lớp 10 môn Toán - Thái Bình 2025" />
              </div>
              <div>
                <Label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-300">Mô tả ngắn (Tùy chọn)</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-gray-800 border-gray-600" />
              </div>
              <div>
                <Label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-300">Môn học (*)</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required className="bg-gray-800 border-gray-600" placeholder="VD: Toán" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="year" className="block mb-2 text-sm font-medium text-gray-300">Năm (*)</Label>
                      <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value === '' ? '' : parseInt(e.target.value, 10))} required className="bg-gray-800 border-gray-600" placeholder="VD: 2025" />
                  </div>
                  <div>
                      <Label htmlFor="province" className="block mb-2 text-sm font-medium text-gray-300">Tỉnh/Thành phố (Tùy chọn)</Label>
                      <Input id="province" value={province} onChange={(e) => setProvince(e.target.value)} className="bg-gray-800 border-gray-600" placeholder="VD: Thái Bình" />
                  </div>
              </div>
          </div>
          <div>
            <Label htmlFor="htmlContent" className="block mb-2 text-sm font-medium text-gray-300">Nội dung HTML đầy đủ (*)</Label>
            <Textarea id="htmlContent" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} required className="bg-gray-800 border-gray-600 h-96 font-mono text-sm" placeholder="<html>...</html>" />
          </div>
          <div className="flex justify-end gap-4">
              {editingExam && (
                <Button type="button" onClick={resetForm} variant="outline" className="text-white border-gray-500 hover:bg-gray-700">Hủy Chỉnh Sửa</Button>
              )}
              <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-2">
                {isLoading ? (editingExam ? 'Đang cập nhật...' : 'Đang lưu...') : (editingExam ? 'Cập Nhật Đề Thi' : 'Lưu Đề Thi Mới')}
              </Button>
          </div>
        </form>
      </div>

      {/* --- Section Danh sách đề thi --- */}
      <div>
        <h2 className="text-3xl font-bold mb-6 border-t border-gray-700 pt-8">Quản Lý Đề Thi</h2>
        {isFetching ? (
          <p>Đang tải danh sách đề thi...</p>
        ) : apiError ? (
          <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-lg">
            <h4 className="font-bold text-red-400">Không thể hiển thị danh sách đề thi</h4>
            <p className="mt-2 text-sm text-red-200">{apiError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.length > 0 ? exams.map(exam => (
              <div key={exam._id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{exam.title}</h3>
                  <p className="text-sm text-gray-400">{exam.subject} - {exam.province || 'N/A'} ({exam.year})</p>
                  <p className="text-xs text-gray-500 mt-1">Đăng ngày: {new Date(exam.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(exam)} className="hover:bg-gray-700">
                    <Pencil className="h-4 w-4 text-blue-400" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(exam)} className="hover:bg-gray-700">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            )) : <p>Chưa có đề thi nào được tạo.</p>}
          </div>
        )}
      </div>

      {/* --- Modal Xác Nhận Xóa --- */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold">Xác nhận xóa</h3>
            <p className="my-4 text-gray-300">Bạn có chắc chắn muốn xóa đề thi này không?</p>
            <p className="font-semibold break-words">"{deleteConfirm.title}"</p>
            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="text-white border-gray-500 hover:bg-gray-700">Hủy</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
                {isLoading ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExamUpload;
