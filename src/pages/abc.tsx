// src/pages/SampleEssay.tsx
"use client";

import * as React from "react";
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../components/theme-provider';

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

// Format time from seconds
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

interface CustomAudioPlayerProps {
  audioSrc: string | undefined;
  initialDuration: number;
  variant: 'dark' | 'light';
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ audioSrc, initialDuration, variant }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(initialDuration);

  // Determine colors based on variant and dark mode
  const bgColor = variant === 'dark'
    ? 'bg-gradient-to-r from-violet-600 to-indigo-600'
    : 'bg-indigo-100 dark:bg-gray-700';
  const textColor = variant === 'dark'
    ? 'text-white'
    : 'text-indigo-800 dark:text-gray-200';
  const iconColor = variant === 'dark'
    ? 'text-indigo-600'
    : 'text-indigo-600 dark:text-blue-400';
  const progressBarBg = variant === 'dark'
    ? 'bg-white bg-opacity-30'
    : 'bg-indigo-200 dark:bg-gray-600';
  const progressBarFill = variant === 'dark'
    ? 'bg-white'
    : 'bg-indigo-600 dark:bg-blue-400';
  const buttonBg = variant === 'dark'
    ? 'bg-white'
    : 'bg-white dark:bg-gray-800';


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const setAudioData = () => {
      setDuration(isFinite(audio.duration) ? audio.duration : initialDuration);
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      if (audio) audio.currentTime = 0;
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [initialDuration]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = e.currentTarget;
    if (audio && progressBar) {
      const clickX = e.nativeEvent.offsetX;
      const width = progressBar.offsetWidth;
      const newProgress = (clickX / width);
      audio.currentTime = newProgress * audio.duration;
    }
  };

  if (!audioSrc) return null;

  return (
    <div className={`w-full rounded-lg p-3 flex items-center space-x-4 shadow-lg ${bgColor} ${textColor}`}>
      <button
        onClick={togglePlayPause}
        className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md cursor-pointer flex-shrink-0 ${buttonBg}`}
      >
        <i
          className={`fas ${isPlaying ? "fa-pause" : "fa-play"} ${iconColor} text-xl`}
        ></i>
      </button>
      <div className="flex-1 flex flex-col justify-center">
        <div className={`w-full rounded-full h-2 mb-1 cursor-pointer ${progressBarBg}`} onClick={handleProgressBarClick}>
          <div
            className={`h-2 rounded-full ${progressBarFill}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <audio ref={audioRef} src={audioSrc} controlsList="nodownload" preload="metadata" className="hidden" />
    </div>
  );
};


