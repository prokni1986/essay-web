// file: pages/Index.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import HeroSectionWithSlider from '@/components/HeroSectionWithSlider';
// Xóa: import axios from 'axios';
import axiosInstance from '../lib/axiosInstance'; // <<<< THÊM IMPORT AXIOSINSTANCE

// SVG Icon cho mũi tên (giữ nguyên)
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-1 transition-transform duration-200 group-hover:translate-x-1">
    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
  </svg>
);

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

const Card = ({ title, description, image, link }: { title: string; description?: string; image?: string; link: string }) => (
  <Link
    to={link}
    className="bg-dark rounded-xl p-6 flex flex-col shadow-xl hover:shadow-highlight/20 transition-all duration-300 group transform hover:-translate-y-2 h-full no-underline"
  >
    <div className="w-full h-56 rounded-lg overflow-hidden mb-6 relative bg-gray-700">
      {image ? (
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">Ảnh đang cập nhật</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
    </div>
    <h3 className="text-2xl font-semibold mb-3 text-light group-hover:text-highlight transition-colors">{title}</h3>
    <p className="text-light/70 mb-5 text-base leading-relaxed flex-grow">
      {description || "Mô tả cho chủ đề này đang được cập nhật..."}
    </p>
    <span
      className="inline-flex items-center mt-auto text-highlight font-semibold transition-colors text-lg group-hover:underline"
    >
      Xem chi tiết <ArrowRightIcon />
    </span>
  </Link>
);


const Index = () => {
  const sectionPadding = "py-16 md:py-24 px-6";
  const sectionTitleBase = "text-4xl md:text-5xl font-heading font-bold mb-6 text-center";
  const sectionDescriptionBase = "text-lg text-center text-light/70 mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed";

  const [nlxhTopics, setNlxhTopics] = useState<Topic[]>([]);
  const [nlvhTopics, setNlvhTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CATEGORY_NAMES = {
    NLXH: "Nghị Luận Xã hội",
    NLVH: "Nghị luận văn học"
  };

  useEffect(() => {
    const fetchDataForHomepage = async () => {
      setLoading(true);
      setError(null);
      try {
        // <<<< SỬA ĐỔI Ở ĐÂY >>>>
        const categoriesRes = await axiosInstance.get<Category[]>('/api/categories');
        const allAvailableTopicsRes = await axiosInstance.get<Topic[]>('/api/topics');

        const allCategories = categoriesRes.data;
        const allTopics = allAvailableTopicsRes.data;

        const nlxhCategory = allCategories.find(cat => cat.name === CATEGORY_NAMES.NLXH);
        const nlvhCategory = allCategories.find(cat => cat.name === CATEGORY_NAMES.NLVH);

        if (nlxhCategory) {
          const topicsInNlxh = allTopics
            .filter(topic => (typeof topic.category === 'string' ? topic.category : topic.category?._id) === nlxhCategory._id)
            .slice(0, 3);
          setNlxhTopics(topicsInNlxh);
        } else {
          console.warn(`Không tìm thấy category: ${CATEGORY_NAMES.NLXH}`);
        }

        if (nlvhCategory) {
          const topicsInNlvh = allTopics
            .filter(topic => (typeof topic.category === 'string' ? topic.category : topic.category?._id) === nlvhCategory._id)
            .slice(0, 3);
          setNlvhTopics(topicsInNlvh);
        } else {
          console.warn(`Không tìm thấy category: ${CATEGORY_NAMES.NLVH}`);
        }

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu cho trang chủ:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        // Trong trường hợp lỗi, bạn có thể muốn xử lý error object cụ thể hơn
        // Ví dụ: if (axios.isAxiosError(err)) { ... }
        // Nhưng để làm vậy, bạn cần giữ lại import axios và AxiosError
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

  // <<<< THÊM UI CHO LOADING VÀ ERROR >>>>
  if (loading) {
    return (
        <Layout>
            <div className="flex justify-center items-center min-h-screen bg-dark">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-highlight border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-4 text-xl text-light">Đang tải trang chủ...</p>
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
                    <Link to="/" onClick={() => window.location.reload()} className="px-6 py-3 bg-highlight text-dark font-semibold rounded-lg hover:bg-yellow-300 transition-colors duration-150 text-base">
                        Thử lại
                    </Link>
                </div>
            </div>
        </Layout>
    );
  }
  // Phần còn lại của return JSX giữ nguyên
  return (
    <Layout>
      <HeroSectionWithSlider />

      {/* Section Nghị Luận Xã Hội */}
      <section className={`${sectionPadding} bg-secondary`}>
        <div className="max-w-7xl mx-auto">
          <h2 className={`${sectionTitleBase} text-light`}>
            Văn Mẫu <span className="text-highlight">{CATEGORY_NAMES.NLXH}</span>
          </h2>
          <p className={sectionDescriptionBase}>
            Tổng hợp các bài văn mẫu nghị luận xã hội đặc sắc, giúp bạn nắm vững cấu trúc, cách triển khai ý và sử dụng ngôn từ hiệu quả. Khám phá ngay để nâng cao kỹ năng viết của bạn!
          </p>
          {nlxhTopics.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nlxhTopics.map((topic) => (
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
            !loading && <p className="text-center text-light/70 text-lg">Chưa có chủ đề nào cho mục này. Chúng tôi sẽ sớm cập nhật!</p>
          )}
          <div className="text-center mt-16">
            <Link
              to="/alltopic"
              className="px-10 py-4 bg-highlight text-dark font-semibold rounded-lg text-lg hover:bg-yellow-300 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 inline-block"
            >
              Xem Tất Cả Chủ Đề {CATEGORY_NAMES.NLXH}
            </Link>
          </div>
        </div>
      </section>

      {/* Section Nghị Luận Văn Học */}
      <section className={`${sectionPadding} bg-dark`}>
        <div className="max-w-7xl mx-auto">
          <h2 className={`${sectionTitleBase} text-light`}>
            Văn Mẫu <span className="text-highlight">{CATEGORY_NAMES.NLVH}</span>
          </h2>
          <p className={sectionDescriptionBase}>
            Phân tích sâu sắc các tác phẩm văn học kinh điển. Bộ sưu tập bài văn mẫu nghị luận văn học chất lượng cao, khơi nguồn cảm hứng và ý tưởng cho bạn.
          </p>
          {nlvhTopics.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nlvhTopics.map((topic) => (
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
            !loading && <p className="text-center text-light/70 text-lg">Chưa có chủ đề nào cho mục này. Chúng tôi sẽ sớm cập nhật!</p>
          )}
           <div className="text-center mt-16">
            <Link
              to="/alltopic"
              className="px-10 py-4 bg-transparent border-2 border-highlight text-highlight font-semibold rounded-lg text-lg hover:bg-highlight hover:text-dark transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 inline-block"
            >
              Khám Phá Bài Mẫu {CATEGORY_NAMES.NLVH}
            </Link>
          </div>
        </div>
      </section>

      {/* Section Tiếng Anh */}
      <section className={`${sectionPadding} bg-secondary`}>
          <div className="max-w-7xl mx-auto">
            <h2 className={`${sectionTitleBase} text-light`}>
                Bài Luận <span className="text-highlight">Tiếng Anh</span> Mẫu
            </h2>
            <p className={sectionDescriptionBase}>
                Explore well-structured English essays on various topics. Enhance your writing skills with our curated examples and guides.
            </p>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {englishSectionTopics.map((item, index) => (
                <Card key={`english-${index}`} {...item} />
              ))}
            </div>
            <div className="text-center mt-16">
                <Link
                to="/gigs"
                className="px-10 py-4 bg-highlight text-dark font-semibold rounded-lg text-lg hover:bg-yellow-300 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 inline-block"
                >
                Explore All English Essays
                </Link>
            </div>
          </div>
        </section>

      {/* Section Call to Action */}
      <section className={`${sectionPadding} bg-dark`}>
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-light mb-8">
                Nâng Tầm Bài Viết Của Bạn Ngay Hôm Nay!
            </h2>
            <p className="text-xl text-light/80 mb-12 leading-relaxed">
                Dù bạn đang tìm kiếm ý tưởng, muốn cải thiện kỹ năng, hay cần một bài mẫu hoàn chỉnh, chúng tôi luôn sẵn sàng hỗ trợ.
            </p>
            <Link
                to="/alltopic"
                className="px-12 py-5 bg-highlight text-dark font-bold rounded-lg text-xl hover:bg-yellow-300 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
            >
                Bắt Đầu Ngay
            </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;