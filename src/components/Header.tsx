// file: components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import axiosInstance from '../lib/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../components/theme-provider'; // <-- [THÊM MỚI] Import useTheme

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// <-- [THÊM MỚI] Import icons cho nút chuyển theme
import { User as UserIcon, LogOut, LayoutDashboard, FileUp, Settings, Moon, Sun } from 'lucide-react';

interface Category { _id: string; name: string; }

// --- [THÊM MỚI] Component riêng cho nút chuyển đổi theme ---
function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="focus-visible:ring-0 focus-visible:ring-offset-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card text-card-foreground border-border">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Sáng
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Tối
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          Hệ thống
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
// --- Kết thúc component ModeToggle ---


const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const categoriesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, user, logout, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = isAuthenticated && user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get<Category[]>('/api/categories');
        setCategories(response.data);
      } catch (error) { console.error("Failed to fetch categories:", error); }
    };
    fetchCategories();
    return () => window.removeEventListener('scroll', handleScroll);
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
      "relative text-foreground/80 hover:text-primary transition-colors duration-200 py-2 text-base font-medium",
      "after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300",
      isActive ? "text-primary font-semibold" : "after:hover:scale-x-100"
    );

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "block py-3 px-4 text-lg text-foreground/90 hover:bg-secondary rounded-md transition-colors duration-200",
      isActive ? "bg-secondary text-primary font-semibold" : ""
    );

  // AuthSectionDesktop và AuthSectionMobile giữ nguyên, không cần thay đổi.
  const AuthSectionDesktop = () => {
    if (authIsLoading) return <div className="text-sm text-muted-foreground animate-pulse">Đang tải...</div>;
  
    if (isAuthenticated && user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 hover:bg-accent">
              <UserIcon className="h-5 w-5 text-primary" />
              <span className="text-foreground/90 font-semibold">{user.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card text-card-foreground border-border">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onSelect={() => navigate('/my-account')} className="cursor-pointer focus:bg-accent">
              <UserIcon className="mr-2 h-4 w-4" /> <span>Gói đăng ký</span>
            </DropdownMenuItem>
            
            {isAdmin && (
              <>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuLabel>Quản trị viên</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => navigate('/admin-dashboard')} className="cursor-pointer focus:bg-accent"><LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/admin-exam-upload')} className="cursor-pointer focus:bg-accent"><FileUp className="mr-2 h-4 w-4" /><span>Upload Đề Thi</span></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/admin-user-subscriptions')} className="cursor-pointer focus:bg-accent"><Settings className="mr-2 h-4 w-4" /><span>Quản lý Users</span></DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator className="bg-border"/>
            <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground">
              <LogOut className="mr-2 h-4 w-4" /> <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  
    return (
      <div className="flex items-center space-x-3">
        <Button onClick={() => navigate('/login')} variant="outline" size="sm">Đăng nhập</Button>
        <Button onClick={() => navigate('/register')} variant="default" size="sm">Đăng ký</Button>
      </div>
    );
  };
  
  const AuthSectionMobile = () => {
    if (authIsLoading) return <div className="px-4 py-2 text-muted-foreground text-center animate-pulse">Đang tải...</div>;
    if (isAuthenticated && user) {
      return (
        <>
          <NavLink to="/my-account" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Tài khoản: {user.username}</NavLink>
          {isAdmin && (
            <div className="pl-4 border-l-2 border-border my-2">
                 <p className="text-xs text-muted-foreground uppercase font-semibold mt-2 mb-1 px-4">Admin</p>
                 <NavLink to="/admin-dashboard" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Dashboard</NavLink>
                 <NavLink to="/admin-exam-upload" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Upload Đề Thi</NavLink>
                 <NavLink to="/admin-user-subscriptions" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Quản lý Users</NavLink>
            </div>
          )}
          <button onClick={handleLogout} className="w-full text-left block py-3 px-4 text-lg text-destructive hover:bg-destructive/10 rounded-md">
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
        scrolled || isMobileMenuOpen ? "bg-background/80 backdrop-blur-sm shadow-lg border-b border-border py-3" : "bg-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-3xl font-heading font-bold text-foreground">
            Thi Điểm Cao<span className="text-primary">.</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-7">
            <NavLink to="/" className={navLinkClasses}>Trang Chủ</NavLink>
            <NavLink to="/mon-ngu-van" className={navLinkClasses}>Ngữ Văn</NavLink>
            <NavLink to="/tieng-anh" className={navLinkClasses}>Tiếng Anh</NavLink>
            <NavLink to="/de-thi" className={navLinkClasses}>Đề Thi</NavLink>
            <NavLink to="/tin-tuc" className={navLinkClasses}>Tin Tức</NavLink>
            <div className="relative" onMouseEnter={handleCategoriesMouseEnter} onMouseLeave={handleCategoriesMouseLeave}>
              <NavLink to="/bai-van-mau" className={navLinkClasses}>Bài Văn Mẫu</NavLink>
              {isCategoriesDropdownOpen && categories.length > 0 && (
                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-card shadow-xl rounded-lg p-2 border animate-fadeInUpMenu">
                  <ul className="space-y-1">
                    {categories.map(category => (
                      <li key={category._id}>
                        <Link to={`/category/${category._id}`} className="block whitespace-nowrap px-4 py-2 text-sm text-card-foreground/80 hover:bg-accent hover:text-primary rounded-md" onClick={() => setIsCategoriesDropdownOpen(false)}>
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* -- [CHỈNH SỬA] Thêm nút toggle và Auth section vào một nhóm -- */}
            <div className="flex items-center space-x-2 border-l border-border/70 pl-7 ml-0">
                <ModeToggle />
                <AuthSectionDesktop />
            </div>
          </nav>

          {/* -- [CHỈNH SỬA] Thêm nút toggle vào chế độ mobile -- */}
          <div className="flex items-center space-x-2 md:hidden">
             <ModeToggle />
             <button onClick={toggleMobileMenu} className="text-foreground p-2 rounded-md hover:bg-accent" aria-label="Toggle menu">
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          // Phần mobile menu dropdown giữ nguyên, không cần thay đổi.
          <div className="md:hidden bg-background/95 backdrop-blur-md pt-4 pb-6 px-6 absolute top-full left-0 w-full border-b border-border animate-slideDown">
            <nav className="flex flex-col space-y-1">
              <NavLink to="/" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Trang Chủ</NavLink>
              <NavLink to="/alltopic" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Ngữ Văn</NavLink>
              <NavLink to="/gigs" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Tiếng Anh</NavLink>
              <NavLink to="/exams" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Đề Thi</NavLink>
              <NavLink to="/bai-van-mau" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Bài Văn Mẫu</NavLink>
              
              {categories.length > 0 && (
                <div className="pl-4 border-l-2 border-border my-2">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mt-2 mb-1 px-4">Chuyên mục:</p>
                  {categories.map(category => (
                     <Link key={`mobile-${category._id}`} to={`/category/${category._id}`} className="block py-2 px-4 text-sm text-foreground/80 hover:bg-accent hover:text-primary rounded-md" onClick={toggleMobileMenu}>
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
              <NavLink to="/about" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Liên Hệ</NavLink>

              <div className="mt-4 pt-4 border-t border-border/50">
                <AuthSectionMobile />
              </div>
            </nav>
          </div>
        )}
      </header>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUpMenu { from { opacity: 0; transform: translateY(10px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } }
        .animate-fadeInUpMenu { animation: fadeInUpMenu 0.2s ease-out forwards; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
      `}} />
    </>
  );
};

export default Header;