const SampleEssay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [essay, setEssay] = useState<EssayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeEssaySection, setActiveEssaySection] = useState<1 | 2 | 3>(1);

  const { theme } = useTheme();

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

  if (loading || authIsLoading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary dark:border-blue-400 border-r-transparent" role="status">
                <span className="sr-only">Đang tải...</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground dark:text-gray-100 mt-4">Đang tải dữ liệu...</h1>
            <p className="text-muted-foreground dark:text-gray-400">Vui lòng chờ trong giây lát.</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
            <h1 className="text-3xl font-bold text-destructive dark:text-red-400">Lỗi!</h1>
            <p className="text-muted-foreground dark:text-gray-400 mt-2">{error}</p>
            <Button asChild variant="link" className="mt-4"><Link to="/">Về trang chủ</Link></Button>
          </div>
      </Layout>
    );
  }

  if (!essay) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
            <h1 className="text-3xl font-bold text-muted-foreground dark:text-gray-400">Không tìm thấy bài luận</h1>
            <Button asChild className="mt-6"><Link to="/essays">Quay lại Thư viện</Link></Button>
          </div>
      </Layout>
    );
  }

  const pageTitle = essay.title;
  const topicName = essay.topic && typeof essay.topic === 'object' ? essay.topic.name : 'Chủ đề';
  const topicIdForLink = essay.topic && typeof essay.topic === 'object' ? essay.topic._id : null;

  const essaySections = [];
  if (essay.content) {
    essaySections.push({
      id: 1,
      title: "Bài luận 1",
      content: essay.content,
      audio: essay.audioFiles?.[1]
    });
  }
  if (essay.essay2) {
    essaySections.push({
      id: 2,
      title: "Bài luận 2",
      content: essay.essay2,
      audio: essay.audioFiles?.[2]
    });
  }
  if (essay.essay3) {
    essaySections.push({
      id: 3,
      title: "Bài luận 3",
      content: essay.essay3,
      audio: essay.audioFiles?.[3]
    });
  }

  const currentEssaySection = essaySections.find(sec => sec.id === activeEssaySection);

  return (
    <Layout>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <i className="fas fa-book-open text-indigo-600 text-2xl mr-3"></i>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Essay Writing Guide
              </h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-8 text-sm flex flex-wrap items-center text-muted-foreground dark:text-gray-400 space-x-2">
            <Link to="/" className="hover:underline text-primary dark:text-blue-300">Trang chủ</Link>
            <span>/</span>
            <Link to="/essays" className="hover:underline text-primary dark:text-blue-300">Thư viện</Link>
            {topicIdForLink && (<><span>/</span><Link to={`/topic/${topicIdForLink}`} className="hover:underline text-primary dark:text-blue-300">{topicName}</Link></>)}
            <span>/</span>
            <span className="text-foreground dark:text-gray-100 font-medium truncate" title={essay.title}>{getShortTitle(essay.title)}</span>
          </nav>

          {/* Part 1: Essay Outline Guide */}
          <section className="mb-16 bg-card dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl border dark:border-gray-700">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 sm:px-8 flex flex-col md:flex-row justify-between items-start md:items-center rounded-t-lg -mx-6 -mt-6">
              <h2 className="text-2xl font-bold text-white mb-4 md:mb-0 md:flex-1 md:pr-4">
                Dàn ý bài luận: <span className="font-normal">{pageTitle}</span>
              </h2>
              <div className="w-full md:w-64">
                <CustomAudioPlayer audioSrc={essay.audioFiles?.[0]} initialDuration={300} variant="dark" />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Cấu trúc thiết yếu
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Một bài luận có cấu trúc tốt tuân theo một định dạng rõ ràng hướng dẫn người đọc qua lập luận của bạn một cách hợp lý và thuyết phục.
                  Hãy làm theo dàn ý này để tạo ra những bài luận hấp dẫn, thu hút khán giả và truyền đạt ý tưởng của bạn một cách hiệu quả.
                </p>

                {essay.outline ? (
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                      <i className="fas fa-flag text-indigo-500 mr-2"></i>
                      Dàn ý chi tiết
                    </h4>
                    <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: essay.outline }} />
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground dark:text-gray-400 mb-8">
                    Không có dàn ý khả dụng.
                  </p>
                )}
              </div>

              {/* Additional Tips - This section remains unchanged as it's general guidance */}
              <div className="mt-10 bg-indigo-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-700 dark:text-blue-300 mb-4">
                  Mẹo chuyên nghiệp để viết bài luận hiệu quả
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-600 p-4 rounded shadow-sm">
                    <div className="flex items-center mb-3">
                      <i className="fas fa-lightbulb text-yellow-500 text-xl mr-2"></i>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Rõ ràng</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Sử dụng ngôn ngữ rõ ràng, súc tích và tránh các thuật ngữ không cần thiết.
                      Mỗi câu nên đóng góp vào lập luận tổng thể của bạn.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-600 p-4 rounded shadow-sm">
                    <div className="flex items-center mb-3">
                      <i className="fas fa-link text-blue-500 text-xl mr-2"></i>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Tính mạch lạc</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Đảm bảo các chuyển tiếp mượt mà giữa các đoạn văn và ý tưởng.
                      Bài luận của bạn nên tuân theo logic từ đầu đến cuối.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-600 p-4 rounded shadow-sm">
                    <div className="flex items-center mb-3">
                      <i className="fas fa-search text-green-500 text-xl mr-2"></i>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Bằng chứng</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Hỗ trợ các tuyên bố bằng bằng chứng liên quan.
                      Sử dụng hỗn hợp các ví dụ, số liệu thống kê và ý kiến chuyên gia để củng cố lập luận của bạn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Part 2: Essay Content Sections with Dropdown and Side Notes */}
          <section className="bg-card dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl border dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-8 sm:px-8 flex flex-col md:flex-row justify-between items-start md:items-center rounded-t-lg -mx-6 -mt-6">
              <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">
                Các bài luận chi tiết
              </h2>
              {/* This div wraps the dropdown and the hint text/arrow */}
              {essay.canViewFullContent && essaySections.length > 0 && (
                <div className="flex items-center space-x-3 text-white text-sm relative w-full md:w-auto flex-shrink-0">
                  {/* Hint text and arrow */}
                  <span className="hidden md:inline-flex items-center text-sm font-medium mr-2">
                    Click vào đây để chọn các bài mẫu khác
                    <i className="fas fa-arrow-right ml-2 text-white"></i>
                  </span>
                  {/* Essay Selector Dropdown */}
                  <div className="relative w-full md:w-64">
                    <select
                      value={activeEssaySection}
                      onChange={(e) => setActiveEssaySection(parseInt(e.target.value) as 1 | 2 | 3)}
                      className="block w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg py-3 px-4 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 cursor-pointer"
                    >
                      {essaySections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.title}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              {essay.canViewFullContent ? (
                currentEssaySection ? (
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <div className="pb-4">
                        <div className="flex items-center mb-4">
                          <div className="w-1 h-8 bg-blue-600 dark:bg-blue-400 mr-3"></div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            {currentEssaySection.title}: {pageTitle}
                          </h3>
                        </div>
                        {/* Audio Player for the selected Essay Section */}
                        <CustomAudioPlayer audioSrc={currentEssaySection.audio} initialDuration={270} variant="light" />
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 prose dark:prose-invert max-w-none mt-6" dangerouslySetInnerHTML={{ __html: currentEssaySection.content }} />
                        <img
                          src={`https://readdy.ai/api/search-image?query=Abstract concept illustration related to ${pageTitle}. Minimalist design with soft colors and geometric shapes on a light background. Professional, educational, and visually appealing illustration suitable for an, educational, and visually appealing illustration suitable for an academic website&width=400&height=300&seq=11&orientation=landscape`}
                          alt={`Illustration for ${pageTitle}`}
                          className="w-full h-auto rounded-lg shadow-md object-cover object-top mt-8"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1 space-y-6">
                      <div className="bg-blue-50 dark:bg-gray-700 p-5 rounded-lg border border-blue-100 dark:border-gray-600">
                        <h4 className="text-blue-800 dark:text-blue-300 font-medium mb-3 flex items-center">
                          <i className="fas fa-lightbulb text-blue-500 mr-2"></i>
                          Điểm mạnh chính
                        </h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                            <span>Luận điểm rõ ràng</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                            <span>Các đoạn văn có cấu trúc tốt</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                            <span>Bằng chứng hỗ trợ mạnh mẽ</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                            <span>Kết luận hiệu quả</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h4 className="text-gray-800 dark:text-gray-200 font-medium mb-3 flex items-center">
                          <i className="fas fa-search text-indigo-500 mr-2"></i>
                          Ghi chú phân tích
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          Bài luận này trình bày hiệu quả quan điểm cân bằng về chủ đề,
                          xem xét nhiều khía cạnh trong khi vẫn giữ vững lập trường rõ ràng.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Tác giả sử dụng nhiều loại bằng chứng và chuyển tiếp mượt mà giữa các ý tưởng,
                          tạo ra một lập luận gắn kết.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground dark:text-gray-400">Không có nội dung cho phần bài luận này.</p>
                )
              ) : (
                // Limited access view for detailed essays
                <div className="mt-10 p-6 border-2 border-dashed border-primary/50 dark:border-blue-700 rounded-lg text-center bg-card dark:bg-gray-700 shadow-lg">
                  <h2 className="text-2xl font-semibold text-primary dark:text-blue-300 mb-4">Nội dung bị giới hạn</h2>
                  <p className="text-muted-foreground dark:text-gray-400 mb-6 leading-relaxed">
                    Vui lòng Đăng nhập hoặc Đăng ký các gói truy cập để xem toàn bộ nội dung bài luận này.
                  </p>
                  <div className="mt-4 space-y-3 sm:space-y-0 sm:space-x-4">
                    {!isAuthenticated ? (
                      <>
                        <Button onClick={() => navigate('/login', { state: { from: location } })}>Đăng Nhập</Button>
                        <Button onClick={() => navigate('/register', { state: { from: location } })} variant="outline">Đăng Ký Mới</Button>
                      </>
                    ) : (
                      <>
                        {/* Only show subscribe buttons if not already full access */}
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
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-300 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                  <i className="fas fa-book-open mr-2"></i>
                  Essay Writing Guide
                </h3>
                <p className="text-sm text-gray-400">
                  Helping students master the art of essay writing with
                  comprehensive guides and examples.
                </p>
              </div>
              <div>
                <h4 className="text-white text-base font-medium mb-4">
                  Quick Links
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors duration-200 flex items-center"
                    >
                      <i className="fas fa-chevron-right text-xs mr-2"></i>{" "}
                      Writing Resources
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors duration-200 flex items-center"
                    >
                      <i className="fas fa-chevron-right text-xs mr-2"></i>{" "}
                      Grammar Guide
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors duration-200 flex items-center"
                    >
                      <i className="fas fa-chevron-right text-xs mr-2"></i>{" "}
                      Citation Tools
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors duration-200 flex items-center"
                    >
                      <i className="fas fa-chevron-right text-xs mr-2"></i>{" "}
                      Writing Prompts
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-base font-medium mb-4">
                  Contact Us
                </h4>
                <div className="space-y-3 text-sm">
                  <p className="flex items-start">
                    <i className="fas fa-envelope mt-1 mr-3 text-gray-400"></i>
                    <span>support@essayguide.com</span>
                  </p>
                  <p className="flex items-start">
                    <i className="fas fa-phone-alt mt-1 mr-3 text-gray-400"></i>
                    <span>+1 (555) 123-4567</span>
                  </p>
                </div>
                <div className="mt-4 flex space-x-4">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <i className="fab fa-facebook"></i>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                &copy; 2025 Essay Writing Guide. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0 flex space-x-6 text-sm">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Accessibility
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <style>{` details[open] > summary .details-arrow { transform: rotate(90deg); } `}</style>
    </Layout>
  );
};

export default SampleEssay;