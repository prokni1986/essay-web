// src/pages/LecturesPage.tsx

import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ChevronDown, ChevronRight, LayoutGrid, List, PlayCircle, Clock, ArrowRight, ChevronLeft
} from "lucide-react";


// Component con cho từng mục Filter trong Sidebar
const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b">
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full py-3 font-medium text-left transition-colors hover:text-primary">
          <span>{title}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-4 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
const FilterCheckbox: React.FC<{ id: string; label: string }> = ({ id, label }) => (
    <div className="flex items-center space-x-2 pl-2">
        <Checkbox id={id} />
        <Label htmlFor={id} className="font-normal text-sm cursor-pointer">{label}</Label>
    </div>
)

// Component con cho Card bài giảng
const LectureCard: React.FC<{ imgSrc: string; altText: string; category: string; difficulty: string; title: string; authorImg: string; author: string; description: string; duration: number; }> = (props) => (
  <Card className="group overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <CardHeader className="p-0">
      <div className="relative h-52 overflow-hidden">
        <img src={props.imgSrc} alt={props.altText} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
          <PlayCircle className="text-white h-8 w-8" />
        </div>
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center">
          <Clock className="w-3 h-3 mr-1" /> {props.duration} phút
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">{props.category}</span>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{props.difficulty}</span>
      </div>
      <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground">{props.title}</h3>
      <div className="flex items-center mb-3">
        <div className="w-7 h-7 rounded-full overflow-hidden mr-2">
          <img src={props.authorImg} alt={props.author} className="w-full h-full object-cover" />
        </div>
        <span className="text-muted-foreground text-sm">{props.author}</span>
      </div>
      <p className="text-muted-foreground text-sm line-clamp-2">{props.description}</p>
    </CardContent>
  </Card>
);


const LecturesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        
        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b">
            <div className="container mx-auto px-4">
                 <Breadcrumb className="py-3">
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/">Trang chủ</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href="/lectures">Bài giảng</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Ngữ văn</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </div>
        
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filter Sidebar */}
            <aside className="w-full md:w-64 shrink-0">
              <div className="bg-card rounded-lg border shadow-sm p-5 sticky top-24">
                <h3 className="font-bold text-lg mb-2 text-card-foreground">Bộ lọc nâng cao</h3>
                <FilterSection title="Cấp học">
                  <FilterCheckbox id="cap-tieu-hoc" label="Tiểu học" />
                  <FilterCheckbox id="cap-thcs" label="THCS" />
                  <FilterCheckbox id="cap-thpt" label="THPT" />
                </FilterSection>
                <FilterSection title="Chương/Phần">
                  <FilterCheckbox id="nghi-luan-xa-hoi" label="Nghị luận xã hội" />
                  <FilterCheckbox id="nghi-luan-van-hoc" label="Nghị luận văn học" />
                  <FilterCheckbox id="van-thuyet-minh" label="Văn thuyết minh" />
                  <FilterCheckbox id="van-tu-su" label="Văn tự sự" />
                </FilterSection>
                 <FilterSection title="Độ khó">
                  <FilterCheckbox id="do-kho-co-ban" label="Cơ bản" />
                  <FilterCheckbox id="do-kho-trung-binh" label="Trung bình" />
                  <FilterCheckbox id="do-kho-nang-cao" label="Nâng cao" />
                </FilterSection>
                <FilterSection title="Thời lượng">
                   <FilterCheckbox id="thoi-luong-ngan" label="Dưới 15 phút" />
                   <FilterCheckbox id="thoi-luong-trung-binh" label="15-30 phút" />
                   <FilterCheckbox id="thoi-luong-dai" label="Trên 30 phút" />
                </FilterSection>
                <Button className="w-full mt-6">Áp dụng bộ lọc</Button>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                  Bài giảng Ngữ văn
                </h1>
                <p className="text-lg text-muted-foreground">
                  Khám phá các bài giảng chất lượng cao từ các giáo viên hàng đầu.
                </p>
                {/* Sorting and View Options */}
                <div className="flex flex-wrap items-center justify-between mt-6 bg-card p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                    <Label className="text-muted-foreground">Sắp xếp theo:</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn cách sắp xếp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Mới nhất</SelectItem>
                            <SelectItem value="popular">Phổ biến</SelectItem>
                            <SelectItem value="rating">Đánh giá cao</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center">
                    <Label className="text-muted-foreground mr-2">Hiển thị:</Label>
                    <Button variant="default" size="icon" className="mr-1"><LayoutGrid className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon"><List className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>

              {/* Nghị Luận Xã Hội Section */}
              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Nghị Luận Xã Hội</h2>
                  <div className="h-px bg-border flex-grow ml-4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <LectureCard 
                    imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%2520teacher%2520explaining%2520social%2520commentary%2520essay%2520writing%2520techniques%2520to%2520high%2520school%2520students%252C%2520classroom%2520with%2520traditional%2520Vietnamese%2520elements%252C%2520educational%2520setting%252C%2520warm%2520lighting%252C%2520high%2520quality&width=600&height=400&seq=101&orientation=landscape"
                    altText="Bài văn nghị luận về hiện tượng học vẹt"
                    category="Nghị luận xã hội"
                    difficulty="Cơ bản"
                    title="Bài văn nghị luận về hiện tượng học vẹt trong giáo dục"
                    authorImg="https://readdy.ai/api/search-image?query=professional%2520female%2520Vietnamese%2520teacher%2520portrait%252C%2520warm%2520smile%252C%2520simple%2520background%252C%2520high%2520quality%252C%2520detailed&width=100&height=100&seq=201&orientation=squarish"
                    author="Cô Nguyễn Thị Minh"
                    description="Phân tích hiện tượng học vẹt, nguyên nhân và hậu quả. Hướng dẫn cách viết bài văn nghị luận xã hội hiệu quả."
                    duration={25}
                  />
                   <LectureCard 
                    imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%2520classroom%2520with%2520teacher%2520discussing%2520social%2520media%2520impact%2520on%2520youth%252C%2520students%2520engaged%2520in%2520debate%252C%2520educational%2520setting%252C%2520warm%2520lighting%252C%2520high%2520quality&width=600&height=400&seq=102&orientation=landscape"
                    altText="Bài văn nghị luận về mạng xã hội"
                    category="Nghị luận xã hội"
                    difficulty="Nâng cao"
                    title="Bài văn nghị luận về tác động của mạng xã hội đối với giới trẻ"
                    authorImg="https://readdy.ai/api/search-image?query=professional%2520male%2520Vietnamese%2520teacher%2520portrait%252C%2520glasses%252C%2520simple%2520background%252C%2520high%2520quality%252C%2520detailed&width=100&height=100&seq=202&orientation=squarish"
                    author="Thầy Trần Văn Hùng"
                    description="Phân tích những mặt tích cực và tiêu cực của mạng xã hội đối với giới trẻ hiện nay."
                    duration={32}
                  />
                  <LectureCard 
                    imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%2520classroom%2520with%2520teacher%2520discussing%2520environmental%2520protection%252C%2520students%2520taking%2520notes%252C%2520educational%2520charts%2520about%2520climate%2520change%252C%2520warm%2520lighting%252C%2520high%2520quality&width=600&height=400&seq=103&orientation=landscape"
                    altText="Bài văn nghị luận về bảo vệ môi trường"
                    category="Nghị luận xã hội"
                    difficulty="Cơ bản"
                    title="Bài văn nghị luận về vấn đề bảo vệ môi trường"
                    authorImg="https://readdy.ai/api/search-image?query=professional%2520female%2520Vietnamese%2520teacher%2520portrait%252C%2520mid%2520age%252C%2520simple%2520background%252C%2520high%2520quality%252C%2520detailed&width=100&height=100&seq=203&orientation=squarish"
                    author="Cô Lê Thị Hương"
                    description="Phân tích thực trạng ô nhiễm môi trường hiện nay và đề xuất các giải pháp."
                    duration={28}
                  />
                </div>
                <div className="text-center mt-8">
                  <Button variant="secondary">Xem thêm bài giảng <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </div>
              </section>

              {/* Nghị Luận Văn Học Section */}
              <section className="mb-12">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Nghị Luận Văn Học</h2>
                  <div className="h-px bg-border flex-grow ml-4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <LectureCard 
                    imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%2520literature%2520class%2520analyzing%2520Chi%2520Pheo%2520novel%252C%2520teacher%2520explaining%2520to%2520students%252C%2520educational%2520setting%2520with%2520book%2520illustrations%252C%2520warm%2520lighting%252C%2520high%2520quality&width=600&height=400&seq=104&orientation=landscape"
                    altText="Phân tích tác phẩm Chí Phèo"
                    category="Nghị luận văn học"
                    difficulty="Cơ bản"
                    title="Phân tích tác phẩm 'Chí Phèo' của Nam Cao"
                    authorImg="https://readdy.ai/api/search-image?query=professional%2520male%2520Vietnamese%2520literature%2520teacher%2520portrait%252C%2520scholarly%2520appearance%252C%2520simple%2520background%252C%2520high%2520quality%252C%2520detailed&width=100&height=100&seq=204&orientation=squarish"
                    author="Thầy Nguyễn Văn An"
                    description="Phân tích nhân vật Chí Phèo, giá trị nhân đạo và nghệ thuật của tác phẩm."
                    duration={35}
                  />
                  <LectureCard 
                    imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%2520literature%2520class%2520analyzing%2520Truyen%2520Kieu%2520poem%252C%2520teacher%2520with%2520traditional%2520Vietnamese%2520elements%252C%2520students%2520engaged%252C%2520educational%2520charts%252C%2520warm%2520lighting%252C%2520high%2520quality&width=600&height=400&seq=105&orientation=landscape"
                    altText="Phân tích Truyện Kiều"
                    category="Nghị luận văn học"
                    difficulty="Nâng cao"
                    title="Phân tích 'Truyện Kiều' của Nguyễn Du"
                    authorImg="https://readdy.ai/api/search-image?query=professional%2520female%2520Vietnamese%2520literature%2520teacher%2520portrait%252C%2520elegant%2520appearance%252C%2520simple%2520background%252C%2520high%2520quality%252C%2520detailed&width=100&height=100&seq=205&orientation=squarish"
                    author="Cô Phạm Thị Lan"
                    description="Phân tích nhân vật Thúy Kiều, giá trị nhân đạo và nghệ thuật của tác phẩm."
                    duration={40}
                  />
                   <LectureCard 
                    imgSrc="https://readdy.ai/api/search-image?query=Vietnamese%2520literature%2520class%2520analyzing%2520Vo%2520Nhat%2520poetry%252C%2520teacher%2520explaining%2520to%2520students%252C%2520educational%2520setting%2520with%2520war%2520themed%2520illustrations%252C%2520warm%2520lighting%252C%2520high%2520quality&width=600&height=400&seq=106&orientation=landscape"
                    altText="Phân tích thơ Tố Hữu"
                    category="Nghị luận văn học"
                    difficulty="Cơ bản"
                    title="Phân tích thơ Tố Hữu qua bài 'Việt Bắc'"
                    authorImg="https://readdy.ai/api/search-image?query=professional%2520male%2520Vietnamese%2520literature%2520teacher%2520portrait%252C%2520middle%2520aged%252C%2520simple%2520background%252C%2520high%2520quality%252C%2520detailed&width=100&height=100&seq=206&orientation=squarish"
                    author="Thầy Đỗ Minh Tuấn"
                    description="Phân tích giá trị nội dung và nghệ thuật của bài thơ 'Việt Bắc'."
                    duration={30}
                  />
                </div>
                <div className="text-center mt-8">
                   <Button variant="secondary">Xem thêm bài giảng <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </div>
              </section>

              {/* Pagination */}
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4"/>
                  </Button>
                  {[1,2,3].map(page => <Button key={page} variant={currentPage === page ? 'default' : 'outline'} onClick={() => setCurrentPage(page)}>{page}</Button>)}
                  <span className="text-muted-foreground">...</span>
                  <Button variant="outline">10</Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p+1)}>
                    <ChevronRight className="h-4 w-4"/>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default LecturesPage;