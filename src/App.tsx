// file: App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminUserSubscriptionsPage from './pages/AdminUserSubscriptionsPage'; // THÊM MỚI

// Import các Pages và Components hiện có
import Index from "./pages/Index";
import Gigs from "./pages/Gigs";
import NotFound from "./pages/NotFound";
import SampleEssay from "./pages/Sampleessay"; // Trang chi tiết bài luận
import AdminUpload from './components/AdminUpload';
import AdminDashboard from './components/AdminDashboard';
import AdminTopics from './components/AdminTopics';
import AdminCategories from './components/AdminCategories';
import EssaysByTopic from './pages/EssaysByTopic';
import AllTopics from './pages/alltopic';
import AllEssaysPage from './pages/AllEssaysPage'; // Trang danh sách tất cả bài luận
import EssaysByCategoryPage from './pages/EssaysByCategoryPage';
import MyAccountPage from './pages/MyAccountPage'; // <<<< THÊM IMPORT
// THÊM MỚI: Import cho Authentication
import { AuthProvider } from './contexts/AuthContext'; // Đường dẫn tới AuthContext của bạn
import LoginPage from './pages/LoginPage'; // Trang Đăng nhập
import RegisterPage from './pages/RegisterPage'; // Trang Đăng ký
import ProtectedRoute from './components/auth/ProtectedRoute'; // Component bảo vệ Route
import AdminExamUpload from './components/AdminExamUpload'; // << Dòng mới
import AllExamsPage from './pages/AllExamsPage'; // <<<< ADD THIS LINE
import ExamPage from './pages/ExamPage'; 
// (Tùy chọn) Import các trang cần bảo vệ khác nếu có
// import UserProfilePage from './pages/UserProfilePage';
// import MySubscriptionsPage from './pages/MySubscriptionsPage';

const queryClient = new QueryClient();

const App = () => (
  // Bọc toàn bộ ứng dụng bằng QueryClientProvider trước tiên
  <QueryClientProvider client={queryClient}>
    {/* Sau đó bọc bằng AuthProvider để context có thể được sử dụng bởi tất cả các route */}
    <AuthProvider>
      <TooltipProvider>
        <Toaster /> {/* Cho Shadcn Toaster (nếu dùng) */}
        <Sonner /> {/* Cho Sonner Toaster (nếu dùng) */}
        <BrowserRouter>
          <Routes>
            {/* Public Routes - Các route ai cũng có thể truy cập */}
            <Route path="/" element={<Index />} />
            <Route path="/gigs" element={<Gigs />} />
            <Route path="/sampleessay" element={<AllEssaysPage />} /> {/* Đổi SampleEssay thành AllEssaysPage cho đường dẫn này nếu nó là trang danh sách */}
            <Route path="/sampleessay/:id" element={<SampleEssay />} /> {/* Giữ nguyên cho trang chi tiết bài luận */}
            <Route path="/topic/:topicId" element={<EssaysByTopic />} />
            <Route path="/alltopic" element={<AllTopics />} />
            <Route path="/essays" element={<AllEssaysPage />} />
            <Route path="/category/:categoryId" element={<EssaysByCategoryPage />} />

            <Route path="/exams" element={<AllExamsPage />} /> {/* <<<< THÊM MỚI */}
            <Route path="/exam/:id" element={<ExamPage />} /> {/* <<<< THÊM MỚI */}
            {/* Authentication Routes - Các route cho đăng nhập và đăng ký */}
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes - Các route yêu cầu người dùng phải đăng nhập */}
            {/* Sử dụng <ProtectedRoute /> để bọc các Route con cần bảo vệ */}
            <Route element={<ProtectedRoute />}>
              {/* Admin Routes */}
              <Route path="/admin-upload" element={<AdminUpload />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-topics" element={<AdminTopics />} />
              <Route path="/admin-categories" element={<AdminCategories />} />
              <Route path="/admin-user-subscriptions" element={<AdminUserSubscriptionsPage />} /> {/* THÊM MỚI: Trang quản lý subscriptions của người dùng */}
              {/* (Tùy chọn) Các route khác cần đăng nhập cho người dùng thường */}
              {/* <Route path="/profile" element={<UserProfilePage />} /> */}
              {/* <Route path="/my-subscriptions" element={<MySubscriptionsPage />} /> */}
              <Route path="/my-account" element={<MyAccountPage />} />
              <Route path="/admin-exam-upload" element={<AdminExamUpload />} /> {/* << Route mới (bạn có thể đổi path cho rõ ràng hơn) */}
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