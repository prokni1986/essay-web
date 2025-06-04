// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Đường dẫn tới AuthContext

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Bạn có thể hiển thị một spinner hoặc một trang loading ở đây
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="text-xl">Đang tải trạng thái xác thực...</div>
        </div>
    );
  }

  if (!isAuthenticated) {
    // Lưu lại trang người dùng muốn truy cập để redirect về sau khi đăng nhập
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // Nếu đã xác thực, render component con
};

export default ProtectedRoute;