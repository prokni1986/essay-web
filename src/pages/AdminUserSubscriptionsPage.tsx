// src/pages/AdminUserSubscriptionsPage.tsx (Giao diện cuối cùng, đã đồng bộ theme)

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

// Import các component và hook cần thiết từ dự án của bạn
import axiosInstance from '@/lib/axiosInstance';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Power, PowerOff, Trash2, User } from 'lucide-react';


// --- Định nghĩa kiểu dữ liệu (Interfaces) ---
interface SubscriptionItem {
  _id: string;
  title: string;
}
interface UserSubscription {
  _id: string;
  subscribedItem?: SubscriptionItem | null;
  hasFullAccess: boolean;
  startDate: string;
  endDate?: string | null;
  planType?: string;
  isActive: boolean;
}
interface UserInfo {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}
interface UserWithSubscriptions extends UserInfo {
  subscriptions: UserSubscription[];
}

// --- Component chính ---
const AdminUserSubscriptionsPage: React.FC = () => {
  const [usersData, setUsersData] = useState<UserWithSubscriptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoading: authIsLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<UserSubscription | null>(null);

  // --- Các hàm xử lý logic ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<UserWithSubscriptions[]>('/api/admin/users-subscriptions');
      setUsersData(response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      const errorMessage = "Không thể tải dữ liệu người dùng.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching user subscriptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async (subId: string) => {
    setIsProcessing(true);
    try {
      const response = await axiosInstance.put(`/api/admin/subscriptions/${subId}/toggle-active`);
      toast.success(response.data.message || 'Cập nhật trạng thái thành công!');
      await fetchData();
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setIsProcessing(true);
    try {
      await axiosInstance.delete(`/api/admin/subscriptions/${deleteConfirm._id}`);
      toast.success('Xóa gói đăng ký thành công!');
      setDeleteConfirm(null);
      await fetchData();
    } catch (error) {
      toast.error("Xóa gói đăng ký thất bại.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Giao diện (UI) ---
  if (loading || authIsLoading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center bg-background">
          <p className="text-destructive">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-background text-foreground min-h-screen">
        <main className="container mx-auto px-4 py-8 md:py-12">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
              Quản lý Người dùng
            </h1>
            <p className="text-lg text-muted-foreground">
              Xem và quản lý các gói đăng ký của tất cả người dùng trong hệ thống.
            </p>
          </header>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {usersData.length > 0 ? usersData.map((userData) => (
              <AccordionItem key={userData._id} value={userData._id} className="bg-card border rounded-lg data-[state=open]:border-primary/50">
                <AccordionTrigger className="p-4 hover:no-underline rounded-t-lg hover:bg-muted/50 data-[state=open]:rounded-b-none data-[state=open]:bg-muted">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                        <User size={20} className="text-primary" />
                        {userData.username}
                      </div>
                      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail size={16} />
                        {userData.email}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground pr-2">
                      Ngày tham gia: {new Date(userData.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-2 border-t">
                  <h3 className="text-base font-medium text-muted-foreground mb-3">
                    Các gói đang sở hữu ({userData.subscriptions.length}):
                  </h3>
                  {userData.subscriptions.length > 0 ? (
                    <div className="overflow-x-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-b-border">
                            <TableHead>Loại Gói</TableHead>
                            <TableHead>Chi Tiết Gói</TableHead>
                            <TableHead>Trạng Thái</TableHead>
                            <TableHead className="text-right">Hành Động</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userData.subscriptions.map(sub => (
                            <TableRow key={sub._id} className="border-border">
                              <TableCell>
                                {sub.hasFullAccess ?
                                  <Badge variant="secondary">Full Access</Badge> :
                                  <Badge variant="default">Bài Viết Lẻ</Badge>
                                }
                              </TableCell>
                              <TableCell className="font-medium">{sub.subscribedItem?.title || (sub.hasFullAccess ? 'Toàn bộ nội dung' : 'N/A')}</TableCell>
                              <TableCell>
                                {sub.isActive ?
                                  <Badge variant="outline" className="border-green-500 text-green-500">Hoạt động</Badge> :
                                  <Badge variant="destructive">Vô hiệu</Badge>
                                }
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                <Button variant="ghost" size="icon" onClick={() => handleToggleActive(sub._id)} disabled={isProcessing}>
                                  {sub.isActive ? <PowerOff className="h-4 w-4 text-orange-500" /> : <Power className="h-4 w-4 text-green-500" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(sub)} disabled={isProcessing}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic text-center py-4">Chưa có gói đăng ký nào.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )) : (
              <div className="text-center py-10 bg-card rounded-lg border">
                <p className="text-muted-foreground">Không có dữ liệu người dùng nào để hiển thị.</p>
              </div>
            )}
          </Accordion>
        </main>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 shadow-lg w-full max-w-md m-4">
            <h3 className="text-lg font-semibold text-foreground">Xác Nhận Xóa</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Bạn có chắc muốn xóa vĩnh viễn gói đăng ký này không? Hành động này không thể hoàn tác.
            </p>
            <p className="my-4 font-semibold text-primary">
              {deleteConfirm.hasFullAccess ? "Full Access" : `"${deleteConfirm.subscribedItem?.title || ''}"`}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Hủy</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isProcessing}>
                {isProcessing ? 'Đang xóa...' : 'Xác Nhận'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminUserSubscriptionsPage;