// src/pages/ExamPage.tsx

import * as React from "react";
import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';

// --- Interfaces ---
interface ExamTopic {
  _id: string;
  name: string;
}

// THAY ĐỔI: Thêm solutionHtml vào interface
interface ExamData {
  _id: string;
  title: string;
  description?: string;
  htmlContent: string | null;
  solutionHtml: string | null; // <--- MỚI
  subject: string;
  year: number;
  province?: string;
  topic?: ExamTopic | null;
  thumbnailUrl?: string;
  type?: 'Chính thức' | 'Thi thử' | 'Đề ôn tập' | 'Đề thi chuyên';
  duration?: number;
  questions?: number;
  difficulty?: 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';
  grade?: number;
  createdAt?: string;
  canViewFullContent: boolean;
  previewContent?: string;
  subscriptionStatus?: 'none' | 'subscribed_specific' | 'full_access';
  message?: string;
}

interface ApiErrorResponse {
  message?: string;
  errors?: Array<{ msg: string }>;
}


const ExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [iframeHeight, setIframeHeight] = useState('500px');
  
  // MỚI: State để quản lý tab đang hoạt động
  const [activeTab, setActiveTab] = useState<'content' | 'solution'>('content');

  const fetchExam = useCallback(async () => {
    // ... (Hàm này không thay đổi)
    if (!id) {
      setError('ID đề thi không hợp lệ.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get<ExamData>(`/api/exams/${id}`);
      setExam(response.data);
      document.title = response.data.title || "Chi tiết đề thi";
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data as ApiErrorResponse;
        setError(errorData?.message || 'Không thể tải chi tiết đề thi.');
      } else {
        setError('Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    // ... (Hàm này không thay đổi)
    const items: BreadcrumbItem[] = [
      { label: 'Trang chủ', path: '/' },
      { label: 'Kho Đề thi', path: '/de-thi' }
    ];
    if (exam) {
      items.push({ label: exam.title });
    }
    return items;
  }, [exam]);


  useEffect(() => {
      // ... (useEffect cho 'message' không thay đổi)
      const handleMessage = (event: MessageEvent) => {
          if (event.data && event.data.type === 'iframeResize') {
              const newHeight = event.data.height;
              setIframeHeight(`${newHeight}px`);
          }
      };

      window.addEventListener('message', handleMessage);

      return () => {
          window.removeEventListener('message', handleMessage);
      };
  }, []);


  useEffect(() => {
    window.scrollTo(0, 0);
    fetchExam();
  }, [fetchExam]);

  // ... (Các hàm handleSubscribe không thay đổi)
  const handleSubscribeExam = async (examId: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đăng ký.");
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      const response = await axiosInstance.post<{ message: string }>(`/api/subscriptions/exam/${examId}`);
      toast.success(response.data.message || "Đăng ký đề thi thành công!");
      fetchExam();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ApiErrorResponse;
        toast.error(errorData?.message || "Lỗi khi đăng ký đề thi.");
      } else {
        toast.error("Lỗi không xác định.");
      }
    }
  };

  const handleSubscribeFullAccess = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đăng ký gói.");
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      const response = await axiosInstance.post<{ message: string }>(`/api/subscriptions/full-access`);
      toast.success(response.data.message || "Đăng ký gói Full Access thành công!");
      fetchExam();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ApiErrorResponse;
        toast.error(errorData?.message || "Lỗi khi đăng ký gói Full Access.");
      } else {
        toast.error("Lỗi không xác định khi đăng ký gói Full Access.");
      }
    }
  };


  // ... (Phần loading, error, không tìm thấy đề thi không thay đổi)
  if (loading || authIsLoading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                <span className="sr-only">Đang tải...</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mt-4">Đang tải dữ liệu...</h1>
            <p className="text-muted-foreground">Vui lòng chờ trong giây lát.</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
            <h1 className="text-3xl font-bold text-destructive">Lỗi!</h1>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button asChild variant="link" className="mt-4"><Link to="/">Về trang chủ</Link></Button>
          </div>
      </Layout>
    );
  }

  if (!exam) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
            <h1 className="text-3xl font-bold text-muted-foreground">Không tìm thấy đề thi</h1>
            <Button asChild className="mt-6"><Link to="/exams">Quay lại Kho Đề thi</Link></Button>
          </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-secondary/50 py-4 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
      </section>

      <div className={`min-h-screen bg-background text-foreground font-sans`}>
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <i className="fas fa-file-invoice text-primary text-2xl mr-3"></i>
              <h1 className="text-xl font-semibold text-foreground">
                {exam.title}
              </h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

        <main className="max-w-[80rem] mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <section className="mb-8">
            {exam.canViewFullContent ? (
              // --- THAY ĐỔI: Giao diện Tabs ---
              <div>
                <div className="border-b border-border flex space-x-2">
                  <Button 
                    variant={activeTab === 'content' ? 'secondary' : 'ghost'} 
                    onClick={() => setActiveTab('content')}
                    className="rounded-b-none"
                  >
                    Nội dung Đề thi
                  </Button>
                  {/* Chỉ hiển thị tab Lời giải nếu có solutionHtml */}
                  {exam.solutionHtml && (
                     <Button 
                        variant={activeTab === 'solution' ? 'secondary' : 'ghost'} 
                        onClick={() => setActiveTab('solution')}
                        className="rounded-b-none"
                      >
                       Gợi ý Lời giải
                    </Button>
                  )}
                </div>
                
                <div className="mt-4">
                  {activeTab === 'content' && (
                    exam.htmlContent ? (
                      <iframe
                        key="content-iframe"
                        src={`/exams/${id}/content`}
                        title={`Nội dung đề thi: ${exam.title}`}
                        width="100%"
                        height={iframeHeight}
                        frameBorder="0"
                        scrolling="no"
                        className="rounded-lg bg-white" 
                        style={{ transition: 'height 0.3s ease-in-out' }} 
                      ></iframe>
                    ) : (
                      <p className="text-center text-muted-foreground p-8">Không có nội dung HTML cho đề thi này.</p>
                    )
                  )}

                  {activeTab === 'solution' && (
                     <iframe
                        key="solution-iframe"
                        src={`/exams/${id}/solution`} // <--- MỚI: Route cho lời giải
                        title={`Lời giải đề thi: ${exam.title}`}
                        width="100%"
                        height={iframeHeight}
                        frameBorder="0"
                        scrolling="no"
                        className="rounded-lg bg-white" 
                        style={{ transition: 'height 0.3s ease-in-out' }} 
                      ></iframe>
                  )}
                </div>
              </div>
              // --- KẾT THÚC Giao diện Tabs ---
            ) : (
              // ... (Phần nội dung bị giới hạn không thay đổi)
              <div className="mt-10 p-6 border-2 border-dashed border-primary/50 rounded-lg text-center bg-card shadow-lg">
                <h2 className="text-2xl font-semibold text-primary mb-4">Nội dung bị giới hạn</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Vui lòng Đăng nhập hoặc Đăng ký các gói truy cập để xem toàn bộ nội dung đề thi này.
                </p>
                <div className="mt-4 space-y-3 sm:space-y-0 sm:space-x-4">
                  {!isAuthenticated ? (
                    <>
                      <Button onClick={() => navigate('/login', { state: { from: location } })}>Đăng Nhập</Button>
                      <Button onClick={() => navigate('/register', { state: { from: location } })} variant="outline">Đăng Ký Mới</Button>
                    </>
                  ) : (
                    <>
                      {exam.subscriptionStatus !== 'full_access' && exam.subscriptionStatus !== 'subscribed_specific' && (
                        <Button onClick={() => handleSubscribeExam(exam._id)}>Đăng ký đề thi này</Button>
                      )}
                      {exam.subscriptionStatus !== 'full_access' && (
                        <Button onClick={handleSubscribeFullAccess} variant="secondary">Đăng ký Full Access</Button>
                      )}
                       {exam.subscriptionStatus === 'subscribed_specific' && (
                        <p className="text-sm text-green-600 mt-2">Bạn đã đăng ký đề thi này.</p>
                      )}
                       {exam.subscriptionStatus === 'full_access' && (
                        <p className="text-sm text-green-600 mt-2">Bạn có quyền truy cập đầy đủ.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default ExamPage;