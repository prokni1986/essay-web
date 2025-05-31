import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '@/components/Layout'; 

interface Topic {
  _id: string;
  name: string;
  imageUrl?: string; // Cập nhật interface để bao gồm imageUrl
  // description?: string; 
}

const TOPICS_PER_PAGE = 6; 

const AllTopic: React.FC = () => {
  const [allFetchedTopics, setAllFetchedTopics] = useState<Topic[]>([]);
  const [displayedTopics, setDisplayedTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      setError('');
      try {
        // Đảm bảo API trả về imageUrl
        const response = await axios.get<Topic[]>('http://localhost:5050/api/topics');
        setAllFetchedTopics(response.data);
      } catch (err) {
        setError('Không thể tải danh sách chủ đề. Vui lòng thử lại sau.');
        console.error("Lỗi khi tải chủ đề:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    setCurrentPage(1); 
    if (!searchTerm) {
      setDisplayedTopics(allFetchedTopics);
      return;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = allFetchedTopics.filter(topic =>
      topic.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setDisplayedTopics(filtered);
  }, [searchTerm, allFetchedTopics]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const totalPages = Math.ceil(displayedTopics.length / TOPICS_PER_PAGE);
  const indexOfLastTopicOnPage = currentPage * TOPICS_PER_PAGE;
  const indexOfFirstTopicOnPage = indexOfLastTopicOnPage - TOPICS_PER_PAGE;
  const topicsForCurrentPage = displayedTopics.slice(indexOfFirstTopicOnPage, indexOfLastTopicOnPage);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      const topicGridElement = document.getElementById('topic-grid-container');
      if (topicGridElement) {
        topicGridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
              ? 'bg-green-500 text-white border-green-500' // Màu này có thể cần điều chỉnh cho nhất quán
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100' // Màu này khác với các nút phân trang khác
            }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  if (loading) {
    return (
      <Layout>
        <section className="py-10 px-4 text-center" style={{ background: "#23232b", minHeight: "100vh" }}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl">
              <h1 className="text-3xl font-bold text-white">Đang tải danh sách chủ đề...</h1>
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
            <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl">
              <h1 className="text-3xl font-bold text-red-500">{error}</h1>
              <Link to="/" className="mt-4 inline-block text-yellow-400 hover:underline">
                Về trang chủ
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-10 px-4" style={{ background: "#23232b" }}>
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl mb-8">
            <nav className="mb-6 text-sm flex flex-wrap items-center text-light/80 space-x-2">
              <Link to="/" className="hover:underline text-yellow-400 font-semibold">Trang chủ</Link>
              <span className="mx-1 text-gray-400">/</span>
              <span className="text-light/90 font-semibold">Tất cả chủ đề</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3 text-white text-center break-words">
              Tất cả <span style={{ color: "#fde047" }}>Chủ đề</span>
            </h1>
            <p className="text-center mb-6 max-w-2xl mx-auto" style={{ color: "#D1D5DB", fontSize: "1.15rem" }}>
              Chọn một chủ đề bên dưới để xem các bài văn mẫu nghị luận xã hội liên quan.
            </p>
            <div className="mb-2 max-w-xl mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Tìm kiếm chủ đề theo tên..."
                className="w-full p-3 bg-[#2c2c34] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="topic-grid-container" className="py-10 px-4 bg-[#18181B]">
        <div className="max-w-5xl mx-auto">
          {topicsForCurrentPage.length === 0 && !loading && (
            <div className="text-center py-10">
              <p className="text-xl text-gray-400">
                Không tìm thấy chủ đề nào {searchTerm ? `cho từ khóa "${searchTerm}"` : ""}.
              </p>
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topicsForCurrentPage.map((topic) => (
              <Link
                to={`/topic/${topic._id}`}
                key={topic._id}
                className="bg-[#23232b] rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-[1.03] transition-all duration-300 group"
                style={{
                  minWidth: 300,
                  maxWidth: 370,
                  margin: "0 auto",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                <div
                  className="w-full h-48 rounded-xl overflow-hidden mb-6 bg-gray-700 flex items-center justify-center"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* THAY THẾ SVG BẰNG IMG NẾU CÓ topic.imageUrl */}
                  {topic.imageUrl ? (
                    <img src={topic.imageUrl} alt={topic.name} className="object-cover w-full h-full" style={{ minHeight: 150 }} />
                  ) : (
                    <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white text-left w-full group-hover:text-yellow-400 transition-colors duration-200">
                  {topic.name}
                </h3>
                 <p className="text-gray-400 mb-5 text-base text-left w-full h-16 overflow-hidden">
                  Xem các bài luận thuộc chủ đề "{topic.name}".
                </p>
                <span className="mt-auto text-yellow-300 font-semibold group-hover:underline transition-all text-lg text-left w-full">
                  Khám phá chủ đề →
                </span>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="py-2 px-4 border rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none
                           bg-white text-gray-700 border-gray-300 hover:bg-gray-100 
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                « Trước
              </button>
              {renderPageNumbers()}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="py-2 px-4 border rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none
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

export default AllTopic;