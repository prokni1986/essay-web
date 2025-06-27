import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '@/components/Layout'; // Import Layout
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs'; // Import Breadcrumbs và BreadcrumbItem
import './NewsDetailPage.css'; // Import file CSS để làm đẹp

interface NewsArticleDetail {
  _id: string;
  title: string;
  content: string; // Nội dung HTML
  thumbnailUrl?: string;
  author: string;
  publishedAt: string;
}

const NewsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticleDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = article?.title ? `${article.title} - Tin tức` : "Chi tiết tin tức"; // Cập nhật tiêu đề trang
    window.scrollTo(0, 0); // Cuộn lên đầu trang
    const fetchArticle = async () => {
      // Bỏ qua fetch nếu không có slug
      if (!slug) {
        setLoading(false);
        setError("Không tìm thấy slug của bài viết.");
        return;
      }
      
      try {
        setLoading(true);
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/news/${slug}`;
        const response = await axios.get(apiUrl);
        setArticle(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Bài viết bạn tìm không tồn tại hoặc chưa được xuất bản.");
        } else {
          setError('Không thể tải bài viết. Vui lòng thử lại sau.');
        }
        console.error("Lỗi khi tải chi tiết bài viết:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, article?.title]); // Thêm article?.title vào dependency array để cập nhật tiêu đề

  // Định nghĩa breadcrumb items. Sử dụng useMemo để tránh re-render không cần thiết.
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Trang chủ', path: '/' },
      { label: 'Tin tức & Thông báo', path: '/tin-tuc' },
    ];
    if (article) {
      items.push({ label: article.title }); // Không có path cho mục cuối cùng
    }
    return items;
  }, [article]); // Phụ thuộc vào article để cập nhật tiêu đề bài viết

  // --- Giao diện cho các trạng thái ---
  if (loading) {
    return (
      <Layout> {/* Bọc trong Layout */}
        <div className="detail-status-message">Đang tải bài viết...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout> {/* Bọc trong Layout */}
        <div className="detail-status-message error">{error}</div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout> {/* Bọc trong Layout */}
        <div className="detail-status-message">Không tìm thấy dữ liệu bài viết.</div>
      </Layout>
    );
  }

  // --- Giao diện chi tiết bài viết ---
  return (
    <Layout> {/* Bọc toàn bộ nội dung trong Layout */}
      <div className="bg-background text-foreground min-h-screen">
        <section className="bg-secondary/50 py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        </section>
        <div className="container mx-auto px-4 py-8">
          <article className="news-article">
            {article.thumbnailUrl && (
              <img src={article.thumbnailUrl} alt={article.title} className="article-banner"/>
            )}
            <header className="article-header">
              <h1 className="article-title">{article.title}</h1>
              <div className="article-meta">
                <span>Tác giả: <strong>{article.author}</strong></span>
                
                {article.publishedAt && (
                  <span>Ngày đăng: {new Date(article.publishedAt).toLocaleDateString('vi-VN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                  })}</span>
                )}
              </div>
            </header>
            
            <div 
              className="article-content prose"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />
          </article>
        </div>
      </div>
    </Layout>
  );
};

export default NewsDetailPage;