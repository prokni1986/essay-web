// file: pages/Index.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

// ICON
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-1 transition-transform duration-200 group-hover:translate-x-1">
    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75A.75 0 0 1 3 10Z" clipRule="evenodd" />
  </svg>
);

// INTERFACES (Giữ nguyên)
interface Category {
  _id: string;
  name: string;
}

interface Topic {
  _id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  category: Category | string;
}

// COMPONENT CARD - Modified to match the "Tài Liệu Mới" card style from the reference
interface DocumentCardProps {
  title: string;
  category: string;
  grade: string;
  imageUrl: string;
  downloadCount: number;
  link: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ title, category, grade, imageUrl, downloadCount, link }) => (
  <Link
    to={link}
    className="bg-card rounded-xl shadow-md overflow-hidden border border-border transition-transform hover:shadow-lg no-underline text-inherit"
  >
    <div className="h-40 overflow-hidden">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover object-top"
      />
    </div>
    <div className="p-4">
      <div className="flex justify-between mb-2">
        <span className={`text-xs px-2 py-1 rounded ${
          category === 'Toán học' ? 'bg-blue-100 text-blue-800' :
          category === 'Ngữ văn' ? 'bg-purple-100 text-purple-800' :
          category === 'Tiếng Anh' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>{category}</span>
        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{grade}</span>
      </div>
      <h3 className="font-bold mb-2 line-clamp-2 text-foreground">{title}</h3>
      <div className="flex items-center text-muted-foreground text-sm">
        <i className="fas fa-download mr-1"></i>
        <span>{downloadCount.toLocaleString()} lượt tải</span>
      </div>
    </div>
  </Link>
);


const Index = () => {
  // Static data cho các section (giữ nguyên)
  const mainSubjects = [
    {
      icon: "fas fa-calculator",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Toán Học",
      materialCount: "3,500+",
      examCount: "2,800+",
      features: ["Đại số và Giải tích", "Hình học không gian", "Số học và Đại số", "Thống kê và Xác suất"],
      buttonColor: "bg-blue-600",
      buttonHover: "hover:bg-blue-700",
      borderColor: "border-blue-500",
      link: "/mon-toan"
    },
    {
      icon: "fas fa-book-open",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Ngữ Văn",
      materialCount: "2,800+",
      examCount: "2,200+",
      features: ["Văn học dân gian", "Văn học trung đại", "Văn học hiện đại", "Kỹ năng làm văn"],
      buttonColor: "bg-purple-600",
      buttonHover: "hover:bg-purple-700",
      borderColor: "border-purple-500",
      link: "/mon-ngu-van"
    },
    {
      icon: "fas fa-globe-americas",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      title: "Tiếng Anh",
      materialCount: "3,200+",
      examCount: "2,500+",
      features: ["Ngữ pháp và Từ vựng", "Kỹ năng Nghe - Nói", "Kỹ năng Đọc - Viết", "Luyện đề IELTS/TOEFL"],
      buttonColor: "bg-orange-600",
      buttonHover: "hover:bg-orange-700",
      borderColor: "border-orange-500",
      link: "/tieng-anh"
    }
  ];

  const importantExams = [
    {
      image: "https://readdy.ai/api/search-image?query=Vietnamese%20students%20in%20a%20classroom%20preparing%20for%20high%20school%20entrance%20exams%2C%20focused%20expressions%2C%20neat%20uniforms%2C%20modern%20classroom%20setting%20with%20natural%20lighting%2C%20blue%20tones%2C%20educational%20atmosphere%2C%20multiple%20students%20studying%20together&width=600&height=400&seq=2&orientation=landscape",
      title: "Thi vào lớp 10",
      description: "Tài liệu ôn tập và đề thi thử cho kỳ thi vào lớp 10 THPT, bao gồm các môn Toán, Văn, Anh và các môn chuyên.",
      tags: ["Toán học", "Ngữ văn", "Tiếng Anh"],
      link: "/de-thi"
    },
    {
      image: "https://readdy.ai/api/search-image?query=Vietnamese%20middle%20school%20students%20taking%20exams%20in%20a%20bright%20classroom%2C%20concentration%20on%20faces%2C%20papers%20and%20pens%20on%20desks%2C%20natural%20lighting%20through%20windows%2C%20educational%20setting%2C%20multiple%20students%20in%20uniform%2C%20purple%20tones&width=600&height=400&seq=3&orientation=landscape",
      title: "Thi THCS",
      description: "Bộ sưu tập đề thi, đáp án và hướng dẫn giải chi tiết cho kỳ thi tốt nghiệp THCS, giúp học sinh ôn tập hiệu quả.",
      tags: ["Toán học", "Ngữ văn", "Tiếng Anh"],
      link: "/de-thi"
    },
    {
      image: "https://readdy.ai/api/search-image?query=Vietnamese%20high%20school%20students%20in%20formal%20uniforms%20taking%20final%20graduation%20exams%20in%20a%20large%20examination%20hall%2C%20serious%20atmosphere%2C%20rows%20of%20desks%2C%20bright%20lighting%2C%20educational%20setting%20multiple%20students%2C%20orange%20tones&width=600&height=400&seq=4&orientation=landscape",
      title: "Thi tốt nghiệp THPT",
      description: "Tài liệu ôn thi tốt nghiệp THPT Quốc gia đầy đủ, cập nhật theo cấu trúc đề thi mới nhất từ Bộ Giáo dục và Đào tạo.",
      tags: ["Toán học", "Ngữ văn", "Tiếng Anh"],
      link: "/de-thi"
    }
  ];

  const newDocuments = [
    {
      title: "Ôn tập Toán 12 - Chuyên đề Hàm số và Đạo hàm",
      category: "Toán học",
      grade: "Lớp 12",
      imageUrl: "https://readdy.ai/api/search-image?query=Mathematics%20textbook%20with%20formulas%20and%20geometric%20shapes%2C%20clean%20modern%20design%2C%20educational%20material%2C%20blue%20color%20scheme%2C%20Vietnamese%20educational%20content%2C%20high%20quality%20printing&width=400&height=300&seq=5&orientation=landscape",
      downloadCount: 1245,
      link: "/sampleessay/1"
    },
    {
      title: "Phân tích tác phẩm Truyện Kiều - Nguyễn Du",
      category: "Ngữ văn",
      grade: "Lớp 11",
      imageUrl: "https://readdy.ai/api/search-image?query=Vietnamese%20literature%20book%20with%20poetry%20and%20prose%2C%20traditional%20and%20modern%20literature%20elements%2C%20purple%20color%20scheme%2C%20educational%20material%2C%20high%20quality%20printing%2C%20clean%20layout&width=400&height=300&seq=6&orientation=landscape",
      downloadCount: 987,
      link: "/sampleessay/2"
    },
    {
      title: "Bài tập ngữ pháp tiếng Anh - Thì hiện tại hoàn thành",
      category: "Tiếng Anh",
      grade: "Lớp 10",
      imageUrl: "https://readdy.ai/api/search-image?query=English%20language%20textbook%20with%20vocabulary%20and%20grammar%20exercises%2C%20modern%20design%2C%20orange%20color%20scheme%2C%20educational%20material%2C%20high%20quality%20printing%2C%20clean%20layout&width=400&height=300&seq=7&orientation=landscape",
      downloadCount: 1532,
      link: "/sampleessay/3"
    },
    {
      title: "Đề thi thử vào lớp 10 môn Toán năm 2025",
      category: "Toán học",
      grade: "Lớp 9",
      imageUrl: "https://readdy.ai/api/search-image?query=Math%20exam%20papers%20with%20multiple%20choice%20questions%20and%20problem%20solving%2C%20educational%20material%20for%20Vietnamese%20students%2C%20blue%20color%20scheme%2C%20high%20quality%20printing%2C%20clean%20layout&width=400&height=300&seq=8&orientation=landscape",
      downloadCount: 2145,
      link: "/exam/1"
    }
  ];

  const subscriptionPlans = [
    {
      name: "Gói Cơ bản",
      description: "Dành cho học sinh mới bắt đầu",
      price: "Miễn phí",
      features: [
        { text: "Truy cập tài liệu cơ bản", available: true },
        { text: "10 đề thi mỗi tháng", available: true },
        { text: "Diễn đàn hỏi đáp", available: true },
        { text: "Tài liệu nâng cao", available: false },
        { text: "Hướng dẫn giải chi tiết", available: false }
      ],
      buttonText: "Đăng ký ngay",
      buttonColor: "bg-gray-600",
      buttonHover: "hover:bg-gray-700",
      borderColor: "border-gray-400",
      isPopular: false
    },
    {
      name: "Gói Tiêu chuẩn",
      description: "Dành cho học sinh muốn cải thiện kết quả",
      price: "199.000đ",
      priceSuffix: "/tháng",
      features: [
        { text: "Tất cả tính năng gói Cơ bản", available: true },
        { text: "Không giới hạn đề thi", available: true },
        { text: "Tài liệu nâng cao", available: true },
        { text: "Hướng dẫn giải chi tiết", available: true },
        { text: "Tư vấn học tập 1-1", available: false }
      ],
      buttonText: "Đăng ký ngay",
      buttonColor: "bg-blue-600",
      buttonHover: "hover:bg-blue-700",
      borderColor: "border-blue-500",
      isPopular: true
    },
    {
      name: "Gói Cao cấp",
      description: "Dành cho học sinh muốn đạt điểm cao nhất",
      price: "399.000đ",
      priceSuffix: "/tháng",
      features: [
        { text: "Tất cả tính năng gói Tiêu chuẩn", available: true },
        { text: "Tư vấn học tập 1-1", available: true },
        { text: "Đánh giá bài làm cá nhân", available: true },
        { text: "Khóa học video độc quyền", available: true },
        { text: "Lộ trình học tập cá nhân hóa", available: true }
      ],
      buttonText: "Đăng ký ngay",
      buttonColor: "bg-purple-600",
      buttonHover: "hover:bg-purple-700",
      borderColor: "border-purple-500",
      isPopular: false
    }
  ];

  const educationalNews = [
    {
      date: "18/06/2025",
      title: "Bộ GD&ĐT công bố đề thi tham khảo THPT Quốc gia 2026",
      description: "Bộ Giáo dục và Đào tạo vừa công bố đề thi tham khảo kỳ thi tốt nghiệp THPT Quốc gia năm 2026 với nhiều điểm mới đáng chú ý so với các năm trước.",
      image: "https://readdy.ai/api/search-image?query=Vietnamese%20Ministry%20of%20Education%20announcement%20event%2C%20officials%20at%20podium%2C%20formal%20setting%2C%20educational%20policy%20update%2C%20government%20officials%20in%20suits%2C%20Vietnamese%20education%20system%2C%20press%20conference&width=600&height=400&seq=9&orientation=landscape",
      link: "/tin-tuc/bo-gddt-cong-bo-de-thi-tham-khao-thpt-quoc-gia-2026"
    },
    {
      date: "15/06/2025",
      title: "Học sinh Việt Nam giành 4 huy chương vàng Olympic Toán quốc tế",
      description: "Đoàn học sinh Việt Nam tham dự kỳ thi Olympic Toán học quốc tế năm 2025 đã xuất sắc giành được 4 huy chương vàng, 2 huy chương bạc, đứng thứ 3 toàn đoàn.",
      image: "https://readdy.ai/api/search-image?query=Vietnamese%20students%20receiving%20awards%20at%20academic%20competition%2C%20medals%20and%20certificates%2C%20proud%20moment%2C%20educational%20achievement%2C%20formal%20ceremony%2C%20multiple%20students%20in%20uniform%2C%20celebration&width=600&height=400&seq=10&orientation=landscape",
      link: "/tin-tuc/hoc-sinh-viet-nam-gianh-huy-chuong-vang-olympic-toan-quoc-te"
    },
    {
      date: "10/06/2025",
      title: "Các trường đại học công bố phương án tuyển sinh năm 2025",
      description: "Nhiều trường đại học trên cả nước đã công bố phương án tuyển sinh năm 2025 với nhiều thay đổi quan trọng về điểm chuẩn và tổ hợp môn xét tuyển.",
      image: "https://readdy.ai/api/search-image?query=Vietnamese%20high%20school%20graduation%20ceremony%2C%20students%20in%20caps%20and%20gowns%2C%20celebration%2C%20diploma%20handover%2C%20educational%20milestone%2C%20multiple%20students%20in%20uniform%2C%20joyful%20atmosphere&width=600&height=400&seq=11&orientation=landscape",
      link: "/tin-tuc/cac-truong-dai-hoc-cong-bo-phuong-an-tuyen-sinh-2025"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=A%20modern%20educational%20setting%20with%20students%20in%20a%20bright%20classroom%20environment%2C%20soft%20natural%20lighting%2C%20clean%20and%20minimalist%20design%2C%20blue%20gradient%20background%20on%20the%20left%20transitioning%20to%20a%20vibrant%20classroom%20scene%2C%20showing%20diverse%20Vietnamese%20students%20engaged%20in%20learning%20activities&width=1440&height=600&seq=1&orientation=landscape"
            alt="Education Background"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent dark:from-background/90"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10 text-white">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Nền tảng học tập toàn diện cho học sinh Việt Nam</h1>
            <p className="text-lg mb-8">Tài liệu chất lượng cao, đề thi cập nhật và hướng dẫn chi tiết cho các môn học từ lớp 1 đến lớp 12.</p>

            <div className="flex flex-wrap gap-4">
              <Link to="/mon-toan" className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors flex items-center button-rounded-full whitespace-nowrap cursor-pointer no-underline">
                <i className="fas fa-calculator mr-2"></i>
                Môn Toán
              </Link>
              <Link to="/mon-ngu-van" className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors flex items-center button-rounded-full whitespace-nowrap cursor-pointer no-underline">
                <i className="fas fa-book mr-2"></i>
                Môn Ngữ Văn
              </Link>
              <Link to="/tieng-anh" className="bg-orange-600 text-white px-6 py-3 rounded-full hover:bg-orange-700 transition-colors flex items-center button-rounded-full whitespace-nowrap cursor-pointer no-underline">
                <i className="fas fa-globe-americas mr-2"></i>
                Môn Tiếng Anh
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 mt-12">
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-3 mr-3 text-white">
                  <i className="fas fa-user-graduate text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold">50,000+</p>
                  <p className="text-sm">Học sinh tham gia</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-3 mr-3 text-white">
                  <i className="fas fa-file-alt text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold">10,000+</p>
                  <p className="text-sm">Đề thi & bài tập</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-3 mr-3 text-white">
                  <i className="fas fa-book text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold">5,000+</p>
                  <p className="text-sm">Tài liệu học tập</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ba Môn Học Chính */}
      <section className="py-16 bg-background"> {/* Giữ nguyên bg-background, dark:bg-background sẽ tự động dùng biến */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Ba Môn Học Chính</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mainSubjects.map((subject, index) => (
              <div key={index} className={`bg-card rounded-xl shadow-lg p-8 transition-transform hover:scale-105 border-t-4 ${subject.borderColor}`}> {/* Đã sửa bg-white thành bg-card */}
                <div className={`w-16 h-16 ${subject.iconBg} rounded-full flex items-center justify-center mb-6 mx-auto`}>
                  <i className={`${subject.icon} text-2xl ${subject.iconColor}`}></i>
                </div>
                <h3 className="text-xl font-bold text-center mb-4 text-foreground">{subject.title}</h3>
                <div className="flex justify-center gap-4 mb-6">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${subject.iconColor}`}>{subject.materialCount}</p>
                    <p className="text-sm text-muted-foreground">Tài liệu</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${subject.iconColor}`}>{subject.examCount}</p>
                    <p className="text-sm text-muted-foreground">Đề thi</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-foreground">
                  {subject.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <i className={`${subject.iconColor.replace('text-', 'text-')} fa-check-circle mr-2`}></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={subject.link} className={`w-full ${subject.buttonColor} text-white py-3 rounded-lg ${subject.buttonHover} transition-colors button-rounded-full whitespace-nowrap cursor-pointer block text-center no-underline`}>
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kỳ Thi Quan Trọng */}
      <section className="py-16 bg-secondary"> {/* Đã sửa bg-gray-50 thành bg-secondary */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Kỳ Thi Quan Trọng</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {importantExams.map((exam, index) => (
              <div key={index} className="bg-card rounded-xl shadow-md overflow-hidden"> {/* Đã sửa bg-white thành bg-card */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={exam.image}
                    alt={exam.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-foreground">{exam.title}</h3>
                  <p className="text-muted-foreground mb-4">{exam.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {exam.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className={`text-xs px-3 py-1 rounded-full ${
                        tag === 'Toán học' ? 'bg-blue-100 text-blue-800' :
                        tag === 'Ngữ văn' ? 'bg-purple-100 text-purple-800' :
                        tag === 'Tiếng Anh' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{tag}</span>
                    ))}
                  </div>
                  <Link to={exam.link} className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition-colors button-rounded-full whitespace-nowrap cursor-pointer block text-center no-underline">
                    Xem tài liệu
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tài Liệu Mới */}
      <section className="py-16 bg-background"> {/* Giữ nguyên bg-background */}
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Tài Liệu Mới</h2>
            <Link to="/bai-van-mau" className="text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer no-underline">
              Xem tất cả <ArrowRightIcon />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newDocuments.map((doc, index) => (
              <DocumentCard
                key={index}
                title={doc.title}
                category={doc.category}
                grade={doc.grade}
                imageUrl={doc.imageUrl}
                downloadCount={doc.downloadCount}
                link={doc.link}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Gói Đăng Ký */}
      <section className="py-16 bg-secondary"> {/* Đã sửa bg-gray-50 thành bg-secondary */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">Gói Đăng Ký</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Lựa chọn gói phù hợp với nhu cầu học tập của bạn để tiếp cận đầy đủ tài liệu và các tính năng độc quyền.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan, index) => (
              <div key={index} className={`bg-card rounded-xl shadow-lg p-8 border-t-4 ${plan.borderColor} transition-transform ${plan.isPopular ? 'scale-105 relative' : 'hover:scale-105'}`}> {/* Đã sửa bg-white thành bg-card */}
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    PHỔ BIẾN NHẤT
                  </div>
                )}
                <h3 className="text-xl font-bold text-center mb-2 text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground text-center mb-6">{plan.description}</p>
                <div className="text-center mb-6 text-foreground">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.priceSuffix && <span className="text-muted-foreground">{plan.priceSuffix}</span>}
                </div>
                <ul className="space-y-3 mb-8 text-foreground">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      {feature.available ? (
                        <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                      ) : (
                        <i className="fas fa-times text-muted-foreground mt-1 mr-3"></i>
                      )}
                      <span className={feature.available ? "" : "text-muted-foreground"}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/my-account" className={`w-full ${plan.buttonColor} text-white py-3 rounded-lg ${plan.buttonHover} transition-colors button-rounded-full whitespace-nowrap cursor-pointer block text-center no-underline`}>
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tin Tức Giáo Dục */}
      <section className="py-16 bg-background"> {/* Giữ nguyên bg-background */}
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Tin Tức Giáo Dục</h2>
            <Link to="/tin-tuc" className="text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer no-underline">
              Xem tất cả <ArrowRightIcon />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {educationalNews.map((news, index) => (
              <div key={index} className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
                <div className="h-48 overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <i className="far fa-calendar-alt mr-2"></i>
                    <span>{news.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{news.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{news.description}</p>
                  <Link to={news.link} className="text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer no-underline">
                    Đọc tiếp <ArrowRightIcon />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;