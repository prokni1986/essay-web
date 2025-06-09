// src/pages/SampleEssay.tsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// --- Interfaces ---
interface EssayTopic {
  _id: string;
  name: string;
  category?: { _id: string; name: string; };
}

interface EssayData {
  _id: string;
  title: string;
  outline?: string | null;
  content: string | null;
  essay2?: string | null;
  essay3?: string | null;
  audioFiles?: string[];
  topic?: EssayTopic | null;
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

// --- Helpers ---
const getShortTitle = (title: string | undefined, maxLength: number = 30): string => {
  if (!title) return '';
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength).trimEnd() + '...';
};

const SampleEssay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [essay, setEssay] = useState<EssayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchEssay = useCallback(async () => {
    if (!id) {
      setError('ID bài luận không hợp lệ.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get<EssayData>(`/api/essays/${id}`);
      setEssay(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data as ApiErrorResponse;
        setError(errorData?.message || 'Không thể tải chi tiết bài luận.');
      } else {
        setError('Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEssay();
  }, [fetchEssay]);

  const handleSubscribeEssay = async (essayId: string) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đăng ký.");
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      const response = await axiosInstance.post<{ message: string }>(`/api/subscriptions/essay/${essayId}`);
      toast.success(response.data.message || "Đăng ký thành công!");
      fetchEssay();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ApiErrorResponse;
        toast.error(errorData?.message || "Lỗi khi đăng ký.");
      } else {
        toast.error("Lỗi không xác định.");
      }
    }
  };

  // SỬA LỖI: Thêm lại hàm handleSubscribeFullAccess đã thiếu
  const handleSubscribeFullAccess = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đăng ký gói.");
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      const response = await axiosInstance.post<{ message: string }>(`/api/subscriptions/full-access`);
      toast.success(response.data.message || "Đăng ký gói Full Access thành công!");
      fetchEssay();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ApiErrorResponse;
        toast.error(errorData?.message || "Lỗi khi đăng ký gói Full Access.");
      } else {
        toast.error("Lỗi không xác định khi đăng ký gói Full Access.");
      }
    }
  };
  
  const renderAudioPlayer = (audioSrc: string | undefined): JSX.Element | null => {
    if (!audioSrc) return null;
    return (
      <audio controls controlsList="nodownload" className="w-full max-w-[280px] rounded-lg">
        <source src={audioSrc} type="audio/mpeg" />
        Trình duyệt của bạn không hỗ trợ phát audio.
      </audio>
    );
  };
  
  if (loading || authIsLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center text-foreground">
            <h1 className="text-2xl font-semibold">Đang tải chi tiết bài luận...</h1>
            <div className="mt-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen text-center px-4">
          <div className="p-8 bg-card rounded-lg shadow-xl border max-w-md">
            <h1 className="text-3xl font-bold text-destructive mb-4">Lỗi</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild><Link to="/essays">Quay lại Thư viện</Link></Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!essay) {
     return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen text-center px-4">
          <div className="p-8 bg-card rounded-lg shadow-xl border max-w-md">
            <h1 className="text-3xl font-bold text-muted-foreground">Không tìm thấy bài luận</h1>
            <Button asChild className="mt-6"><Link to="/essays">Quay lại Thư viện</Link></Button>
          </div>
        </div>
      </Layout>
    );
  }

  const pageTitle = essay.title;
  const topicName = essay.topic && typeof essay.topic === 'object' ? essay.topic.name : 'Chủ đề';
  const topicIdForLink = essay.topic && typeof essay.topic === 'object' ? essay.topic._id : null;

  return (
    <Layout>
      <section className="py-10 px-4 bg-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="px-4 md:px-8 py-6">
            <nav className="mb-8 text-sm flex flex-wrap items-center text-muted-foreground space-x-2">
              <Link to="/" className="hover:underline text-primary">Trang chủ</Link>
              <span>/</span>
              <Link to="/essays" className="hover:underline text-primary">Thư viện</Link>
              {topicIdForLink && (<><span>/</span><Link to={`/topic/${topicIdForLink}`} className="hover:underline text-primary">{topicName}</Link></>)}
              <span>/</span>
              <span className="text-foreground font-medium truncate" title={essay.title}>{getShortTitle(essay.title)}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground text-justify break-words">
              {pageTitle}
            </h1>
          </div>
        </div>
      </section>

      <section className="py-4 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="bg-background rounded-2xl p-4 md:p-8">
            <article>
              {essay.canViewFullContent ? (
                <div className="space-y-6">
                  {essay.outline && (
                    <details className="essay-section" open>
                      <summary className="flex items-center justify-between border-b border-border py-3 cursor-pointer list-none rounded-md group">
                        <div className="flex items-center group-hover:text-primary transition-colors"><span className="mr-3 text-primary text-xl transition-transform duration-200 transform details-arrow">❯</span><h2 className="text-2xl font-semibold text-primary">Dàn ý</h2></div>
                        <div className="flex-shrink-0 ml-4">{renderAudioPlayer(essay.audioFiles?.[0])}</div>
                      </summary>
                      <div className="mt-4 p-4 md:p-6 bg-secondary/50 rounded prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: essay.outline }} />
                    </details>
                  )}
                  {essay.content && (
                     <details className="essay-section" open>
                      <summary className="flex items-center justify-between border-b border-border py-3 cursor-pointer list-none rounded-md group">
                        <div className="flex items-center group-hover:text-primary transition-colors"><span className="mr-3 text-primary text-xl transition-transform duration-200 transform details-arrow">❯</span><h2 className="text-2xl font-semibold text-primary">Bài luận 1</h2></div>
                        <div className="flex-shrink-0 ml-4">{renderAudioPlayer(essay.audioFiles?.[1])}</div>
                      </summary>
                      <div className="mt-4 p-4 md:p-6 bg-secondary/50 rounded prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: essay.content }} />
                    </details>
                  )}
                   {/* Logic cho essay2, essay3 nếu có */}
                </div>
              ) : (
                <div className="mt-10 p-6 border-2 border-dashed border-primary/50 rounded-lg text-center bg-card shadow-lg">
                  <h2 className="text-2xl font-semibold text-primary mb-4">Nội dung giới hạn</h2>
                  <div className="text-muted-foreground mb-6 leading-relaxed prose prose-invert max-w-none text-justify" dangerouslySetInnerHTML={{ __html: essay.previewContent || essay.message || "" }}/>
                  <div className="mt-4 space-y-3 sm:space-y-0 sm:space-x-4">
                    {!isAuthenticated ? (
                      <>
                        <Button onClick={() => navigate('/login', { state: { from: location } })}>Đăng Nhập</Button>
                        <Button onClick={() => navigate('/register', { state: { from: location } })} variant="outline">Đăng Ký Mới</Button>
                      </>
                    ) : (
                      <>
                        {essay.subscriptionStatus !== 'full_access' && essay.subscriptionStatus !== 'subscribed_specific' && (
                          <Button onClick={() => handleSubscribeEssay(essay._id)}>Đăng ký bài luận này</Button>
                        )}
                        {essay.subscriptionStatus !== 'full_access' && (
                          <Button onClick={handleSubscribeFullAccess} variant="secondary">Đăng ký Full Access</Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </article>
            <div className="mt-12 pt-6 border-t border-border text-center">
                <Button variant="link" asChild><Link to="/essays">&larr; Quay lại Thư viện</Link></Button>
            </div>
          </div>
        </div>
      </section>
      <style>{` details[open] > summary .details-arrow { transform: rotate(90deg); } `}</style>
    </Layout>
  );
};

export default SampleEssay;