import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '@/components/Layout';
import { cn } from "@/lib/utils";
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs'; // Import Breadcrumbs và BreadcrumbItem

// --- Interfaces ---
interface Tag {
  _id: string;
  name: string;
}

interface Category {
  _id:string;
  name: string;
}

interface NewsArticle {
  _id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  author: string;
  publishedAt: string;
  content: string;
  tags?: Tag[];
}

interface Notice {
    _id: string;
    title: string;
    description: string;
}


// --- Component Card ---
const NewsCard: React.FC<{ article: NewsArticle, showExcerpt?: boolean }> = ({ article, showExcerpt = true }) => {
  const excerpt = (article.content || '').replace(/<[^>]*>/g, '').substring(0, 100) + '...';

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group">
      <div className="aspect-video overflow-hidden bg-secondary">
        <Link to={`/tin-tuc/${article.slug}`}>
          <img
            src={article.thumbnailUrl || 'https://via.placeholder.com/400x225?text=Tin+Tuc'}
            alt={article.title}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center mb-2 text-xs">
          {article.tags && article.tags.length > 0 && (
            <span className="bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded mr-3">
              {article.tags[0].name}
            </span>
          )}
          {article.publishedAt && (
            <span className="text-muted-foreground">
              {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2 flex-grow">
          <Link to={`/tin-tuc/${article.slug}`} className="hover:text-primary transition-colors">
            {article.title}
          </Link>
        </h3>
        {showExcerpt && <p className="text-muted-foreground text-sm mb-3">{excerpt}</p>}
        <Link to={`/tin-tuc/${article.slug}`} className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center mt-auto">
          Đọc tiếp
          <i className="fas fa-arrow-right ml-1 text-xs"></i>
        </Link>
      </div>
    </div>
  );
};


// --- Component chính của trang News ---
const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [examSchedules, setExamSchedules] = useState<Notice[]>([]);
  const [admissionNotices, setAdmissionNotices] = useState<Notice[]>([]);

  // THAY ĐỔI 1: Thêm state để lưu danh sách tất cả các tags
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    document.title = "Tin tức & Thông báo";
    window.scrollTo(0, 0);

    const fetchData = async () => {
      setLoading(true);
      try {
        // THAY ĐỔI 2: Thêm API call để lấy về tất cả tags
        const [newsRes, schedulesRes, admissionsRes, tagsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/news`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/notices?type=exam_schedule`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/notices?type=admission_notice`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/tags`) // Lấy danh sách tags
        ]);

        if (Array.isArray(newsRes.data)) setArticles(newsRes.data);
        if (Array.isArray(schedulesRes.data)) setExamSchedules(schedulesRes.data);
        if (Array.isArray(admissionsRes.data)) setAdmissionNotices(admissionsRes.data);
        if (Array.isArray(tagsRes.data)) setAllTags(tagsRes.data); // Lưu tags vào state

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1, 5) : [];
  
  // THAY ĐỔI 3: Cập nhật logic lọc theo Tag ID
  const articlesForTab = activeTab === 'all'
    ? articles.slice(0, 6)
    : articles.filter(article => article.tags?.some(tag => tag._id === activeTab));

  // Định nghĩa breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Trang chủ', path: '/' },
    { label: 'Tin tức & Thông báo', path: '/tin-tuc' },
  ], []);


  if (loading) return (<Layout><div className="text-center py-20 text-foreground">Đang tải...</div></Layout>);
  if (error) return (<Layout><div className="text-center py-20 text-destructive">{error}</div></Layout>);

  return (
    <Layout>
      <div className="bg-background">
        {/* Thêm Breadcrumbs tại đây */}
        <section className="bg-secondary/50 py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        </section>

        {/* === BÀI VIẾT NỔI BẬT (HERO SECTION) === */}
        {featuredArticle && (
          <section className="relative bg-secondary/50 border-b border-border">
            <div className="container mx-auto px-4 py-12 md:py-20">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 z-10 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                    Thông tin giáo dục & tuyển sinh mới nhất
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Cập nhật tin tức về kỳ thi vào lớp 10, tốt nghiệp THPT và thông tin tuyển sinh đại học 2025.
                  </p>
                  <Link to={`/tin-tuc/${featuredArticle.slug}`} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-lg transition duration-300 shadow-md inline-block">
                    Xem tin mới nhất
                  </Link>
                </div>
                <div className="md:w-1/2 mt-10 md:mt-0 relative">
                  <Link to={`/tin-tuc/${featuredArticle.slug}`} className="block aspect-video bg-secondary rounded-xl overflow-hidden shadow-2xl group">
                    <img
                      src={featuredArticle.thumbnailUrl || 'https://via.placeholder.com/600x338?text=GiaoDucVN'}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{featuredArticle.title}</h3>
                        <p className="text-white/90 text-sm">
                          {new Date(featuredArticle.publishedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <main className="lg:w-2/3">
                <h2 className="text-2xl font-bold mb-6 flex items-center"><i className="fas fa-newspaper text-primary mr-3"></i>Tin tức mới nhất</h2>
                {articles.length <= 1 ? (
                  <div className="bg-card p-10 rounded-xl shadow-md text-center text-muted-foreground">
                    <p>{articles.length === 0 ? "Chưa có bài viết nào." : "Không có tin tức nào khác."}</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {remainingArticles.map(article => <NewsCard key={article._id} article={article} />)}
                  </div>
                )}
              </main>
              
              <aside className="lg:w-1/3 mt-8 lg:mt-0">
                <div className="sticky top-24">
                  <div className="bg-card rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center"><i className="fas fa-star text-yellow-400 mr-2"></i>Tin nổi bật</h3>
                    {articles.length > 0 ? (
                      <ul className="space-y-4">
                        {articles.slice(0, 5).map(article => (
                          <li key={article._id} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                            <Link to={`/tin-tuc/${article.slug}`} className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">{article.title}</Link>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">Không có tin tức.</p>}
                  </div>

                  <div className="bg-card rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <i className="fas fa-calendar-alt text-primary mr-2"></i>
                      Lịch Thi Quan Trọng
                    </h3>
                    <ul className="space-y-3">
                      {examSchedules.length > 0 ? (
                        examSchedules.map(item => (
                          <li key={item._id} className="flex items-start">
                            <div className="bg-primary/10 text-primary rounded-lg p-2 mr-3 mt-1"><i className="fas fa-graduation-cap"></i></div>
                            <div>
                              <p className="font-medium text-foreground">{item.title}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </li>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Chưa có lịch thi nào được công bố.</p>
                      )}
                    </ul>
                    {/* === THÊM NÚT VÀO ĐÂY === */}
                    <Link 
                      to="/tra-cuu/lich-thi" 
                      className="mt-4 block w-full text-center bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                      Xem tất cả Lịch thi
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* THAY ĐỔI 4: Sửa lại tên và logic của mục này */}
        <section className="py-12 bg-secondary/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Tin tức theo Tags</h2>
            <div className="bg-card rounded-xl shadow-md overflow-hidden">
              <div className="flex border-b border-border overflow-x-auto">
                <button className={cn("flex-shrink-0 py-4 px-6 text-center font-medium", activeTab === 'all' ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")} onClick={() => setActiveTab('all')}>Tất cả</button>
                {/* Render các nút lọc từ `allTags` thay vì `categories` */}
                {allTags.map(tag => (
                  <button key={tag._id} className={cn("flex-shrink-0 py-4 px-6 text-center font-medium", activeTab === tag._id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")} onClick={() => setActiveTab(tag._id)}>{tag.name}</button>
                ))}
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articlesForTab.length > 0 ? (
                    articlesForTab.map(article => <NewsCard key={article._id} article={article} showExcerpt={false} />)
                  ) : <p className="col-span-full text-center text-muted-foreground">Không có bài viết nào với tag này.</p>}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default NewsPage;