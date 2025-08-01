// src/pages/LecturesPage.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';
import {
  ChevronDown, PlayCircle, LayoutGrid, List, ChevronLeft, ChevronRight, ArrowRight
} from "lucide-react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b">
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full py-3 font-medium text-left transition-colors hover:text-primary">
          <span>{title}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-4 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

const FilterCheckbox: React.FC<{ id: string; label: string }> = ({ id, label }) => (
  <div className="flex items-center space-x-2 pl-2">
    <Checkbox id={id} />
    <Label htmlFor={id} className="font-normal text-sm cursor-pointer">{label}</Label>
  </div>
)

// --- Interfaces for LECTURES (Bài giảng) ---
interface LectureCardProps {
  _id: string;
  slug: string; // <<<< THÊM TRƯỜNG NÀY
  imgSrc?: string;
  altText: string;
  lectureCategory: string;
  grade: number;
  title: string;
  description?: string;
}

const LectureCard: React.FC<LectureCardProps> = (props) => (
  // THAY ĐỔI ĐƯỜNG DẪN Ở ĐÂY
  <Link to={`/mon-ngu-van/${props.slug}`} className="block">
    <Card className="group overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-52 overflow-hidden">
          <img src={props.imgSrc || '/placeholder-image.jpg'} alt={props.altText} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
            <PlayCircle className="text-white h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">{props.lectureCategory}</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Lớp {props.grade}</span>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground">{props.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mt-3">{props.description}</p>
      </CardContent>
    </Card>
  </Link>
);

// Interfaces cho LECTURE DATA (cho admin/backend)
interface ILectureCategory {
  _id: string;
  name: string;
  description?: string;
}

interface ILecture {
  _id: string;
  name: string;
  slug: string; // <<<< THÊM TRƯỜNG NÀY
  imageUrl?: string;
  description?: string;
  lectureCategory: string | ILectureCategory; // Đã sửa kiểu ở đây
  grade: number;
}

// KHÔNG CẦN INTERFACE NÀY NỮA VÌ CHÚNG TA KHÔNG NHÓM THEO CATEGORY
// interface ILectureCategoryWithLectures extends ILectureCategory {
//   lectures: ILecture[];
//   currentPage: number;
// }

// --- Interfaces for ESSAY TOPICS (Bài văn mẫu / Chủ đề luận) ---
interface EssayTopicItem {
  _id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  category?: string | { _id: string; name: string; }; // 'category' có thể là ID hoặc object
}

interface EssayCategory { // Category cho Essay Topics
  _id: string;
  name: string;
  description?: string;
}

interface EssayCategoryWithTopics extends EssayCategory {
  topics: EssayTopicItem[];
  currentPage: number;
}

