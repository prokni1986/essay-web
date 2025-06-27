// src/components/lecture/AdminLectureDashboard.tsx
import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusCircle, Edit, Trash2, BookText, Folder } from 'lucide-react';
import { cn } from '@/utils';

// --- Interfaces ---
interface LectureCategory {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Lecture {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string; // Thêm publicId
  videoUrl?: string;
  content?: string;
  lectureCategory: string | LectureCategory;
  grade: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminLectureDashboardProps {
  showPageMessage: (msg: string, isError?: boolean) => void;
}

const AdminLectureDashboard: React.FC<AdminLectureDashboardProps> = ({ showPageMessage }) => {
  const [lectureCategories, setLectureCategories] = useState<LectureCategory[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'lectureCategories' | 'lectures'>('lectureCategories');

  // State cho LectureCategory Form
  const [currentLectureCategory, setCurrentLectureCategory] = useState<LectureCategory | null>(null);
  const [lectureCategoryName, setLectureCategoryName] = useState('');
  const [lectureCategoryDescription, setLectureCategoryDescription] = useState('');
  const [isLectureCategoryDialogOpen, setIsLectureCategoryDialogOpen] = useState(false);

  // State cho Lecture Form
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [lectureName, setLectureName] = useState('');
  const [lectureDescription, setLectureDescription] = useState('');
  const [lectureImageFile, setLectureImageFile] = useState<File | null>(null); // State cho File
  const [lectureImagePreview, setLectureImagePreview] = useState<string | null>(null); // State cho Preview
  const [currentLectureImageUrl, setCurrentLectureImageUrl] = useState<string | null>(null); // State cho URL ảnh cũ khi sửa
  const [topicVideoUrl, setTopicVideoUrl] = useState('');
  const [lectureContent, setLectureContent] = useState('');
  const [selectedLectureCategory, setSelectedLectureCategory] = useState('');
  const [lectureGrade, setLectureGrade] = useState('');
  const [isLectureDialogOpen, setIsLectureDialogOpen] = useState(false);


  // --- Helper để xử lý file input ---
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  // --- Fetch Data ---
  const fetchLectureCategories = useCallback(async () => {
    try {
      const res = await axiosInstance.get<LectureCategory[]>('/api/lecturecategories');
      setLectureCategories(res.data);
    } catch (err) {
      toast.error('Lỗi khi tải chuyên mục.');
      console.error('Fetch categories error:', err);
    }
  }, []);

  const fetchLectures = useCallback(async () => {
    try {
      const res = await axiosInstance.get<Lecture[]>('/api/lectures');
      const lecturesWithCategoryObjects = res.data.map(lecture => ({
        ...lecture,
        lectureCategory: lectureCategories.find(cat => cat._id === lecture.lectureCategory) || lecture.lectureCategory
      }));
      setLectures(lecturesWithCategoryObjects);
    } catch (err) {
      toast.error('Lỗi khi tải bài giảng.');
      console.error('Fetch topics error:', err);
    }
  }, [lectureCategories]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchLectureCategories();
      setIsLoading(false);
    };
    loadData();
  }, [fetchLectureCategories]);

  useEffect(() => {
    if (!isLoading && lectureCategories.length > 0) {
      fetchLectures();
    }
  }, [isLoading, lectureCategories, fetchLectures]);


  // --- LectureCategory Handlers ---
  const handleAddLectureCategoryClick = () => {
    setCurrentLectureCategory(null);
    setLectureCategoryName('');
    setLectureCategoryDescription('');
    setIsLectureCategoryDialogOpen(true);
  };

  const handleEditLectureCategoryClick = (category: LectureCategory) => {
    setCurrentLectureCategory(category);
    setLectureCategoryName(category.name);
    setLectureCategoryDescription(category.description || '');
    setIsLectureCategoryDialogOpen(true);
  };

  const handleSaveLectureCategory = async () => {
    if (!lectureCategoryName) {
      toast.error('Tên chuyên mục không được để trống.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (currentLectureCategory) {
        await axiosInstance.put(`/api/lecturecategories/${currentLectureCategory._id}`, { name: lectureCategoryName, description: lectureCategoryDescription });
        toast.success('Cập nhật chuyên mục thành công.');
      } else {
        await axiosInstance.post('/api/lecturecategories', { name: lectureCategoryName, description: lectureCategoryDescription });
        toast.success('Thêm chuyên mục thành công.');
      }
      fetchLectureCategories();
      setIsLectureCategoryDialogOpen(false);
    } catch (err) {
      toast.error('Lỗi khi lưu chuyên mục.');
      console.error('Save category error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLectureCategory = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chuyên mục này? Các bài giảng thuộc chuyên mục này cũng có thể bị ảnh hưởng.')) {
      return;
    }
    try {
      await axiosInstance.delete(`/api/lecturecategories/${id}`);
      toast.success('Xóa chuyên mục thành công.');
      fetchLectureCategories();
      fetchLectures();
    } catch (err) {
      toast.error('Lỗi khi xóa chuyên mục.');
      console.error('Delete category error:', err);
    }
  };

