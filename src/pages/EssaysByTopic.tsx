import React, { useEffect, useState, useMemo } from 'react'; // Import useMemo
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs'; // Import Breadcrumbs và BreadcrumbItem

// SỬA LỖI: Khôi phục lại logic cho 2 hàm helpers
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const getFirstParagraph = (html: string): string => {
  if (!html) return '';
  const match = html.match(/<p.*?>(.*?)<\/p>/is);
  if (match && match[1]) {
    const paragraphText = stripHtml(match[1]);
    return paragraphText.substring(0, 200) + (paragraphText.length > 200 ? '...' : '');
  }
  const plainText = stripHtml(html);
  return plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
};


// Interfaces (giữ nguyên)
interface Essay { _id: string; title: string; content: string; topic?: string | { _id: string; name: string } | null; createdAt?: string; }
// Updated TopicWithImage to reflect `category` being populated by topicRoutes.js
interface TopicWithImage {
  _id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  createdAt?: string;
  // 'category' will be an object if populated
  category?: { _id: string; name: string; description?: string } | null;
}
interface ApiErrorResponse { error: string; }

const ESSAYS_PER_PAGE = 4; // Changed to 4 as requested (3-4 articles)
const OTHER_TOPICS_PER_PAGE = 8; // Number of other topics per page

// Example data for "Most Viewed Essays" (keep as example for now)
const EXAMPLE_MOST_VIEWED_ESSAYS: Essay[] = [
  { _id: 'ex1', title: 'Phương pháp học tập hiệu quả cho sinh viên đại học', content: '', createdAt: '2025-06-10T00:00:00.000Z' },
  { _id: 'ex2', title: 'Tổng quan về văn học Việt Nam thời kỳ đổi mới', content: '', createdAt: '2025-06-08T00:00:00.000Z' },
  { _id: 'ex3', title: 'Kỹ năng viết luận văn học hiệu quả cho học sinh THPT', content: '', createdAt: '2025-06-05T00:00:00.000Z' },
  { _id: 'ex4', title: 'Phân tích tác phẩm "Số Đỏ" của Vũ Trọng Phụng', content: '', createdAt: '2025-06-01T00:00:00.000Z' },
];

// Example data for "Latest Essays" (keep as example for now)
const EXAMPLE_LATEST_ESSAYS: Essay[] = [
  { _id: 'lat1', title: 'Ảnh hưởng của văn học nước ngoài đến văn học Việt Nam hiện đại', content: '', createdAt: '2025-06-13T00:00:00.000Z' },
  { _id: 'lat2', title: 'Phân tích nhân vật Chí Phèo trong tác phẩm của Nam Cao', content: '', createdAt: '2025-06-12T00:00:00.000Z' },
  { _id: 'lat3', title: 'Tìm hiểu về thơ ca cách mạng Việt Nam giai đoạn 1945-1975', content: '', createdAt: '2025-06-11T00:00:00.000Z' },
  { _id: 'lat4', title: 'Nghệ thuật sử dụng ngôn ngữ trong truyện ngắn Nguyễn Công Hoan', content: '', createdAt: '2025-06-09T00:00:00.000Z' },
];


