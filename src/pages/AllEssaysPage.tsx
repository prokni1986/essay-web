import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../lib/axiosInstance'; // Import axiosInstance
import { Link } from 'react-router-dom';
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
  return plainText.substring(0, 180) + (plainText.length > 180 ? '...' : '');
};

// Interfaces
interface Category {
  _id: string;
  name: string;
}

interface Topic {
  _id: string;
  name: string;
  category: Category;
}

interface Essay {
  _id: string;
  title: string;
  content: string;
  topic?: Topic | null;
  createdAt?: string;
}

interface GroupedEssays {
  categoryId: string;
  categoryName: string;
  essays: Essay[];
  topics: Topic[];
}

const AllEssaysPage: React.FC = () => {
  const [allFetchedEssays, setAllFetchedEssays] = useState<Essay[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);

  const [essaysGroupedByCategory, setEssaysGroupedByCategory] = useState<GroupedEssays[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [selectedTopicsInCategory, setSelectedTopicsInCategory] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      setError(null);
      try {
        // Use axiosInstance and relative paths
        const [essaysRes, categoriesRes, topicsRes] = await Promise.all([
          axiosInstance.get<Essay[]>('/api/essays'),
          axiosInstance.get<Category[]>('/api/categories'),
          axiosInstance.get<Topic[]>('/api/topics')
        ]);

        setAllFetchedEssays(essaysRes.data.sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ));

        const sortedCategories = categoriesRes.data.sort((a,b) => a.name.localeCompare(b.name));
        setAllCategories(sortedCategories);

        setAllTopics(topicsRes.data);

        const initialExpansionState: Record<string, boolean> = {};
        const initialSelectedTopics: Record<string, string> = {};
        const initialSearchTerms: Record<string, string> = {};

        sortedCategories.forEach((cat) => {
          initialExpansionState[cat._id] = false;
          initialSelectedTopics[cat._id] = 'Tất cả';
          initialSearchTerms[cat._id] = '';
        });
        setExpandedCategories(initialExpansionState);
        setSelectedTopicsInCategory(initialSelectedTopics);
        setSearchTerms(initialSearchTerms);

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError('Không thể tải dữ liệu trang. Vui lòng thử lại sau.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (loadingData || !allCategories.length) {
        setEssaysGroupedByCategory([]);
        return;
    }

    const grouped: GroupedEssays[] = allCategories.map(category => {
      const essaysInThisCategory = allFetchedEssays.filter(essay =>
        essay.topic?.category?._id === category._id
      );
      const topicsInThisCategory = allTopics.filter(topic => {
        return topic.category?._id === category._id;
      });
      return {
        categoryId: category._id,
        categoryName: category.name,
        essays: essaysInThisCategory,
        topics: topicsInThisCategory.sort((a,b) => a.name.localeCompare(b.name)),
      };
    });
    setEssaysGroupedByCategory(grouped);

  }, [allFetchedEssays, allCategories, allTopics, loadingData]);


  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleSectionSearchChange = (categoryId: string, term: string) => {
    setSearchTerms(prev => ({ ...prev, [categoryId]: term }));
  };

  const handleSelectTopicInSection = (categoryId: string, topicId: string) => {
    setSelectedTopicsInCategory(prev => ({ ...prev, [categoryId]: topicId }));
  };

  const getDisplayedEssaysForSection = useMemo(() => {
    return (categoryId: string, essaysOfCategory: Essay[]): Essay[] => {
      let filtered = essaysOfCategory;
      const currentSearchTerm = searchTerms[categoryId]?.toLowerCase().trim() || '';
      const currentSelectedTopicId = selectedTopicsInCategory[categoryId] || 'Tất cả';

      if (currentSelectedTopicId !== 'Tất cả') {
        filtered = filtered.filter(essay => essay.topic?._id === currentSelectedTopicId);
      }

      if (currentSearchTerm) {
        filtered = filtered.filter(essay => {
          const titleMatch = essay.title.toLowerCase().includes(currentSearchTerm);
          const contentMatch = stripHtml(essay.content).toLowerCase().includes(currentSearchTerm);
          return titleMatch || contentMatch;
        });
      }
      return filtered;
    };
  }, [searchTerms, selectedTopicsInCategory]);


  if (loadingData) {
    return (
      <Layout>
        <section className="py-10 px-4 text-center" style={{ background: "#23232b", minHeight: "100vh" }}>
          <div className="max-w-4xl mx-auto p-6">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-yellow-400 motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <h1 className="text-3xl font-bold text-white mt-4">Đang tải dữ liệu...</h1>
            <p className="text-gray-400">Vui lòng chờ trong giây lát.</p>
          </div>
        </section>
      </Layout>
    );
  }
  if (error) {
     return (
      <Layout>
        <section className="py-10 px-4 text-center" style={{ background: "#23232b", minHeight: "100vh" }}>
           <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-red-500">Lỗi!</h1>
            <p className="text-gray-300">{error}</p>
            <Link to="/" className="mt-4 inline-block text-yellow-400 hover:underline">
                Về trang chủ
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ background: "#23232b" }} className="min-h-screen py-8 px-4 md:px-0">
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-12 py-6">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">
              Thư viện <span style={{ color: "#fde047" }}>Bài luận</span>
            </h1>
            <p className="text-gray-300 mt-3 text-lg">Khám phá bài luận theo chuyên mục và chủ đề.</p>
          </header>

          <div id="essays-by-category-container" className="space-y-10">
            {essaysGroupedByCategory.length === 0 && !loadingData && (
                 <div className="text-center py-12 bg-[#18181B] rounded-xl shadow-lg">
                    <p className="text-xl text-gray-400">
                        Hiện chưa có chuyên mục hoặc bài luận nào.
                    </p>
                </div>
            )}

            {essaysGroupedByCategory.map(group => {
              const isExpanded = !!expandedCategories[group.categoryId];
              const essaysToDisplay = isExpanded ? getDisplayedEssaysForSection(group.categoryId, group.essays) : [];
              const currentSearchTermForSection = searchTerms[group.categoryId] || '';
              const currentSelectedTopicForSection = selectedTopicsInCategory[group.categoryId] || 'Tất cả';

              return (
                <section key={group.categoryId} aria-labelledby={`category-title-${group.categoryId}`} className="bg-[#1c1c22] p-4 sm:p-6 rounded-xl shadow-xl">
                  <div
                      onClick={() => handleToggleCategory(group.categoryId)}
                      className="flex justify-between items-center cursor-pointer group mb-3 sm:mb-4"
                      aria-expanded={isExpanded}
                      aria-controls={`category-content-${group.categoryId}`}
                  >
                    <h2
                        id={`category-title-${group.categoryId}`}
                        className="text-2xl sm:text-3xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-200"
                    >
                      {group.categoryName}
                    </h2>
                    <span className="text-yellow-400 group-hover:text-yellow-300 transition-transform duration-300 transform"
                          style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d={isExpanded ? "M19.5 8.25l-7.5 7.5-7.5-7.5" : "M8.25 4.5l7.5 7.5-7.5 7.5"} />
                      </svg>
                    </span>
                  </div>

                  {isExpanded && (
                    <div id={`category-content-${group.categoryId}`} className="mt-2 animate-fadeIn space-y-6">
                      <div className="pt-2 pb-4">
                        <input
                          type="text"
                          value={currentSearchTermForSection}
                          onChange={(e) => handleSectionSearchChange(group.categoryId, e.target.value)}
                          placeholder={`Tìm trong chuyên mục ${group.categoryName}...`}
                          className="w-full p-3 bg-[#2c2c34] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none placeholder-gray-400 text-sm sm:text-base"
                        />
                      </div>

                      {group.topics.length > 0 && (
                        <div className="mb-6">
                          <p className="text-sm font-medium text-gray-400 mb-2">Lọc nhanh theo chủ đề:</p>
                          <div className="flex flex-wrap gap-2 items-center">
                            <button
                              onClick={() => handleSelectTopicInSection(group.categoryId, 'Tất cả')}
                              className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1c1c22]
                                ${currentSelectedTopicForSection === 'Tất cả'
                                  ? 'bg-yellow-500 text-gray-900 focus:ring-yellow-400'
                                  : 'bg-[#2c2c34] text-gray-300 hover:bg-gray-600 focus:ring-gray-500'}`}
                            >
                              Tất cả
                              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-500/50 text-gray-300 text-xs rounded-full">
                                {group.essays.filter(e =>
                                    !currentSearchTermForSection ||
                                    (e.title.toLowerCase().includes(currentSearchTermForSection) ||
                                     stripHtml(e.content).toLowerCase().includes(currentSearchTermForSection))
                                ).length}
                              </span>
                            </button>
                            {group.topics.map(topic => {
                               const essaysInTopic = group.essays.filter(e => e.topic?._id === topic._id);
                               const essaysInTopicAfterSearch = essaysInTopic.filter(e =>
                                    !currentSearchTermForSection ||
                                    (e.title.toLowerCase().includes(currentSearchTermForSection) ||
                                     stripHtml(e.content).toLowerCase().includes(currentSearchTermForSection))
                                );
                              return (
                                <button
                                  key={topic._id}
                                  onClick={() => handleSelectTopicInSection(group.categoryId, topic._id)}
                                  className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1c1c22]
                                    ${currentSelectedTopicForSection === topic._id
                                      ? 'bg-yellow-500 text-gray-900 focus:ring-yellow-400'
                                      : 'bg-[#2c2c34] text-gray-300 hover:bg-gray-600 focus:ring-gray-500'}`}
                                >
                                  {topic.name}
                                  <span className="ml-1.5 px-1.5 py-0.5 bg-gray-500/50 text-gray-300 text-xs rounded-full">
                                    {essaysInTopicAfterSearch.length}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {essaysToDisplay.length > 0 ? (
                        <div className="space-y-6">
                          {essaysToDisplay.map((essay) => (
                            <div
                              key={essay._id}
                              className="bg-[#18181B] p-5 rounded-xl shadow-xl transition-all duration-300 hover:shadow-yellow-500/20 hover:ring-1 hover:ring-yellow-500/50 group hover:-translate-y-1"
                            >
                              <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-200 mb-2">
                                <Link to={`/sampleessay/${essay._id}`}>{essay.title}</Link>
                              </h3>
                              <p className="text-sm text-gray-400 mb-1">
                                Chủ đề: <span className="font-medium text-gray-300">{essay.topic?.name || 'Không rõ'}</span>
                              </p>
                               <p className="text-xs text-gray-500 mb-3">
                                Chuyên mục: <span className="font-medium text-gray-400">
                                  {essay.topic?.category?.name || 'Không rõ'}
                                </span>
                              </p>
                              <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
                                {getFirstParagraph(essay.content)}
                              </p>
                              <Link
                                to={`/sampleessay/${essay._id}`}
                                className="inline-block text-yellow-400 font-semibold group-hover:underline group-hover:text-yellow-300 transition-colors duration-200 text-sm sm:text-base"
                              >
                                Đọc thêm →
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 pl-2 italic py-4 text-center">
                          Không có bài luận nào phù hợp với lựa chọn của bạn trong chuyên mục "{group.categoryName}".
                        </p>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
    </Layout>
  );
};

export default AllEssaysPage;