// src/pages/SampleEssay.tsx
"use client";

import * as React from "react";
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../components/theme-provider';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';

// Import Select components from shadcn/ui
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; //

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

  const bgColor = variant === 'dark'
    ? 'bg-primary text-primary-foreground'
    : 'bg-muted/30 text-foreground';
  const textColor = variant === 'dark'
    ? 'text-primary-foreground'
    : 'text-foreground';
  const iconColor = variant === 'dark'
    ? 'text-primary-foreground'
    : 'text-primary';
  const progressBarBg = variant === 'dark'
    ? 'bg-primary-foreground/30'
    : 'bg-primary/20';
  const progressBarFill = variant === 'dark'
    ? 'bg-primary-foreground'
    : 'bg-primary';
  const buttonBg = variant === 'dark'
    ? 'bg-primary-foreground/20'
    : 'bg-background';


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

  // Định nghĩa breadcrumb items (Đã thêm useMemo và cấu trúc theo component Breadcrumbs tùy chỉnh)
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: 'Trang chủ', path: '/' }];
    // Kiểm tra nếu có topic và là object, thì thêm vào breadcrumbs
    if (essay?.topic && typeof essay.topic === 'object') {
      items.push({ label: essay.topic.name, path: `/topic/${essay.topic._id}` });
    }
    // Thêm tiêu đề bài luận hiện tại (luôn là mục cuối cùng, không có path)
    if (essay) {
      items.push({ label: getShortTitle(essay.title, 50) });
    }
    return items;
  }, [essay]);


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

  if (!essay) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
            <h1 className="text-3xl font-bold text-muted-foreground">Không tìm thấy bài luận</h1>
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

  // Hàm cuộn trang đến phần "Bài viết mẫu"
  const scrollToEssayContent = () => {
    const essayContentSection = document.getElementById('essay-content-section');
    if (essayContentSection) {
      essayContentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <Layout>

      {/* Breadcrumbs */}
      <section className="bg-secondary/50 py-4 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
      </section>

      <div className={`min-h-screen bg-background text-foreground font-sans`}>
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Phần bên trái: Icon và Hướng dẫn + Nút */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <i className="fas fa-book-open text-primary text-2xl mr-3"></i>
                <h1 className="text-xl font-semibold text-foreground">
                  Hướng dẫn viết luận
                </h1>
              </div>
              {essaySections.length > 0 && (
                <button
                  onClick={scrollToEssayContent}
                  className="bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-semibold hover:bg-primary-foreground hover:text-primary transition duration-200 ease-in-out flex items-center"
                >
                  Xem bài luận mẫu <i className="fas fa-arrow-down ml-2"></i>
                </button>
              )}
            </div>
            {/* Phần bên phải: Ngày tháng */}
            <div className="text-sm text-muted-foreground hidden sm:block">
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
          {/* Part 1: Essay Outline Guide */}
          <section className="mb-16 bg-card p-4 sm:p-6 rounded-xl shadow-xl border border-border">
            <div className="bg-primary px-6 py-8 sm:px-8 flex flex-col md:flex-row justify-between items-start md:items-center rounded-t-lg -mx-6 -mt-6">
              <h2 className="text-white mb-4 md:mb-0 md:flex-1 md:pr-4">
                <i className="fas fa-flag text-primary-foreground mr-2 text-3xl"></i>
                <span className="text-2xl font-bold">Dàn ý bài luận:</span><br />
                <span className="text-base font-normal">{pageTitle}</span>
              </h2>
              <div className="w-full md:w-64">
                <CustomAudioPlayer audioSrc={essay.audioFiles?.[0]} initialDuration={300} variant="dark" />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Cấu trúc thiết yếu
                </h3>
                <p className="text-muted-foreground mb-6">
                  Một bài luận có cấu trúc tốt tuân theo một định dạng rõ ràng hướng dẫn người đọc qua lập luận của bạn một cách hợp lý và thuyết phục.
                  Hãy làm theo dàn ý này để tạo ra những bài luận hấp dẫn, thu hút khán giả và truyền đạt ý tưởng của bạn một cách hiệu quả.
                </p>

                {essay.outline ? (
                  <div className="border-l-0 border-primary pl-4">
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: essay.outline }} />
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground mb-8">
                    Không có dàn ý khả dụng.
                  </p>
                )}
              </div>

              {/* Additional Tips */}
              <div className="mt-10 bg-muted/30 p-6 rounded-lg border border-border">
                <h3 className="text-primary font-semibold mb-4 text-lg">
                  Mẹo chuyên nghiệp để viết bài luận hiệu quả
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-background p-4 rounded shadow-sm border border-border">
                    <div className="flex items-center mb-3">
                      <i className="fas fa-lightbulb text-yellow-500 text-xl mr-2"></i>
                      <h4 className="font-medium text-foreground">Rõ ràng</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Sử dụng ngôn ngữ rõ ràng, súc tích và tránh các thuật ngữ không cần thiết.
                      Mỗi câu nên đóng góp vào lập luận tổng thể của bạn.
                    </p>
                  </div>
                  <div className="bg-background p-4 rounded shadow-sm border border-border">
                    <div className="flex items-center mb-3">
                      <i className="fas fa-link text-blue-500 text-xl mr-2"></i>
                      <h4 className="font-medium text-foreground">Tính mạch lạc</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Đảm bảo các chuyển tiếp mượt mà giữa các đoạn văn và ý tưởng.
                      Bài luận của bạn nên tuân theo logic từ đầu đến cuối.
                    </p>
                  </div>
                  <div className="bg-background p-4 rounded shadow-sm border border-border">
                    <div className="flex items-center mb-3">
                      <i className="fas fa-search text-green-500 text-xl mr-2"></i>
                      <h4 className="font-medium text-foreground">Bằng chứng</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Hỗ trợ các tuyên bố bằng bằng chứng liên quan.
                      Sử dụng hỗn hợp các ví dụ, số liệu thống kê và ý kiến chuyên gia để củng cố lập luận của bạn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Part 2: Essay Content Sections with Dropdown and Side Notes */}
          <section id="essay-content-section" className="bg-card p-4 sm:p-6 rounded-xl shadow-xl border border-border">
            <div className="bg-primary px-6 py-8 sm:px-8 flex flex-col md:flex-row justify-between items-start md:items-center rounded-t-lg -mx-6 -mt-6">
              <h2 className="text-primary-foreground mb-4 md:mb-0">
                <i className="fas fa-file-alt text-primary-foreground mr-2 text-3xl"></i>
                <span className="text-2xl font-bold">Bài viết mẫu :</span><br />
              </h2>
              {essay.canViewFullContent && essaySections.length > 0 && (
                <div className="flex items-center space-x-3 text-primary-foreground text-sm relative w-full md:w-auto flex-shrink-0">
                  <span className="hidden md:inline-flex items-center text-sm font-medium mr-2">
                    Click vào đây để chọn các bài mẫu khác
                    <i className="fas fa-arrow-right ml-2 text-primary-foreground"></i>
                  </span>
                  {/* Sử dụng Shadcn/ui Select component */}
                  <Select
                      value={String(activeEssaySection)} // Giá trị phải là string
                      onValueChange={(value) => setActiveEssaySection(parseInt(value) as 1 | 2 | 3)} //
                  >
                      <SelectTrigger
                          className="w-full md:w-64 bg-primary-foreground/20 border border-primary-foreground/30 rounded-lg py-3 px-4 text-primary-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary-foreground/50 cursor-pointer"
                      >
                          <SelectValue placeholder="Chọn bài luận mẫu" />
                      </SelectTrigger>
                      <SelectContent
                          className="bg-card border border-border text-foreground shadow-lg" // Tùy chỉnh màu nền, viền cho dropdown content
                      >
                          {essaySections.map((sec) => (
                              <SelectItem
                                  key={sec.id}
                                  value={String(sec.id)}
                                  className="hover:bg-accent hover:text-accent-foreground cursor-pointer" //
                              >
                                  {sec.title}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              {essay.canViewFullContent ? (
                currentEssaySection ? (
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <div className="pb-4">
                        <div className="flex items-center mb-2">
                          <div className="w-1 h-8 bg-primary mr-3"></div>
                          <h3 className="text-xl font-bold text-foreground">
                            {currentEssaySection.title}: {pageTitle}
                          </h3>
                        </div>
                        <div className="mb-6">
                          <CustomAudioPlayer audioSrc={currentEssaySection.audio} initialDuration={270} variant="light" />
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-muted-foreground text-justify " dangerouslySetInnerHTML={{ __html: currentEssaySection.content || '' }} />
                      </div>
                    </div>

                    <div className="md:col-span-1 space-y-6">
                      <div className="bg-muted/30 p-5 rounded-lg border border-border">
                        <h4 className="text-primary font-medium mb-3 flex items-center">
                          <i className="fas fa-lightbulb text-primary mr-2"></i>
                          Điểm mạnh chính
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
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

                      <div className="bg-muted/30 p-5 rounded-lg border border-border">
                        <h4 className="text-foreground font-medium mb-3 flex items-center">
                          <i className="fas fa-search text-primary mr-2"></i>
                          Ghi chú phân tích
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Bài luận này trình bày hiệu quả quan điểm cân bằng về chủ đề,
                          xem xét nhiều khía cạnh trong khi vẫn giữ vững lập trường rõ ràng.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tác giả sử dụng nhiều loại bằng chứng và chuyển tiếp mượt mà giữa các ý tưởng,
                          tạo ra một lập luận gắn kết.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Không có nội dung cho phần bài luận này.</p>
                )
              ) : (
                <div className="mt-10 p-6 border-2 border-dashed border-primary/50 rounded-lg text-center bg-card shadow-lg">
                  <h2 className="text-2xl font-semibold text-primary mb-4">Nội dung bị giới hạn</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
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
      </div>
      <style>{` details[open] > summary .details-arrow { transform: rotate(90deg); } `}</style>
    </Layout>
  );
};

export default SampleEssay;