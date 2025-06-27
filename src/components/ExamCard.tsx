// src/components/ExamCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Download } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho một đề thi trong danh sách
interface ExamInList {
  _id: string;
  title: string;
  year: number;
  subject: string;
  // Thêm các trường khác nếu cần
}

interface ExamCardProps {
  exam: ExamInList;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam }) => {
  // Xây dựng URL cho thumbnail động
  const thumbnailUrl = `http://localhost:5050/api/exams/${exam._id}/thumbnail`;

  return (
    <Card className="group overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card">
      <Link to={`/exam/${exam._id}`}>
        <div className="w-full aspect-video bg-muted overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={`Ảnh minh họa cho ${exam.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            // Ảnh dự phòng nếu API thumbnail lỗi
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225/1f2937/4d5562?text=Error'; }}
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground h-14">
            {exam.title}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>Năm {exam.year}</span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link to={`/exam/${exam._id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Xem đề
          </Link>
        </Button>
        {/* Nếu có chức năng download, bạn có thể thêm vào đây */}
        {/*
        <Button variant="outline" size="icon" className="ml-2">
          <Download className="h-4 w-4" />
        </Button>
        */}
      </CardFooter>
    </Card>
  );
};

export default ExamCard;