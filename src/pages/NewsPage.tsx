// src/pages/NewsPage.tsx

import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Thay thế icon Font Awesome bằng Lucide-React
import { 
  ArrowRight, Newspaper, Star, Calendar, GraduationCap, School, University, 
  FileText, Megaphone, Search, Phone, MapPin, Mail, Ellipsis, ChevronRight 
} from "lucide-react";


const NewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <Layout>
      <div className="bg-background text-foreground">
        
        {/* Main Banner */}
        <section className="relative bg-secondary/50 overflow-hidden border-b">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-12 z-10 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                  Thông tin giáo dục & tuyển sinh mới nhất
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Cập nhật tin tức về kỳ thi vào lớp 10, tốt nghiệp THPT và thông
                  tin tuyển sinh đại học 2025.
                </p>
                <Button size="lg">
                  Xem tin mới nhất
                </Button>
              </div>
              <div className="md:w-1/2 mt-10 md:mt-0 relative">
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src="https://readdy.ai/api/search-image?query=Students%20in%20Vietnamese%20traditional%20ao%20dai%20uniforms%20studying%20in%20a%20modern%20classroom%20with%20digital%20devices%2C%20bright%20and%20airy%20space%20with%20natural%20light%2C%20education%20technology%20environment%2C%20high%20quality%20professional%20photography%20with%20soft%20lighting&width=600&height=400&seq=1&orientation=landscape"
                    alt="Học sinh Việt Nam"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-end">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Lịch thi THPT Quốc gia 2025
                      </h3>
                      <p className="text-white/90 text-sm">
                        Bộ GD&ĐT công bố lịch thi chính thức
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Column */}
              <div className="lg:w-2/3">
                <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
                  <Newspaper className="text-primary mr-3 h-8 w-8"/>
                  Tin Tức Mới Nhất
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* News Item 1 */}
                  <NewsCard 
                    category="Kỳ Thi"
                    date="08/06/2025"
                    title="Bộ GD&ĐT công bố đề thi minh họa THPT Quốc gia 2025"
                    description="Đề thi minh họa có nhiều thay đổi quan trọng so với năm trước, thí sinh cần lưu ý..."
                    imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%20high%20school%20students%20in%20uniform%20taking%20an%20exam%20in%20a%20large%20examination%20hall%2C%20rows%20of%20desks%2C%20serious%20atmosphere%2C%20natural%20lighting%20through%20windows%2C%20high%20resolution%20education%20photography&width=400&height=250&seq=2&orientation=landscape"
                  />
                   <NewsCard 
                    category="Tuyển Sinh"
                    date="07/06/2025"
                    title="Top 10 trường đại học có điểm chuẩn cao nhất năm 2025"
                    description="Dự kiến điểm chuẩn các trường top đầu sẽ tăng nhẹ so với năm học trước..."
                    imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%20university%20campus%20with%20modern%20architecture%2C%20students%20walking%20between%20buildings%2C%20green%20spaces%2C%20academic%20atmosphere%2C%20bright%20daylight%2C%20professional%20education%20photography%20with%20vibrant%20colors&width=400&height=250&seq=3&orientation=landscape"
                  />
                  <NewsCard 
                    category="Lớp 10"
                    date="06/06/2025"
                    title="Hà Nội công bố phương án tuyển sinh lớp 10 năm học 2025-2026"
                    description="Sở GD&ĐT Hà Nội vừa công bố phương án tuyển sinh vào lớp 10 với nhiều điểm mới..."
                    imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%20middle%20school%20students%20in%20uniform%20studying%20together%20in%20a%20classroom%2C%20collaborative%20learning%20environment%2C%20educational%20materials%20on%20desks%2C%20bright%20classroom%20with%20modern%20facilities%2C%20professional%20education%20photography&width=400&height=250&seq=4&orientation=landscape"
                  />
                   <NewsCard 
                    category="Chính Sách"
                    date="05/06/2025"
                    title="Thay đổi quan trọng trong chương trình giáo dục phổ thông mới"
                    description="Bộ GD&ĐT thông báo điều chỉnh một số nội dung trong chương trình giáo dục phổ thông..."
                    imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%20education%20officials%20in%20formal%20attire%20announcing%20policy%20changes%20at%20a%20press%20conference%2C%20government%20backdrop%2C%20microphones%2C%20serious%20professional%20setting%2C%20high%20quality%20news%20photography%20with%20clear%20lighting&width=400&height=250&seq=5&orientation=landscape"
                  />
                </div>

                <div className="mt-8 flex justify-center space-x-2">
                  <Button variant="outline">1</Button>
                  <Button variant="secondary">2</Button>
                  <Button variant="secondary">3</Button>
                  <Button variant="secondary" size="icon"><Ellipsis className="h-4 w-4"/></Button>
                  <Button variant="secondary" size="icon"><ChevronRight className="h-4 w-4"/></Button>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="lg:w-1/3 mt-8 lg:mt-0 space-y-8">
                {/* Important News */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-bold text-foreground flex items-center">
                      <Star className="text-yellow-400 mr-2 h-5 w-5"/> Tin Nổi Bật
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="border-b pb-3"><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Lịch thi tốt nghiệp THPT 2025 chính thức: 7-10 tháng 7</a></li>
                      <li className="border-b pb-3"><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Các trường đại học top đầu công bố phương thức xét tuyển sớm</a></li>
                      <li className="border-b pb-3"><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Tổng hợp học bổng du học các nước năm 2025-2026</a></li>
                      <li className="border-b pb-3"><a href="#" className="text-muted-foreground hover:text-primary transition-colors">TP.HCM công bố chỉ tiêu tuyển sinh lớp 10 các trường chuyên</a></li>
                      <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">5 bí quyết ôn thi hiệu quả trong thời gian ngắn</a></li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Exam Calendar */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-bold text-foreground flex items-center">
                      <Calendar className="text-primary mr-2 h-5 w-5"/> Lịch Thi Quan Trọng
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <CalendarItem icon={<GraduationCap/>} title="Thi THPT Quốc Gia" date="07/07 - 10/07/2025"/>
                      <CalendarItem icon={<School/>} title="Thi vào lớp 10 Hà Nội" date="10/06 - 12/06/2025"/>
                      <CalendarItem icon={<University/>} title="Hạn nộp hồ sơ xét tuyển ĐH" date="30/07/2025"/>
                      <CalendarItem icon={<FileText/>} title="Công bố điểm thi THPT" date="25/07/2025"/>
                    </ul>
                    <Button variant="secondary" className="w-full mt-4">Xem lịch đầy đủ</Button>
                  </CardContent>
                </Card>
                
              </aside>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Thông Tin Theo Chuyên Mục
            </h2>
            <Tabs defaultValue="tab1" onValueChange={(value) => setActiveTab(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tab1"><School className="mr-2 h-4 w-4"/>Thi vào lớp 10</TabsTrigger>
                <TabsTrigger value="tab2"><GraduationCap className="mr-2 h-4 w-4"/>Thi tốt nghiệp THPT</TabsTrigger>
                <TabsTrigger value="tab3"><University className="mr-2 h-4 w-4"/>Tuyển sinh đại học</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="mt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <NewsCardSimple title="Đề thi thử vào lớp 10 môn Toán - Hà Nội 2025" description="Bộ đề thi thử mới nhất với cấu trúc sát đề chính thức..." imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%20students%20in%20school%20uniforms%20taking%20entrance%20exams%20for%20grade%2010%2C%20classroom%20setting%20with%20exam%20papers%2C%20focused%20expressions%2C%20natural%20lighting%2C%20high%20quality%20educational%20photography&width=350&height=200&seq=6&orientation=landscape" />
                    <NewsCardSimple title="Phương pháp ôn tập hiệu quả cho kỳ thi vào lớp 10" description="Các chuyên gia chia sẻ phương pháp ôn tập khoa học..." imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%20middle%20school%20students%20studying%20together%20in%20a%20library%2C%20preparing%20for%20high%20school%20entrance%20exams%2C%20books%20and%20notes%20spread%20on%20table%2C%20concentrated%20faces%2C%20bright%20academic%20environment%2C%20high%20resolution%20educational%20photography&width=350&height=200&seq=7&orientation=landscape" />
                    <NewsCardSimple title="Phân tích điểm chuẩn lớp 10 các trường top TP.HCM" description="Xu hướng điểm chuẩn trong 5 năm qua và dự báo năm 2025..." imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%20education%20officials%20reviewing%20exam%20results%2C%20charts%20and%20statistics%20on%20wall%2C%20professional%20meeting%20room%20setting%2C%20serious%20discussion%20about%20grade%2010%20entrance%20statistics%2C%20high%20quality%20professional%20photography&width=350&height=200&seq=8&orientation=landscape" />
                </div>
              </TabsContent>
              <TabsContent value="tab2" className="mt-6">
                  {/* ... Nội dung cho tab 2 ... */}
              </TabsContent>
              <TabsContent value="tab3" className="mt-6">
                  {/* ... Nội dung cho tab 3 ... */}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Score Lookup Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl mx-auto bg-card overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-primary p-8 text-primary-foreground flex flex-col justify-center">
                  <h2 className="text-2xl font-bold mb-4">Tra Cứu Điểm Thi</h2>
                  <p className="mb-6 opacity-90">Tra cứu nhanh điểm thi THPT Quốc gia và thi vào lớp 10.</p>
                </div>
                <div className="md:w-2/3 p-8">
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="examType" className="block text-sm font-medium text-muted-foreground mb-2">Kỳ thi</label>
                      <Select defaultValue="thpt-2025">
                        <SelectTrigger id="examType"><SelectValue placeholder="Chọn kỳ thi..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="thpt-2025">THPT Quốc gia 2025</SelectItem>
                          <SelectItem value="l10-hanoi-2025">Thi vào lớp 10 Hà Nội 2025</SelectItem>
                          <SelectItem value="l10-hcm-2025">Thi vào lớp 10 TP.HCM 2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="studentId" className="block text-sm font-medium text-muted-foreground mb-2">Số báo danh</label>
                      <Input type="text" id="studentId" placeholder="Nhập số báo danh"/>
                    </div>
                    <div className="pt-2">
                      <Button type="submit" className="w-full"><Search className="mr-2 h-4 w-4"/>Tra cứu điểm</Button>
                    </div>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
};

// --- Component con để mã nguồn sạch hơn ---
interface NewsCardProps { imgSrc: string; category: string; date: string; title: string; description: string;}
const NewsCard: React.FC<NewsCardProps> = ({ imgSrc, category, date, title, description }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-0 h-48 overflow-hidden"><img src={imgSrc} alt={title} className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"/></CardHeader>
        <CardContent className="p-5">
            <div className="flex items-center mb-2">
                <Badge variant="secondary">{category}</Badge>
                <span className="text-muted-foreground text-xs ml-2">{date}</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">{title}</h3>
            <p className="text-muted-foreground text-sm mb-3">{description}</p>
            <a href="#" className="text-primary hover:underline text-sm font-medium inline-flex items-center cursor-pointer">Đọc tiếp <ArrowRight className="ml-1 h-4 w-4" /></a>
        </CardContent>
    </Card>
);

interface NewsCardSimpleProps { imgSrc: string; title: string; description: string;}
const NewsCardSimple: React.FC<NewsCardSimpleProps> = ({ imgSrc, title, description }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <img src={imgSrc} alt={title} className="w-full h-40 object-cover object-top" />
        <CardContent className="p-4">
            <h3 className="font-bold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
    </Card>
);

interface CalendarItemProps { icon: React.ReactNode; title: string; date: string; }
const CalendarItem: React.FC<CalendarItemProps> = ({ icon, title, date }) => (
    <li className="flex items-center">
        <div className="bg-secondary text-secondary-foreground rounded-lg p-2 mr-3">{icon}</div>
        <div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{date}</p>
        </div>
    </li>
);

export default NewsPage;