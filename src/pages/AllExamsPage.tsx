// src/pages/AllExamsPage.tsx

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { Link, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';

// UI components và icons
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Download, Clock, FileText, CalendarDays, BarChart3, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Interface cho đề thi (đã xóa thumbnailUrl)
interface ExamInList {
  _id: string;
  title: string;
  description?: string;
  subject?: string;
  year?: number;
  province?: string;
  createdAt: string;
  type?: 'Chính thức' | 'Thi thử' | 'Đề ôn tập' | 'Đề thi chuyên';
  duration?: number;
  questions?: number;
  difficulty?: 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';
  grade?: number;
}

interface ApiErrorResponse {
  message?: string;
}

// Hàm helper để lấy màu nền cho Badge Subject
const getSubjectBadgeColorClass = (subject: string | undefined): string => {
  switch (subject) {
    case 'Toán':
      return 'bg-green-300';
    case 'Ngữ văn':
      return 'bg-blue-300';
    case 'Tiếng Anh':
      return 'bg-pink-300';
    default:
      return 'bg-gray-300';
  }
};

// Hàm helper để lấy màu nền cho Badge Type
const getTypeBadgeClasses = (type: 'Chính thức' | 'Thi thử' | 'Đề ôn tập' | 'Đề thi chuyên' | undefined): string => {
  switch (type) {
    case 'Chính thức':
      return 'bg-purple-400 text-white';
    case 'Thi thử':
      return 'bg-orange-400 text-white';
    case 'Đề ôn tập':
      return 'bg-teal-400 text-white';
    case 'Đề thi chuyên':
      return 'bg-red-400 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

// === HÀM HELPER MỚI: Lấy đường dẫn ảnh thumbnail động ===
const getThumbnailForExam = (exam: ExamInList): string => {
  // Ưu tiên kiểm tra đề chuyên trước
  if (exam.type === 'Đề thi chuyên') {
    switch (exam.subject) {
      case 'Toán':
        return '/uploads/Ảnh thumbnail/chuyên toán.png';
      case 'Ngữ văn':
        return '/uploads/Ảnh thumbnail/chuyên văn.png';
      case 'Tiếng Anh':
        return '/uploads/Ảnh thumbnail/chuyên anh.png';
      default:
        // Ảnh mặc định cho các môn chuyên khác (Lý, Hóa, Sinh,...)
        return '/uploads/Ảnh thumbnail/chuyen_default.png';
    }
  }
  if (exam.type === 'Chính thức') {
    switch (exam.subject) {
      case 'Toán':
        return '/uploads/Ảnh thumbnail/đề thi toán.png';
      case 'Ngữ văn':
        return '/uploads/Ảnh thumbnail/đề thi văn.png';
      case 'Tiếng Anh':
        return '/uploads/Ảnh thumbnail/đề thi anh.png';
      default:
        return '/uploads/Ảnh thumbnail/chinhthuc_default.png';
    }
  }
  if (exam.type === 'Thi thử') {
    // Với đề thi thử, ta có thể dùng ảnh chung hoặc phân loại theo môn nếu muốn
    switch (exam.subject) {
      case 'Toán':
        return '/uploads/Ảnh thumbnail/đề thi thử.png';
      case 'Ngữ văn':
        return '/uploads/Ảnh thumbnail/đề thi thử.png';
      case 'Tiếng Anh':
          return '/uploads/Ảnh thumbnail/đề thi thử.png';
      default:
        // Ảnh chung cho các đề thi thử
        return '/uploads/Ảnh thumbnail/thithu_default.png';
    }
  }
  if (exam.type === 'Đề ôn tập') {
    // Đề ôn tập thường dùng ảnh chung
    return '/uploads/Ảnh thumbnail/ontap.png';
  }
  // Fallback: Trả về một ảnh mặc định cho tất cả các trường hợp còn lại
  return '/uploads/Ảnh thumbnail/default.png';
};



// Component ExamCard chi tiết
const ExamCard: React.FC<{ exam: ExamInList }> = ({ exam }) => {
  const placeholderOnError = "https://via.placeholder.com/400x225/1f2937/4d5562?text=Không có ảnh";

  // Lấy đường dẫn ảnh thumbnail động
  const thumbnailUrl = getThumbnailForExam(exam);

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md border overflow-hidden flex flex-col group">
      <Link to={`/exam/${exam._id}`} className="block h-40 bg-muted overflow-hidden border-b border-border">
        <img
          src={thumbnailUrl} // <-- SỬ DỤNG LOGIC MỚI
          alt={`Ảnh minh họa cho ${exam.title}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = placeholderOnError; }}
        />
      </Link>
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-3">
          {exam.subject && (
            <Badge variant="default" className={`${getSubjectBadgeColorClass(exam.subject)} text-black text-xs px-1.5 py-0.5 rounded-full`}>
              {exam.subject}
            </Badge>
          )}
          {exam.type && (
            <Badge variant="default"
                   className={`${getTypeBadgeClasses(exam.type)} text-xs px-1.5 py-0.5 rounded-full`}>
              {exam.type}
            </Badge>
          )}
        </div>
        <h3 className="font-bold text-lg mb-2 flex-grow h-12">
          <Link to={`/exam/${exam._id}`} className="hover:text-primary transition-colors">
            {exam.title}{exam.province ? ` - ${exam.province}` : ''}
          </Link>
        </h3>
        
        <div className="grid grid-cols-2 gap-x-20 gap-y-2 text-sm text-muted-foreground mb-4">
          {exam.duration && <InfoItem icon={<Clock size={16}/>} text={`${exam.duration} phút`} />}
          {exam.questions && <InfoItem icon={<FileText size={16}/>} text={`${exam.questions} câu`} />}
          {exam.year && <InfoItem icon={<CalendarDays size={16}/>} text={`Năm ${exam.year}`} />}
          {exam.difficulty && <InfoItem icon={<BarChart3 size={16}/>} text={exam.difficulty} />}
        </div>

        <div className="mt-auto flex gap-2">
          <Button asChild className="flex-1">
            <Link to={`/exam/${exam._id}`}>
              <Eye size={16} className="mr-2"/> Xem đề
            </Link>
          </Button>
          <Button variant="outline" size="icon" disabled>
              <Download size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
  <div className="flex items-center">
    <span className="mr-2 flex-shrink-0">{icon}</span>
    <span>{text}</span>
  </div>
);


const AllExamsPage: React.FC = () => {
  // State data
  const [exams, setExams] = useState<ExamInList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho bộ lọc
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Get query parameters from URL
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);


  // State cho phân trang của từng môn học
  const [subjectCurrentPages, setSubjectCurrentPages] = useState<{ [subject: string]: number }>({});
  const ITEMS_PER_ROW = 3; 
  const MAX_ROWS_PER_PAGE = 2; 
  const ITEMS_PER_PAGE_PER_SUBJECT = ITEMS_PER_ROW * MAX_ROWS_PER_PAGE;

  const allSubjects = useMemo(() => Array.from(new Set(exams.map(e => e.subject).filter(Boolean) as string[])), [exams]);
  const allGrades = useMemo(() => Array.from(new Set(exams.map(e => e.grade).filter(Boolean) as number[])).sort((a,b)=>a-b), [exams]);
  const allDifficulties = useMemo(() => Array.from(new Set(exams.map(e => e.difficulty).filter(Boolean) as string[])), [exams]);
  const allTypes = useMemo(() => Array.from(new Set(exams.map(e => e.type).filter(Boolean) as string[])), [exams]);

  // Logic gọi API
  useEffect(() => {
    document.title = "Tuyển tập đề thi";
    window.scrollTo(0, 0);

    const initialGradeParam = queryParams.get('grade');
    if (initialGradeParam) {
      setSelectedGrades([parseInt(initialGradeParam, 10)]);
    } else {
      setSelectedGrades([]);
    }

    const fetchExams = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<ExamInList[]>('/api/exams');
        const sortedExams = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setExams(sortedExams);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data.message || "Không thể tải danh sách đề thi.");
        } else {
          setError("Đã xảy ra lỗi không xác định.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [queryParams]);

  // Hàm lọc đề thi dựa trên các bộ lọc đã chọn
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSubject = selectedSubjects.length === 0 || (exam.subject && selectedSubjects.includes(exam.subject));
      const matchesGrade = selectedGrades.length === 0 || (exam.grade && selectedGrades.includes(exam.grade));
      const matchesDifficulty = selectedDifficulties.length === 0 || (exam.difficulty && selectedDifficulties.includes(exam.difficulty));
      const matchesType = selectedTypes.length === 0 || (exam.type && selectedTypes.includes(exam.type));
      const matchesSearch = searchQuery === "" ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.province?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSubject && matchesGrade && matchesDifficulty && matchesType && matchesSearch;
    });
  }, [exams, selectedSubjects, selectedGrades, selectedDifficulties, selectedTypes, searchQuery]);

  // Nhóm các đề thi đã lọc theo môn học VÀ áp dụng phân trang cho từng nhóm
  const groupedExams = useMemo(() => {
    const groups: {
      subject: string;
      totalExams: number;
      totalPages: number;
      currentPage: number;
      exams: ExamInList[];
    }[] = [];

    const tempGroups: { [key: string]: ExamInList[] } = {};
    filteredExams.forEach(exam => {
      const subjectKey = exam.subject || 'Chưa phân loại';
      if (!tempGroups[subjectKey]) {
        tempGroups[subjectKey] = [];
      }
      tempGroups[subjectKey].push(exam);
    });

    Object.keys(tempGroups).sort().forEach(subject => {
      const totalExamsInSubject = tempGroups[subject].length;
      const totalPagesInSubject = Math.ceil(totalExamsInSubject / ITEMS_PER_PAGE_PER_SUBJECT);
      
      const currentPage = subjectCurrentPages[subject] || 1;

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_PER_SUBJECT;
      const endIndex = startIndex + ITEMS_PER_PAGE_PER_SUBJECT;
      const paginatedSubjectExams = tempGroups[subject].slice(startIndex, endIndex);

      groups.push({
        subject,
        totalExams: totalExamsInSubject,
        totalPages: totalPagesInSubject,
        currentPage,
        exams: paginatedSubjectExams,
      });
    });

    return groups;
  }, [filteredExams, subjectCurrentPages, ITEMS_PER_PAGE_PER_SUBJECT]);

  // Hàm thay đổi trang cho một môn học cụ thể
  const handleSubjectPageChange = (subject: string, newPage: number) => {
    setSubjectCurrentPages(prev => ({
      ...prev,
      [subject]: newPage,
    }));
  };

  // Hàm xử lý click vào nút tìm kiếm nhanh theo môn
  const handleQuickSearchBySubject = (subject: string) => {
    setSearchQuery(subject);
    setSelectedSubjects([subject]);
    setSelectedGrades([]);
    setSelectedDifficulties([]);
    setSelectedTypes([]);
    setSubjectCurrentPages({});
  };

  // Hàm xử lý click vào nút "Hiển thị tất cả"
  const handleShowAll = () => {
    setSearchQuery("");
    setSelectedSubjects([]);
    setSelectedGrades([]);
    setSelectedDifficulties([]);
    setSelectedTypes([]);
    setSubjectCurrentPages({});
  };

  // Define breadcrumb items based on current filters
  const breadcrumbItems = useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Trang chủ', path: '/' }, 
      { label: 'Kho đề thi', path: '/de-thi' }
    ];
    
    const gradeParam = queryParams.get('grade');
    if (gradeParam) {
      items.push({ label: `Lớp ${gradeParam}` });
    }
  
    return items;
  }, [queryParams]);

  return (
    <Layout>
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="mb-4">
              <Breadcrumbs items={breadcrumbItems} />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Kho <span className="text-primary">Đề Thi</span>
            </h1>
            
          </header>

          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
            {/* Sidebar Bộ lọc */}
            <aside className="w-full lg:w-1/5 xl:w-1/6 bg-background rounded-lg shadow-sm border p-4">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Bộ lọc</h2>

              {/* Lọc theo Môn học */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Môn học</h3>
                {allSubjects.map(subject => (
                  <div key={subject} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`subject-${subject}`}
                      checked={selectedSubjects.includes(subject)}
                      onCheckedChange={(checked) => {
                        setSelectedSubjects(prev =>
                          checked ? [...prev, subject] : prev.filter(s => s !== subject)
                        );
                      }}
                    />
                    <Label htmlFor={`subject-${subject}`}>{subject}</Label>
                  </div>
                ))}
              </div>

              {/* Lọc theo Lớp (Dropdown) */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Lớp</h3>
                <Select
                  value={selectedGrades.length > 0 ? String(selectedGrades[0]) : "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedGrades([]);
                    } else {
                      setSelectedGrades([parseInt(value, 10)]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {allGrades.map(grade => (
                      <SelectItem key={grade} value={String(grade)}>Lớp {grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lọc theo Độ khó */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Độ khó</h3>
                {allDifficulties.map(difficulty => (
                  <div key={difficulty} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`difficulty-${difficulty}`}
                      checked={selectedDifficulties.includes(difficulty)}
                      onCheckedChange={(checked) => {
                        setSelectedDifficulties(prev =>
                          checked ? [...prev, difficulty] : prev.filter(d => d !== difficulty)
                        );
                      }}
                    />
                    <Label htmlFor={`difficulty-${difficulty}`}>{difficulty}</Label>
                  </div>
                ))}
              </div>

              {/* Lọc theo Loại đề thi */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Loại đề thi</h3>
                {allTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        setSelectedTypes(prev =>
                          checked ? [...prev, type] : prev.filter(t => t !== type)
                        );
                      }}
                    />
                    <Label htmlFor={`type-${type}`}>{type}</Label>
                  </div>
                ))}
              </div>

              {/* Nút reset filter */}
              <Button 
                onClick={() => {
                  setSelectedSubjects([]);
                  setSelectedGrades([]);
                  setSelectedDifficulties([]);
                  setSelectedTypes([]);
                  setSearchQuery("");
                }} 
                variant="outline" 
                className="w-full"
              >
                Đặt lại bộ lọc
              </Button>
            </aside>

            {/* Khu vực hiển thị chính */}
            <div className="flex-1">
              {/* Thanh tìm kiếm và nút tìm kiếm nhanh */}
              <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-2 rounded-lg shadow-sm border">
                {/* Phần tìm kiếm */}
                <div className="flex items-center space-x-2 flex-grow sm:flex-grow-0 sm:w-1/2">
                  <Search className="text-muted-foreground" size={20} />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo tiêu đề, môn học, tỉnh..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-none focus-visible:ring-0"
                  />
                </div>
                
                {/* Các nút tìm kiếm nhanh và nút "Hiển thị tất cả" */}
                <div className="flex gap-2 justify-end flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => handleQuickSearchBySubject("Toán")}>Toán</Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickSearchBySubject("Ngữ văn")}>Ngữ văn</Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickSearchBySubject("Tiếng Anh")}>Tiếng Anh</Button>
                  <Button variant="default" size="sm" onClick={handleShowAll}>Hiển thị tất cả</Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center text-muted-foreground py-10 flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" /> Đang tải danh sách...
                </div>
              ) : error ? (
                <div className="text-center text-destructive bg-destructive/10 p-4 rounded-md">{error}</div>
              ) : (
                <>
                  {groupedExams.length > 0 ? (
                    groupedExams.map(group => (
                      <div key={group.subject} className="mb-8 p-4 bg-muted rounded-lg shadow-sm border">
                        <h3 className="text-2xl font-bold mb-4 border-b pb-2">Đề thi môn {group.subject}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {group.exams.map(exam => (
                            <ExamCard key={exam._id} exam={exam} />
                          ))}
                        </div>

                        {/* PHẦN PHÂN TRANG CHO TỪNG MÔN HỌC */}
                        {group.totalPages > 1 && (
                          <div className="flex justify-center items-center mt-6 space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleSubjectPageChange(group.subject, group.currentPage - 1)}
                              disabled={group.currentPage === 1}
                            >
                              <ChevronLeft size={20} />
                            </Button>
                            
                            {Array.from({ length: group.totalPages }, (_, i) => i + 1).map(pageNumber => (
                              <Button
                                key={pageNumber}
                                variant={pageNumber === group.currentPage ? "default" : "outline"}
                                size="icon"
                                onClick={() => handleSubjectPageChange(group.subject, pageNumber)}
                                className={pageNumber === group.currentPage ? "bg-primary text-primary-foreground" : ""}
                              >
                                {pageNumber}
                              </Button>
                            ))}

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleSubjectPageChange(group.subject, group.currentPage + 1)}
                              disabled={group.currentPage === group.totalPages}
                            >
                              <ChevronRight size={20} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 bg-card rounded-lg border">
                      <h3 className="text-xl font-bold mb-2">Không tìm thấy đề thi</h3>
                      <p className="text-muted-foreground">Không có đề thi nào phù hợp với bộ lọc của bạn.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AllExamsPage;