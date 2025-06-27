// file: App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminUserSubscriptionsPage from './pages/AdminUserSubscriptionsPage';
import 'katex/dist/katex.min.css';
// Import các Pages và Components hiện có
import Index from "./pages/Index";
import Gigs from "./pages/Gigs";
import NotFound from "./pages/NotFound";
import SampleEssay from "./pages/Sampleessay";
import AdminUpload from './components/AdminUpload';
import AdminDashboard from './components/AdminDashboard';
import AdminTopics from './components/AdminTopics';
import AdminCategories from './components/AdminCategories';
import EssaysByTopic from './pages/EssaysByTopic';
import AllTopics from "./pages/alltopic";
import AllEssaysPage from './pages/AllEssaysPage';
import EssaysByCategoryPage from './pages/EssaysByCategoryPage';
import MyAccountPage from './pages/MyAccountPage';
import ExamContentPage from './pages/ExamContentPage';
// Import cho Authentication
import { AuthProvider } from './contexts/AuthProvider';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminExamUpload from './components/AdminExamUpload';
import AllExamsPage from './pages/AllExamsPage';
import ExamPage from './pages/ExamPage';
import AdminUploadExam from './components/AdminUploadExam';
import LecturesPage from './pages/LecturesPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import NewsManagement from './pages/NewsManagement';
import LichThiPage from './pages/LichThiPage';
import AdminPage from './pages/AdminPage';
import ExamSolutionPage from './pages/ExamSolutionPage';
// THÊM MỚI: Import các trang Quiz
import QuizPage from './pages/QuizPage'; // Trang chính cho học sinh làm trắc nghiệm
import AdminQuizPage from './pages/AdminQuizPage'; // Trang quản trị đề trắc nghiệm
import AdminLecturePage from './pages/AdminLecturePage';
import LectureDetailPage from './pages/LectureDetailPage'; // <<<< Import LectureDetailPage

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes - Các route ai cũng có thể truy cập */}
            <Route path="/" element={<Index />} />
            <Route path="/tieng-anh" element={<Gigs />} />
            <Route path="/bai-van-mau" element={<AllEssaysPage />} />
            <Route path="/sampleessay/:id" element={<SampleEssay />} />
            <Route path="/topic/:topicId" element={<EssaysByTopic />} />
            <Route path="/alltopic" element={<AllTopics />} />
            <Route path="/bai-luan" element={<AllEssaysPage />} />
            <Route path="/category/:categoryId" element={<EssaysByCategoryPage />} />
            <Route path="/mon-ngu-van" element={<LecturesPage />} />
            <Route path="/de-thi" element={<AllExamsPage />} />
            <Route path="/exam/:id" element={<ExamPage />} />
            <Route path="/tin-tuc" element={<NewsPage />} />
            <Route path="/tin-tuc/:slug" element={<NewsDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/tra-cuu/lich-thi" element={<LichThiPage />} />
            <Route path="/lectures" element={<LecturesPage />} />
            <Route path="/lectures/:id" element={<LectureDetailPage />} />
            {/* THÊM MỚI: Public Route cho Đề thi Trắc nghiệm (Học sinh) */}
            <Route path="/interactive-exams" element={<QuizPage />} />
            <Route path="/exams/:id/content" element={<ExamContentPage />} />
            <Route path="/exams/:id/solution" element={<ExamSolutionPage />} />
            {/* Protected Routes - Các route yêu cầu người dùng phải đăng nhập */}
            <Route element={<ProtectedRoute />}>
              {/* Admin Routes */}
              <Route path="/admin-upload" element={<AdminUpload />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-topics" element={<AdminTopics />} />
              <Route path="/admin-categories" element={<AdminCategories />} />
              <Route path="/admin-user-subscriptions" element={<AdminUserSubscriptionsPage />} />
              <Route path="/my-account" element={<MyAccountPage />} />
              <Route path="/admin-exam-upload" element={<AdminExamUpload />} />
              <Route path="/admin-upload-exam" element={<AdminUploadExam />} />
              <Route path="/admin-news-management" element={<NewsManagement />} />
              <Route path="/admin-page" element={<AdminPage />} />
              <Route path="/admin-interactive-exams" element={<AdminQuizPage />} />
              <Route path="/admin/lectures" element={<AdminLecturePage />} />
            </Route>

            {/* Not Found Route - Route cho các đường dẫn không khớp */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;