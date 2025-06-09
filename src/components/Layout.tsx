import React from 'react';
import Header from './Header';
import Footer from './Footer';
// MỚI: Import ThemeProvider từ file bạn đã tạo
import { ThemeProvider } from './theme-provider'; // <-- Sửa đường dẫn nếu cần

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className }: LayoutProps) => {
  return (
    // MỚI: Bao bọc toàn bộ nội dung của Layout bằng ThemeProvider
    // Điều này cung cấp "context" về theme cho Header, Footer, và children
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className={`min-h-screen flex flex-col ${className || ''}`}>
        <Header />
        <main className="flex-grow pt-24">
          {children}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Layout;