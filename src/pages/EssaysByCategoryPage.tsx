// file: pages/EssaysByCategoryPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { Link, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button"; // Import Button from ui
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // Import Card from ui
import { Input } from "@/components/ui/input"; // Import Input for search
import { Label } from "@/components/ui/label"; // Import Label for filter
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // Import Breadcrumb from ui
import {
  ArrowRight,
} from "lucide-react"; // Import ArrowRight for consistency

// Interfaces
interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface Topic {
  _id: string;
  name: string;
  category: Category | string;
  description?: string;
  imageUrl?: string;
}

interface Essay {
  _id: string;
  title: string;
  content: string;
  topic?: Topic | null;
  createdAt?: string;
}

// Helpers
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const getFirstParagraph = (html: string): string => {
  const match = html.match(/<p.*?>(.*?)<\/p>/is);
  if (match && match[1]) {
    return stripHtml(match[1]);
  }
  const plainText = stripHtml(html);
  // Ensure it doesn't cut in the middle of an HTML entity or tag that stripHtml missed
  const maxLength = 180;
  if (plainText.length > maxLength) {
      return plainText.substring(0, plainText.lastIndexOf(' ', maxLength)) + '...';
  }
  return plainText;
};

// Removed custom ArrowRightIcon, using LucideIcon directly in JSX

const EssaysByCategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [essaysOfThisCategory, setEssaysOfThisCategory] = useState<Essay[]>([]);
  const [topicsInThisCategory, setTopicsInThisCategory] = useState<Topic[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('Tất cả');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setError("Không tìm thấy ID chuyên mục trong URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setCurrentCategory(null);
      setTopicsInThisCategory([]);
      setEssaysOfThisCategory([]);
      setSelectedTopic('Tất cả');
      setSearchTerm('');

      try {
        const [categoryRes, topicsRes, essaysRes] = await Promise.all([
          axiosInstance.get<Category>(`/api/categories/${categoryId}`),
          axiosInstance.get<Topic[]>(`/api/topics?category=${categoryId}`),
          axiosInstance.get<Essay[]>(`/api/essays?category=${categoryId}`)
        ]);

        setCurrentCategory(categoryRes.data);
        setTopicsInThisCategory(topicsRes.data.sort((a,b) => a.name.localeCompare(b.name)));
        setEssaysOfThisCategory(essaysRes.data.sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ));

      } catch (err: unknown) {
        console.error("Lỗi khi tải dữ liệu cho category:", err);
        let errorMessage = "Không thể tải dữ liệu cho chuyên mục này. Vui lòng thử lại.";

        if (axios.isAxiosError(err)) {
          console.error("Backend response:", err.response?.data);
          const responseData = err.response?.data as { error?: string };
          errorMessage = responseData?.error || err.message;
          if (err.response?.status === 404) {
            errorMessage = `Không tìm thấy chuyên mục hoặc dữ liệu liên quan với ID: ${categoryId}.`;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  const displayedEssays = useMemo(() => {
    let filtered = essaysOfThisCategory;
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    if (selectedTopic !== 'Tất cả') {
      filtered = filtered.filter(essay => essay.topic?._id === selectedTopic);
    }

    if (lowerSearchTerm) {
      filtered = filtered.filter(essay =>
        essay.title.toLowerCase().includes(lowerSearchTerm) ||
        stripHtml(essay.content).toLowerCase().includes(lowerSearchTerm) ||
        (essay.topic?.name || '').toLowerCase().includes(lowerSearchTerm)
      );
    }
    return filtered;
  }, [essaysOfThisCategory, searchTerm, selectedTopic]);

  const countEssaysForTopicTab = (topicId: string): number => {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    let relevantEssays = essaysOfThisCategory;
    if(topicId !== 'Tất cả') {
        relevantEssays = essaysOfThisCategory.filter(e => e.topic?._id === topicId);
    }
    if (lowerSearchTerm) {
      return relevantEssays.filter(essay =>
        essay.title.toLowerCase().includes(lowerSearchTerm) ||
        stripHtml(essay.content).toLowerCase().includes(lowerSearchTerm)
      ).length;
    }
    return relevantEssays.length;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen bg-background">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="sr-only">Đang tải...</span>
            </div>
            <p className="mt-4 text-xl text-foreground">Đang tải bài luận...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
     return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center px-4">
          <Card className="p-8 max-w-md w-full">
            <svg className="w-16 h-16 text-destructive mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold text-destructive mb-3">Đã xảy ra lỗi!</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/essays">
              <Button>
                Xem tất cả chuyên mục
              </Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!currentCategory && !loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen bg-background text-center px-4">
           <Card className="p-8 max-w-md w-full">
             <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-2xl font-bold text-yellow-500 mb-3">Không tìm thấy thông tin chuyên mục</h2>
            <p className="text-muted-foreground mb-6">Chuyên mục bạn đang tìm kiếm có thể không tồn tại hoặc đã bị di chuyển.</p>
            <Link to="/essays">
              <Button>
                Xem tất cả chuyên mục
              </Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="bg-muted/50 border-b">
            <div className="container mx-auto px-4">
                 <Breadcrumb className="py-3">
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/">Trang chủ</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href="/essays">Bài luận</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>{currentCategory?.name || 'Chuyên mục'}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </div>
        <main className="container mx-auto px-4 py-8">
          <header className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {currentCategory?.name || 'Chuyên mục'}
            </h1>
            {currentCategory?.description && (
              <p className="text-muted-foreground mt-3 text-base sm:text-lg max-w-3xl mx-auto">
                {currentCategory.description}
              </p>
            )}
          </header>

          <div className="bg-card p-4 sm:p-6 rounded-lg border shadow-sm space-y-6">
            <div className="pt-2 pb-4">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Tìm kiếm bài luận trong chuyên mục ${currentCategory?.name || ''}...`}
                className="w-full" // Shadcn Input already has good default styling
              />
            </div>

            {topicsInThisCategory.length > 0 && (
              <div className="mb-6">
                <Label className="text-muted-foreground mb-2 block">Lọc nhanh theo chủ đề:</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button
                    variant={selectedTopic === 'Tất cả' ? 'default' : 'outline'}
                    onClick={() => setSelectedTopic('Tất cả')}
                    className="font-semibold"
                  >
                    Tất cả
                    <span className="ml-1.5 px-1.5 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                      {countEssaysForTopicTab('Tất cả')}
                    </span>
                  </Button>
                  {topicsInThisCategory.map(topic => (
                    <Button
                      key={topic._id}
                      variant={selectedTopic === topic._id ? 'default' : 'outline'}
                      onClick={() => setSelectedTopic(topic._id)}
                      className="font-semibold"
                    >
                      {topic.name}
                      <span className="ml-1.5 px-1.5 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                        {countEssaysForTopicTab(topic._id)}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {displayedEssays.length > 0 ? (
              <div className="space-y-6">
                {displayedEssays.map((essay) => (
                  <Card
                    key={essay._id}
                    className="p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                  >
                    <CardContent className="p-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-200 mb-2">
                        <Link to={`/sampleessay/${essay._id}`}>{essay.title}</Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        Chủ đề: <span className="font-medium text-foreground">{essay.topic?.name || 'Không rõ'}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Chuyên mục: <span className="font-medium text-foreground">{currentCategory?.name || 'Không rõ'}</span>
                      </p>
                      <p className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base line-clamp-3">
                        {getFirstParagraph(essay.content)}
                      </p>
                      <Link
                        to={`/sampleessay/${essay._id}`}
                        className="inline-flex items-center mt-auto text-primary font-semibold hover:underline group-hover:text-primary/80 transition-colors duration-200 text-sm sm:text-base"
                      >
                        Đọc thêm <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic py-4 text-center">
                Không có bài luận nào phù hợp với lựa chọn của bạn trong chuyên mục "{currentCategory?.name}".
              </p>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default EssaysByCategoryPage;