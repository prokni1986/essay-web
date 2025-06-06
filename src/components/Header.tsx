// file: components/Header.tsx

// ... (giữ nguyên các import và phần đầu component)
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import axiosInstance from '../lib/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";

interface Category {
  _id: string;
  name: string;
}

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const categoriesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isAuthenticated, user, logout, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
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
    if (categoriesTimeoutRef.current) {
      clearTimeout(categoriesTimeoutRef.current);
    }
    setIsCategoriesDropdownOpen(true);
  };

  const handleCategoriesMouseLeave = () => {
    categoriesTimeoutRef.current = setTimeout(() => {
      setIsCategoriesDropdownOpen(false);
    }, 200);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
    navigate('/');
  };


  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-light/80 hover:text-highlight transition-colors duration-200 py-2 text-base font-medium",
      isActive ? "text-highlight font-semibold" : ""
    );

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "block py-3 px-4 text-lg text-light/90 hover:bg-dark rounded-md transition-colors duration-200",
      isActive ? "bg-dark text-highlight font-semibold" : ""
    );

  const AuthSectionDesktop = () => {
    if (authIsLoading && !isAuthenticated) {
        return <div className="text-sm text-light/70">Đang tải...</div>;
    }
    if (isAuthenticated && user) {
      return (
        <div className="flex items-center space-x-4">
          {/* SỬA ĐỔI Ở ĐÂY */}
          <NavLink
            to="/my-account"
            className="text-light/90 text-sm font-semibold hover:text-highlight transition-colors"
          >
            Chào, {user.username}!
          </NavLink>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-highlight text-highlight hover:bg-highlight hover:text-dark transition-colors"
          >
            Đăng xuất
          </Button>
        </div>
      );
    }
    // ... (phần đăng nhập/đăng ký giữ nguyên)
    return (
      <div className="flex items-center space-x-3">
        <NavLink to="/login">
          <Button
            variant="outline"
            size="sm"
            className="border-light/70 text-light/80 hover:border-highlight hover:text-highlight transition-colors"
          >
            Đăng nhập
          </Button>
        </NavLink>
        <NavLink to="/register">
          <Button
            variant="default"
            size="sm"
            className="bg-highlight text-dark hover:bg-opacity-80 transition-colors"
          >
            Đăng ký
          </Button>
        </NavLink>
      </div>
    );
  };

  const AuthSectionMobile = () => {
    if (authIsLoading && !isAuthenticated) {
        return <div className="px-4 py-2 text-light/70">Đang tải...</div>;
    }
    if (isAuthenticated && user) {
      return (
        <>
          {/* SỬA ĐỔI Ở ĐÂY */}
          <NavLink
            to="/my-account"
            className={mobileNavLinkClasses}
            onClick={toggleMobileMenu}
          >
            Tài khoản: {user.username}
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full text-left block py-3 px-4 text-lg text-highlight hover:bg-dark rounded-md transition-colors duration-200"
          >
            Đăng xuất
          </button>
        </>
      );
    }
     // ... (phần đăng nhập/đăng ký giữ nguyên)
     return (
        <>
          <NavLink to="/login" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Đăng nhập</NavLink>
          <NavLink to="/register" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Đăng ký</NavLink>
        </>
      );
  };


  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out",
          scrolled || isMobileMenuOpen ? "bg-dark/95 backdrop-blur-lg shadow-lg py-4" : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10">
          <Link to="/" className="text-3xl font-heading font-bold">
            Thi Điểm Cao<span className="text-highlight">.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={navLinkClasses}>Trang Chủ</NavLink>
            <NavLink to="/alltopic" className={navLinkClasses}>Ngữ Văn</NavLink>
            <NavLink to="/gigs" className={navLinkClasses}>Tiếng Anh</NavLink>

            <div
              className="relative"
              onMouseEnter={handleCategoriesMouseEnter}
              onMouseLeave={handleCategoriesMouseLeave}
            >
              <NavLink
                to="/essays"
                className={navLinkClasses}
              >
                Bài Văn Mẫu
              </NavLink>
              {isCategoriesDropdownOpen && categories.length > 0 && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs bg-dark shadow-xl rounded-lg p-2 animate-fadeInUpMenu"
                >
                  <ul className="space-y-1">
                    {categories.map(category => (
                      <li key={category._id}>
                        <Link
                          to={`/category/${category._id}`}
                          className="block whitespace-nowrap px-4 py-2 text-sm text-light/80 hover:bg-secondary hover:text-highlight rounded-md transition-colors"
                          onClick={() => setIsCategoriesDropdownOpen(false)}
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <NavLink to="/about" className={navLinkClasses}>Liên Hệ</NavLink>

            {/* Auth section cho desktop */}
            <div className="border-l border-light/20 pl-6 ml-2">
                <AuthSectionDesktop />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
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
              <NavLink to="/essays" className={mobileNavLinkClasses} onClick={toggleMobileMenu}>Bài Văn Mẫu (Tất cả)</NavLink>
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

              {/* Auth section cho mobile */}
              <div className="mt-4 pt-4 border-t border-light/20">
                <AuthSectionMobile />
              </div>
            </nav>
          </div>
        )}
      </header>
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