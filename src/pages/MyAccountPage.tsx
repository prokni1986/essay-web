// src/pages/MyAccountPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import Layout from '@/components/Layout';
import { useAuth } from '../hooks/useAuth'; 
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Thêm import Button
import { Star, BookOpen, FileText, ChevronRight, CircleUserRound, CalendarDays } from 'lucide-react';

// --- Interfaces ---
interface Subscription {
  _id: string;
  subscribedItem?: {
    _id: string;
    title: string;
  } | null;
  onModel?: 'Essay' | 'Exam';
  hasFullAccess: boolean;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
}

interface SubscriptionTableProps {
  title: string;
  subscriptions: Subscription[];
  itemType: 'Essay' | 'Exam';
  icon: React.ReactNode;
}

// --- Component con ---
const SubscriptionTable: React.FC<SubscriptionTableProps> = ({ title, subscriptions, itemType, icon }) => {
  const itemNameHeader = itemType === 'Essay' ? 'Tên Bài Luận' : 'Tên Đề Thi';

  return (
    <Card className="mb-8 bg-card border">
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
          {icon}
          <span className="ml-3 text-xl">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-accent/50">
              <TableHead className="text-muted-foreground w-[60%]">{itemNameHeader}</TableHead>
              <TableHead className="text-muted-foreground">Ngày Đăng Ký</TableHead>
              <TableHead className="text-muted-foreground text-right">Trạng Thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map(sub => (
              <TableRow key={sub._id} className="border-border hover:bg-accent/50">
                <TableCell>
                  {sub.subscribedItem ? (
                    <Link to={itemType === 'Essay' ? `/sampleessay/${sub.subscribedItem._id}` : `/exam/${sub.subscribedItem._id}`} className="text-foreground hover:text-primary flex items-center group transition-colors">
                      {sub.subscribedItem.title}
                      <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ) : 'N/A'}
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(sub.startDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  {sub.isActive ? (
                    <Badge variant="outline" className="border-green-500 text-green-500">Hoạt động</Badge>
                  ) : (
                    <Badge variant="destructive">Không hoạt động</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- Component chính ---
const MyAccountPage: React.FC = () => {
  // Tất cả state và hooks được định nghĩa bên trong component
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMySubscriptions = async () => {
      if (!user) {
        setLoading(false); // Nếu chưa có user, không cần loading
        return;
      }
      setLoading(true);
      try {
        const response = await axiosInstance.get<Subscription[]>('/api/subscriptions/me');
        setSubscriptions(response.data);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data.message || "Không thể tải thông tin gói đăng ký.");
        } else {
          setError("Đã xảy ra lỗi không xác định.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMySubscriptions();
  }, [user]);

  const { fullAccessSub, essaySubs, examSubs } = useMemo(() => {
    return {
      fullAccessSub: subscriptions.find(sub => sub.hasFullAccess && sub.isActive),
      essaySubs: subscriptions.filter(sub => sub.onModel === 'Essay' && sub.isActive),
      examSubs: subscriptions.filter(sub => sub.onModel === 'Exam' && sub.isActive),
    };
  }, [subscriptions]);

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-screen text-foreground">Đang tải...</div></Layout>;
  }

  return (
    <Layout className="bg-secondary antialiased">
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                Tài Khoản Của Tôi
            </h1>
            {user && (
                <div className="flex items-center justify-center mt-4 text-muted-foreground">
                    <CircleUserRound className="w-5 h-5 mr-2" />
                    <span>{user.username} ({user.email})</span>
                </div>
            )}
        </header>

        <main className="space-y-10">
          {error && <p className="text-destructive text-center">{error}</p>}
          {!error && (
            <>
              {fullAccessSub && (
                 <Card className="bg-gradient-to-tr from-primary/10 via-background to-background border-2 border-primary/80 shadow-lg shadow-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center text-primary">
                        <Star className="mr-3 fill-current" />
                        <span className="text-xl">Gói Full Access Đang Hoạt Động</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-muted-foreground">Bạn đang có toàn quyền truy cập tất cả các bài luận và đề thi.</p>
                      <div className="flex items-center text-sm text-muted-foreground pt-2">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        <span>Ngày đăng ký: {new Date(fullAccessSub.startDate).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                 </Card>
              )}
              
              {essaySubs.length > 0 && (<SubscriptionTable title="Bài Luận Đã Đăng Ký" subscriptions={essaySubs} itemType="Essay" icon={<BookOpen className="w-6 h-6" />} />)}
              
              {examSubs.length > 0 && (<SubscriptionTable title="Đề Thi Đã Đăng Ký" subscriptions={examSubs} itemType="Exam" icon={<FileText className="w-6 h-6" />} />)}

              {!user && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
                  <Button asChild className="mt-4"><Link to="/login">Đến trang đăng nhập</Link></Button>
                </div>
              )}

              {user && !fullAccessSub && essaySubs.length === 0 && examSubs.length === 0 && (
                 <div className="text-center py-12">
                    <p className="text-muted-foreground">Bạn chưa đăng ký gói nào đang hoạt động.</p>
                    <Button variant="link" asChild className="mt-2"><Link to="/">Khám phá các gói đăng ký</Link></Button>
                 </div>
              )}
            </>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default MyAccountPage;