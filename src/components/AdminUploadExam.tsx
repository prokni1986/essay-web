// src/components/AdminUploadExam.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, XCircle, Eye } from 'lucide-react';

// =================================================================================
// CẤU HÌNH AXIOS VÀ INTERCEPTOR XÁC THỰC
// =================================================================================
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith('/api')) {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =================================================================================
// CÁC ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPESCRIPT INTERFACES)
// =================================================================================
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

interface ApiErrorResponse {
  message?: string;
}

// =================================================================================
// COMPONENT CHÍNH: AdminUploadExam
// =================================================================================
const AdminUploadExam: React.FC = () => {
  // === STATE MANAGEMENT ===
  const [exams, setExams] = useState<Exam[]>([]);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // State cho các trường trong form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState<number | ''>(new Date().getFullYear());
  const [province, setProvince] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  
  // State cho các trạng thái giao diện
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Exam | null>(null);

  // === API FUNCTIONS ===
  const fetchExams = useCallback(async () => {
    setIsFetching(true);
    setApiError(null);
    try {
      const response = await axiosInstance.get('/api/exams');
      
      let examsData = response.data;
      if (!Array.isArray(examsData) && typeof examsData === 'object' && examsData !== null) {
        if (Array.isArray(examsData.data)) examsData = examsData.data;
        else if (Array.isArray(examsData.exams)) examsData = examsData.exams;
        else if (Array.isArray(examsData.results)) examsData = examsData.results;
      }
      
      if (Array.isArray(examsData)) {
        const sortedExams = examsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setExams(sortedExams);
      } else {
        const receivedDataType = typeof response.data;
        const receivedDataInfo = receivedDataType === 'object' && response.data !== null ? `Keys: [${Object.keys(response.data).join(', ')}]` : `Value: ${String(response.data).substring(0, 100)}...`;
        throw new Error(`Dữ liệu trả về không phải là một mảng. Kiểu nhận được: ${receivedDataType}. ${receivedDataInfo}`);
      }
    } catch (error) {
      let errorMessage = 'Không thể tải danh sách đề thi.';
      if (error instanceof Error) {
        errorMessage = error.message; 
      } else if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            errorMessage = 'Lỗi xác thực: Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        }
      }
      setApiError(errorMessage);
      toast.error(errorMessage);
      console.error("Fetch exams error:", error);
      setExams([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // === FORM HANDLERS ===
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
    // Nếu đang sửa bài này rồi thì đóng lại, ngược lại thì mở ra
    if (editingExam?._id === exam._id) {
        resetForm();
    } else {
        setEditingExam(exam);
        setTitle(exam.title);
        setDescription(exam.description || '');
        setSubject(exam.subject);
        setYear(exam.year);
        setProvince(exam.province || '');
        setHtmlContent(exam.htmlContent);
        // Tìm element form và cuộn tới
        document.getElementById('exam-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !htmlContent || !subject || !year) {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc: Tiêu đề, Nội dung HTML, Môn học, và Năm.");
        return;
    }
    setIsLoading(true);

    const examData = { title, description, htmlContent, subject, year: Number(year), province };

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
      toast.error('Thao tác thất bại.');
      console.error("Submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // === DELETE HANDLER ===
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

  // === RENDER FUNCTION ===
  return (
    <div className="p-4 md:p-8 text-white bg-gray-900 rounded-lg space-y-12">
      <section id="exam-form-section">
        <h1 className="text-3xl font-bold mb-4">{editingExam ? 'Chỉnh Sửa Đề Thi' : 'Tạo Đề Thi Mới'}</h1>
        <p className="text-sm text-gray-400 mb-6">
          {editingExam ? `Bạn đang chỉnh sửa đề: "${editingExam.title}"` : 'Điền thông tin và dán toàn bộ code HTML của đề thi vào ô bên dưới.'}
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
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6 border-t border-gray-700 pt-8">Quản Lý Đề Thi</h2>
        {isFetching ? (
          <p className="text-center text-gray-400">Đang tải danh sách đề thi...</p>
        ) : apiError ? (
          <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-lg text-center">
            <XCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
            <h4 className="font-bold text-red-400">Không thể hiển thị danh sách đề thi</h4>
            <p className="mt-2 text-sm text-red-200">{apiError}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exams.length > 0 ? exams.map(exam => (
              <details key={exam._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 transition-all duration-300">
                  <summary className="p-4 flex justify-between items-center cursor-pointer list-none hover:bg-gray-700/50">
                      <div>
                          <h3 className="font-semibold text-lg text-gray-100">{exam.title}</h3>
                          <p className="text-sm text-gray-400">{exam.subject} - {exam.province || 'N/A'} ({exam.year})</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditClick(exam); }} className="hover:bg-gray-600" aria-label="Sửa">
                              <Pencil className="h-4 w-4 text-blue-400" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(exam); }} className="hover:bg-gray-600" aria-label="Xóa">
                              <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                      </div>
                  </summary>
                  <div className="p-4 border-t border-gray-700">
                      <h4 className="font-semibold mb-2">Xem trước nội dung:</h4>
                      <iframe 
                          srcDoc={exam.htmlContent} 
                          title={`Preview of ${exam.title}`}
                          className="w-full h-96 rounded bg-white border border-gray-600"
                          sandbox="" // Hạn chế các quyền của iframe để tăng bảo mật
                      />
                  </div>
              </details>
            )) : <p className="text-center text-gray-500 py-8">Chưa có đề thi nào được tạo.</p>}
          </div>
        )}
      </section>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full border border-gray-700">
            <h3 className="text-lg font-bold text-white">Xác nhận xóa</h3>
            <p className="my-4 text-gray-300">Bạn có chắc chắn muốn xóa đề thi này không? Hành động này không thể hoàn tác.</p>
            <p className="font-semibold break-words text-yellow-400">"{deleteConfirm.title}"</p>
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

export default AdminUploadExam;
