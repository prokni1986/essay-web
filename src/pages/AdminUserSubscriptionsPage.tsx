// src/pages/AdminUserSubscriptionsPage.tsx
import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback for potential future use
import axios, { AxiosError } from 'axios'; // Import AxiosError and axios for type checking
import axiosInstance from '../lib/axiosInstance';
import Layout from '@/components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserSubscription {
  _id: string;
  subscribedEssay?: { _id: string; title: string; } | null;
  hasFullAccess: boolean;
  startDate: string;
  endDate?: string | null;
  planType?: string;
  isActive: boolean;
}

interface UserInfo { // Renamed from User to avoid conflict with AuthContext's User if different
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  // Add other user fields if returned by backend and needed
}

interface UserWithSubscriptions extends UserInfo { // UserInfo now includes fields from User model
  subscriptions: UserSubscription[];
}

// Interface for expected API error structure
interface ApiErrorResponse {
  message?: string;
  // Add other potential error fields like 'errors' if your API returns them
  // errors?: Array<{ msg: string }>;
}

const AdminUserSubscriptionsPage: React.FC = () => {
  const [usersData, setUsersData] = useState<UserWithSubscriptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser, isAuthenticated, isLoading: authIsLoading } = useAuth(); // Renamed user to authUser to avoid conflict
  const navigate = useNavigate();

  // Example: Use environment variable for admin email check
  // Ensure VITE_ADMIN_EMAIL is set in your .env file for the frontend
  const isAdmin = authUser?.email === import.meta.env.VITE_ADMIN_EMAIL;

  const fetchData = useCallback(async () => { // useCallback in case you need to pass this function down
    if (!isAuthenticated || !isAdmin) { // Check isAdmin status here
      // This check might be premature if authIsLoading is true, handled in useEffect
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.get<UserWithSubscriptions[]>('/api/admin/users-subscriptions');
      setUsersData(response.data);
      setError(null);
    } catch (err) { // 'err' is implicitly 'unknown' or 'any' if no type specified
      console.error("Error fetching users and subscriptions:", err);
      let errorMessage = "Không thể tải dữ liệu người dùng và subscriptions.";
      if (axios.isAxiosError(err)) {
        // Now err is narrowed to AxiosError
        const errorData = err.response?.data as ApiErrorResponse; // Type assertion
        errorMessage = errorData?.message || err.message || "Lỗi tải dữ liệu từ server.";
      } else if (err instanceof Error) {
        // Handle generic Error instances
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]); // Dependencies for useCallback

  useEffect(() => {
    if (authIsLoading) {
      // Wait for authentication status to be determined
      return;
    }

    if (!isAuthenticated || !isAdmin) {
      toast.error("Truy cập bị từ chối. Bạn không có quyền Admin.");
      navigate('/'); // Or to a more appropriate page like /login
      return;
    }
    // Only fetch data if authenticated and admin
    fetchData();

  }, [isAuthenticated, isAdmin, authIsLoading, navigate, fetchData]); // Added fetchData to dependencies


  if (loading || authIsLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Quản lý Người dùng & Subscriptions</h1>
          <p className="text-gray-300">Đang tải dữ liệu...</p>
          {/* Optional: Add a spinner */}
        </div>
      </Layout>
    );
  }

  if (error && !loading) { // Ensure error is shown only when not loading
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Lỗi</h1>
          <p className="text-gray-300">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8 text-white">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Quản lý Người dùng & Subscriptions</h1>
        </header>

        {usersData.length === 0 && !loading && ( // Ensure not loading before showing "no data"
          <p className="text-gray-400">Không có dữ liệu người dùng nào.</p>
        )}

        {usersData.map((userData) => (
          <div key={userData._id} className="mb-10 p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold text-yellow-300 mb-1">
              User: {userData.username}
            </h2>
            <p className="text-sm text-gray-400 mb-1">Email: {userData.email}</p>
            <p className="text-xs text-gray-500 mb-4">
              Ngày tạo: {new Date(userData.createdAt).toLocaleDateString('vi-VN')}
            </p>

            <h3 className="text-lg font-medium text-gray-200 mt-4 mb-2">Subscriptions ({userData.subscriptions.length}):</h3>
            {userData.subscriptions.length > 0 ? (
              <Table className="bg-gray-700/50 rounded-md">
                <TableHeader>
                  <TableRow className="border-gray-600 hover:bg-gray-600/50">
                    <TableHead className="text-yellow-400">Loại</TableHead>
                    <TableHead className="text-yellow-400">Chi tiết</TableHead>
                    <TableHead className="text-yellow-400">Ngày bắt đầu</TableHead>
                    <TableHead className="text-yellow-400">Ngày kết thúc</TableHead>
                    <TableHead className="text-yellow-400">Trạng thái</TableHead>
                    <TableHead className="text-yellow-400">Plan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userData.subscriptions.map(sub => (
                    <TableRow key={sub._id} className="border-gray-600 hover:bg-gray-600/30">
                      <TableCell>
                        {sub.hasFullAccess ? (
                          <Badge variant="default" className="bg-blue-500 text-white hover:bg-blue-600">Full Access</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-600 text-white hover:bg-green-700">Bài lẻ</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                          {sub.subscribedEssay?.title || (sub.hasFullAccess ? 'Tất cả bài luận' : 'N/A')}
                      </TableCell>
                      <TableCell className="text-gray-300">{new Date(sub.startDate).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="text-gray-300">{sub.endDate ? new Date(sub.endDate).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}</TableCell>
                      <TableCell>
                        {sub.isActive ? (
                          <Badge variant="outline" className="border-green-500 text-green-400">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-500 text-red-400">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">{sub.planType || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-400 italic">Người dùng này chưa có subscription nào.</p>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default AdminUserSubscriptionsPage;