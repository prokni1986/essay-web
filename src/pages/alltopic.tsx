import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../lib/axiosInstance';
import Layout from '@/components/Layout';

interface Topic {
  _id: string;
  name: string;
  imageUrl?: string;
}

const TOPICS_PER_PAGE = 6;

const AllTopic: React.FC = () => {
  const [allFetchedTopics, setAllFetchedTopics] = useState<Topic[]>([]);
  const [displayedTopics, setDisplayedTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Logic fetch dữ liệu và xử lý state giữ nguyên
  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get<Topic[]>('/api/topics');
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
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = searchTerm
      ? allFetchedTopics.filter(topic => topic.name.toLowerCase().includes(lowerCaseSearchTerm))
      : allFetchedTopics;
    setDisplayedTopics(filtered);
  }, [searchTerm, allFetchedTopics]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const totalPages = Math.ceil(displayedTopics.length / TOPICS_PER_PAGE);
  const topicsForCurrentPage = displayedTopics.slice((currentPage - 1) * TOPICS_PER_PAGE, currentPage * TOPICS_PER_PAGE);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      document.getElementById('topic-grid-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // SỬA: Cập nhật styling cho các nút phân trang
  const renderPageNumbers = () => {
    // ... logic renderPageNumbers giữ nguyên ...
    const pageNumbers = [];
    const maxPageButtons = 3;
    let startPage: number, endPage: number;

    if (totalPages <= maxPageButtons) {
      startPage = 1; endPage = totalPages;
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPageButtons / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPageButtons / 2) - 1;
      if (currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1; endPage = maxPageButtons;
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        startPage = totalPages - maxPageButtons + 1; endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrentPage; endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }
    if (startPage > 1) {
      pageNumbers.push(<button key={1} onClick={() => handlePageChange(1)} className="py-2 px-4 mx-1 border border-border rounded-md text-sm font-medium transition-colors bg-card hover:bg-accent">1</button>);
      if (startPage > 2) pageNumbers.push(<span key="start-ellipsis" className="py-2 px-3 mx-1 text-muted-foreground">...</span>);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button key={i} onClick={() => handlePageChange(i)} className={`py-2 px-4 mx-1 border rounded-md text-sm font-medium transition-colors ${currentPage === i ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-card-foreground border-border hover:bg-accent'}`}>
          {i}
        </button>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push(<span key="end-ellipsis" className="py-2 px-3 mx-1 text-muted-foreground">...</span>);
      pageNumbers.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)} className="py-2 px-4 mx-1 border border-border rounded-md text-sm font-medium transition-colors bg-card hover:bg-accent">{totalPages}</button>);
    }
    return pageNumbers;
  };
  
  // SỬA: Cập nhật giao diện Loading và Error
  if (loading) {
    return <Layout><div className="flex justify-center items-center min-h-screen"><p className="text-foreground text-xl">Đang tải...</p></div></Layout>;
  }
  if (error) {
    return <Layout><div className="flex justify-center items-center min-h-screen"><p className="text-destructive text-xl">{error}</p></div></Layout>;
  }

  return (
    <Layout>
      {/* SỬA: Bỏ style inline, dùng class của Tailwind */}
      <section className="py-10 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="px-8 py-10 mb-8">
            <nav className="mb-6 text-sm flex items-center text-muted-foreground space-x-2">
              <Link to="/" className="hover:underline text-primary font-semibold">Trang chủ</Link>
              <span className="mx-1">/</span>
              <span className="text-foreground font-semibold">Tất cả chủ đề</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3 text-foreground text-center">
              Tất cả <span className="text-primary">Chủ đề</span>
            </h1>
            <p className="text-center mb-6 max-w-2xl mx-auto text-muted-foreground text-lg">
              Chọn một chủ đề bên dưới để xem các bài văn mẫu nghị luận xã hội liên quan.
            </p>
            <div className="mb-2 max-w-xl mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Tìm kiếm chủ đề theo tên..."
                className="w-full p-3 bg-input text-foreground border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="topic-grid-container" className="py-10 px-4 bg-secondary">
        <div className="max-w-5xl mx-auto">
          {topicsForCurrentPage.length === 0 && (
            <div className="text-center py-10"><p className="text-xl text-muted-foreground">Không tìm thấy chủ đề nào.</p></div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topicsForCurrentPage.map((topic) => (
              <Link
                to={`/topic/${topic._id}`}
                key={topic._id}
                className="bg-card rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-[1.03] transition-transform duration-300 group border"
              >
                <div className="w-full h-48 rounded-xl overflow-hidden mb-6 bg-accent flex items-center justify-center">
                  {topic.imageUrl ? (
                    <img src={topic.imageUrl} alt={topic.name} className="object-cover w-full h-full" />
                  ) : (
                    <svg className="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground text-left w-full group-hover:text-primary transition-colors">
                  {topic.name}
                </h3>
                <p className="text-muted-foreground mb-5 text-base text-left w-full h-16 overflow-hidden">
                  Xem các bài luận thuộc chủ đề "{topic.name}".
                </p>
                <span className="mt-auto text-primary font-semibold group-hover:underline transition-all text-lg text-left w-full">
                  Khám phá chủ đề →
                </span>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="py-2 px-4 border border-border rounded-md text-sm font-medium transition-colors bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                « Trước
              </button>
              {renderPageNumbers()}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="py-2 px-4 border border-border rounded-md text-sm font-medium transition-colors bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
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