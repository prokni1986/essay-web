// src/pages/ExamPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import Layout from '@/components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExamData {
  _id: string;
  title: string;
  htmlContent: string | null;
  subject?: string;
  year?: number;
  description?: string;
  province?: string;
  canViewFullContent: boolean;
  previewContent?: string;
  subscriptionStatus?: 'none' | 'subscribed_specific' | 'full_access';
  message?: string;
}

interface ApiErrorResponse {
  message?: string;
}

declare global {
  interface Window {
    MathJax: {
      Hub: {
        Queue: (params: unknown[]) => void;
      };
    };
  }
}

const ExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) {
      setError("ID không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchExam = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<ExamData>(`/api/exams/${id}`);
        setExam(response.data);
      } catch (err: unknown) {
        console.error("Lỗi khi tải đề thi:", err);
        if (axios.isAxiosError<ApiErrorResponse>(err)) {
          setError(err.response?.data?.message || "Không thể tải nội dung đề thi.");
        } else {
          setError("Đã xảy ra lỗi không xác định.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  useEffect(() => {
    // Chạy logic này khi `exam` thay đổi (tức là sau khi dữ liệu được tải)
    if (exam) {
      // Chỉ gọi MathJax nếu có nội dung để hiển thị
      if ((exam.canViewFullContent && exam.htmlContent) || exam.previewContent) {
        if (typeof window.MathJax !== "undefined") {
          const timeoutId = setTimeout(() => {
            window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
          }, 150); // Độ trễ nhỏ để đảm bảo DOM render xong

          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [exam]);

  const handleSubscribe = async (type: 'exam' | 'full', examId: string) => {
    if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để thực hiện hành động này.");
        navigate('/login', { state: { from: location } });
        return;
    }
    const endpoint = type === 'full' ? '/api/subscriptions/full-access' : `/api/subscriptions/exam/${examId}`;
    try {
        const response = await axiosInstance.post(endpoint);
        toast.success(response.data.message || "Đăng ký thành công!");
        // Fetch lại dữ liệu để cập nhật UI
        const updatedExam = await axiosInstance.get<ExamData>(`/api/exams/${id}`);
        setExam(updatedExam.data);
    } catch (error: unknown) {
        if (axios.isAxiosError<ApiErrorResponse>(error)) {
            toast.error(error.response?.data?.message || "Lỗi khi thực hiện đăng ký.");
        } else {
            toast.error("Đã xảy ra lỗi không xác định.");
        }
    }
  };

  const memoizedHtmlContent = useMemo(() => {
    if (!exam?.htmlContent) return null;
    return { __html: exam.htmlContent };
  }, [exam?.htmlContent]);


  if (loading || authIsLoading) {
    return (
      <Layout><div className="flex justify-center items-center min-h-screen text-xl">Đang tải nội dung...</div></Layout>
    );
  }

  if (error) {
    return (
      <Layout><div className="flex flex-col justify-center items-center min-h-screen text-center"><p className="text-xl text-red-500 mb-4">Lỗi: {error}</p><Link to="/" className="text-blue-500 hover:underline">Quay về trang chủ</Link></div></Layout>
    );
  }

  if (!exam) {
    return (
      <Layout><div className="flex justify-center items-center min-h-screen text-xl">Không tìm thấy nội dung.</div></Layout>
    );
  }

  return (
    <Layout>
      {exam.canViewFullContent && memoizedHtmlContent ? (
        <div dangerouslySetInnerHTML={memoizedHtmlContent} />
      ) : (
        <div className="container mx-auto p-4 md:p-8 text-white min-h-screen">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{exam.title}</h1>
            <div className="p-6 mt-8 border-2 border-dashed border-yellow-500/50 rounded-lg text-center bg-gray-800/30 shadow-lg">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Nội dung giới hạn</h2>
              <div className="text-gray-300 mb-6 leading-relaxed max-w-3xl mx-auto"
                   dangerouslySetInnerHTML={{ __html: exam.previewContent || exam.message || ""}}
              />
              {!isAuthenticated ? (
                <div className="space-y-3 mt-6">
                    <p className="text-gray-300">Vui lòng đăng nhập để có thể đăng ký xem nội dung này.</p>
                    <Button onClick={() => navigate('/login', { state: { from: location } })} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                        Đăng Nhập
                    </Button>
                </div>
              ) : (
                <div className="mt-6 space-y-3 md:space-y-0 md:space-x-4">
                  {exam.subscriptionStatus !== 'full_access' && exam.subscriptionStatus !== 'subscribed_specific' && (
                    <Button onClick={() => handleSubscribe('exam', exam._id)} className="bg-green-500 hover:bg-green-600 text-white font-semibold">
                      Đăng ký Đề thi này
                    </Button>
                  )}
                  {exam.subscriptionStatus !== 'full_access' && (
                    <Button onClick={() => handleSubscribe('full', exam._id)} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                      Đăng ký Full Access
                    </Button>
                  )}
                   {exam.subscriptionStatus === 'subscribed_specific' && (
                    <p className="text-green-400 text-sm mt-2">Bạn đã đăng ký đề thi này.</p>
                  )}
                   {exam.subscriptionStatus === 'full_access' && (
                    <p className="text-blue-400 text-sm mt-2">Bạn đã có quyền truy cập toàn bộ.</p>
                  )}
                </div>
              )}
            </div>
        </div>
      )}
    </Layout>
  );
};

export default ExamPage;
