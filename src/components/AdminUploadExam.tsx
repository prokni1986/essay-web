// src/components/AdminUploadExam.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import Papa, { ParseError } from 'papaparse';
import axios from 'axios';

// --- Import các thành phần cần thiết ---
import axiosInstance from '@/lib/axiosInstance';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Pencil, Trash2, XCircle, Loader2, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Định nghĩa kiểu dữ liệu (Interfaces) ---
type ExamType = 'Chính thức' | 'Thi thử' | 'Đề ôn tập' | 'Đề thi chuyên';
type ExamDifficulty = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

interface ExamInList {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  year: number;
  province?: string;
  createdAt: string;
  type?: ExamType;
  duration?: number;
  questions?: number;
  difficulty?: ExamDifficulty;
  grade?: number;
}

interface ExamFull extends ExamInList {
  htmlContent: string;
  solutionHtml?: string;
}

interface CsvRow {
  'Tiêu đề Đề thi': string;
  'Mô tả ngắn': string;
  'Môn học': string;
  'Năm': string;
  'Tỉnh/ Thành phố': string;
  'Loại đề thi': string;
  'Thời gian làm bài': string;
  'Số Câu hỏi': string;
  'Độ khó': string;
  'Lớp': string;
  'Nội dung Đề thi HTML': string;
  'Gợi ý lời giải HTML (Tùy chọn)': string;
}

// Hàm Type Guard để chuyển đổi chuỗi sang kiểu ExamType an toàn
const toExamType = (value: string): ExamType => {
  const validTypes: ExamType[] = ['Chính thức', 'Thi thử', 'Đề ôn tập', 'Đề thi chuyên'];
  return validTypes.includes(value as ExamType) ? (value as ExamType) : 'Chính thức';
};

// Hàm Type Guard để chuyển đổi chuỗi sang kiểu ExamDifficulty an toàn
const toDifficulty = (value: string): ExamDifficulty => {
  const validDifficulties: ExamDifficulty[] = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];
  return validDifficulties.includes(value as ExamDifficulty) ? (value as ExamDifficulty) : 'Trung bình';
};