const EssaysByTopic: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [allEssaysForTopic, setAllEssaysForTopic] = useState<Essay[]>([]);
  const [displayedEssays, setDisplayedEssays] = useState<Essay[]>([]);
  const [currentTopic, setCurrentTopic] = useState<TopicWithImage | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1); // For main essays list

  // States for sidebar data
  const [mostViewedEssays, setMostViewedEssays] = useState<Essay[]>([]);
  const [latestEssays, setLatestEssays] = useState<Essay[]>([]);
  
  // States for "Other Topics" section
  const [allOtherTopics, setAllOtherTopics] = useState<TopicWithImage[]>([]);
  const [currentPageOtherTopics, setCurrentPageOtherTopics] = useState<number>(1);


  useEffect(() => {
    const fetchData = async () => {
      if (!topicId) {
        setError("Không tìm thấy ID chủ đề.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      setCurrentPage(1);
      setCurrentPageOtherTopics(1); // Reset other topics pagination too

      try {
        // Fetch current topic details
        const topicRes = await axiosInstance.get<TopicWithImage>(`/api/topics/${topicId}`);
        setCurrentTopic(topicRes.data); // This will include category.name and description if populated
        document.title = `${topicRes.data.name} - Bài luận`; // Cập nhật tiêu đề trang

        // Fetch essays for the current topic
        const essaysRes = await axiosInstance.get<Essay[]>(`/api/essays?topic=${topicId}`);
        setAllEssaysForTopic(essaysRes.data);

        // Use example data for "Most Viewed Essays"
        setMostViewedEssays(EXAMPLE_MOST_VIEWED_ESSAYS);

        // Use example data for "Latest Essays"
        setLatestEssays(EXAMPLE_LATEST_ESSAYS);

        // Fetch all other topics from the database
        const otherTopicsRes = await axiosInstance.get<TopicWithImage[]>('/api/topics'); // Fetch ALL topics
        // Filter out the current topic and set them
        setAllOtherTopics(otherTopicsRes.data.filter(topic => topic._id !== topicId));

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        let errorMessage = 'Không thể tải dữ liệu chủ đề hoặc bài luận.';
        if (axios.isAxiosError(err)) {
            const serverError = err.response?.data as ApiErrorResponse;
            errorMessage = serverError?.error || err.message;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }
        setError(errorMessage);
        setCurrentTopic(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [topicId]);

  useEffect(() => {
    setCurrentPage(1);
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = searchTerm
      ? allEssaysForTopic.filter(essay => {
          const titleMatch = essay.title.toLowerCase().includes(lowerCaseSearchTerm);
          const contentMatch = stripHtml(essay.content).toLowerCase().includes(lowerCaseSearchTerm);
          return titleMatch || contentMatch;
        })
      : allEssaysForTopic;
    setDisplayedEssays(filtered);
  }, [searchTerm, allEssaysForTopic]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleResetSearch = () => {
    setSearchTerm('');
  };

  // Pagination for main essays
  const totalPagesEssays = Math.ceil(displayedEssays.length / ESSAYS_PER_PAGE);
  const essaysForCurrentPage = displayedEssays.slice((currentPage - 1) * ESSAYS_PER_PAGE, currentPage * ESSAYS_PER_PAGE);

  const handlePageChangeEssays = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPagesEssays) {
      setCurrentPage(pageNumber);
      document.getElementById('essay-list-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const renderPageNumbersEssays = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPagesEssays; i++) {
        pageNumbers.push(
            <button key={i} onClick={() => handlePageChangeEssays(i)} className={`py-2 px-4 mx-1 border rounded-md text-sm font-medium transition-colors ${currentPage === i ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-card-foreground border-border hover:bg-accent'}`}>
              {i}
            </button>
        );
    }
    return pageNumbers;
  };

  // Pagination for other topics
  const totalPagesOtherTopics = Math.ceil(allOtherTopics.length / OTHER_TOPICS_PER_PAGE);
  const otherTopicsForCurrentPage = allOtherTopics.slice((currentPageOtherTopics - 1) * OTHER_TOPICS_PER_PAGE, currentPageOtherTopics * OTHER_TOPICS_PER_PAGE);

  const handlePageChangeOtherTopics = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPagesOtherTopics) {
      setCurrentPageOtherTopics(pageNumber);
      document.getElementById('other-topics-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderPageNumbersOtherTopics = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPagesOtherTopics; i++) {
        pageNumbers.push(
            <button key={i} onClick={() => handlePageChangeOtherTopics(i)} className={`py-2 px-4 mx-1 border rounded-md text-sm font-medium transition-colors ${currentPageOtherTopics === i ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-card-foreground border-border hover:bg-accent'}`}>
              {i}
            </button>
        );
    }
    return pageNumbers;
  };


  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime(); // Calculate difference in milliseconds
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Calculate difference in full days

        if (diffDays === 0) { // Check if it's today
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffTime / (1000 * 60));
                if (diffMinutes === 0) return 'vừa xong';
                return `${diffMinutes} phút trước`;
            }
            return `${diffHours} giờ trước`;
        }
        if (diffDays === 1) return 'hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;


        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch (e) {
        console.error("Error parsing date:", dateString, e);
        return dateString;
    }
  };

  // Định nghĩa breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Trang chủ', path: '/' },
      { label: 'Tất cả chủ đề', path: '/alltopic' },
    ];
    if (currentTopic) {
      items.push({ label: currentTopic.name }); // Mục cuối cùng không có path
    }
    return items;
  }, [currentTopic]);


  if (loading) {
    return <Layout><div className="flex justify-center items-center min-h-screen text-foreground text-xl">Đang tải dữ liệu...</div></Layout>;
  }
  if (error || !currentTopic) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
          <p className="text-destructive text-xl">{error || "Không tìm thấy thông tin chủ đề."}</p>
          <Link to="/alltopic" className="mt-4 text-primary hover:underline">Quay lại danh sách chủ đề</Link>
        </div>
      </Layout>
    );
  }

  const topicName = currentTopic.name || 'Chủ đề không xác định';
  // Use category.description if available, otherwise fallback to topic.description, then a default string
  const topicDescription = currentTopic.category?.description || currentTopic.description || 'Chưa có mô tả cho chủ đề này.';

  return (
    <Layout>
      <section className="py-4 bg-secondary/50 border-b border-border"> {/* Thay đổi padding-top và background */}
        {/* Full width navigation */}
        <div className="max-w-7xl mx-auto px-4">
          {/* Sử dụng component Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </section>

      <section className="py-10 px-4 bg-background"> {/* Giữ nguyên padding cho section này */}
        {/* Topic Header Section: Image on right, Text on left */}
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center lg:items-start gap-8 mb-12 bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3 text-foreground">
              Bài luận chủ đề: <span className="text-primary">{topicName}</span>
            </h1>
            <p className="mb-6 text-muted-foreground text-lg">
              {topicDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto lg:mx-0">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={`Tìm kiếm trong chủ đề "${topicName}"...`}
                className="flex-1 p-3 bg-input text-foreground border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none placeholder:text-muted-foreground"
              />
              {searchTerm && (
                <button
                  onClick={handleResetSearch}
                  className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shrink-0"
                >
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          </div>
          
          {currentTopic.imageUrl && (
            <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
              <img src={currentTopic.imageUrl} alt={`Hình ảnh cho chủ đề ${topicName}`} className="w-full max-w-xs sm:max-w-md lg:max-w-full h-auto rounded-lg shadow-lg border-4 border-border object-cover" style={{ maxHeight: '300px' }}/>
            </div>
          )}
        </div>


        {/* Main content (essays) and sidebar container */}
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 mb-12">
          <div className="flex-1"> {/* Main content area */}
            {essaysForCurrentPage.length === 0 && !loading && (
              <div className="text-center py-10">
                  <p className="text-xl text-muted-foreground">Không tìm thấy bài luận nào {searchTerm ? `cho từ khóa "${searchTerm}"` : ""} trong chủ đề này.</p>
                   {searchTerm && ( <button onClick={() => setSearchTerm('')} className="mt-4 text-primary hover:underline">Xóa tìm kiếm</button>)}
              </div>
            )}

            <div id="essay-list-container">
              <ul className="space-y-6 sm:space-y-8">
                {essaysForCurrentPage.map((essay, idx) => (
                  <li key={essay._id} className="bg-card rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-primary/20 border">
                    {/* Link to specific essay page - CORRECTED TO /sampleessay/:id */}
                    <Link to={`/sampleessay/${essay._id}`} className="block group p-6 sm:p-8">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 flex items-center justify-center bg-primary text-primary-foreground w-10 h-10 rounded-full font-bold text-lg">
                          {(currentPage - 1) * ESSAYS_PER_PAGE + idx + 1}
                        </span>
                        <div className="flex-1">
                          <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {essay.title}
                          </h2>
                          <p className="text-muted-foreground text-base mt-2 leading-relaxed line-clamp-3">
                            {getFirstParagraph(essay.content)}
                          </p>
                          <span className="inline-block mt-4 text-primary font-semibold group-hover:underline">
                            Xem chi tiết →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {totalPagesEssays > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-2">
                <button onClick={() => handlePageChangeEssays(currentPage - 1)} disabled={currentPage === 1} className="py-2 px-4 border border-border rounded-md text-sm font-medium transition-colors bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                  « Trước
                </button>
                {renderPageNumbersEssays()}
                <button onClick={() => handlePageChangeEssays(currentPage + 1)} disabled={currentPage === totalPagesEssays} className="py-2 px-4 border border-border rounded-md text-sm font-medium transition-colors bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                  Sau »
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-8 mt-10 lg:mt-0">
            {/* "Bài luận được xem nhiều nhất" section - using example data */}
            <div className="bg-card rounded-lg shadow-md p-6 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4 border-b pb-2">Bài luận được xem nhiều nhất</h3>
              <ul className="space-y-4">
                {mostViewedEssays.map(essay => (
                  <li key={essay._id}>
                    {/* Link to specific essay page - CORRECTED TO /sampleessay/:id */}
                    <Link to={`/sampleessay/${essay._id}`} className="flex items-start gap-3 group">
                      <div>
                        <p className="text-base font-medium text-foreground group-hover:text-primary transition-colors">{essay.title}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(essay.createdAt)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
                {mostViewedEssays.length === 0 && <p className="text-muted-foreground text-sm">Không có bài luận nào.</p>}
              </ul>
            </div>

            {/* "Bài luận mới nhất" section - using example data */}
            <div className="bg-card rounded-lg shadow-md p-6 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4 border-b pb-2">Bài luận mới nhất</h3>
              <ul className="space-y-4">
                {latestEssays.map(essay => (
                  <li key={essay._id}>
                    {/* Link to specific essay page - CORRECTED TO /sampleessay/:id */}
                    <Link to={`/sampleessay/${essay._id}`} className="group">
                      <p className="text-base font-medium text-foreground group-hover:text-primary transition-colors">{essay.title}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(essay.createdAt)}</p>
                    </Link>
                  </li>
                ))}
                {latestEssays.length === 0 && <p className="text-muted-foreground text-sm">Không có bài luận nào.</p>}
              </ul>
            </div>
          </aside>
        </div>

        {/* "Chủ đề khác" section - now a separate full-width section from database */}
        <div id="other-topics-container" className="max-w-7xl mx-auto mt-12 bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
            <h3 className="text-3xl font-bold text-foreground mb-6 text-center">Khám phá các chủ đề khác</h3>
            
            {otherTopicsForCurrentPage.length === 0 && !loading && (
                <div className="text-center py-5">
                    <p className="text-xl text-muted-foreground">Không tìm thấy chủ đề khác nào.</p>
                </div>
            )}

            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {otherTopicsForCurrentPage.map(topic => (
                    <li key={topic._id} className="bg-background rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/50 border border-border">
                        {/* Link to specific topic page - CORRECTED TO /essaysbytopic/:topicId */}
                        <Link to={`/essaysbytopic/${topic._id}`} className="block group">
                            <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-1">{topic.name}</h4>
                            {/* Display category name if populated, otherwise fallback to topic.description */}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {topic.category?.name ? `Thuộc về: ${topic.category.name}` : (topic.description || 'Chưa có mô tả.')}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>

            {totalPagesOtherTopics > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-2">
                <button onClick={() => handlePageChangeOtherTopics(currentPageOtherTopics - 1)} disabled={currentPageOtherTopics === 1} className="py-2 px-4 border border-border rounded-md text-sm font-medium transition-colors bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                  « Trước
                </button>
                {renderPageNumbersOtherTopics()}
                <button onClick={() => handlePageChangeOtherTopics(currentPageOtherTopics + 1)} disabled={currentPageOtherTopics === totalPagesOtherTopics} className="py-2 px-4 border border-border rounded-md text-sm font-medium transition-colors bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                  Sau »
                </button>
              </div>
            )}
        </div>
      </section>
    </Layout>
  );
};

export default EssaysByTopic;