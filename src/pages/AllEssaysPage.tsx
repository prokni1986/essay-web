import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button'; // Thêm import Button
import { Input } from '@/components/ui/input';   // Thêm import Input

// Helpers và Interfaces giữ nguyên
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};
const getFirstParagraph = (html: string): string => {
  const match = html.match(/<p.*?>(.*?)<\/p>/is);
  if (match && match[1]) {
    const text = stripHtml(match[1]);
    return text.substring(0, 180) + (text.length > 180 ? '...' : '');
  }
  const plainText = stripHtml(html);
  return plainText.substring(0, 180) + (plainText.length > 180 ? '...' : '');
};
interface Category { _id: string; name: string; }
interface Topic { _id: string; name: string; category: Category; }
interface Essay { _id: string; title: string; content: string; topic?: Topic | null; createdAt?: string; }
interface GroupedEssays { categoryId: string; categoryName: string; essays: Essay[]; topics: Topic[]; }


const AllEssaysPage: React.FC = () => {
  // Toàn bộ logic, state và useEffects giữ nguyên như file gốc của bạn
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
        const [essaysRes, categoriesRes, topicsRes] = await Promise.all([
          axiosInstance.get<Essay[]>('/api/essays'),
          axiosInstance.get<Category[]>('/api/categories'),
          axiosInstance.get<Topic[]>('/api/topics')
        ]);
        setAllFetchedEssays(essaysRes.data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
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
      const essaysInThisCategory = allFetchedEssays.filter(essay => essay.topic?.category?._id === category._id);
      const topicsInThisCategory = allTopics.filter(topic => topic.category?._id === category._id);
      return {
        categoryId: category._id,
        categoryName: category.name,
        essays: essaysInThisCategory,
        topics: topicsInThisCategory.sort((a,b) => a.name.localeCompare(b.name)),
      };
    });
    setEssaysGroupedByCategory(grouped);
  }, [allFetchedEssays, allCategories, allTopics, loadingData]);

  const handleToggleCategory = (categoryId: string) => setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  const handleSectionSearchChange = (categoryId: string, term: string) => setSearchTerms(prev => ({ ...prev, [categoryId]: term }));
  const handleSelectTopicInSection = (categoryId: string, topicId: string) => setSelectedTopicsInCategory(prev => ({ ...prev, [categoryId]: topicId }));
  const getDisplayedEssaysForSection = useMemo(() => {
    return (categoryId: string, essaysOfCategory: Essay[]): Essay[] => {
      let filtered = essaysOfCategory;
      const currentSearchTerm = searchTerms[categoryId]?.toLowerCase().trim() || '';
      const currentSelectedTopicId = selectedTopicsInCategory[categoryId] || 'Tất cả';
      if (currentSelectedTopicId !== 'Tất cả') {
        filtered = filtered.filter(essay => essay.topic?._id === currentSelectedTopicId);
      }
      if (currentSearchTerm) {
        filtered = filtered.filter(essay => (essay.title.toLowerCase().includes(currentSearchTerm) || stripHtml(essay.content).toLowerCase().includes(currentSearchTerm)));
      }
      return filtered;
    };
  }, [searchTerms, selectedTopicsInCategory]);

  // GIAO DIỆN: Đã cập nhật cho Loading và Error
  if (loadingData) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                <span className="sr-only">Loading...</span>
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

  return (
    <Layout>
      {/* GIAO DIỆN: Đã cập nhật */}
      <div className="bg-background min-h-screen py-8 px-4 md:px-0">
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-12 py-6">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              Thư viện <span className="text-primary">Bài luận</span>
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">Khám phá bài luận theo chuyên mục và chủ đề.</p>
          </header>

          <div id="essays-by-category-container" className="space-y-10">
            {essaysGroupedByCategory.length === 0 && !loadingData && (
                 <div className="text-center py-12 bg-card rounded-xl shadow-lg border">
                    <p className="text-xl text-muted-foreground">Hiện chưa có chuyên mục hoặc bài luận nào.</p>
                </div>
            )}

            {essaysGroupedByCategory.map(group => {
              const isExpanded = !!expandedCategories[group.categoryId];
              const essaysToDisplay = isExpanded ? getDisplayedEssaysForSection(group.categoryId, group.essays) : [];
              const currentSearchTermForSection = searchTerms[group.categoryId] || '';
              const currentSelectedTopicForSection = selectedTopicsInCategory[group.categoryId] || 'Tất cả';

              return (
                <section key={group.categoryId} aria-labelledby={`category-title-${group.categoryId}`} className="bg-card p-4 sm:p-6 rounded-xl shadow-xl border">
                  <div onClick={() => handleToggleCategory(group.categoryId)} className="flex justify-between items-center cursor-pointer group mb-3 sm:mb-4" aria-expanded={isExpanded}>
                    <h2 id={`category-title-${group.categoryId}`} className="text-2xl sm:text-3xl font-bold text-primary group-hover:text-primary/90 transition-colors">
                      {group.categoryName}
                    </h2>
                    <span className="text-primary group-hover:text-primary/90 transition-transform duration-300 transform" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 animate-fadeIn space-y-6">
                      <div className="pt-2 pb-4">
                        <Input
                          type="text"
                          value={currentSearchTermForSection}
                          onChange={(e) => handleSectionSearchChange(group.categoryId, e.target.value)}
                          placeholder={`Tìm trong chuyên mục ${group.categoryName}...`}
                          className="text-base"
                        />
                      </div>

                      {group.topics.length > 0 && (
                        <div className="mb-6">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Lọc nhanh theo chủ đề:</p>
                          <div className="flex flex-wrap gap-2 items-center">
                            <Button onClick={() => handleSelectTopicInSection(group.categoryId, 'Tất cả')} variant={currentSelectedTopicForSection === 'Tất cả' ? 'default' : 'secondary'} size="sm">
                              Tất cả
                              <span className="ml-1.5 px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                                {group.essays.filter(e => !currentSearchTermForSection || (e.title.toLowerCase().includes(currentSearchTermForSection) || stripHtml(e.content).toLowerCase().includes(currentSearchTermForSection))).length}
                              </span>
                            </Button>
                            {group.topics.map(topic => {
                               const essaysInTopicAfterSearch = group.essays.filter(e => e.topic?._id === topic._id && (!currentSearchTermForSection || (e.title.toLowerCase().includes(currentSearchTermForSection) || stripHtml(e.content).toLowerCase().includes(currentSearchTermForSection))));
                              return (
                                <Button key={topic._id} onClick={() => handleSelectTopicInSection(group.categoryId, topic._id)} variant={currentSelectedTopicForSection === topic._id ? 'default' : 'secondary'} size="sm">
                                  {topic.name}
                                  <span className="ml-1.5 px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                                    {essaysInTopicAfterSearch.length}
                                  </span>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {essaysToDisplay.length > 0 ? (
                        <div className="space-y-6">
                          {essaysToDisplay.map((essay) => (
                            <div key={essay._id} className="bg-secondary p-5 rounded-xl transition-all duration-300 hover:shadow-primary/20 hover:ring-1 hover:ring-primary/50 group hover:-translate-y-1">
                              <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                                <Link to={`/sampleessay/${essay._id}`}>{essay.title}</Link>
                              </h3>
                              <p className="text-sm text-muted-foreground mb-1">Chủ đề: <span className="font-medium text-foreground/80">{essay.topic?.name || 'Không rõ'}</span></p>
                              <p className="text-xs text-muted-foreground/80 mb-3">Chuyên mục: <span className="font-medium text-muted-foreground">{essay.topic?.category?.name || 'Không rõ'}</span></p>
                              <p className="text-foreground/90 leading-relaxed mb-4 text-base line-clamp-3">{getFirstParagraph(essay.content)}</p>
                              <Button asChild variant="link" className="p-0 h-auto text-sm sm:text-base"><Link to={`/sampleessay/${essay._id}`}>Đọc thêm →</Link></Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground pl-2 italic py-4 text-center">Không có bài luận nào phù hợp với lựa chọn của bạn.</p>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; }`}</style>
    </Layout>
  );
};

export default AllEssaysPage;