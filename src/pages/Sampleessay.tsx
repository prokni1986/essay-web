// src/pages/SampleEssay.tsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios'; // Vẫn cần cho axios.isAxiosError
import axiosInstance from '../lib/axiosInstance'; // Đảm bảo đường dẫn đúng
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout'; // Đảm bảo đường dẫn đúng
import { useAuth } from '../contexts/AuthContext'; // Đảm bảo đường dẫn đúng
import { Button } from '@/components/ui/button'; // Đảm bảo đường dẫn đúng
import { toast } from 'sonner';

// Helper function
const stripHtml = (html: string): string => {
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
  return '';
};

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

// Kiểu cho response lỗi từ API (tùy chỉnh nếu cần)
interface ApiErrorResponse {
  message?: string;
  errors?: Array<{ msg: string }>;
}


const SampleEssay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [essay, setEssay] = useState<EssayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isAuthenticated, isLoading: authIsLoading } = useAuth(); // Bỏ 'user' nếu không dùng trực tiếp ở đây
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
      console.error("Lỗi khi tải bài luận:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
            setError('Không tìm thấy bài luận được yêu cầu.');
        } else {
            const errorData = err.response?.data as ApiErrorResponse;
            setError(errorData?.message || 'Không thể tải chi tiết bài luận. Vui lòng thử lại sau.');
        }
      } else {
          setError('Đã xảy ra lỗi không xác định khi tải bài luận.');
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
      toast.error("Vui lòng đăng nhập để đăng ký bài luận.");
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      const response = await axiosInstance.post<{ message: string }>(`/api/subscriptions/essay/${essayId}`);
      toast.success(response.data.message || "Đăng ký bài luận thành công!");
      fetchEssay(); // Tải lại để cập nhật trạng thái
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ApiErrorResponse;
        toast.error(errorData?.message || "Lỗi khi đăng ký bài luận.");
      } else {
        toast.error("Lỗi không xác định khi đăng ký bài luận.");
        console.error("Non-Axios error in handleSubscribeEssay:", error);
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
      fetchEssay(); // Tải lại để cập nhật trạng thái
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ApiErrorResponse;
        toast.error(errorData?.message || "Lỗi khi đăng ký gói Full Access.");
      } else {
        toast.error("Lỗi không xác định khi đăng ký gói Full Access.");
        console.error("Non-Axios error in handleSubscribeFullAccess:", error);
      }
    }
  };

  const getShortTitle = (title: string | undefined, maxLength: number = 30): string => {
    if (!title) return '';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trimEnd() + '...';
  };

  const renderAudioPlayer = (audioSrc: string | undefined): JSX.Element | null => {
    if (!audioSrc) return null;
    return (
      <audio
        controls
        controlsList="nodownload"
        className="rounded-lg custom-audio-controls"
        style={{ maxWidth: '280px', minWidth: '220px' }}
      >
        <source src={audioSrc} />
        Trình duyệt của bạn không hỗ trợ phát audio.
      </audio>
    );
  };

  if (loading || authIsLoading) {
    return (
      <Layout>
        <section className="py-10 px-4 text-center" style={{ background: "#23232b", minHeight: "100vh" }}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl mb-8">
              <h1 className="text-3xl font-bold text-white">Đang tải chi tiết bài luận...</h1>
              <div className="mt-6 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-yellow-400 motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="py-10 px-4 text-center" style={{ background: "#23232b", minHeight: "100vh" }}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl mb-8">
              <h1 className="text-3xl font-bold text-red-500 mb-4">Lỗi</h1>
              <p className="text-gray-300 mb-6">{error}</p>
              <Link to="/essays" className="mt-4 inline-block text-yellow-400 hover:underline font-semibold py-2 px-4 border border-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-gray-900 transition-colors">
                Quay lại Thư viện Bài luận
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (!essay) {
     return (
      <Layout>
        <section className="py-10 px-4 text-center" style={{ background: "#23232b", minHeight: "100vh" }}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl mb-8">
              <h1 className="text-3xl font-bold text-gray-400">Không tìm thấy bài luận</h1>
               <Link to="/essays" className="mt-6 inline-block text-yellow-400 hover:underline font-semibold py-2 px-4 border border-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-gray-900 transition-colors">
                Quay lại Thư viện Bài luận
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const pageTitle = essay?.title || "Chi tiết Bài luận";
  // Đảm bảo topic là object trước khi truy cập name và _id
  const topicName = essay?.topic && typeof essay.topic === 'object' ? essay.topic.name : 'Chủ đề không xác định';
  const topicIdForLink = essay?.topic && typeof essay.topic === 'object' ? essay.topic._id : null;


  return (
    <Layout>
      {/* Hero section */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#23232b] rounded-2xl px-8 py-6 shadow-xl mb-0">
            <nav className="mb-10 text-sm flex flex-wrap items-center text-gray-400 space-x-1 md:space-x-2">
              <Link to="/" className="hover:underline text-yellow-400 font-semibold">Trang chủ</Link>
              <span className="mx-1 text-gray-400">/</span>
              <Link to="/essays" className="hover:underline text-yellow-400 font-semibold">Thư viện Bài luận</Link>
              {topicIdForLink && topicName && topicName !== 'Chủ đề không xác định' && topicName !== 'Chủ đề không tên' && (
                <>
                  <span className="mx-1 text-gray-400">/</span>
                  <Link to={`/topic/${topicIdForLink}`} className="hover:underline text-yellow-400 font-semibold">
                    {topicName}
                  </Link>
                </>
              )}
              <span className="mx-1 text-gray-400">/</span>
              <span className="text-gray-200 font-semibold truncate" title={essay?.title}>
                {getShortTitle(essay.title)}
              </span>
            </nav>
            <h1 className="text-2xl md:text-2xl font-heading font-bold mb-3 text-white text-justify break-words">
              {pageTitle}
            </h1>
          </div>
        </div>
      </section>

      {/* Nội dung bài luận chi tiết */}
      <section className="py-4 px-4 bg-[#18181B]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#18181B] shadow-2xl rounded-2xl p-6 md:p-0 mb-10">
            <article>
              {essay.canViewFullContent ? (
                <>
                  {essay.outline && (
                    <details className="essay-section mt-10" open>
                      <summary className="flex items-center justify-between border-b border-gray-700 py-3 px-3 cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181B] rounded-md group summary-interactive mb-0">
                        <div className="flex items-center group-hover:text-yellow-400 transition-colors duration-150">
                            <span className="mr-3 text-yellow-400 text-xl transition-transform duration-200 ease-in-out transform disclosure-arrow">❯</span>
                            <h2 className="text-2xl font-semibold text-yellow-400">Dàn ý chi tiết</h2>
                        </div>
                        <div className="flex items-center flex-shrink-0 ml-4">
                            {renderAudioPlayer(essay.audioFiles?.[0])}
                        </div>
                      </summary>
                      <div
                        className="mt-2 p-3 px-8 bg-gray-700/30 rounded prose prose-invert prose-lg max-w-none text-gray-200 text-justify"
                        style={{ lineHeight: '1.85', fontSize: '1.1rem' }}
                        dangerouslySetInnerHTML={{ __html: essay.outline }}
                      />
                    </details>
                  )}

                  {essay.content && (
                    <details className="essay-section" open>
                      <summary className="flex items-center justify-between border-b border-gray-700 py-3 px-3 cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181B] rounded-md group summary-interactive mb-0">
                        <div className="flex items-center group-hover:text-yellow-400 transition-colors duration-150">
                          <span className="mr-3 text-yellow-400 text-xl transition-transform duration-200 ease-in-out transform disclosure-arrow">❯</span>
                          <h2 className="text-2xl font-semibold text-yellow-400">Bài luận tham khảo 1</h2>
                        </div>
                        <div className="flex items-center flex-shrink-0 ml-4">
                          {renderAudioPlayer(essay.audioFiles?.[1])}
                        </div>
                      </summary>
                      <div
                        className="mt-2 p-3 px-8 bg-gray-700/30 rounded prose prose-invert prose-lg max-w-none text-gray-200 text-justify"
                        style={{ lineHeight: '1.85', fontSize: '1.1rem' }}
                        dangerouslySetInnerHTML={{ __html: essay.content }}
                      />
                    </details>
                  )}

                  {essay.essay2 && (
                    <details className="essay-section" open>
                      <summary className="flex items-center justify-between border-b border-gray-700 py-3 px-3 cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181B] rounded-md group summary-interactive mb-0">
                        <div className="flex items-center group-hover:text-yellow-400 transition-colors duration-150">
                            <span className="mr-3 text-yellow-400 text-xl transition-transform duration-200 ease-in-out transform disclosure-arrow">❯</span>
                            <h2 className="text-2xl font-semibold text-yellow-400">Bài luận tham khảo 2</h2>
                        </div>
                        <div className="flex items-center flex-shrink-0 ml-4">
                            {renderAudioPlayer(essay.audioFiles?.[2])}
                        </div>
                      </summary>
                      <div
                        className="mt-2 p-3 px-8 bg-gray-700/30 rounded prose prose-invert prose-lg max-w-none text-gray-200 text-justify"
                        style={{ lineHeight: '1.85', fontSize: '1.1rem' }}
                        dangerouslySetInnerHTML={{ __html: essay.essay2 }}
                      />
                    </details>
                  )}

                  {essay.essay3 && (
                    <details className="essay-section" open>
                      <summary className="flex items-center justify-between border-b border-gray-700 py-3 px-3 cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181B] rounded-md group summary-interactive mb-0">
                         <div className="flex items-center group-hover:text-yellow-400 transition-colors duration-150">
                            <span className="mr-3 text-yellow-400 text-xl transition-transform duration-200 ease-in-out transform disclosure-arrow">❯</span>
                            <h2 className="text-2xl font-semibold text-yellow-400">Bài luận tham khảo 3</h2>
                        </div>
                         <div className="flex items-center flex-shrink-0 ml-4">
                            {renderAudioPlayer(essay.audioFiles?.[3])}
                        </div>
                      </summary>
                      <div
                        className="mt-2 p-3 px-8 bg-gray-700/30 rounded prose prose-invert prose-lg max-w-none text-gray-200 text-justify"
                        style={{ lineHeight: '1.85', fontSize: '1.1rem' }}
                        dangerouslySetInnerHTML={{ __html: essay.essay3 }}
                      />
                    </details>
                  )}
                </>
              ) : (
                <div className="mt-10 p-6 border-2 border-dashed border-yellow-500/50 rounded-lg text-center bg-gray-800/30 shadow-lg">
                  <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Nội dung giới hạn</h2>
                  {essay.previewContent ? (
                    <div
                      className="text-gray-300 mb-6 leading-relaxed prose prose-invert max-w-none text-justify"
                      dangerouslySetInnerHTML={{ __html: essay.previewContent }}
                    />
                  ) : (
                    <p className="text-gray-300 mb-6">{essay.message || "Bạn cần đăng nhập và đăng ký để xem toàn bộ nội dung này."}</p>
                  )}

                  {!isAuthenticated ? (
                    <div className="space-y-3">
                        <p className="text-gray-300">Vui lòng đăng nhập để có thể đăng ký xem bài luận này.</p>
                        <Button onClick={() => navigate('/login', { state: { from: location } })} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold transition-transform hover:scale-105">
                            Đăng Nhập
                        </Button>
                        <span className="block sm:inline mx-2 my-2 sm:my-0 text-gray-400">hoặc</span>
                        <Button onClick={() => navigate('/register', { state: { from: location } })} variant="outline" className="w-full sm:w-auto border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 font-semibold transition-transform hover:scale-105">
                            Đăng Ký Mới
                        </Button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {essay.subscriptionStatus !== 'full_access' && essay.subscriptionStatus !== 'subscribed_specific' && (
                        <Button onClick={() => handleSubscribeEssay(essay._id)} className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold transition-transform hover:scale-105">
                          Đăng ký bài luận này
                        </Button>
                      )}
                      {essay.subscriptionStatus !== 'full_access' && (
                        <Button onClick={handleSubscribeFullAccess} className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-transform hover:scale-105">
                          Đăng ký Full Access
                        </Button>
                      )}
                       {essay.subscriptionStatus === 'subscribed_specific' && (
                        <p className="text-green-400 text-sm mt-2">Bạn đã đăng ký bài luận này.</p>
                      )}
                       {essay.subscriptionStatus === 'full_access' && (
                        <p className="text-blue-400 text-sm mt-2">Bạn đã có quyền truy cập toàn bộ.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
            <div className="mt-12 pt-6 border-t border-gray-700/50 text-center">
                <Link to="/essays" className="inline-block text-yellow-400 hover:text-yellow-300 hover:underline font-semibold py-2 px-4 rounded-lg transition-colors duration-150">
                &larr; Quay lại Thư viện Bài luận
                </Link>
            </div>
          </div>
        </div>
      </section>
      {/* CSS Styles */}
      <style>{`
        .custom-audio-controls {
          filter: invert(1) brightness(0.8) hue-rotate(180deg) saturate(0.5);
        }

        .essay-section + .essay-section {
            margin-top: 0.5rem;
            padding-top: 0;
            border-top: none;
        }

        summary {
          list-style: none;
        }
        summary::-webkit-details-marker {
          display: none;
        }
        summary::marker {
          display: none;
        }

        .disclosure-arrow {
          transition: transform 0.2s ease-in-out;
          display: inline-block;
        }
        details summary div.group-hover\\:text-yellow-300 h2,
        details summary div.group-hover\\:text-yellow-300 .disclosure-arrow {
            color: #fef08a !important;
        }
        details summary h2 {
             color: #fde047;
        }
        details summary .disclosure-arrow {
             color: #fde047;
        }

        details[open] > summary .disclosure-arrow {
          transform: rotate(90deg);
        }

        details[open] > summary.summary-interactive {
          background-color: rgba(42, 42, 51, 0.5);
        }

        .prose-invert {
            --tw-prose-body: #d1d5db;
            --tw-prose-headings: #ffffff;
            --tw-prose-lead: #9ca3af;
            --tw-prose-links: #fde047;
            --tw-prose-bold: #ffffff;
            --tw-prose-counters: #9ca3af;
            --tw-prose-bullets: #4b5563;
            --tw-prose-hr: #374151;
            --tw-prose-quotes: #e5e7eb;
            --tw-prose-quote-borders: #374151;
            --tw-prose-captions: #9ca3af;
            --tw-prose-code: #ffffff;
            --tw-prose-pre-code: #d1d5db;
            --tw-prose-pre-bg: #1f2937;
            --tw-prose-th-borders: #4b5563;
            --tw-prose-td-borders: #374151;
        }
        .prose-invert a { color: var(--tw-prose-links); }
        .prose-invert strong { color: var(--tw-prose-bold); }
        body {
          font-family: 'Inter', sans-serif;
        }
        .font-heading {
          font-family: 'Georgia', serif;
        }
      `}</style>
    </Layout>
  );
};

export default SampleEssay;