// --- Component chính ---
const AdminUploadExam: React.FC = () => {
  // --- State Management ---
  const [exams, setExams] = useState<ExamInList[]>([]);
  const [editingExam, setEditingExam] = useState<ExamFull | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState<number | ''>(new Date().getFullYear());
  const [province, setProvince] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ExamInList | null>(null);
  const [loadingContentId, setLoadingContentId] = useState<string | null>(null);
  const [fullContentCache, setFullContentCache] = useState<{ [key: string]: { htmlContent: string; solutionHtml?: string } }>({});
  const [type, setType] = useState<ExamType>('Chính thức');
  const [duration, setDuration] = useState<number | ''>('');
  const [questions, setQuestions] = useState<number | ''>('');
  const [difficulty, setDifficulty] = useState<ExamDifficulty>('Trung bình');
  const [grade, setGrade] = useState<number | ''>('');
  const [solutionHtml, setSolutionHtml] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isCsvUploading, setIsCsvUploading] = useState(false);

  // --- API Functions ---
  const fetchExams = useCallback(async () => {
    setIsFetching(true);
    setApiError(null);
    try {
      const response = await axiosInstance.get('/api/exams');
      if (Array.isArray(response.data)) {
        const sortedExams = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setExams(sortedExams);
      } else {
        throw new Error("Dữ liệu không hợp lệ từ server.");
      }
    } catch (error) {
      const errorMessage = 'Không thể tải danh sách đề thi.';
      setApiError(errorMessage);
      toast.error(errorMessage);
      console.error("Fetch exams error:", error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // --- Form & Content Handlers ---
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setYear(new Date().getFullYear());
    setProvince('');
    setHtmlContent('');
    setSolutionHtml('');
    setType('Chính thức');
    setDuration('');
    setQuestions('');
    setDifficulty('Trung bình');
    setGrade('');
    setEditingExam(null);
  };

  const handleEditClick = async (exam: ExamInList) => {
    if (editingExam?._id === exam._id) {
      resetForm();
      return;
    }
    toast.info("Đang tải nội dung đề thi và lời giải...");
    try {
      const response = await axiosInstance.get(`/api/exams/${exam._id}`);
      const fullExamData: ExamFull = response.data;
      setEditingExam(fullExamData);
      setTitle(fullExamData.title);
      setDescription(fullExamData.description || '');
      setSubject(fullExamData.subject);
      setYear(fullExamData.year);
      setProvince(fullExamData.province || '');
      setHtmlContent(fullExamData.htmlContent);
      setSolutionHtml(fullExamData.solutionHtml || '');
      setType(fullExamData.type || 'Chính thức');
      setDuration(fullExamData.duration || '');
      setQuestions(fullExamData.questions || '');
      setDifficulty(fullExamData.difficulty || 'Trung bình');
      setGrade(fullExamData.grade || '');
      document.getElementById('exam-form-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      toast.error("Không thể tải nội dung chi tiết để sửa.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !htmlContent || !subject || !year) {
      toast.error("Vui lòng điền đủ các trường: Tiêu đề, Môn học, Năm và Nội dung HTML.");
      return;
    }
    setIsLoading(true);
    const examData = {
      title, description, htmlContent, solutionHtml, subject,
      year: Number(year), province, type,
      duration: Number(duration) || undefined,
      questions: Number(questions) || undefined,
      difficulty,
      grade: Number(grade) || undefined,
    };
    try {
      const action = editingExam
        ? axiosInstance.put(`/api/exams/${editingExam._id}`, examData)
        : axiosInstance.post('/api/exams/create-html-post', examData);
      await action;
      toast.success(editingExam ? 'Cập nhật đề thi thành công!' : 'Tạo mới đề thi thành công!');
      resetForm();
      await fetchExams();
    } catch (error) {
      toast.error('Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.');
      console.error("Submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setIsLoading(true);
    try {
      await axiosInstance.delete(`/api/exams/${deleteConfirm._id}`);
      toast.success('Đã xóa đề thi thành công!');
      setDeleteConfirm(null);
      await fetchExams();
    } catch (error) {
      toast.error('Xóa đề thi thất bại.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleDetails = async (examId: string) => {
    if (!fullContentCache[examId] && !loadingContentId) {
      setLoadingContentId(examId);
      try {
        const response = await axiosInstance.get(`/api/exams/${examId}`);
        setFullContentCache(prev => ({ ...prev, [examId]: {
          htmlContent: response.data.htmlContent,
          solutionHtml: response.data.solutionHtml,
        }}));
      } catch (error) {
        toast.error('Không thể tải nội dung xem trước.');
      } finally {
        setLoadingContentId(null);
      }
    }
  };
  
  const gradeOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    } else {
      setCsvFile(null);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error("Vui lòng chọn một file CSV để upload.");
      return;
    }
    setIsCsvUploading(true);
    toast.info("Đang đọc và xử lý file CSV...");
    try {
      const results = await new Promise<Papa.ParseResult<CsvRow>>((resolve, reject) => {
        Papa.parse<CsvRow>(csvFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results),
          error: (error: Error) => reject(error),
        });
      });
      
      if (results.errors.length > 0) {
        toast.error(`Có lỗi xảy ra khi đọc file CSV: ${results.errors[0].message}`);
        return;
      }
      
      const requiredHeaders = ['Tiêu đề Đề thi', 'Môn học', 'Năm', 'Nội dung Đề thi HTML'];
      const headers = results.meta.fields || [];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        toast.error(`File CSV thiếu các cột bắt buộc: ${missingHeaders.join(', ')}`);
        return;
      }
      
      const examsToCreate = results.data.map((row: CsvRow) => ({
        title: row['Tiêu đề Đề thi']?.trim() || '',
        description: row['Mô tả ngắn']?.trim() || '',
        subject: row['Môn học']?.trim() || '',
        year: row['Năm'] ? Number(row['Năm']) : undefined,
        province: row['Tỉnh/ Thành phố']?.trim() || '',
        type: toExamType(row['Loại đề thi']?.trim()),
        duration: row['Thời gian làm bài'] ? Number(row['Thời gian làm bài']) : undefined,
        questions: row['Số Câu hỏi'] ? Number(row['Số Câu hỏi']) : undefined,
        difficulty: toDifficulty(row['Độ khó']?.trim()),
        grade: row['Lớp'] ? Number(row['Lớp']) : undefined,
        htmlContent: row['Nội dung Đề thi HTML']?.trim() || '',
        solutionHtml: row['Gợi ý lời giải HTML (Tùy chọn)']?.trim() || '',
      })).filter(exam => exam.title && exam.subject && exam.year && exam.htmlContent);

      if (examsToCreate.length === 0) {
        toast.warning("Không tìm thấy dữ liệu đề thi hợp lệ trong file CSV.");
        return;
      }

      toast.info(`Đã tìm thấy ${examsToCreate.length} đề thi. Bắt đầu upload...`);
      const response = await axiosInstance.post('/api/exams/create-bulk-csv', examsToCreate);
      toast.success(response.data.message || 'Upload hàng loạt thành công!');
      await fetchExams();
      setCsvFile(null);
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if(fileInput) fileInput.value = '';

    } catch (error: unknown) {
      console.error("Lỗi khi upload CSV:", error);
      let errorMessage = "Upload hàng loạt thất bại. Vui lòng kiểm tra console log.";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsCsvUploading(false);
    }
  };

  // --- Render ---
  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 md:py-12">
        
        <section className="mb-16">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-6 w-6" />
                Upload Hàng Loạt Bằng File CSV
              </CardTitle>
              <CardDescription>
                Tải lên nhiều đề thi cùng lúc bằng cách sử dụng file .csv. File phải có header trùng với các trường dữ liệu.
                <br/>
                Các cột bắt buộc: <strong>Tiêu đề Đề thi, Môn học, Năm, Nội dung Đề thi HTML</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="csv-file">Chọn file CSV</Label>
                <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
              </div>
              <Button onClick={handleCsvUpload} disabled={isCsvUploading || !csvFile} className="mt-4">
                {isCsvUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCsvUploading ? 'Đang Upload...' : 'Bắt đầu Upload'}
              </Button>
            </CardContent>
           </Card>
        </section>

        <div className="my-12 border-t border-dashed"></div>

        <section id="exam-form-section" className="mb-16">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
              {editingExam ? 'Chỉnh Sửa Đề Thi Thủ Công' : 'Tạo Đề Thi Mới Thủ Công'}
            </h1>
            <p className="text-lg text-muted-foreground">
              Điền thông tin, nội dung HTML của đề thi và lời giải vào biểu mẫu bên dưới.
            </p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-6 bg-card border p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Tiêu đề Đề thi (*)</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="description">Mô tả ngắn</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="subject">Môn học (*)</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Năm (*)</Label>
                  <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value === '' ? '' : parseInt(e.target.value, 10))} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="province">Tỉnh/Thành phố</Label>
                  <Input id="province" value={province} onChange={(e) => setProvince(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Loại đề thi</Label>
                <Select value={type} onValueChange={(value) => setType(value as ExamType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn loại đề" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chính thức">Chính thức</SelectItem>
                    <SelectItem value="Thi thử">Thi thử</SelectItem>
                    <SelectItem value="Đề ôn tập">Đề ôn tập</SelectItem>
                    <SelectItem value="Đề thi chuyên">Đề thi chuyên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Thời gian làm bài (phút)</Label>
                <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="questions">Số câu hỏi</Label>
                <Input id="questions" type="number" value={questions} onChange={(e) => setQuestions(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="difficulty">Độ khó</Label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as ExamDifficulty)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dễ">Dễ</SelectItem>
                    <SelectItem value="Trung bình">Trung bình</SelectItem>
                    <SelectItem value="Khó">Khó</SelectItem>
                    <SelectItem value="Rất khó">Rất khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="grade">Lớp</Label>
                <Select value={grade !== '' ? String(grade) : ''} onValueChange={(value) => setGrade(value === '' ? '' : parseInt(value, 10))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map(g => (
                      <SelectItem key={g} value={String(g)}>Lớp {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div>
                  <Label htmlFor="htmlContent">Nội dung Đề thi HTML (*)</Label>
                  <Textarea id="htmlContent" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} required className="h-96 font-mono mt-1" />
                </div>
                <div>
                  <Label htmlFor="solutionHtml">Gợi ý lời giải HTML (Tùy chọn)</Label>
                  <Textarea id="solutionHtml" value={solutionHtml} onChange={(e) => setSolutionHtml(e.target.value)} className="h-96 font-mono mt-1" />
                </div>
            </div>

            <div className="flex justify-end gap-2">
              {editingExam && (
                <Button type="button" onClick={resetForm} variant="outline">Hủy Chỉnh Sửa</Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Đang xử lý...' : (editingExam ? 'Cập Nhật Đề Thi' : 'Tạo Mới')}
              </Button>
            </div>
          </form>
        </section>

        <section>
          <header className="mb-6">
             <h2 className="text-3xl font-bold tracking-tight text-foreground">Danh Sách Đề Thi</h2>
          </header>
          {isFetching ? (
            <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
          ) : apiError ? (
            <div className="bg-destructive/10 border border-destructive/50 p-4 rounded-lg text-center">
              <XCircle className="mx-auto h-8 w-8 text-destructive" />
              <h4 className="font-bold mt-2">Lỗi Tải Dữ Liệu</h4>
              <p className="text-sm text-destructive/80 mt-1">{apiError}</p>
            </div>
           ) : (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {exams.length > 0 ? exams.map(exam => {
                  const cachedContent = fullContentCache[exam._id];
                  return (
                    <AccordionItem key={exam._id} value={exam._id} className="bg-card border rounded-lg" onClick={() => handleToggleDetails(exam._id)}>
                      <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50 rounded-t-lg data-[state=open]:rounded-b-none">
                        <div className="flex flex-col md:flex-row items-start md:items-center flex-1 text-left">
                          {/* BỎ KHỐI HIỂN THỊ THUMBNAIL */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-lg">{exam.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                {exam.subject} ({exam.year}) - {exam.province || 'Không rõ'}
                                {exam.type && ` - ${exam.type}`}
                                {exam.grade && ` - Lớp ${exam.grade}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Ngày tạo: {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pl-4">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditClick(exam); }}>
                            <Pencil className="h-4 w-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(exam); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 border-t">
                        {loadingContentId === exam._id ? (
                          <div className="w-full h-96 flex items-center justify-center bg-muted rounded-md">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : cachedContent ? (
                            <div>
                                <h4 className="font-semibold mb-2 text-muted-foreground">Xem trước nội dung đề thi:</h4>
                                <iframe 
                                    srcDoc={cachedContent.htmlContent || ""} 
                                    title={`Preview of ${exam.title}`}
                                    className="w-full h-[70vh] rounded-md bg-white border mb-4"
                                    sandbox="allow-scripts"
                                />
                                {cachedContent.solutionHtml && (
                                    <>
                                        <h4 className="font-semibold mb-2 text-muted-foreground">Xem trước lời giải:</h4>
                                        <iframe 
                                            srcDoc={cachedContent.solutionHtml} 
                                            title={`Solution Preview for ${exam.title}`}
                                            className="w-full h-[70vh] rounded-md bg-white border"
                                            sandbox="allow-scripts"
                                        />
                                    </>
                                )}
                            </div>
                        ) : (
                            <p style={{padding:'1rem'}}>Nhấn vào để tải nội dung xem trước.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )
                }) : <p className="text-center text-muted-foreground py-8">Chưa có đề thi nào.</p>}
            </Accordion>
           )}
        </section>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-card border rounded-lg p-6 shadow-lg w-full max-w-sm m-4">
              <h3 className="text-lg font-semibold text-foreground">Xác nhận xóa</h3>
              <p className="my-2 text-sm text-muted-foreground">Bạn có chắc muốn xóa vĩnh viễn đề thi này không?</p>
              <p className="my-4 font-semibold text-primary">"{deleteConfirm.title}"</p>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Hủy</Button>
                <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Đang xóa...' : 'Xóa Vĩnh Viễn'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default AdminUploadExam;