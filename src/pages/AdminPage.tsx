// src/pages/AdminPage.tsx

import React, { useState } from 'react';
import AdminDashboard from '@/components/AdminDashboard'; // Giả sử bạn di chuyển file vào đây
import AdminCategories from '@/components/AdminCategories'; // Giả sử bạn di chuyển file vào đây
import AdminTopics from '@/components/AdminTopics';       // Giả sử bạn di chuyển file vào đây
import { LayoutDashboard, ListCollapse, Shapes } from 'lucide-react'; // Dùng icon cho đẹp

// Định nghĩa các tab có thể có
type AdminTab = 'essays' | 'categories' | 'topics';

const AdminPage: React.FC = () => {
  // State để theo dõi tab nào đang được chọn, mặc định là 'essays'
  const [activeTab, setActiveTab] = useState<AdminTab>('essays');

  const renderContent = () => {
    switch (activeTab) {
      case 'essays':
        return <AdminDashboard />;
      case 'categories':
        return <AdminCategories />;
      case 'topics':
        return <AdminTopics />;
      default:
        return <AdminDashboard />;
    }
  };

  // Helper để tạo class cho tab, giúp làm nổi bật tab đang được chọn
  const getTabClassName = (tabName: AdminTab): string => {
    const baseClasses = "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 text-sm sm:text-base font-medium transition-all duration-200 ease-in-out rounded-t-lg border-b-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100";
    if (activeTab === tabName) {
      return `${baseClasses} text-blue-600 bg-white border-blue-600 shadow-sm`;
    }
    return `${baseClasses} text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-transparent`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <header className="mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Trang Quản Trị</h1>
          <p className="text-base text-gray-600 mt-1">
            Quản lý tập trung bài luận, chuyên mục và chủ đề.
          </p>
        </header>

        {/* Khu vực các nút chọn Tab */}
        <div className="border-b border-gray-300">
          <nav className="-mb-px flex flex-wrap space-x-1 sm:space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('essays')}
              className={getTabClassName('essays')}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Quản lý Bài luận</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={getTabClassName('categories')}
            >
              <ListCollapse className="h-5 w-5" />
              <span>Quản lý Chuyên mục</span>
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={getTabClassName('topics')}
            >
              <Shapes className="h-5 w-5" />
              <span>Quản lý Chủ đề</span>
            </button>
          </nav>
        </div>

        {/* Nội dung của Tab được chọn sẽ hiển thị ở đây */}
        <main className="mt-5">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;