// Essay Topic Card (re-used from EssaysByTopic logic)
const EssayTopicCard: React.FC<{ topic: EssayTopicItem }> = ({ topic }) => {
  return (
    <Link
      to={`/topic/${topic._id}`} // Adjust this path if your essay topic detail page is different
      key={topic._id}
      className="bg-card rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-[1.03] transition-transform duration-300 group border"
    >
      <div className="w-full h-48 rounded-xl overflow-hidden mb-6 bg-accent flex items-center justify-center">
        {topic.imageUrl ? (
          <img src={topic.imageUrl} alt={topic.name} className="object-cover w-full h-full" />
        ) : (
          <svg className="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-2 text-foreground text-left w-full group-hover:text-primary transition-colors">
        {topic.name}
      </h3>
      <p className="text-muted-foreground mb-5 text-base text-left w-full h-16 overflow-hidden">
        Xem các bài luận thuộc chủ đề "{topic.name}".
      </p>
      <span className="mt-auto text-primary font-semibold group-hover:underline transition-all text-lg text-left w-full">
        Khám phá chủ đề →
      </span>
    </Link>
  );
};


const LecturesPage: React.FC = () => {
  // State for LECTURES (Bài giảng)
  const [allLectures, setAllLectures] = useState<ILecture[]>([]); // Sửa từ categoriesWithLectures
  const [currentLecturePage, setCurrentLecturePage] = useState(1); // Thêm state cho page bài giảng
  const [isLoadingLectures, setIsLoadingLectures] = useState(true);
  const [errorLectures, setErrorLectures] = useState<string | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);

  const lecturesPerPage = 3;

  // State for ESSAY TOPICS (Bài văn mẫu)
  const [essayCategoriesWithTopics, setEssayCategoriesWithTopics] = useState<EssayCategoryWithTopics[]>([]);
  const [isLoadingEssayTopics, setIsLoadingEssayTopics] = useState(true);
  const [errorEssayTopics, setErrorEssayTopics] = useState<string | null>(null);

  const essayTopicsPerPage = 3; // Number of essay topics per row


  // --- Fetch Lectures Data ---
  useEffect(() => {
    document.title = "Bài giảng & Văn mẫu";
    window.scrollTo(0, 0);

    const fetchLecturesData = async () => {
      setIsLoadingLectures(true);
      setErrorLectures(null);
      try {
        // Chúng ta vẫn cần lectureCategories để populate lectureCategory trong ILecture
        const [lectureCategoriesRes, lecturesRes] = await Promise.all([
          axiosInstance.get<ILectureCategory[]>('/api/lecturecategories'),
          axiosInstance.get<ILecture[]>('/api/lectures')
        ]);

        const lectureCategories: ILectureCategory[] = lectureCategoriesRes.data;
        let fetchedLectures: ILecture[] = lecturesRes.data;

        // Populate lectureCategory objects for display
        fetchedLectures = fetchedLectures.map(lecture => {
          const categoryId = typeof lecture.lectureCategory === 'object' ? lecture.lectureCategory._id : lecture.lectureCategory;
          const foundCategory = lectureCategories.find(cat => cat._id === categoryId);
          return {
            ...lecture,
            lectureCategory: foundCategory || lecture.lectureCategory // Keep original if not found (e.g., it's already an object)
          };
        });


        const filteredLectures = selectedGrades.length > 0
          ? fetchedLectures.filter(lecture => selectedGrades.includes(lecture.grade))
          : fetchedLectures;

        // Sắp xếp tất cả các bài giảng theo tên (hoặc theo tiêu chí khác nếu muốn)
        setAllLectures(filteredLectures.sort((a, b) => a.name.localeCompare(b.name)));
        setCurrentLecturePage(1); // Reset về trang 1 khi filters thay đổi
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const serverError = err.response?.data as { error?: string, message?: string };
          setErrorLectures(serverError?.error || serverError?.message || err.message);
        } else if (err instanceof Error) {
          setErrorLectures(err.message);
        } else {
          setErrorLectures('An unknown error occurred while fetching lectures.');
        }
      } finally {
        setIsLoadingLectures(false);
      }
    };
    fetchLecturesData();
  }, [selectedGrades]); // Re-fetch lectures if grade filter changes

  // --- Fetch Essay Topics Data (Giữ nguyên) ---
  useEffect(() => {
    const fetchEssayTopicsData = async () => {
      setIsLoadingEssayTopics(true);
      setErrorEssayTopics(null);
      try {
        const [essayCategoriesRes, essayTopicsRes] = await Promise.all([
          axiosInstance.get<EssayCategory[]>('/api/categories'), // Use /api/categories for essay categories
          axiosInstance.get<EssayTopicItem[]>('/api/topics') // Use /api/topics for essay topics
        ]);

        const essayCategories: EssayCategory[] = essayCategoriesRes.data;
        const allEssayTopics: EssayTopicItem[] = essayTopicsRes.data;

        // Moved handleEssayTopicPageChange outside map
        // const groupedEssayTopics = essayCategories.map(cat => ({
        //   ...cat,
        //   topics: allEssayTopics.filter(topic => typeof topic.category === 'object' ? topic.category._id === cat._id : topic.category === cat._id) // Filter by category ID
        //                 .sort((a, b) => a.name.localeCompare(b.name)),
        //   currentPage: 1
        // })).filter(cat => cat.topics.length > 0);
        // setEssayCategoriesWithTopics(groupedEssayTopics);

        // Fix the issue by ensuring category is an object before filtering
        const processedEssayTopics = allEssayTopics.map(topic => ({
            ...topic,
            category: typeof topic.category === 'string'
                ? essayCategories.find(cat => cat._id === topic.category) || topic.category
                : topic.category
        }));

        const groupedEssayTopics = essayCategories.map(cat => ({
            ...cat,
            topics: processedEssayTopics.filter(topic =>
                typeof topic.category === 'object' && topic.category?._id === cat._id
            ).sort((a, b) => a.name.localeCompare(b.name)),
            currentPage: 1
        })).filter(cat => cat.topics.length > 0);

        setEssayCategoriesWithTopics(groupedEssayTopics);

      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const serverError = err.response?.data as { error?: string, message?: string };
          setErrorEssayTopics(serverError?.error || serverError?.message || err.message);
        } else if (err instanceof Error) {
          setErrorEssayTopics(err.message);
        } else {
          setErrorEssayTopics('An unknown error occurred while fetching essay topics.');
        }
      } finally {
        setIsLoadingEssayTopics(false);
      }
    };
    fetchEssayTopicsData();
  }, []); // Added essayCategories to dependency array to avoid re-renders

  // --- Handlers for Lectures Pagination and Filters ---
  const handleLecturePageChange = (newPage: number) => { // Sửa hàm này không cần categoryId
    setCurrentLecturePage(newPage);
  };

  const handleGradeFilterChange = (grade: number, checked: boolean) => {
    setSelectedGrades(prev =>
      checked ? [...prev, grade] : prev.filter(g => g !== grade)
    );
  };

  // Lấy danh sách các lớp duy nhất từ tất cả các bài giảng
  const allGrades = useMemo(() => {
    const grades = new Set<number>();
    allLectures.forEach(lecture => { // Duyệt qua allLectures đã gộp
      if (lecture.grade) {
        grades.add(lecture.grade);
      }
    });
    return Array.from(grades).sort((a, b) => a - b);
  }, [allLectures]); // Phụ thuộc vào allLectures

  // Tính toán số trang và bài giảng hiển thị cho phần LECTURES
  const totalLecturePages = Math.ceil(allLectures.length / lecturesPerPage);
  const lectureStartIndex = (currentLecturePage - 1) * lecturesPerPage;
  const lectureEndIndex = lectureStartIndex + lecturesPerPage;
  const currentLecturesDisplayed = allLectures.slice(lectureStartIndex, lectureEndIndex);


  // --- Handlers for Essay Topics Pagination ---
  const handleEssayTopicPageChange = useCallback((categoryId: string, newPage: number) => {
    setEssayCategoriesWithTopics(prevCategories =>
      prevCategories.map(category =>
        category._id === categoryId ? { ...category, currentPage: newPage } : category
      )
    );
  }, []); // Sử dụng useCallback để memoize hàm này


  // --- Breadcrumbs (Giữ nguyên) ---
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Trang chủ', path: '/' },
    { label: 'Bài giảng & Văn mẫu', path: '/mon-ngu-van' },
  ], []);


  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="bg-secondary/50 py-4 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-52 shrink-0">
              <div className="bg-card rounded-lg border shadow-sm p-5 sticky top-24">
                <h3 className="font-bold text-lg mb-2 text-card-foreground">Bộ lọc</h3>
                {/* Lọc theo Lớp học (cho Bài giảng) */}
                <FilterSection title="Lớp học (Bài giảng)">
                  {allGrades.length > 0 ? (
                    allGrades.map(grade => (
                      <div key={grade} className="flex items-center space-x-2 pl-2">
                        <Checkbox
                          id={`grade-${grade}`}
                          checked={selectedGrades.includes(grade)}
                          onCheckedChange={(checked) => handleGradeFilterChange(grade, checked as boolean)}
                        />
                        <Label htmlFor={`grade-${grade}`} className="font-normal text-sm cursor-pointer">Lớp {grade}</Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm pl-2">Không có dữ liệu lớp.</p>
                  )}
                </FilterSection>

                {/* Các bộ lọc chung khác (có thể dùng cho cả 2 loại nếu phù hợp) */}
                <FilterSection title="Chương/Phần">
                  <FilterCheckbox id="nghi-luan-xa-hoi" label="Nghị luận xã hội" />
                  <FilterCheckbox id="nghi-luan-van-hoc" label="Nghị luận văn học" />
                  <FilterCheckbox id="van-thuyet-minh" label="Văn thuyết minh" />
                  <FilterCheckbox id="van-tu-su" label="Văn tự sự" />
                </FilterSection>
                <FilterSection title="Độ khó">
                  <FilterCheckbox id="do-kho-co-ban" label="Cơ bản" />
                  <FilterCheckbox id="do-kho-trung-binh" label="Trung bình" />
                  <FilterCheckbox id="do-kho-nang-cao" label="Nâng cao" />
                </FilterSection>
                <FilterSection title="Thời lượng">
                  <FilterCheckbox id="thoi-luong-ngan" label="Dưới 15 phút" />
                  <FilterCheckbox id="thoi-luong-trung-binh" label="15-30 phút" />
                  <FilterCheckbox id="thoi-luong-dai" label="Trên 30 phút" />
                </FilterSection>
                <Button className="w-full mt-6">Áp dụng bộ lọc</Button>
              </div>
            </aside>
            <div className="flex-1">
              {/* --- PHẦN HIỂN THỊ BÀI GIẢNG (LECTURES) --- */}
              <div className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                  Bài giảng Ngữ văn
                </h1>
                <p className="text-lg text-muted-foreground">
                  Khám phá các bài giảng chất lượng cao từ các giáo viên hàng đầu.
                </p>
                <div className="flex flex-wrap items-center justify-between mt-6 bg-card p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                    <Label className="text-muted-foreground">Sắp xếp theo:</Label>
                    <Select value="newest" onValueChange={() => {}}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Mới nhất" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Mới nhất</SelectItem>
                        <SelectItem value="popular">Phổ biến</SelectItem>
                        <SelectItem value="rating">Đánh giá cao</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center">
                    <Label className="text-muted-foreground mr-2">Hiển thị:</Label>
                    <Button variant="default" size="icon" className="mr-1"><LayoutGrid className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon"><List className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
              
              {isLoadingLectures && <p className="text-center text-foreground text-lg py-10">Đang tải bài giảng...</p>}
              {errorLectures && <p className="text-center text-destructive text-lg py-10">Lỗi: {errorLectures}</p>}
              {!isLoadingLectures && !errorLectures && (
                <>
                  {currentLecturesDisplayed.length === 0 ? (
                    <p className="text-center text-muted-foreground text-lg py-10">Không có bài giảng nào để hiển thị.</p>
                  ) : (
                    <section className="mb-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentLecturesDisplayed.map(lecture => (
                          <LectureCard
                            key={lecture._id}
                            _id={lecture._id}
                            slug={lecture.slug} // Truyền slug vào component
                            imgSrc={lecture.imageUrl}
                            altText={lecture.name}
                            lectureCategory={
                                typeof lecture.lectureCategory === 'object' && lecture.lectureCategory?.name
                                    ? lecture.lectureCategory.name
                                    : 'N/A'
                            }
                            grade={lecture.grade}
                            title={lecture.name}
                            description={lecture.description}
                          />
                        ))}
                      </div>
                      {/* Pagination for Lectures */}
                      {totalLecturePages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-8">
                          <nav className="flex items-center space-x-2 mb-4 sm:mb-0">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleLecturePageChange(Math.max(1, currentLecturePage - 1))}
                              disabled={currentLecturePage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {Array.from({ length: totalLecturePages }, (_, i) => i + 1).map(page => (
                              <Button
                                key={page}
                                variant={currentLecturePage === page ? 'default' : 'outline'}
                                onClick={() => handleLecturePageChange(page)}
                              >
                                {page}
                              </Button>
                            ))}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleLecturePageChange(Math.min(totalLecturePages, currentLecturePage + 1))}
                              disabled={currentLecturePage === totalLecturePages}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </nav>
                          {/* Không có nút "Xem tất cả" cho phần bài giảng vì đã hiển thị tất cả */}
                        </div>
                      )}
                    </section>
                  )}
                </>
              )}

              {/* --- PHẦN HIỂN THỊ CHỦ ĐỀ BÀI LUẬN (ESSAY TOPICS) --- */}
              <div className="mt-12 pt-8 border-t border-border">
                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                  Chủ đề Bài luận Mẫu
                </h1>
                <p className="text-lg text-muted-foreground">
                  Tuyển chọn các chủ đề và dàn ý văn mẫu nghị luận xã hội.
                </p>
                {isLoadingEssayTopics && <p className="text-center text-foreground text-lg py-10">Đang tải chủ đề bài luận...</p>}
                {errorEssayTopics && <p className="text-center text-destructive text-lg py-10">Lỗi: {errorEssayTopics}</p>}
                {!isLoadingEssayTopics && !errorEssayTopics && (
                  <>
                    {essayCategoriesWithTopics.length === 0 && <p className="text-center text-muted-foreground text-lg py-10">Không có chủ đề bài luận nào để hiển thị.</p>}
                    {essayCategoriesWithTopics.map(cat => {
                      const totalPages = Math.ceil(cat.topics.length / essayTopicsPerPage);
                      const startIndex = (cat.currentPage - 1) * essayTopicsPerPage;
                      const endIndex = startIndex + essayTopicsPerPage;
                      const currentTopics = cat.topics.slice(startIndex, endIndex);

                      return (
                        <section key={`essay-cat-${cat._id}`} className="mb-12 mt-8">
                          <div className="flex items-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Chủ đề {cat.name}</h2>
                            <div className="h-px bg-border flex-grow ml-4"></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentTopics.map(topic => (
                              <EssayTopicCard key={topic._id} topic={topic} />
                            ))}
                          </div>
                          {/* Pagination for Essay Topics */}
                          <div className="flex flex-col sm:flex-row items-center justify-between mt-8">
                            {totalPages > 1 && (
                              <nav className="flex items-center space-x-2 mb-4 sm:mb-0">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEssayTopicPageChange(cat._id, Math.max(1, cat.currentPage - 1))}
                                  disabled={cat.currentPage === 1}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                  <Button
                                    key={page}
                                    variant={cat.currentPage === page ? 'default' : 'outline'}
                                    onClick={() => handleEssayTopicPageChange(cat._id, page)}
                                  >
                                    {page}
                                  </Button>
                                ))}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEssayTopicPageChange(cat._id, Math.min(totalPages, cat.currentPage + 1))}
                                  disabled={cat.currentPage === totalPages}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </nav>
                            )}
                            {cat.topics.length > 0 && (
                              <Link to={`/category/${cat._id}`}>
                                <Button variant="outline" className="w-full sm:w-auto">
                                  Xem tất cả chủ đề {cat.name} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </section>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default LecturesPage;