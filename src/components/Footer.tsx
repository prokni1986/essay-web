// file: components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Icons - Replaced with Font Awesome classes where possible, or kept existing SVG for custom ones
const TiktokIcon = () => ( <i className="fab fa-tiktok"></i> );
const YoutubeIcon = () => ( <i className="fab fa-youtube"></i> );
const FacebookIcon = () => ( <i className="fab fa-facebook-f"></i> );
const InstagramIcon = () => ( <i className="fab fa-instagram"></i> );

const Footer = () => {
  const currentYear = new Date().getFullYear();
  // useAuth is kept, but isAdmin related logic for footer links is removed as per reference
  const { isAuthenticated, user } = useAuth();
  // const isAdmin = isAuthenticated && user?.email === import.meta.env.VITE_ADMIN_EMAIL; // Removed usage

  const footerLinkClasses = "text-gray-400 hover:text-white transition-colors cursor-pointer"; // Adapted from reference
  const socialLinkClasses = "text-gray-400 hover:text-white transition-colors cursor-pointer"; // Adapted from reference
  const headingClasses = "text-lg font-bold mb-4"; // Adapted from reference

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8"> {/* Adjusted background and text color */}
      <div className="container mx-auto px-4"> {/* Using container for consistent max-width */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link to="/" className="text-2xl font-bold text-white mb-4 flex items-center"> {/* EduViet styling */}
              <i className="fas fa-book-open mr-2"></i>
              EduViet
            </Link>
            <p className="text-gray-400 mb-4">Nền tảng học tập trực tuyến hàng đầu dành cho học sinh Việt Nam từ lớp 1 đến lớp 12.</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={socialLinkClasses}><FacebookIcon /></a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className={socialLinkClasses}><YoutubeIcon /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={socialLinkClasses}><InstagramIcon /></a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className={socialLinkClasses}><TiktokIcon /></a>
            </div>
          </div>

          <div>
            <h3 className={headingClasses}>Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><Link to="/" className={footerLinkClasses}>Trang chủ</Link></li>
              <li><Link to="/mon-ngu-van" className={footerLinkClasses}>Môn học</Link></li> {/* Mapped */}
              <li><Link to="/de-thi" className={footerLinkClasses}>Đề thi</Link></li>
              <li><Link to="/bai-van-mau" className={footerLinkClasses}>Tài liệu</Link></li> {/* Mapped */}
              <li><Link to="/tin-tuc" className={footerLinkClasses}>Tin tức</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={headingClasses}>Hỗ trợ</h3>
            <ul className="space-y-2">
              <li><Link to="/support-center" className={footerLinkClasses}>Trung tâm hỗ trợ</Link></li> {/* Placeholder links */}
              <li><Link to="/faq" className={footerLinkClasses}>Câu hỏi thường gặp</Link></li>
              <li><Link to="/about" className={footerLinkClasses}>Liên hệ</Link></li>
              <li><Link to="/privacy-policy" className={footerLinkClasses}>Chính sách bảo mật</Link></li>
              <li><Link to="/terms-of-service" className={footerLinkClasses}>Điều khoản sử dụng</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={headingClasses}>Đăng ký nhận tin</h3>
            <p className="text-gray-400 mb-4">Nhận thông báo về tài liệu mới và tin tức giáo dục.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email của bạn"
                className="px-4 py-2 rounded-l-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 w-full text-sm"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors button-rounded-full whitespace-nowrap cursor-pointer">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© {currentYear} EduViet. Tất cả các quyền được bảo lưu.</p>
            <div className="flex space-x-4">
              <i className="fab fa-cc-visa text-2xl text-gray-400"></i>
              <i className="fab fa-cc-mastercard text-2xl text-gray-400"></i>
              <i className="fab fa-paypal text-2xl text-gray-400"></i>
              <i className="fab fa-cc-jcb text-2xl text-gray-400"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;