  // --- Lecture Handlers ---
  const resetLectureForm = () => {
    setCurrentLecture(null);
    setLectureName('');
    setLectureDescription('');
    setLectureImageFile(null);
    setLectureImagePreview(null);
    setCurrentLectureImageUrl(null);
    setTopicVideoUrl('');
    setLectureContent('');
    setSelectedLectureCategory('');
    setLectureGrade('');
    const fileInput = document.getElementById('lectureImageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleAddLectureClick = () => {
    resetLectureForm();
    setIsLectureDialogOpen(true);
  };

  const handleEditLectureClick = (lecture: Lecture) => {
    setCurrentLecture(lecture);
    setLectureName(lecture.name);
    setLectureDescription(lecture.description || '');
    setLectureImageFile(null); // Reset file input
    setCurrentLectureImageUrl(lecture.imageUrl || null); // Lưu URL cũ
    setLectureImagePreview(lecture.imageUrl || null); // Hiển thị ảnh cũ trong preview
    setTopicVideoUrl(lecture.videoUrl || '');
    setLectureContent(lecture.content || '');
    setSelectedLectureCategory(typeof lecture.lectureCategory === 'object' ? lecture.lectureCategory._id : lecture.lectureCategory);
    setLectureGrade(String(lecture.grade));
    setIsLectureDialogOpen(true);
  };

  const handleSaveLecture = async (e: FormEvent) => {
    e.preventDefault();
    if (!lectureName || !selectedLectureCategory || !lectureGrade) {
      toast.error('Tên bài giảng, Chuyên mục và Lớp không được để trống.');
      return;
    }
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', lectureName);
    formData.append('description', lectureDescription);
    formData.append('videoUrl', topicVideoUrl);
    formData.append('content', lectureContent);
    formData.append('lectureCategory', selectedLectureCategory);
    formData.append('grade', lectureGrade);

    if (lectureImageFile) {
        formData.append('image', lectureImageFile);
    } else if (!lectureImagePreview && currentLectureImageUrl) {
        formData.append('removeCurrentImage', 'true');
    }

    try {
      if (currentLecture) {
        await axiosInstance.put(`/api/lectures/${currentLecture._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Cập nhật bài giảng thành công.');
      } else {
        await axiosInstance.post('/api/lectures', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Thêm bài giảng thành công.');
      }
      fetchLectures();
      setIsLectureDialogOpen(false);
      resetLectureForm();
    } catch (err) {
      toast.error('Lỗi khi lưu bài giảng.');
      console.error('Save lecture error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLecture = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài giảng này?')) {
      return;
    }
    try {
      await axiosInstance.delete(`/api/lectures/${id}`);
      toast.success('Xóa bài giảng thành công.');
      fetchLectures();
    } catch (err) {
      toast.error('Lỗi khi xóa bài giảng.');
      console.error('Delete lecture error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg text-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center mb-6">
        <Button
          onClick={() => setActiveTab('lectureCategories')}
          variant={activeTab === 'lectureCategories' ? 'default' : 'outline'}
          className="mr-2"
        >
          <Folder className="mr-2 h-4 w-4" /> Quản lý Chuyên mục Bài giảng
        </Button>
        <Button
          onClick={() => setActiveTab('lectures')}
          variant={activeTab === 'lectures' ? 'default' : 'outline'}
        >
          <BookText className="mr-2 h-4 w-4" /> Quản lý Bài giảng
        </Button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'lectureCategories' && (
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Danh sách Chuyên mục Bài giảng</h2>
            <Button onClick={handleAddLectureCategoryClick}>
              <PlusCircle className="mr-2 h-4 w-4" /> Thêm Chuyên mục
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên chuyên mục</TableHead>
                <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lectureCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                    Không có chuyên mục bài giảng nào.
                  </TableCell>
                </TableRow>
              ) : (
                lectureCategories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {category.description || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right flex justify-end space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditLectureCategoryClick(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteLectureCategory(category._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* LectureCategory Dialog */}
          <Dialog open={isLectureCategoryDialogOpen} onOpenChange={setIsLectureCategoryDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{currentLectureCategory ? 'Chỉnh sửa Chuyên mục Bài giảng' : 'Thêm Chuyên mục Bài giảng mới'}</DialogTitle>
                <DialogDescription>
                  {currentLectureCategory ? 'Thay đổi thông tin chuyên mục bài giảng.' : 'Điền thông tin để tạo chuyên mục bài giảng mới.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lectureCategoryName" className="text-right">
                    Tên
                  </Label>
                  <Input
                    id="lectureCategoryName"
                    value={lectureCategoryName}
                    onChange={(e) => setLectureCategoryName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lectureCategoryDescription" className="text-right">
                    Mô tả
                  </Label>
                  <Textarea
                    id="lectureCategoryDescription"
                    value={lectureCategoryDescription}
                    onChange={(e) => setLectureCategoryDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsLectureCategoryDialogOpen(false)} variant="outline">
                  Hủy
                </Button>
                <Button onClick={handleSaveLectureCategory} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Lưu
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Lectures Tab */}
      {activeTab === 'lectures' && (
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Danh sách Bài giảng</h2>
            <Button onClick={handleAddLectureClick}>
              <PlusCircle className="mr-2 h-4 w-4" /> Thêm Bài giảng
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tên bài giảng</TableHead>
                <TableHead>Chuyên mục</TableHead>
                <TableHead>Lớp</TableHead>
                <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lectures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                    Không có bài giảng nào.
                  </TableCell>
                </TableRow>
              ) : (
                lectures.map((lecture) => (
                  <TableRow key={lecture._id}>
                    <TableCell>
                      <img src={lecture.imageUrl || 'https://via.placeholder.com/50x50?text=No+Img'} alt="Thumbnail" className="w-12 h-12 object-cover rounded-md" />
                    </TableCell>
                    <TableCell className="font-medium">{lecture.name}</TableCell>
                    <TableCell>
                      {typeof lecture.lectureCategory === 'object' ? lecture.lectureCategory.name : 'N/A'}
                    </TableCell>
                    <TableCell>{lecture.grade}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {lecture.description ? lecture.description.substring(0, 50) + '...' : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right flex justify-end space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditLectureClick(lecture)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteLecture(lecture._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Lecture Dialog */}
          <Dialog open={isLectureDialogOpen} onOpenChange={setIsLectureDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{currentLecture ? 'Chỉnh sửa Bài giảng' : 'Thêm Bài giảng mới'}</DialogTitle>
                <DialogDescription>
                  {currentLecture ? 'Thay đổi thông tin bài giảng.' : 'Điền thông tin để tạo bài giảng mới.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveLecture} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {/* Tên bài giảng */}
                <div className="md:col-span-2">
                  <Label htmlFor="lectureName" className="block text-sm font-medium mb-1">
                    Tên bài giảng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lectureName"
                    value={lectureName}
                    onChange={(e) => setLectureName(e.target.value)}
                    required
                  />
                </div>

                {/* Chuyên mục */}
                <div>
                  <Label htmlFor="selectedLectureCategory" className="block text-sm font-medium mb-1">
                    Chuyên mục <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedLectureCategory} onValueChange={setSelectedLectureCategory} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn chuyên mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {lectureCategories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lớp */}
                <div>
                  <Label htmlFor="lectureGrade" className="block text-sm font-medium mb-1">
                    Lớp <span className="text-red-500">*</span>
                  </Label>
                  <Select value={lectureGrade} onValueChange={setLectureGrade} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn lớp" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                        <SelectItem key={grade} value={String(grade)}>
                          Lớp {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mô tả ngắn */}
                <div className="md:col-span-2">
                  <Label htmlFor="lectureDescription" className="block text-sm font-medium mb-1">
                    Mô tả ngắn
                  </Label>
                  <Textarea
                    id="lectureDescription"
                    value={lectureDescription}
                    onChange={(e) => setLectureDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                {/* Ảnh bìa */}
                <div className="md:col-span-2">
                  <Label htmlFor="lectureImageFile" className="block text-sm font-medium mb-1">
                    Ảnh bìa
                  </Label>
                  <Input
                    id="lectureImageFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setLectureImageFile, setLectureImagePreview)}
                  />
                  {lectureImagePreview && (
                    <div className="mt-2 relative inline-block">
                      <img src={lectureImagePreview} alt="Preview" className="w-32 h-auto object-cover rounded-md border" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => { setLectureImageFile(null); setLectureImagePreview(null); setCurrentLectureImageUrl(null); }}
                      >
                        X
                      </Button>
                    </div>
                  )}
                </div>

                {/* URL Video */}
                <div className="md:col-span-2">
                  <Label htmlFor="topicVideoUrl" className="block text-sm font-medium mb-1">
                    URL Video
                  </Label>
                  <Input
                    id="topicVideoUrl"
                    value={topicVideoUrl}
                    onChange={(e) => setTopicVideoUrl(e.target.value)}
                    placeholder="VD: https://www.youtube.com/watch?v=..."
                  />
                </div>

                {/* Nội dung chi tiết */}
                <div className="md:col-span-2">
                  <Label htmlFor="lectureContent" className="block text-sm font-medium mb-1">
                    Nội dung chi tiết
                  </Label>
                  <Textarea
                    id="lectureContent"
                    value={lectureContent}
                    onChange={(e) => setLectureContent(e.target.value)}
                    className="min-h-[150px]"
                    placeholder="Nội dung HTML hoặc Markdown"
                  />
                </div>
              
                <DialogFooter className="md:col-span-2 flex justify-end gap-2 mt-4">
                  <Button onClick={() => { setIsLectureDialogOpen(false); resetLectureForm(); }} variant="outline">
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Lưu
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default AdminLectureDashboard;