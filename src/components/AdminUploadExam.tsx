// src/components/AdminUploadExam.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, XCircle, Loader2 } from 'lucide-react';

// =================================================================================
// CẤU HÌNH AXIOS VÀ INTERCEPTOR XÁC THỰC
// =================================================================================
const axiosInstance = axios.create({
  // Sửa đổi: Sử dụng URL backend từ biến môi trường của Vite.
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

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

// =================================================================================
// CÁC ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPESCRIPT INTERFACES)
// =================================================================================
// Interface cho danh sách (không có htmlContent)
interface ExamInList {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  year: number;
  province?: string;
  createdAt: string;
}

// Interface cho đề thi đầy đủ (có htmlContent)
interface ExamFull extends ExamInList {
    htmlContent: string;
}


// =================================================================================
// COMPONENT CHÍNH: AdminUploadExam
// =================================================================================
const AdminUploadExam: React.FC = () => {
  // === STATE MANAGEMENT ===
  const [exams, setExams] = useState<ExamInList[]>([]); // Chỉ lưu danh sách tóm tắt
  const [editingExam, setEditingExam] = useState<ExamFull | null>(null);

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
  const [deleteConfirm, setDeleteConfirm] = useState<ExamInList | null>(null);

  // State để lưu nội dung chi tiết đã được tải
  const [fullContentCache, setFullContentCache] = useState<{ [key: string]: string }>({});
  const [loadingContentId, setLoadingContentId] = useState<string | null>(null);


  // === API FUNCTIONS ===
  const fetchExams = useCallback(async () => {
    setIsFetching(true);
    setApiError(null);
    try {
      const response = await axiosInstance.get('/api/exams');
      
      if (Array.isArray(response.data)) {
        const sortedExams = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setExams(sortedExams);
      } else {
        throw new Error("Dữ liệu trả về từ server không phải là một mảng.");
      }
    } catch (error) {
      let errorMessage = 'Không thể tải danh sách đề thi.';
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          errorMessage = 'Lỗi xác thực: Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn.';
      } else if (error instanceof Error) {
        errorMessage = error.message; 
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

  // === FORM & CONTENT HANDLERS ===
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setYear(new Date().getFullYear());
    setProvince('');
    setHtmlContent('');
    setEditingExam(null);
  };

  const handleEditClick = async (exam: ExamInList) => {
    if (editingExam?._id === exam._id) {
        resetForm();
        return;
    }
    
    // Tải nội dung đầy đủ để sửa
    toast.info("Đang tải nội dung để chỉnh sửa...");
    try {
        const response = await axiosInstance.get(`/api/exams/${exam._id}`);
        const fullExamData: ExamFull = response.data;
        
        setEditingExam(fullExamData);
        setTitle(fullExamData.title);
        setDescription(fullExamData.description || '');
        setSubject(fullExamData.subject);
        setYear(fullExamData.year);
        setProvince(fullExamData.province || '');
        setHtmlContent(fullExamData.htmlContent);
        
        document.getElementById('exam-form-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch {
        toast.error("Không thể tải nội dung chi tiết để sửa.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !htmlContent || !subject || !year) {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
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
  
  // === LAZY LOAD CONTENT FOR PREVIEW ===
  const handleToggleDetails = async (examId: string, isOpen: boolean) => {
    if (isOpen && !fullContentCache[examId] && !loadingContentId) {
      setLoadingContentId(examId);
      try {
        const response = await axiosInstance.get(`/api/exams/${examId}`);
        if (response.data?.htmlContent) {
          setFullContentCache(prev => ({ ...prev, [examId]: response.data.htmlContent }));
        }
      } catch (error) {
        toast.error('Không thể tải nội dung xem trước.');
      } finally {
        setLoadingContentId(null);
      }
    }
  };


  // === RENDER FUNCTION ===
  return (
    <div className="p-4 md:p-8 text-white bg-gray-900 rounded-lg space-y-12">
      <section id="exam-form-section">
        <h1 className="text-3xl font-bold mb-4">{editingExam ? 'Chỉnh Sửa Đề Thi' : 'Tạo Đề Thi Mới'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields remain the same */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Tiêu đề Đề thi (*)</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-gray-800 border-gray-600 mt-1" />
              </div>
              <div>
                <Label htmlFor="description">Mô tả ngắn (Tùy chọn)</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-gray-800 border-gray-600 mt-1" />
              </div>
              <div>
                <Label htmlFor="subject">Môn học (*)</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required className="bg-gray-800 border-gray-600 mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="year">Năm (*)</Label>
                      <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value === '' ? '' : parseInt(e.target.value, 10))} required className="bg-gray-800 border-gray-600 mt-1" />
                  </div>
                  <div>
                      <Label htmlFor="province">Tỉnh/Thành phố (Tùy chọn)</Label>
                      <Input id="province" value={province} onChange={(e) => setProvince(e.target.value)} className="bg-gray-800 border-gray-600 mt-1" />
                  </div>
              </div>
          </div>
          <div>
            <Label htmlFor="htmlContent">Nội dung HTML đầy đủ (*)</Label>
            <Textarea id="htmlContent" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} required className="bg-gray-800 border-gray-600 h-96 font-mono mt-1" />
          </div>
          <div className="flex justify-end gap-4">
              {editingExam && (
                <Button type="button" onClick={resetForm} variant="outline" className="text-white border-gray-500">Hủy</Button>
              )}
              <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                {isLoading ? 'Đang xử lý...' : (editingExam ? 'Cập Nhật' : 'Tạo Mới')}
              </Button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6 border-t border-gray-700 pt-8">Quản Lý Đề Thi</h2>
        {isFetching ? (
          <p className="text-center">Đang tải danh sách...</p>
        ) : apiError ? (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg text-center">
            <XCircle className="mx-auto h-8 w-8 text-red-400" />
            <h4 className="font-bold mt-2">Lỗi Tải Dữ Liệu</h4>
            <p className="text-sm text-red-200 mt-1">{apiError}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exams.length > 0 ? exams.map(exam => (
              <details key={exam._id} className="bg-gray-800 rounded-lg border border-gray-700" onToggle={(e) => handleToggleDetails(exam._id, (e.target as HTMLDetailsElement).open)}>
                  <summary className="p-4 flex justify-between items-center cursor-pointer list-none hover:bg-gray-700/50">
                      <div>
                          <h3 className="font-semibold">{exam.title}</h3>
                          <p className="text-sm text-gray-400">{exam.subject} ({exam.year})</p>
                      </div>
                      <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditClick(exam); }} aria-label="Sửa">
                              <Pencil className="h-4 w-4 text-blue-400" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(exam); }} aria-label="Xóa">
                              <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                      </div>
                  </summary>
                  <div className="p-4 border-t border-gray-700">
                      <h4 className="font-semibold mb-2">Xem trước:</h4>
                      {loadingContentId === exam._id ? (
                        <div className="w-full h-96 flex items-center justify-center bg-gray-700 rounded">
                           <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      ) : (
                         <iframe 
                            srcDoc={fullContentCache[exam._id] || "<p style='padding:1rem; color:#555;'>Mở rộng để tải nội dung xem trước.</p>"} 
                            title={`Preview of ${exam.title}`}
                            className="w-full h-96 rounded bg-white"
                            sandbox=""
                          />
                      )}
                  </div>
              </details>
            )) : <p className="text-center text-gray-500 py-8">Chưa có đề thi nào.</p>}
          </div>
        )}
      </section>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-bold">Xác nhận xóa</h3>
            <p className="my-4">Bạn có chắc muốn xóa đề thi: "{deleteConfirm.title}"?</p>
            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Hủy</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
                {isLoading ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUploadExam;
