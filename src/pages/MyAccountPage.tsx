// src/pages/MyAccountPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import Layout from '@/components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Interface cho một subscription
interface Subscription {
  _id: string;
  subscribedEssay?: {
    _id: string;
    title: string;
  } | null;
  hasFullAccess: boolean;
  startDate: string;
  endDate?: string | null;
  planType?: string;
  isActive: boolean;
}

const MyAccountPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Lấy thông tin user hiện tại

  useEffect(() => {
    const fetchMySubscriptions = async () => {
      setLoading(true);
      try {
        // API này đã được bảo vệ bởi authenticateToken ở backend
        const response = await axiosInstance.get<Subscription[]>('/api/subscriptions/me');
        setSubscriptions(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
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
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center text-white">
          Đang tải thông tin tài khoản...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8 text-white min-h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Tài Khoản Của Tôi</h1>
          {user && <p className="text-lg text-gray-300 mt-2">Chào mừng, {user.username} ({user.email})</p>}
        </header>

        <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-yellow-300 mb-4">Các Gói Đã Đăng Ký</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {!error && subscriptions.length > 0 ? (
            <Table className="bg-gray-700/50 rounded-md">
              <TableHeader>
                <TableRow className="border-gray-600 hover:bg-gray-600/50">
                  <TableHead className="text-yellow-400">Loại Gói</TableHead>
                  <TableHead className="text-yellow-400">Chi tiết</TableHead>
                  <TableHead className="text-yellow-400">Ngày Đăng Ký</TableHead>
                  <TableHead className="text-yellow-400">Ngày Hết Hạn</TableHead>
                  <TableHead className="text-yellow-400">Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map(sub => (
                  <TableRow key={sub._id} className="border-gray-600 hover:bg-gray-600/30">
                    <TableCell>
                      {sub.hasFullAccess ? (
                        <Badge variant="default" className="bg-blue-500 text-white">Full Access</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-600 text-white">Bài Luận Lẻ</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {sub.hasFullAccess ? 'Truy cập tất cả bài luận' : (
                        sub.subscribedEssay ? (
                          <Link to={`/sampleessay/${sub.subscribedEssay._id}`} className="hover:underline text-yellow-400">
                            {sub.subscribedEssay.title}
                          </Link>
                        ) : 'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">{new Date(sub.startDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-gray-300">{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Vĩnh viễn'}</TableCell>
                    <TableCell>
                      {sub.isActive ? (
                        <Badge variant="outline" className="border-green-500 text-green-400">Hoạt động</Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-400">Không hoạt động</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-400 italic">Bạn chưa đăng ký gói nào.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyAccountPage;