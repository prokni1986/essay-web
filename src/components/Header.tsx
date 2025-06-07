// file: components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import axiosInstance from '../lib/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";

// Giả sử bạn đang dùng shadcn/ui, import các component cho dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut, LayoutDashboard, FileUp, Settings } from 'lucide-react'; // Dùng icon từ lucide-react

interface Category {
  _id: string;
  name: string;
}

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Logic cho dropdown categories (giữ nguyên)
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const categoriesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isAuthenticated, user, logout, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();

  // Xác định quyền admin
  const isAdmin = isAuthenticated && user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get<Category[]>('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoriesMouseEnter = () => {
    if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
    setIsCategoriesDropdownOpen(true);
  };

  const handleCategoriesMouseLeave = () => {
    categoriesTimeoutRef.current = setTimeout(() => setIsCategoriesDropdownOpen(false), 200);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const handleLogout = () => {
    logout();
    if (isMobileMenuOpen) toggleMobileMenu();
    navigate('/');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative text-light/80 hover:text-highlight transition-colors duration-200 py-2 text-base font-medium",
      "after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-highlight after:scale-x-0 after:origin-left after:transition-transform after:duration-300",
      isActive ? "text-highlight font-semibold" : "after:hover:scale-x-100"
    );

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "block py-3 px-4 text-lg text-light/90 hover:bg-dark rounded-md transition-colors duration-200",
      isActive ? "bg-dark text-highlight font-semibold" : ""
    );
  
  // === CẢI TIẾN LỚN: Phần xác thực người dùng trên Desktop ===
  const AuthSectionDesktop = () => {
    if (authIsLoading) return <div className="text-sm text-light/70 animate-pulse">Đang tải...</div>;
  
    if (isAuthenticated && user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 hover:bg-dark/80">
              <UserIcon className="h-5 w-5 text-highlight" />
              <span className="text-light/90 font-semibold">{user.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-dark text-light border-muted/30">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-muted/30" />
            <DropdownMenuItem onSelect={() => navigate('/my-account')} className="cursor-pointer focus:bg-secondary">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Gói đăng ký</span>
            </DropdownMenuItem>
            
            {isAdmin && (
              <>
                <DropdownMenuSeparator className="bg-muted/30" />
                <DropdownMenuLabel>Quản trị viên</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => navigate('/admin-dashboard')} className="cursor-pointer focus:bg-secondary">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={() => navigate('/admin-exam-upload')} className="cursor-pointer focus:bg-secondary">
                  <FileUp className="mr-2 h-4 w-4" />
                  <span>Upload Đề Thi</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={() => navigate('/admin-user-subscriptions')} className="cursor-pointer focus:bg-secondary">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Quản lý Users</span>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator className="bg-muted/30"/>
            <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer focus:bg-red-500/80 focus:text-light">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  
    return (
      <div className="flex items-center space-x-3">
        <Button onClick={() => navigate('/login')} variant="outline" size="sm" className="border-light/70 text-light/80 hover:border-highlight hover:text-highlight transition-colors">
          Đăng nhập
        </Button>
        <Button onClick={() => navigate('/register')} variant="default" size="sm" className="bg-highlight text-dark hover:bg-opacity-80 transition-colors">
          Đăng ký
        </Button>
      </div>
    );
  };
  
  // === SỬA LỖI: Hoàn thiện logic cho AuthSectionMobile ===
  const AuthSectionMobile = () => {
    if (authIsLoading) {
      return <div className="px-4 py-2 text-light/70 text-center animate-pulse">Đang tải...</div>;
    }
  
    if (isAuthenticated && user) {
      return (
        <>
          <NavLink
            to="/my-account"
            className={mobileNavLinkClasses}
            onClick={toggleMobileMenu}
          >
            Tài khoản: {user.username}
          </NavLink>
          {/* Thêm các link admin cho mobile nếu là admin */}
          {isAdmin && (
            <div className="pl-4 border-l-2 border-secondary my-2">
                 <p className="text-xs text-muted uppercase font-semibold mt-2 mb-1 px-4">Admin</p>
                 <NavLink to="/admin-dashboard" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Dashboard</NavLink>
                 <NavLink to="/admin-exam-upload" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Upload Đề Thi</NavLink>
                 <NavLink to="/admin-user-subscriptions" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Quản lý Users</NavLink>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left block py-3 px-4 text-lg text-highlight hover:bg-dark rounded-md transition-colors duration-200"
          >
            Đăng xuất
          </button>
        </>
      );
    }

    return (
       <>
          <NavLink to="/login" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Đăng nhập</NavLink>
          <NavLink to="/register" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Đăng ký</NavLink>
        </>
    );
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out",
        scrolled || isMobileMenuOpen ? "bg-dark/95 backdrop-blur-sm shadow-lg py-3" : "bg-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-3xl font-heading font-bold">
            Thi Điểm Cao<span className="text-highlight">.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7">
            <NavLink to="/" className={navLinkClasses}>Trang Chủ</NavLink>
            <NavLink to="/alltopic" className={navLinkClasses}>Ngữ Văn</NavLink>
            <NavLink to="/gigs" className={navLinkClasses}>Tiếng Anh</NavLink>
            
            {/* THÊM MỚI: Tab Đề Thi */}
            <NavLink to="/exams" className={navLinkClasses}>Đề Thi</NavLink>

            <div className="relative" onMouseEnter={handleCategoriesMouseEnter} onMouseLeave={handleCategoriesMouseLeave}>
              <NavLink to="/essays" className={navLinkClasses}>Bài Văn Mẫu</NavLink>
              {isCategoriesDropdownOpen && categories.length > 0 && (
                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-dark shadow-xl rounded-lg p-2 animate-fadeInUpMenu">
                  <ul className="space-y-1">
                    {categories.map(category => (
                      <li key={category._id}>
                        <Link to={`/category/${category._id}`} className="block whitespace-nowrap px-4 py-2 text-sm text-light/80 hover:bg-secondary hover:text-highlight rounded-md transition-colors" onClick={() => setIsCategoriesDropdownOpen(false)}>
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="border-l border-light/20 pl-7 ml-0">
                <AuthSectionDesktop />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
             <button
              onClick={toggleMobileMenu}
              className="text-light p-2 rounded-md hover:bg-dark focus:outline-none focus:ring-2 focus:ring-inset focus:ring-highlight"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-dark/95 backdrop-blur-md pt-4 pb-6 px-6 absolute top-full left-0 w-full animate-slideDown">
            <nav className="flex flex-col space-y-1">
              <NavLink to="/" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Trang Chủ</NavLink>
              <NavLink to="/alltopic" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Ngữ Văn</NavLink>
              <NavLink to="/gigs" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Tiếng Anh</NavLink>
              <NavLink to="/exams" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Đề Thi</NavLink>
              <NavLink to="/essays" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Bài Văn Mẫu</NavLink>
              
              {categories.length > 0 && (
                <div className="pl-4 border-l-2 border-secondary my-2">
                  <p className="text-xs text-muted uppercase font-semibold mt-2 mb-1 px-4">Chuyên mục bài mẫu:</p>
                  {categories.map(category => (
                     <Link
                      key={`mobile-${category._id}`}
                      to={`/category/${category._id}`}
                      className="block py-2 px-4 text-sm text-light/80 hover:bg-secondary hover:text-highlight rounded-md transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
              <NavLink to="/about" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Liên Hệ</NavLink>

              <div className="mt-4 pt-4 border-t border-light/20">
                <AuthSectionMobile />
              </div>
            </nav>
          </div>
        )}
      </header>
      {/* CSS Animations (giữ nguyên) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUpMenu {
          from { opacity: 0; transform: translateY(10px) translateX(-50%); }
          to { opacity: 1; transform: translateY(0) translateX(-50%); }
        }
        .animate-fadeInUpMenu { animation: fadeInUpMenu 0.2s ease-out forwards; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
      `}} />
    </>
  );
};

export default Header;
