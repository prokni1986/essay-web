// src/pages/AllExamsPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

// UI components và icons
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Clock, FileText, CalendarDays, BarChart3 } from 'lucide-react';

// Interface cho đề thi, đã bổ sung các trường mới
interface ExamInList {
  _id: string;
  title: string;
  description?: string;
  subject?: string;
  year?: number;
  province?: string;
  createdAt: string;
  image?: string;
  type?: 'Chính thức' | 'Thi thử';
  duration?: number;
  questions?: number;
  difficulty?: 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';
}

interface ApiErrorResponse {
  message?: string;
}

// Component ExamCard chi tiết
const ExamCard: React.FC<{ exam: ExamInList }> = ({ exam }) => {
  const defaultImage = "https://readdy.ai/api/search-image?query=exam%20paper%20on%20a%20desk%20with%20a%20pen%2C%20minimalist%2C%20clean&width=400&height=250&seq=1";

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md border overflow-hidden flex flex-col group">
      <div className="h-40 bg-muted overflow-hidden">
        <img
          src={exam.image || defaultImage}
          alt={`Ảnh minh họa cho ${exam.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-3">
          {exam.subject && <Badge variant="default">{exam.subject}</Badge>}
          {exam.type && <Badge variant="outline">{exam.type}</Badge>}
        </div>
        <h3 className="font-bold text-md mb-3 flex-grow h-12">
          <Link to={`/exam/${exam._id}`} className="hover:text-primary transition-colors">
            {exam.title}
          </Link>
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
          {exam.duration && <InfoItem icon={<Clock size={14}/>} text={`${exam.duration} phút`} />}
          {exam.questions && <InfoItem icon={<FileText size={14}/>} text={`${exam.questions} câu`} />}
          {exam.year && <InfoItem icon={<CalendarDays size={14}/>} text={`Năm ${exam.year}`} />}
          {exam.difficulty && <InfoItem icon={<BarChart3 size={14}/>} text={exam.difficulty} />}
        </div>
        <div className="mt-auto flex gap-2">
            <Button asChild className="flex-1">
                <Link to={`/exam/${exam._id}`}>
                    <Eye size={16} className="mr-2"/> Xem đề
                </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
                <a href="#">
                    <Download size={16} />
                </a>
            </Button>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
  <div className="flex items-center">
    <span className="mr-2">{icon}</span>
    <span>{text}</span>
  </div>
);


const AllExamsPage: React.FC = () => {
  // State data
  const [exams, setExams] = useState<ExamInList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho bộ lọc
  const [activeSubject, setActiveSubject] = useState("all");
  const [activeYear, setActiveYear] = useState("all");
  const [activeRegion, setActiveRegion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Logic gọi API
  useEffect(() => {
    document.title = "Tuyển tập đề thi";
    window.scrollTo(0, 0);

    const fetchExams = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<ExamInList[]>('/api/exams');
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

  // Các hàm xử lý filter
  const handleSubjectFilter = (subject: string) => { setActiveSubject(subject); setCurrentPage(1); };
  const handleYearFilter = (year: string) => { setActiveYear(year); setCurrentPage(1); };
  const handleRegionFilter = (region: string) => { setActiveRegion(region); setCurrentPage(1); };

  // Logic lọc và phân trang
  const filteredExams = exams.filter((exam) => {
    return (
      (activeSubject === "all" || exam.subject === activeSubject) &&
      (activeYear === "all" || exam.year?.toString() === activeYear) &&
      (activeRegion === "all" || exam.province === activeRegion) &&
      (searchQuery === "" ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.province?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto px-4 py-8">
            {/* Tiêu đề trang */}
            <header className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Kho <span className="text-primary">Đề Thi</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Tổng hợp đề thi chính thức và đề thi thử các môn Toán, Anh văn,
                Ngữ văn qua các năm.
              </p>
            </header>

            {/* Bộ lọc nhanh */}
            <div className="mb-8">
              <div className="bg-card rounded-lg p-4 border shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleSubjectFilter("all")} variant={activeSubject === "all" ? "default" : "secondary"}>Tất cả môn</Button>
                  <Button onClick={() => handleSubjectFilter("Toán")} variant={activeSubject === "Toán" ? "default" : "secondary"}>Toán học</Button>
                  <Button onClick={() => handleSubjectFilter("Ngữ văn")} variant={activeSubject === "Ngữ văn" ? "default" : "secondary"}>Ngữ văn</Button>
                  <Button onClick={() => handleSubjectFilter("Tiếng Anh")} variant={activeSubject === "Tiếng Anh" ? "default" : "secondary"}>Tiếng Anh</Button>
                </div>
              </div>
            </div>
            
            {/* Bộ lọc nâng cao */}
            <div className="mb-8">
              <div className="bg-card rounded-lg p-6 border shadow-sm">
                  <h2 className="text-lg font-bold text-card-foreground mb-4">Bộ lọc nâng cao</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Năm</label>
                          <select onChange={(e) => handleYearFilter(e.target.value)} value={activeYear} className="block w-full bg-input border-border rounded-md py-2 px-3 focus:ring-primary focus:border-primary">
                              <option value="all">Tất cả</option>
                              <option value="2024">2024</option>
                              <option value="2023">2023</option>
                              <option value="2022">2022</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Tỉnh/Thành phố</label>
                          <select onChange={(e) => handleRegionFilter(e.target.value)} value={activeRegion} className="block w-full bg-input border-border rounded-md py-2 px-3 focus:ring-primary focus:border-primary">
                              <option value="all">Tất cả</option>
                              <option value="Toàn quốc">Toàn quốc</option>
                              <option value="Hà Nội">Hà Nội</option>
                              <option value="TP.HCM">TP.HCM</option>
                              <option value="Đà Nẵng">Đà Nẵng</option>
                          </select>
                      </div>
                      <div>
                        <label htmlFor="search-exam" className="block text-sm font-medium text-muted-foreground mb-2">Tìm kiếm</label>
                        <input
                           type="text"
                           id="search-exam"
                           placeholder="Nhập tên đề thi, môn học..."
                           className="block w-full bg-input border-border rounded-md py-2 px-3 focus:ring-primary focus:border-primary"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                  </div>
              </div>
            </div>
            
            {/* Danh sách đề thi */}
            <div>
                <h2 className="text-xl font-bold mb-4">
                    Kết quả ({filteredExams.length} đề thi)
                </h2>
                {loading && <div className="text-center text-muted-foreground py-10">Đang tải danh sách...</div>}
                {error && <div className="text-center text-destructive bg-destructive/10 p-4 rounded-md">{error}</div>}
                {!loading && !error && (
                    <>
                        {paginatedExams.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedExams.map((exam) => <ExamCard key={exam._id} exam={exam} />)}
                            </div>
                        ) : (
                             <div className="text-center py-16 bg-card rounded-lg border">
                                <h3 className="text-xl font-bold mb-2">Không tìm thấy đề thi</h3>
                                <p className="text-muted-foreground">Không có đề thi nào phù hợp với bộ lọc của bạn.</p>
                            </div>
                        )}

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8">
                                <nav className="inline-flex rounded-md shadow-sm">
                                    <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="outline" className="rounded-r-none">
                                        Trước
                                    </Button>
                                    {/* Có thể thêm logic hiển thị số trang ở đây nếu muốn */}
                                    <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="outline" className="rounded-l-none">
                                        Sau
                                    </Button>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default AllExamsPage;