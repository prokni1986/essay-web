// file: components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils"; // Chú ý: path này là "@/lib/utils"
import axiosInstance from '../lib/axiosInstance'; // Chú ý: path này là "../lib/axiosInstance"
import { useAuth } from '../hooks/useAuth'; // Chú ý: path này là "../hooks/useAuth"
import { useTheme } from '../components/theme-provider';

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// ICON
import { User as UserIcon, LogOut, LayoutDashboard, FileUp, Settings, Moon, Sun, Newspaper, ChevronDown, BookOpenCheck, GraduationCap } from 'lucide-react'; // Thêm GraduationCap icon cho Bài giảng

// --- Component riêng cho nút chuyển đổi theme ---
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
  const [isSubjectsDropdownOpen, setIsSubjectsDropdownOpen] = useState(false);
  // NEW STATE: for "Kho đề thi" dropdown
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const subjectsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // NEW STATE: to store available grades
  const [availableGrades, setAvailableGrades] = useState<number[]>([]);
  const examsTimeoutRef = useRef<NodeJS.Timeout | null>(null); // New ref for exam dropdown timeout

  const { isAuthenticated, user, logout, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = isAuthenticated && (user?.role === 'admin' || user?.email === import.meta.env.VITE_ADMIN_EMAIL);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // NEW EFFECT: Fetch available grades when component mounts
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await axiosInstance.get('/api/exams/grades');
        setAvailableGrades(response.data);
      } catch (error) {
        console.error("Error fetching available grades:", error);
      }
    };
    fetchGrades();
  }, []);

  const handleSubjectsMouseEnter = () => {
    if (subjectsTimeoutRef.current) clearTimeout(subjectsTimeoutRef.current);
    setIsSubjectsDropdownOpen(true);
  };
  const handleSubjectsMouseLeave = () => {
    subjectsTimeoutRef.current = setTimeout(() => setIsSubjectsDropdownOpen(false), 200);
  };

  // NEW HANDLERS for "Kho đề thi" dropdown
  const handleExamsMouseEnter = () => {
    if (examsTimeoutRef.current) clearTimeout(examsTimeoutRef.current);
    setIsExamDropdownOpen(true);
  };
  const handleExamsMouseLeave = () => {
    examsTimeoutRef.current = setTimeout(() => setIsExamDropdownOpen(false), 200);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close any open dropdowns when mobile menu is toggled
    setIsSubjectsDropdownOpen(false);
    setIsExamDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    if (isMobileMenuOpen) toggleMobileMenu();
    navigate('/');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "font-medium text-foreground hover:text-primary transition-colors py-2 text-base",
      isActive ? "text-primary font-semibold" : ""
    );

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "block py-3 px-4 text-lg text-foreground hover:bg-accent rounded-md transition-colors duration-200",
      isActive ? "bg-accent text-primary font-semibold" : ""
    );

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

            {/* Mục Đề thi trắc nghiệm (cho mọi user đã đăng nhập) */}
            <DropdownMenuItem onSelect={() => navigate('/interactive-exams')} className="cursor-pointer focus:bg-accent">
              <BookOpenCheck className="mr-2 h-4 w-4" /> <span>Đề Thi Trắc Nghiệm</span>
            </DropdownMenuItem>

            {isAdmin && (
              <>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuLabel>Quản trị viên</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => navigate('/admin-page')} className="cursor-pointer focus:bg-accent"><LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/admin-upload-exam')} className="cursor-pointer focus:bg-accent"><FileUp className="mr-2 h-4 w-4" /><span>Upload Đề Thi</span></DropdownMenuItem>
                {/* Liên kết đến trang Quản trị Đề Trắc Nghiệm */}
                <DropdownMenuItem onSelect={() => navigate('/admin-interactive-exams')} className="cursor-pointer focus:bg-accent">
                  <BookOpenCheck className="mr-2 h-4 w-4" /> <span>Quản lý Đề Trắc Nghiệm</span>
                </DropdownMenuItem>
                {/* THÊM LIÊN KẾT ĐẾN TRANG QUẢN LÝ BÀI GIẢNG */}
                <DropdownMenuItem onSelect={() => navigate('/admin/lectures')} className="cursor-pointer focus:bg-accent">
                  <GraduationCap className="mr-2 h-4 w-4" /> <span>Quản lý Bài Giảng</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/admin-user-subscriptions')} className="cursor-pointer focus:bg-accent"><Settings className="mr-2 h-4 w-4" /><span>Quản lý Users</span></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/admin-news-management')} className="cursor-pointer focus:bg-accent"><Newspaper className="mr-2 h-4 w-4" /><span>Quản lý Tin tức</span></DropdownMenuItem>
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
      <button
        onClick={() => navigate('/login')}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors button-rounded-full whitespace-nowrap cursor-pointer text-sm"
      >
        Đăng nhập / Đăng ký
      </button>
    );
  };

  const AuthSectionMobile = () => {
    if (authIsLoading) return <div className="px-4 py-2 text-muted-foreground text-center animate-pulse">Đang tải...</div>;
    if (isAuthenticated && user) {
      return (
        <>
          <NavLink to="/my-account" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Tài khoản: {user.username}</NavLink>
          {/* Mục Đề thi trắc nghiệm (cho mọi user đã đăng nhập) */}
          <NavLink to="/interactive-exams" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Đề Thi Trắc Nghiệm</NavLink>
          {isAdmin && (
            <div className="pl-4 border-l-2 border-border my-2">
                 <p className="text-xs text-muted-foreground uppercase font-semibold mt-2 mb-1 px-4">Admin</p>
                 <NavLink to="/admin-dashboard" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Dashboard</NavLink>
                 <NavLink to="/admin-exam-upload" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Upload Đề Thi</NavLink>
                 {/* Liên kết đến trang Quản trị Đề Trắc Nghiệm */}
                 <NavLink to="/admin/interactive-exams" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Quản lý Đề Trắc Nghiệm</NavLink>
                 {/* THÊM LIÊN KẾT ĐẾN TRANG QUẢN LÝ BÀI GIẢNG */}
                 <NavLink to="/admin/lectures" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Quản lý Bài Giảng</NavLink>
                 <NavLink to="/admin-user-subscriptions" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Quản lý Users</NavLink>
                 <NavLink to="/admin-news-management" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Quản lý Tin tức</NavLink>
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
      <header className="bg-card shadow-md z-50 relative border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              <i className="fas fa-book-open mr-2"></i>
              EduViet
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={navLinkClasses}>Trang chủ</NavLink>

            {/* Dropdown Môn học */}
            <div className="relative" onMouseEnter={handleSubjectsMouseEnter} onMouseLeave={handleSubjectsMouseLeave}>
              <button
                className={cn(
                  "flex items-center font-medium text-foreground hover:text-primary transition-colors py-2 text-base",
                  isSubjectsDropdownOpen ? "text-primary font-semibold" : ""
                )}
              >
                Môn học <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200" />
              </button>
              {isSubjectsDropdownOpen && (
                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-40 bg-card shadow-xl rounded-lg p-2 border border-border animate-fadeInUpMenu z-50">
                  <ul className="space-y-1">
                    <li>
                      <Link to="/mon-toan" className="block whitespace-nowrap px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-primary rounded-md" onClick={() => setIsSubjectsDropdownOpen(false)}>
                        Toán học
                      </Link>
                    </li>
                    <li>
                      <Link to="/mon-ngu-van" className="block whitespace-nowrap px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-primary rounded-md" onClick={() => setIsSubjectsDropdownOpen(false)}>
                        Ngữ Văn
                      </Link>
                    </li>
                    <li>
                      <Link to="/tieng-anh" className="block whitespace-nowrap px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-primary rounded-md" onClick={() => setIsSubjectsDropdownOpen(false)}>
                        Tiếng Anh
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            {/* Kết thúc Dropdown Môn học */}

            {/* NEW: Dropdown Kho đề thi */}
            <div className="relative" onMouseEnter={handleExamsMouseEnter} onMouseLeave={handleExamsMouseLeave}>
                <button
                    className={cn(
                        "flex items-center font-medium text-foreground hover:text-primary transition-colors py-2 text-base",
                        isExamDropdownOpen ? "text-primary font-semibold" : ""
                    )}
                    // Double click to go to AllExamsPage without filter
                    onDoubleClick={() => {
                        navigate('/de-thi');
                        setIsExamDropdownOpen(false);
                    }}
                >
                    Kho đề thi <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200" />
                </button>
                {isExamDropdownOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-40 bg-card shadow-xl rounded-lg p-2 border border-border animate-fadeInUpMenu z-50">
                        <ul className="space-y-1">
                            <li>
                                <Link to="/de-thi" className="block whitespace-nowrap px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-primary rounded-md" onClick={() => setIsExamDropdownOpen(false)}>
                                    Tất cả đề thi
                                </Link>
                            </li>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuLabel className="px-4 pt-2 pb-1 text-xs text-muted-foreground uppercase">Theo Lớp</DropdownMenuLabel>
                            {availableGrades.length > 0 ? (
                                availableGrades.map(grade => (
                                    <li key={`grade-${grade}`}>
                                        <Link to={`/de-thi?grade=${grade}`} className="block whitespace-nowrap px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-primary rounded-md" onClick={() => setIsExamDropdownOpen(false)}>
                                            Lớp {grade}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li>
                                    <span className="block whitespace-nowrap px-4 py-2 text-sm text-muted-foreground">Đang tải lớp...</span>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            {/* END NEW: Dropdown Kho đề thi */}

            {/* THÊM LIÊN KẾT BÀI GIẢNG */}
            <NavLink to="/lectures" className={navLinkClasses}>Bài giảng</NavLink>
            {/* KẾT THÚC THÊM LIÊN KẾT */}

            {/* THÊM LIÊN KẾT ĐỀ THI TRẮC NGHIỆM */}
            <NavLink to="/interactive-exams" className={navLinkClasses}>Kho đề trắc nghiệm</NavLink>
            {/* KẾT THÚC THÊM LIÊN KẾT */}
            <NavLink to="/bai-van-mau" className={navLinkClasses}>Tài liệu</NavLink>
            <NavLink to="/tin-tuc" className={navLinkClasses}>Tin tức</NavLink>

            <div className="flex items-center space-x-2 border-l border-border/70 pl-7 ml-0">
                <ModeToggle />
                <AuthSectionDesktop />
            </div>
          </nav>

          <div className="flex items-center space-x-4">
             <button onClick={toggleMobileMenu} className="text-foreground p-2 rounded-md hover:bg-accent md:hidden" aria-label="Toggle menu">
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-card backdrop-blur-md pt-4 pb-6 px-6 absolute top-full left-0 w-full border-b border-border animate-slideDown z-40">
            <nav className="flex flex-col space-y-1">
              <NavLink to="/" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Trang Chủ</NavLink>

              {/* Môn học trong menu di động */}
              <div className="py-2 px-4 text-lg text-foreground hover:bg-accent rounded-md transition-colors duration-200">
                <button
                  className="w-full text-left flex items-center justify-between"
                  onClick={() => setIsSubjectsDropdownOpen(!isSubjectsDropdownOpen)}
                >
                  Môn học <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform duration-200", isSubjectsDropdownOpen ? "rotate-180" : "rotate-0")} />
                </button>
                {isSubjectsDropdownOpen && (
                  <ul className="pl-4 mt-2 space-y-1 border-l-2 border-border">
                    <li>
                      <Link to="/mon-toan" className="block py-2 px-4 text-sm text-foreground/80 hover:bg-accent hover:text-primary rounded-md" onClick={toggleMobileMenu}>
                        Toán học
                      </Link>
                    </li>
                    <li>
                      <Link to="/mon-ngu-van" className="block py-2 px-4 text-sm text-foreground/80 hover:bg-accent hover:text-primary rounded-md" onClick={toggleMobileMenu}>
                        Ngữ Văn
                      </Link>
                    </li>
                    <li>
                      <Link to="/tieng-anh" className="block py-2 px-4 text-sm text-foreground/80 hover:bg-accent hover:text-primary rounded-md" onClick={toggleMobileMenu}>
                        Tiếng Anh
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
              {/* Kết thúc Môn học trong menu di động */}

              {/* NEW: Kho đề thi trong menu di động */}
              <div className="py-2 px-4 text-lg text-foreground hover:bg-accent rounded-md transition-colors duration-200">
                <button
                  className="w-full text-left flex items-center justify-between"
                  onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
                >
                  Kho đề thi <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform duration-200", isExamDropdownOpen ? "rotate-180" : "rotate-0")} />
                </button>
                {isExamDropdownOpen && (
                  <ul className="pl-4 mt-2 space-y-1 border-l-2 border-border">
                    <li>
                      <Link to="/de-thi" className="block py-2 px-4 text-sm text-foreground/80 hover:bg-accent hover:text-primary rounded-md" onClick={toggleMobileMenu}>
                        Tất cả đề thi
                      </Link>
                    </li>
                    {availableGrades.length > 0 ? (
                      availableGrades.map(grade => (
                        <li key={`mobile-grade-${grade}`}>
                          <Link to={`/de-thi?grade=${grade}`} className="block py-2 px-4 text-sm text-foreground/80 hover:bg-accent hover:text-primary rounded-md" onClick={toggleMobileMenu}>
                            Lớp {grade}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>
                        <span className="block py-2 px-4 text-sm text-muted-foreground">Đang tải lớp...</span>
                      </li>
                    )}
                  </ul>
                )}
              </div>
              {/* END NEW: Kho đề thi trong menu di động */}

              {/* THÊM LIÊN KẾT BÀI GIẢNG */}
              <NavLink to="/lectures" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Bài giảng</NavLink>
              {/* KẾT THÚC THÊM LIÊN KẾT */}

              {/* THÊM LIÊN KẾT ĐỀ THI TRẮC NGHIỆM */}
              <NavLink to="/interactive-exams" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Đề Thi Trắc nghiệm</NavLink>
              {/* KẾT THÚC THÊM LIÊN KẾT */}
              <NavLink to="/bai-van-mau" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Tài Liệu</NavLink>
              <NavLink to="/tin-tuc" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Tin Tức</NavLink>


              <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center px-4">
                <span className="text-sm text-muted-foreground">Chế độ hiển thị:</span>
                <ModeToggle />
              </div>

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