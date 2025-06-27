// src/pages/LectureDetailPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '@/lib/axiosInstance';
import Layout from '@/components/Layout';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';

// Interfaces cho dữ liệu bài giảng
interface ILectureDetail {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string; // URL của video bài giảng
  content: string; // Nội dung HTML của bài giảng
  lectureCategory: { _id: string; name: string; description?: string };
  grade: number;
  createdAt: string;
}

const LectureDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lecture, setLecture] = useState<ILectureDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = lecture ? `${lecture.name} - Bài giảng` : "Đang tải bài giảng...";
    window.scrollTo(0, 0);

    const fetchLecture = async () => {
      if (!id) {
        setLoading(false);
        setError("Không tìm thấy ID bài giảng.");
        return;
      }
      
      try {
        setLoading(true);
        const response = await axiosInstance.get<ILectureDetail>(`/api/lectures/${id}`);
        setLecture(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Bài giảng bạn tìm không tồn tại hoặc chưa được xuất bản.");
        } else {
          setError('Không thể tải bài giảng. Vui lòng thử lại sau.');
        }
        console.error("Lỗi khi tải chi tiết bài giảng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [id, lecture?.name]); // Thêm lecture?.name vào dependency để cập nhật title

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Trang chủ', path: '/' },
      { label: 'Bài giảng', path: '/lectures' },
    ];
    if (lecture) {
      items.push({ label: lecture.name }); // Mục cuối cùng không có path
    }
    return items;
  }, [lecture]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20 text-foreground">Đang tải bài giảng...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-20 text-destructive">{error}</div>
      </Layout>
    );
  }

  if (!lecture) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">Không tìm thấy dữ liệu bài giảng.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-background text-foreground min-h-screen">
        <section className="bg-secondary/50 py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <article className="bg-card rounded-lg shadow-sm border p-6 md:p-8">
            <header className="mb-6 pb-4 border-b border-border">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-2">
                {lecture.name}
              </h1>
              <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                <span>Chuyên mục: 
                  <Link to={`/lecture-category/${lecture.lectureCategory._id}`} className="text-primary hover:underline ml-1">
                    {lecture.lectureCategory.name}
                  </Link>
                </span>
                <span className="mx-2">•</span>
                <span>Lớp: <strong className="text-foreground">{lecture.grade}</strong></span>
                <span className="mx-2">•</span>
                <span>Ngày đăng: {new Date(lecture.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </header>

            {lecture.imageUrl && (
              <img
                src={lecture.imageUrl}
                alt={lecture.name}
                className="w-full h-auto max-h-[400px] object-cover rounded-lg mb-6 shadow-md"
              />
            )}

            {lecture.videoUrl && (
              <div className="mb-6 aspect-video w-full max-w-full mx-auto">
                {/* Đây là phần nhúng video. Cần đảm bảo URL là hợp lệ để nhúng. */}
                {/* Ví dụ cho YouTube: https://www.youtube.com/embed/VIDEO_ID */}
                {/* Cần kiểm tra xem URL có phải là nhúng trực tiếp được không. */}
                {/* Có thể cần thư viện như react-player hoặc tự xử lý URL */}
                <iframe
                  className="w-full h-full rounded-lg shadow-lg"
                  src={lecture.videoUrl.includes("youtube.com/watch") ? lecture.videoUrl.replace("watch?v=", "embed/") : lecture.videoUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lecture.name}
                ></iframe>
              </div>
            )}

            {lecture.description && (
                <div className="bg-muted/30 p-4 rounded-lg border border-border mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Giới thiệu</h3>
                    <p className="text-muted-foreground">{lecture.description}</p>
                </div>
            )}

            <div
              className="prose dark:prose-invert max-w-none text-foreground leading-relaxed text-justify"
              dangerouslySetInnerHTML={{ __html: lecture.content }}
            />
          </article>
        </div>
      </div>
    </Layout>
  );
};

export default LectureDetailPage;