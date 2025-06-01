// file: pages/EssaysByCategoryPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios'; // Giữ lại để sử dụng axios.isAxiosError
import axiosInstance from '../lib/axiosInstance'; // Import axiosInstance
import { Link, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';

// Interfaces
interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface Topic {
  _id: string;
  name: string;
  category: Category | string;
  description?: string;
  imageUrl?: string;
}

interface Essay {
  _id: string;
  title: string;
  content: string;
  topic?: Topic | null;
  createdAt?: string;
}

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
  return plainText.substring(0, 180) + (plainText.length > 180 ? '...' : '');
};

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-1 transition-transform duration-200 group-hover:translate-x-1">
    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
  </svg>
);

const EssaysByCategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [essaysOfThisCategory, setEssaysOfThisCategory] = useState<Essay[]>([]);
  const [topicsInThisCategory, setTopicsInThisCategory] = useState<Topic[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('Tất cả');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setError("Không tìm thấy ID chuyên mục trong URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setCurrentCategory(null);
      setTopicsInThisCategory([]);
      setEssaysOfThisCategory([]);
      setSelectedTopic('Tất cả');
      setSearchTerm('');

      try {
        // Sử dụng axiosInstance và đường dẫn tương đối
        const [categoryRes, topicsRes, essaysRes] = await Promise.all([
          axiosInstance.get<Category>(`/api/categories/${categoryId}`),
          axiosInstance.get<Topic[]>(`/api/topics?category=${categoryId}`),
          axiosInstance.get<Essay[]>(`/api/essays?category=${categoryId}`)
        ]);

        setCurrentCategory(categoryRes.data);
        setTopicsInThisCategory(topicsRes.data.sort((a,b) => a.name.localeCompare(b.name)));
        setEssaysOfThisCategory(essaysRes.data.sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ));

      } catch (err: unknown) {
        console.error("Lỗi khi tải dữ liệu cho category:", err);
        let errorMessage = "Không thể tải dữ liệu cho chuyên mục này. Vui lòng thử lại.";

        if (axios.isAxiosError(err)) { // Giữ lại check này
          console.error("Backend response:", err.response?.data);
          const responseData = err.response?.data as { error?: string };
          errorMessage = responseData?.error || err.message;
          if (err.response?.status === 404) {
            errorMessage = `Không tìm thấy chuyên mục hoặc dữ liệu liên quan với ID: ${categoryId}.`;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  const displayedEssays = useMemo(() => {
    let filtered = essaysOfThisCategory;
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    if (selectedTopic !== 'Tất cả') {
      filtered = filtered.filter(essay => essay.topic?._id === selectedTopic);
    }

    if (lowerSearchTerm) {
      filtered = filtered.filter(essay =>
        essay.title.toLowerCase().includes(lowerSearchTerm) ||
        stripHtml(essay.content).toLowerCase().includes(lowerSearchTerm) ||
        (essay.topic?.name || '').toLowerCase().includes(lowerSearchTerm)
      );
    }
    return filtered;
  }, [essaysOfThisCategory, searchTerm, selectedTopic]);

  const countEssaysForTopicTab = (topicId: string): number => {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    let relevantEssays = essaysOfThisCategory;
    if(topicId !== 'Tất cả') {
        relevantEssays = essaysOfThisCategory.filter(e => e.topic?._id === topicId);
    }
    if (lowerSearchTerm) {
      return relevantEssays.filter(essay =>
        essay.title.toLowerCase().includes(lowerSearchTerm) ||
        stripHtml(essay.content).toLowerCase().includes(lowerSearchTerm)
      ).length;
    }
    return relevantEssays.length;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen bg-dark">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-highlight border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-xl text-light">Đang tải bài luận...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
     return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen bg-dark text-center px-4">
          <div className="p-8 bg-secondary rounded-lg shadow-xl max-w-md w-full">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold text-red-400 mb-3">Đã xảy ra lỗi!</h2>
            <p className="text-light/80 mb-6">{error}</p>
            <Link to="/essays" className="px-6 py-3 bg-highlight text-dark font-semibold rounded-lg hover:bg-yellow-300 transition-colors duration-150 text-base">
              Xem tất cả chuyên mục
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentCategory && !loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen bg-dark text-center px-4">
           <div className="p-8 bg-secondary rounded-lg shadow-xl max-w-md w-full">
             <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold text-yellow-400 mb-3">Không tìm thấy thông tin chuyên mục</h2>
            <p className="text-light/80 mb-6">Chuyên mục bạn đang tìm kiếm có thể không tồn tại hoặc đã bị di chuyển.</p>
            <Link to="/essays" className="px-6 py-3 bg-highlight text-dark font-semibold rounded-lg hover:bg-yellow-300 transition-colors duration-150 text-base">
              Xem tất cả chuyên mục
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ background: "#23232b" }} className="min-h-screen py-8 px-4 md:px-0">
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-10 pt-6 pb-4">
            <nav className="mb-6 text-sm flex flex-wrap items-center justify-center text-gray-400 space-x-1 sm:space-x-2">
              <Link to="/" className="hover:underline hover:text-yellow-300 text-yellow-400 font-medium">Trang chủ</Link>
              <span>/</span>
              <Link to="/essays" className="hover:underline hover:text-yellow-300 text-yellow-400 font-medium">Bài luận</Link>
              <span>/</span>
              <span className="text-gray-200 font-semibold">{currentCategory?.name || 'Chuyên mục'}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white">
              {currentCategory?.name || 'Chuyên mục'}
            </h1>
            {currentCategory?.description && (
              <p className="text-gray-300 mt-3 text-base sm:text-lg max-w-3xl mx-auto">{currentCategory.description}</p>
            )}
          </header>

          <div className="bg-[#1c1c22] p-4 sm:p-6 rounded-xl shadow-xl space-y-6">
            <div className="pt-2 pb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Tìm trong chuyên mục ${currentCategory?.name || ''}...`}
                className="w-full p-3 bg-[#2c2c34] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none placeholder-gray-400 text-sm sm:text-base"
              />
            </div>

            {topicsInThisCategory.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-400 mb-2">Lọc nhanh theo chủ đề:</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => setSelectedTopic('Tất cả')}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1c1c22]
                      ${selectedTopic === 'Tất cả'
                        ? 'bg-yellow-500 text-gray-900 focus:ring-yellow-400'
                        : 'bg-[#2c2c34] text-gray-300 hover:bg-gray-600 focus:ring-gray-500'}`}
                  >
                    Tất cả
                    <span className="ml-1.5 px-1.5 py-0.5 bg-gray-500/50 text-gray-300 text-xs rounded-full">
                      {countEssaysForTopicTab('Tất cả')}
                    </span>
                  </button>
                  {topicsInThisCategory.map(topic => (
                    <button
                      key={topic._id}
                      onClick={() => setSelectedTopic(topic._id)}
                      className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1c1c22]
                        ${selectedTopic === topic._id
                          ? 'bg-yellow-500 text-gray-900 focus:ring-yellow-400'
                          : 'bg-[#2c2c34] text-gray-300 hover:bg-gray-600 focus:ring-gray-500'}`}
                    >
                      {topic.name}
                      <span className="ml-1.5 px-1.5 py-0.5 bg-gray-500/50 text-gray-300 text-xs rounded-full">
                        {countEssaysForTopicTab(topic._id)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {displayedEssays.length > 0 ? (
              <div className="space-y-6">
                {displayedEssays.map((essay) => (
                  <div
                    key={essay._id}
                    className="bg-[#18181B] p-5 rounded-xl shadow-md transition-all duration-300 hover:shadow-yellow-500/20 hover:ring-1 hover:ring-yellow-500/50 group hover:-translate-y-1"
                  >
                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-200 mb-2">
                      <Link to={`/sampleessay/${essay._id}`}>{essay.title}</Link>
                    </h3>
                    <p className="text-sm text-gray-400 mb-1">
                      Chủ đề: <span className="font-medium text-gray-300">{essay.topic?.name || 'Không rõ'}</span>
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Chuyên mục: <span className="font-medium text-gray-400">{currentCategory?.name || 'Không rõ'}</span>
                    </p>
                    <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
                      {getFirstParagraph(essay.content)}
                    </p>
                    <Link
                      to={`/sampleessay/${essay._id}`}
                      className="inline-flex items-center mt-auto text-yellow-400 font-semibold hover:underline group-hover:text-yellow-300 transition-colors duration-200 text-sm sm:text-base"
                    >
                      Đọc thêm <ArrowRightIcon />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic py-4 text-center">
                Không có bài luận nào phù hợp với lựa chọn của bạn trong chuyên mục "{currentCategory?.name}".
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EssaysByCategoryPage;