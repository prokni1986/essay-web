// EssaysByTopic.tsx
import React, { useEffect, useState, ChangeEvent } from 'react'; // Thêm ChangeEvent nếu bạn chưa có
import axios, { AxiosError } from 'axios'; // Import AxiosError
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';

// Helpers
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const getFirstParagraph = (html: string): string => {
  const match = html.match(/<p.*?>(.*?)<\/p>/is);
  if (match && match[1]) {
    return stripHtml(match[1]);
  }
  const plainText = stripHtml(html);
  return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
};

interface Essay {
  _id: string;
  title: string;
  content: string;
  topic?: string | { _id: string; name: string } | null;
}

interface TopicWithImage {
  _id: string;
  name: string;
  imageUrl?: string;
}

// Định nghĩa kiểu cho lỗi API nếu backend trả về cấu trúc cụ thể
interface ApiErrorResponse {
  error: string;
}

const ESSAYS_PER_PAGE = 5;

const EssaysByTopic: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [allEssaysForTopic, setAllEssaysForTopic] = useState<Essay[]>([]);
  const [displayedEssays, setDisplayedEssays] = useState<Essay[]>([]);
  const [currentTopic, setCurrentTopic] = useState<TopicWithImage | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>(''); // Kiểu string cho state error
  const [currentPage, setCurrentPage] = useState<number>(1);

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
      try {
        const topicRes = await axios.get<TopicWithImage>(`http://localhost:5050/api/topics/${topicId}`);
        setCurrentTopic(topicRes.data);

        const essaysRes = await axios.get<Essay[]>(`http://localhost:5050/api/essays?topic=${topicId}`);
        setAllEssaysForTopic(essaysRes.data);
      } catch (err) { // Dòng 64 ở đây
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
    if (!searchTerm) {
      setDisplayedEssays(allEssaysForTopic);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = allEssaysForTopic.filter(essay => {
      const titleMatch = essay.title.toLowerCase().includes(lowerCaseSearchTerm);
      const contentMatch = stripHtml(essay.content).toLowerCase().includes(lowerCaseSearchTerm);
      return titleMatch || contentMatch;
    });
    setDisplayedEssays(filtered);
  }, [searchTerm, allEssaysForTopic]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const totalPages = Math.ceil(displayedEssays.length / ESSAYS_PER_PAGE);
  const indexOfLastEssayOnPage = currentPage * ESSAYS_PER_PAGE;
  const indexOfFirstEssayOnPage = indexOfLastEssayOnPage - ESSAYS_PER_PAGE;
  const essaysForCurrentPage = displayedEssays.slice(indexOfFirstEssayOnPage, indexOfLastEssayOnPage);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      const essayListElement = document.getElementById('essay-list-container');
      if (essayListElement) {
        window.scrollTo({ top: essayListElement.offsetTop - 80, behavior: 'smooth' });
      }
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 3;
    let startPage: number, endPage: number;

    if (totalPages <= maxPageButtons) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPageButtons / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPageButtons / 2) - 1;
      if (currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1;
        endPage = maxPageButtons;
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        startPage = totalPages - maxPageButtons + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`py-2 px-4 mx-1 border rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none
            ${currentPage === i
              ? 'bg-yellow-400 text-white border-yellow-400'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  // Phần JSX giữ nguyên như trước
  if (loading) {
    return (
      <Layout>
        <section className="py-10 px-4 text-center" style={{ background: "#23232b", minHeight: "100vh" }}>
            <div className="max-w-5xl mx-auto">
                 <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl mb-8">
                    <h1 className="text-3xl font-bold text-white">Đang tải dữ liệu...</h1>
                </div>
            </div>
        </section>
      </Layout>
    );
  }

  if (error || !currentTopic) {
    return (
      <Layout>
        <section className="py-10 px-4 text-center" style={{ background: "#23232b", minHeight: "100vh" }}>
            <div className="max-w-5xl mx-auto">
                 <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl mb-8">
                    <h1 className="text-3xl font-bold text-red-500">{error || "Không tìm thấy thông tin chủ đề."}</h1>
                     <Link to="/alltopic" className="mt-4 inline-block text-yellow-400 hover:underline">
                        Quay lại danh sách chủ đề
                    </Link>
                </div>
            </div>
        </section>
      </Layout>
    );
  }

  const topicName = currentTopic.name || 'Chủ đề không xác định';

  return (
    <Layout>
      <section className="py-10 px-4" style={{ background: "#23232b", minHeight: "100vh" }}>
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl mb-8">
            <nav className="mb-6 text-sm flex flex-wrap items-center text-gray-400 space-x-2">
              <Link to="/" className="hover:underline text-yellow-400 font-semibold">Trang chủ</Link>
              <span className="mx-1">/</span>
              <Link to="/alltopic" className="hover:underline text-yellow-400 font-semibold">Tất cả chủ đề</Link>
              <span className="mx-1">/</span>
              <span className="text-gray-200 font-semibold">{topicName}</span>
            </nav>

            {currentTopic.imageUrl && (
              <div className="mb-6 sm:mb-8 text-center">
                <img
                  src={currentTopic.imageUrl}
                  alt={`Hình ảnh cho chủ đề ${topicName}`}
                  className="w-full max-w-md md:max-w-lg mx-auto rounded-lg shadow-lg border-4 border-gray-700"
                  style={{ width: '100%', height: '350px', objectFit: 'cover' }} // Đặt chiều cao cố định và objectFit: 'cover'
                  onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.onerror = null;
                     target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 text-white text-center">
              Bài luận chủ đề: <span style={{ color: "#fde047" }}>{topicName}</span>
            </h1>
            <p className="text-center mb-6 text-gray-300 text-base sm:text-lg">
              {`Khám phá các bài luận thuộc chủ đề "${topicName}"`}
            </p>

            <div className="mb-8 max-w-xl mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={`Tìm kiếm trong tiêu đề, nội dung của chủ đề "${topicName}"...`}
                className="w-full p-3 bg-[#2c2c34] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {essaysForCurrentPage.length === 0 && !loading && (
             <div className="text-center py-10">
                <p className="text-xl text-gray-400">
                    Không tìm thấy bài luận nào {searchTerm ? `cho từ khóa "${searchTerm}"` : ""} trong chủ đề này.
                </p>
                 {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="mt-4 text-yellow-400 hover:underline"
                    >
                        Xóa tìm kiếm và hiển thị tất cả bài luận
                    </button>
                )}
            </div>
          )}

          <div id="essay-list-container">
            <ul className="space-y-6 sm:space-y-8">
              {essaysForCurrentPage.map((essay, idx) => (
                <li
                  key={essay._id}
                  className="bg-[#18181B] rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-yellow-500/30"
                >
                  <Link to={`/sampleessay/${essay._id}`} className="block group">
                    <div className="flex items-start md:items-center gap-4 px-5 sm:px-6 md:px-8 pt-5 sm:pt-6 md:pt-7 pb-3">
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#2563EB',
                        color: '#fff',
                        minWidth: '2rem',
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        userSelect: 'none',
                        flexShrink: 0,
                        lineHeight: '1',
                        boxSizing: 'border-box'
                      }}
                      className="mt-1 md:mt-0"
                      >
                        {(currentPage - 1) * ESSAYS_PER_PAGE + idx + 1}
                      </span>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-200 mb-0 flex-1">
                          {essay.title}
                      </h2>
                    </div>
                    <div className="px-5 sm:px-6 md:px-8 pb-5 sm:pb-6 md:pb-7 pt-0">
                      <p className="text-gray-300 text-sm sm:text-base mb-3 leading-relaxed line-clamp-3">
                        {getFirstParagraph(essay.content)}
                      </p>
                      <span className="inline-block mt-1 text-yellow-400 font-semibold group-hover:underline text-sm sm:text-base">
                        Xem chi tiết →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {totalPages > 1 && (
            <div className="mt-10 sm:mt-12 flex justify-center items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="py-2 px-3 sm:px-4 border rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 focus:outline-none
                           bg-white text-gray-700 border-gray-300 hover:bg-gray-100
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                « Trước
              </button>
              {renderPageNumbers()}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="py-2 px-3 sm:px-4 border rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 focus:outline-none
                           bg-white text-gray-700 border-gray-300 hover:bg-gray-100
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
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