// src/components/Layout.tsx (Đã sửa)

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { ThemeProvider } from './theme-provider';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className={`min-h-screen flex flex-col bg-background ${className || ''}`}>
        <Header />
        
        {/* Đã xóa pt-24. Thêm class container ở đây nếu bạn muốn TẤT CẢ các trang đều có nội dung co vào giữa */}
        {/* Tuy nhiên, để linh hoạt, tốt hơn là đặt container trong từng trang riêng lẻ */}
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Layout;