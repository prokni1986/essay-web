// src/pages/AdminLecturePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils';
import { Navigate } from 'react-router-dom';
import AdminLectureDashboard from '@/components/lecture/AdminLectureDashboard'; // Component chính cho Dashboard
import Layout from '@/components/Layout'; // Import Layout component

const AdminLecturePage: React.FC = () => {
  const { user, userRole, isAuthenticated, isLoading } = useAuth();
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [pageErrorMessage, setPageMessageError] = useState<string | null>(null);

  const showPageMessage = useCallback((msg: string, isError: boolean = false) => {
    if (isError) {
      setPageMessageError(msg);
      setPageMessage(null);
    } else {
      setPageMessage(msg);
      setPageMessageError(null);
    }
    setTimeout(() => {
      setPageMessage(null);
      setPageMessageError(null);
    }, 5000); // Hide after 5 seconds
  }, []);

  useEffect(() => {
    document.title = "Quản lý Bài giảng";
  }, []);

  if (isLoading) {
    return (
      <Layout> {/* Bọc trong Layout */}
        <div className={cn("container mx-auto p-4 bg-background text-foreground min-h-screen flex justify-center items-center")}>
          <div>
            <div className={cn("w-12 h-12 rounded-full animate-spin border-4 border-solid border-primary border-t-transparent")}></div>
            <p className={cn("mt-4 text-xl")}>Đang tải trang quản trị bài giảng...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || userRole !== 'admin') {
    console.warn('AdminLecturePage: Access Denied. Not authenticated or not admin.');
    return <Navigate to="/" replace />;
  }

  return (
    <Layout> {/* Bọc trong Layout */}
      <div className={cn("container mx-auto p-4 sm:p-6 bg-background text-foreground min-h-screen font-sans")}>
        <h1 className={cn("text-3xl md:text-4xl font-bold mb-8 text-center text-foreground")}>Quản lý Bài Giảng & Chuyên Mục</h1>

        {pageMessage && <div className={cn("mb-4 p-3 rounded-lg bg-green-100 text-green-800 border border-green-300 text-center")}>{pageMessage}</div>}
        {pageErrorMessage && <div className={cn("mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-300 text-center")}>{pageErrorMessage}</div>}

        <AdminLectureDashboard showPageMessage={showPageMessage} />

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
        `}} />
      </div>
    </Layout>
  );
};

export default AdminLecturePage;