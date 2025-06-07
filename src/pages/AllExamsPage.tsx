// src/pages/AllExamsPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

// Interface cho một đề thi trong danh sách
// Chỉ chứa các thông tin cần thiết để hiển thị, không cần htmlContent
interface ExamInList {
  _id: string;
  title: string;
  description?: string;
  subject?: string;
  year?: number;
  province?: string;
  createdAt: string;
}

// Interface cho lỗi API
interface ApiErrorResponse {
  message?: string;
}

const AllExamsPage: React.FC = () => {
  const [exams, setExams] = useState<ExamInList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Tuyển tập đề thi"; // Cập nhật tiêu đề trang
    window.scrollTo(0, 0);

    const fetchExams = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<ExamInList[]>('/api/exams');
        // Sắp xếp các đề thi, ví dụ: mới nhất lên đầu
        const sortedExams = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setExams(sortedExams);
      } catch (err) {
        console.error("Lỗi khi tải danh sách đề thi:", err);
        if (axios.isAxiosError(err)) {
          const errorData = err.response?.data as ApiErrorResponse;
          setError(errorData?.message || "Không thể tải danh sách đề thi.");
        } else {
          setError("Đã xảy ra lỗi không xác định.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const renderExamCard = (exam: ExamInList) => (
    <Link
      to={`/exam/${exam._id}`}
      key={exam._id}
      className="block p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-yellow-500/20 hover:ring-1 hover:ring-yellow-500/50 transition-all duration-300 group hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-2">
        {exam.subject && (
            <span className="text-xs font-semibold bg-yellow-500 text-gray-900 px-2 py-1 rounded-full">
                {exam.subject}
            </span>
        )}
        {exam.year && (
            <span className="text-xs text-gray-400">
                Năm {exam.year}
            </span>
        )}
      </div>
      <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-200 mb-2">
        {exam.title}
      </h3>
      {exam.description && (
        <p className="text-gray-300 leading-relaxed text-sm">
          {exam.description}
        </p>
      )}
      {exam.province && (
        <p className="text-sm text-yellow-300/80 mt-3 font-semibold">
            {exam.province}
        </p>
      )}
    </Link>
  );

  return (
    <Layout>
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Tuyển tập <span className="text-yellow-400">Đề Thi</span>
            </h1>
            <p className="text-gray-300 mt-3 text-lg max-w-2xl mx-auto">
              Tổng hợp các đề thi tuyển sinh và đề thi thử các môn Toán, Văn, Anh qua các năm.
            </p>
          </header>

          {loading && (
            <div className="text-center">Đang tải danh sách đề thi...</div>
          )}

          {error && (
            <div className="text-center text-red-500">{error}</div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {exams.length > 0 ? (
                exams.map(renderExamCard)
              ) : (
                <p className="col-span-full text-center text-gray-400">Chưa có đề thi nào được đăng.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AllExamsPage;