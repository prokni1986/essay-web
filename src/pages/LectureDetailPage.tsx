// src/pages/LectureDetailPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '@/components/Layout';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';
import axiosInstance from '../lib/axiosInstance';
import DOMPurify from 'dompurify';

import './LectureDetailPage.css';

interface LectureDetail {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  content: string;
  lectureCategory: {
    _id: string;
    name: string;
    description?: string;
  };
  grade: number;
  createdAt: string;
  updatedAt: string;
}

const LectureDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // Sửa từ 'id' sang 'slug'
  const [lecture, setLecture] = useState<LectureDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = lecture?.name ? `${lecture.name} - Bài giảng` : "Chi tiết bài giảng";
    window.scrollTo(0, 0);

    const fetchLecture = async () => {
      if (!slug) { // Sử dụng 'slug'
        setLoading(false);
        setError("Không tìm thấy slug bài giảng.");
        return;
      }
      
      try {
        setLoading(true);
        // Cập nhật API endpoint để gọi bằng slug
        const response = await axiosInstance.get(`/api/lectures/slug/${slug}`); 
        setLecture(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Bài giảng bạn tìm không tồn tại.");
        } else {
          setError('Không thể tải bài giảng. Vui lòng thử lại sau.');
        }
        console.error("Lỗi khi tải chi tiết bài giảng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [slug, lecture?.name]); // Cập nhật dependency array

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Trang chủ', path: '/' },
      { label: 'Bài giảng & Văn mẫu', path: '/mon-ngu-van' },
    ];
    if (lecture) {
      items.push({ label: lecture.name });
    }
    return items;
  }, [lecture]);

  if (loading) {
    return (
      <Layout>
        <div className="detail-status-message text-center py-10">Đang tải bài giảng...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="detail-status-message error text-center py-10 text-red-500">{error}</div>
      </Layout>
    );
  }

  if (!lecture) {
    return (
      <Layout>
        <div className="detail-status-message text-center py-10">Không tìm thấy dữ liệu bài giảng.</div>
      </Layout>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(lecture.content);

  return (
    <Layout>
      <div className="bg-background text-foreground min-h-screen">
        {/* Breadcrumbs Section */}
        <section className="bg-secondary/50 py-4 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        </section>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* SECTION BỌC TIÊU ĐỀ, TÓM TẮT VÀ NỘI DUNG CHÍNH */}
          <section className="mb-16 bg-card rounded-xl shadow-xl border border-border overflow-hidden">
            {/* KHỐI HEADER MỚI VỚI MÀU NỀN VÀ PADDING GIỐNG SAMPLEESSAY */}
            <div className="bg-primary p-6 sm:p-8 flex flex-col justify-between items-start rounded-t-xl">
                <h1 className="text-primary-foreground mb-2 text-2xl font-bold">
                    {lecture.name}
                </h1>
                {lecture.description && (
                    <p className="text-primary-foreground/90 text-base mb-4">
                        {lecture.description}
                    </p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {lecture.lectureCategory && (
                        <span className="inline-flex items-center rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
                            Chuyên mục: {lecture.lectureCategory.name}
                        </span>
                    )}
                    {typeof lecture.grade === 'number' && (
                        <span className="inline-flex items-center rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
                            Lớp: {lecture.grade}
                        </span>
                    )}
                    {lecture.createdAt && (
                        <span className="text-sm text-primary-foreground/70">
                            Ngày đăng: {new Date(lecture.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    )}
                </div>
            </div>

            {/* NỘI DUNG CHÍNH CỦA BÀI GIẢNG - Thêm padding trực tiếp vào article hoặc div chứa content */}
            <article className="lecture-article p-4 sm:p-6">
              {lecture.videoUrl && (
                <div className="video-container mb-8 aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg">
                  {/* Sử dụng regex đơn giản hơn để chuyển đổi YouTube watch URL sang embed URL */}
                  <iframe
                    src={lecture.videoUrl.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(.*)?/g, (match, p1) => `http://googleusercontent.com/youtube.com/8{p1}`)}
                    title={lecture.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              )}

              {/* Dòng này không cần thêm padding nữa vì đã thêm vào article cha */}
              <div 
                className="article-content px-9" 
                dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
              />

              <footer className="article-footer mt-12 pt-8 border-t border-border text-muted-foreground text-sm">
                  <p>Cập nhật lần cuối: {new Date(lecture.updatedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </footer>
            </article>
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default LectureDetailPage;