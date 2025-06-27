// src/pages/AdminQuizPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils';
import { Navigate } from 'react-router-dom';
import AdminQuizDashboard from '@/components/quiz/AdminQuizDashboard';

const AdminQuizPage: React.FC = () => {
  const { user, userRole, isAuthenticated, isLoading } = useAuth();
  // Di chuyển useState và useCallback lên đầu component
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [pageErrorMessage, setPageErrorMessage] = useState<string | null>(null);

  // Hiển thị thông báo và tự động ẩn
  const showPageMessage = useCallback((msg: string, isError: boolean = false) => {
    if (isError) {
      setPageErrorMessage(msg);
      setPageMessage(null);
    } else {
      setPageMessage(msg);
      setPageErrorMessage(null);
    }
    setTimeout(() => {
      setPageMessage(null);
      setPageErrorMessage(null);
    }, 5000); // Ẩn sau 5 giây
  }, []); // [] đảm bảo hàm này chỉ được tạo một lần

  console.log('AdminQuizPage: isAuthenticated =', isAuthenticated, 'userRole =', userRole, 'user =', user); // <-- Dòng debug

  if (isLoading) {
    return (
      <div className={cn("container mx-auto p-4 bg-slate-50 text-slate-800 min-h-screen flex justify-center items-center")}>
        <div>
          <div className={cn("w-12 h-12 rounded-full animate-spin border-4 border-solid border-indigo-500 border-t-transparent")}></div>
          <p className={cn("mt-4 text-xl")}>Đang tải trang quản trị...</p>
        </div>
      </div>
    );
  }

  // Redirect nếu không phải admin hoặc chưa đăng nhập
  if (!isAuthenticated || userRole !== 'admin') {
    console.log('AdminQuizPage: Redirecting due to insufficient permissions.'); // <-- Dòng debug
    // Có thể navigate('/403-forbidden') nếu bạn có trang lỗi riêng
    return <Navigate to="/" replace />; // Chuyển hướng về trang chủ
  }

  return (
    <div className={cn("container mx-auto p-4 sm:p-6 bg-slate-50 text-slate-800 min-h-screen font-sans")}>
      <h1 className={cn("text-3xl font-bold mb-8 text-center text-slate-800")}>Quản lý Đề Thi Trắc Nghiệm</h1>

      {pageMessage && <div className={cn("mb-4 p-3 rounded-lg bg-green-100 text-green-800 border border-green-300 text-center")}>{pageMessage}</div>}
      {pageErrorMessage && <div className={cn("mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-300 text-center")}>{pageErrorMessage}</div>}

      {/* Render AdminQuizDashboard component */}
      {/* Nó sẽ chứa tất cả logic và UI cho việc quản lý đề thi trắc nghiệm */}
      <AdminQuizDashboard />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
      `}} />
    </div>
  );
};

export default AdminQuizPage;