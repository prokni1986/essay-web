// file: pages/Index.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import HeroSectionWithSlider from '@/components/HeroSectionWithSlider';
import axiosInstance from '../lib/axiosInstance';

// ICON
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-1 transition-transform duration-200 group-hover:translate-x-1">
    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
  </svg>
);

// INTERFACES
interface Category {
  _id: string;
  name: string;
}

interface Topic {
  _id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  category: Category | string;
}

// COMPONENT CARD
const Card = ({ title, description, image, link }: { title: string; description?: string; image?: string; link: string }) => (
  <Link
    to={link}
    className="bg-card text-card-foreground rounded-xl p-6 flex flex-col shadow-xl hover:shadow-primary/20 transition-all duration-300 group transform hover:-translate-y-2 h-full no-underline border"
  >
    <div className="w-full h-56 rounded-lg overflow-hidden mb-6 relative bg-secondary">
      {image ? (
        <img src={image} alt={title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">Ảnh đang cập nhật</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
    </div>
    <h3 className="text-2xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-muted-foreground mb-5 text-base leading-relaxed flex-grow">
      {description || "Mô tả cho chủ đề này đang được cập nhật..."}
    </p>
    <span className="inline-flex items-center mt-auto text-primary font-semibold transition-colors text-lg group-hover:underline">
      Xem chi tiết <ArrowRightIcon />
    </span>
  </Link>
);


const Index = () => {
  const sectionPadding = "py-16 md:py-24 px-6";
  const sectionTitleBase = "text-4xl md:text-5xl font-heading font-bold mb-6 text-center";
  const sectionDescriptionBase = "text-lg text-center text-muted-foreground mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed";

  const [nlxhTopics, setNlxhTopics] = useState<Topic[]>([]);
  const [nlvhTopics, setNlvhTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CATEGORY_NAMES = {
    NLXH: "Nghị Luận Xã hội",
    NLVH: "Nghị luận văn học"
  };

  useEffect(() => {
    // Logic fetch data giữ nguyên
    const fetchDataForHomepage = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoriesRes = await axiosInstance.get<Category[]>('/api/categories');
        const allAvailableTopicsRes = await axiosInstance.get<Topic[]>('/api/topics');
        const allCategories = categoriesRes.data;
        const allTopics = allAvailableTopicsRes.data;
        const nlxhCategory = allCategories.find(cat => cat.name === CATEGORY_NAMES.NLXH);
        const nlvhCategory = allCategories.find(cat => cat.name === CATEGORY_NAMES.NLVH);
        if (nlxhCategory) {
          const topicsInNlxh = allTopics.filter(topic => (typeof topic.category === 'string' ? topic.category : topic.category?._id) === nlxhCategory._id).slice(0, 3);
          setNlxhTopics(topicsInNlxh);
        }
        if (nlvhCategory) {
          const topicsInNlvh = allTopics.filter(topic => (typeof topic.category === 'string' ? topic.category : topic.category?._id) === nlvhCategory._id).slice(0, 3);
          setNlvhTopics(topicsInNlvh);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu cho trang chủ:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchDataForHomepage();
  }, [CATEGORY_NAMES.NLXH, CATEGORY_NAMES.NLVH]);

  const englishSectionTopics = [
    { title: "Essay Structure Basics", description: "Learn the fundamental components of a compelling English essay.", image: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80", link: "/gigs" },
    { title: "Advanced Vocabulary", description: "Expand your lexicon with sophisticated words and phrases for academic writing.", image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80", link: "/gigs" },
    { title: "IELTS Writing Strategies", description: "Master techniques for achieving a high score in IELTS Writing tasks.", image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80", link: "/gigs" }
  ];

  if (loading) { /* ... UI loading giữ nguyên ... */ }
  if (error) { /* ... UI error giữ nguyên ... */ }

  return (
    <Layout>
      <HeroSectionWithSlider />

      <section className={`${sectionPadding} bg-secondary`}>
        <div className="max-w-7xl mx-auto">
          <h2 className={`${sectionTitleBase} text-foreground`}>
            Văn Mẫu <span className="text-primary">{CATEGORY_NAMES.NLXH}</span>
          </h2>
          <p className={sectionDescriptionBase}>
            Tổng hợp các bài văn mẫu nghị luận xã hội đặc sắc...
          </p>
          {nlxhTopics.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nlxhTopics.map((topic) => (
                // SỬA LỖI Ở ĐÂY: Ánh xạ 'name' sang 'title' và 'imageUrl' sang 'image'
                <Card
                  key={topic._id}
                  title={topic.name}
                  description={topic.description}
                  image={topic.imageUrl}
                  link={`/topic/${topic._id}`}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-lg">Chưa có chủ đề nào...</p>
          )}
          <div className="text-center mt-16">
            <Link to="/alltopic" className="px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-lg text-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg">
              Xem Tất Cả Chủ Đề {CATEGORY_NAMES.NLXH}
            </Link>
          </div>
        </div>
      </section>

      <section className={`${sectionPadding} bg-background`}>
        <div className="max-w-7xl mx-auto">
          <h2 className={`${sectionTitleBase} text-foreground`}>
            Văn Mẫu <span className="text-primary">{CATEGORY_NAMES.NLVH}</span>
          </h2>
          <p className={sectionDescriptionBase}>
            Phân tích sâu sắc các tác phẩm văn học kinh điển...
          </p>
          {nlvhTopics.length > 0 ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nlvhTopics.map((topic) => (
                 // SỬA LỖI Ở ĐÂY: Ánh xạ 'name' sang 'title' và 'imageUrl' sang 'image'
                 <Card
                  key={topic._id}
                  title={topic.name}
                  description={topic.description}
                  image={topic.imageUrl}
                  link={`/topic/${topic._id}`}
                />
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground text-lg">Chưa có chủ đề nào...</p>
          )}
           <div className="text-center mt-16">
            <Link to="/alltopic" className="px-10 py-4 bg-transparent border-2 border-primary text-primary font-semibold rounded-lg text-lg hover:bg-primary hover:text-primary-foreground transition-all">
              Khám Phá Bài Mẫu {CATEGORY_NAMES.NLVH}
            </Link>
          </div>
        </div>
      </section>

      <section className={`${sectionPadding} bg-secondary`}>
          <div className="max-w-7xl mx-auto">
            <h2 className={`${sectionTitleBase} text-foreground`}>
                Bài Luận <span className="text-primary">Tiếng Anh</span> Mẫu
            </h2>
            <p className={sectionDescriptionBase}>
                Explore well-structured English essays on various topics...
            </p>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {englishSectionTopics.map((item, index) => <Card key={`english-${index}`} {...item} />)}
            </div>
            <div className="text-center mt-16">
                <Link to="/gigs" className="px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-lg text-lg hover:bg-primary/90 transition-colors">
                  Explore All English Essays
                </Link>
            </div>
          </div>
      </section>

      <section className={`${sectionPadding} bg-background`}>
          {/* ... Phần còn lại giữ nguyên ... */}
      </section>
    </Layout>
  );
};

export default Index;