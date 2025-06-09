import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';

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
interface Essay { _id: string; title: string; content: string; topic?: string | { _id: string; name: string } | null; }
interface TopicWithImage { _id: string; name: string; imageUrl?: string; }
interface ApiErrorResponse { error: string; }

const ESSAYS_PER_PAGE = 5;

const EssaysByTopic: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [allEssaysForTopic, setAllEssaysForTopic] = useState<Essay[]>([]);
  const [displayedEssays, setDisplayedEssays] = useState<Essay[]>([]);
  const [currentTopic, setCurrentTopic] = useState<TopicWithImage | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
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
        const topicRes = await axiosInstance.get<TopicWithImage>(`/api/topics/${topicId}`);
        setCurrentTopic(topicRes.data);

        const essaysRes = await axiosInstance.get<Essay[]>(`/api/essays?topic=${topicId}`);
        setAllEssaysForTopic(essaysRes.data);
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
  const totalPages = Math.ceil(displayedEssays.length / ESSAYS_PER_PAGE);
  const essaysForCurrentPage = displayedEssays.slice((currentPage - 1) * ESSAYS_PER_PAGE, currentPage * ESSAYS_PER_PAGE);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      document.getElementById('essay-list-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
            <button key={i} onClick={() => handlePageChange(i)} className={`py-2 px-4 mx-1 border rounded-md text-sm font-medium transition-colors ${currentPage === i ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-card-foreground border-border hover:bg-accent'}`}>
              {i}
            </button>
        );
    }
    return pageNumbers;
  };

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

  return (
    <Layout>
      <section className="py-10 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="px-8 py-10 mb-8">
            <nav className="mb-6 text-sm flex flex-wrap items-center text-muted-foreground space-x-2">
              <Link to="/" className="hover:underline text-primary font-semibold">Trang chủ</Link>
              <span>/</span>
              <Link to="/alltopic" className="hover:underline text-primary font-semibold">Tất cả chủ đề</Link>
              <span>/</span>
              <span className="text-foreground font-semibold">{topicName}</span>
            </nav>

            {currentTopic.imageUrl && (
              <div className="mb-8 text-center">
                <img src={currentTopic.imageUrl} alt={`Hình ảnh cho chủ đề ${topicName}`} className="w-full max-w-lg mx-auto rounded-lg shadow-lg border-4 border-border object-cover h-80"/>
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3 text-foreground text-center">
              Bài luận chủ đề: <span className="text-primary">{topicName}</span>
            </h1>
            <p className="text-center mb-6 text-muted-foreground text-lg">
              {`Khám phá các bài luận thuộc chủ đề "${topicName}"`}
            </p>

            <div className="mb-8 max-w-xl mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={`Tìm kiếm trong chủ đề "${topicName}"...`}
                className="w-full p-3 bg-input text-foreground border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

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

export default EssaysByTopic;