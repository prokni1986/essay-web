// src/pages/ExamPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import Layout from '@/components/Layout'; // Giả sử bạn có component Layout chung

// Interface cho dữ liệu trả về từ API
interface ExamData {
  _id: string;
  title: string;
  htmlContent: string;
  // Các trường khác nếu có, ví dụ: subject, year
  subject?: string;
  year?: number;
}

// Interface cho lỗi API
interface ApiErrorResponse {
  message?: string;
}

const ExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top khi component được render
    window.scrollTo(0, 0);

    if (!id) {
      setError("ID không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchExam = async () => {
      setLoading(true);
      try {
        // Gọi API để lấy dữ liệu bài thi/đề thi
        // Đảm bảo URL này khớp với route bạn đã tạo ở backend
        const response = await axiosInstance.get<ExamData>(`/api/exams/${id}`);
        setExam(response.data);
      } catch (err) {
        console.error("Lỗi khi tải đề thi:", err);
        if (axios.isAxiosError(err)) {
          const errorData = err.response?.data as ApiErrorResponse;
          setError(errorData?.message || "Không thể tải nội dung đề thi.");
        } else {
          setError("Đã xảy ra lỗi không xác định.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  // Sử dụng useMemo để chỉ render lại nội dung HTML khi `exam.htmlContent` thay đổi
  const memoizedHtmlContent = useMemo(() => {
    if (!exam?.htmlContent) return null;

    // Chú ý về bảo mật: Chỉ sử dụng khi bạn hoàn toàn tin tưởng nguồn HTML
    return { __html: exam.htmlContent };
  }, [exam?.htmlContent]);


  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-xl">Đang tải nội dung...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen text-center">
          <p className="text-xl text-red-500 mb-4">Lỗi: {error}</p>
          <Link to="/" className="text-blue-500 hover:underline">Quay về trang chủ</Link>
        </div>
      </Layout>
    );
  }

  if (!exam || !memoizedHtmlContent) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-xl">Không tìm thấy nội dung.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/*
        Chúng ta render một div và sử dụng dangerouslySetInnerHTML để chèn HTML từ database.
        Div này sẽ hoạt động như một "khung" để chứa toàn bộ trang HTML của bạn.
        Các CSS classes, scripts (MathJax, Tailwind) trong chuỗi HTML sẽ được trình duyệt
        tự động áp dụng và thực thi.
      */}
      <div dangerouslySetInnerHTML={memoizedHtmlContent} />
    </Layout>
  );
};

export default ExamPage;