// src/pages/AdminUserSubscriptionsPage.tsx
import React, { useEffect, useState, useCallback, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Trash2, Power, PowerOff } from 'lucide-react';

// =================================================================================
// CÁC COMPONENT VÀ HOOKS MOCK ĐỂ GIẢI QUYẾT LỖI BUILD
// Do môi trường hiện tại không thể giải quyết các đường dẫn import tùy chỉnh,
// chúng ta sẽ định nghĩa các phần phụ thuộc này trực tiếp tại đây.
// Trong dự án thực tế của bạn, bạn nên sử dụng các file import gốc.
// =================================================================================

// --- 1. Mock Layout Component ---
const Layout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="bg-gray-900">{children}</div>
);

// --- 2. Mock useAuth Hook ---
// Hook này giả định rằng người dùng đã được xác thực và là admin.
const useAuth = () => {
    // Trong dự án thực của bạn, logic này sẽ lấy từ context
    const [mockUser] = useState({
        // QUAN TRỌNG: Thay thế bằng email admin thực tế của bạn hoặc biến môi trường
        email: 'your-admin-email@example.com' 
    });
    return {
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
    };
};

// --- 3. Định nghĩa axiosInstance ---
const axiosInstance = axios.create({
  // Sửa đổi: Sử dụng URL backend từ biến môi trường của Vite.
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Interceptor để tự động đính kèm token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// =================================================================================
// CÁC ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPESCRIPT INTERFACES)
// =================================================================================
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

interface ApiErrorResponse {
  message?: string;
}

// =================================================================================
// COMPONENT CHÍNH: AdminUserSubscriptionsPage
// =================================================================================
const AdminUserSubscriptionsPage: React.FC = () => {
  const [usersData, setUsersData] = useState<UserWithSubscriptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<UserSubscription | null>(null);

  // SỬA LỖI: Sử dụng email từ mock hook. Trong dự án của bạn, hãy dùng import.meta.env.VITE_ADMIN_EMAIL
  const isAdmin = authUser?.email === 'your-admin-email@example.com';

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get<UserWithSubscriptions[]>('/api/admin/users-subscriptions');
      setUsersData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      const errorMessage = "Không thể tải dữ liệu.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (authIsLoading) return;
    if (!isAuthenticated || !isAdmin) {
      toast.error("Truy cập bị từ chối. Yêu cầu quyền Admin.");
      navigate('/');
      return;
    }
    fetchData();
  }, [isAuthenticated, isAdmin, authIsLoading, navigate, fetchData]);

  // === HANDLER FUNCTIONS FOR ADMIN ACTIONS ===
  const handleToggleActive = async (subId: string) => {
    setIsProcessing(true);
    try {
      const response = await axiosInstance.put(`/api/admin/subscriptions/${subId}/toggle-active`);
      toast.success(response.data.message || 'Cập nhật trạng thái thành công!');
      fetchData();
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại.");
      console.error("Toggle active error:", error);
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
      fetchData();
    } catch (error) {
      toast.error("Xóa gói đăng ký thất bại.");
      console.error("Delete sub error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || authIsLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center text-white">Đang tải dữ liệu...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8 text-white">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Quản lý Người dùng & Gói Đăng Ký</h1>
        </header>

        {usersData.map((userData) => (
          <div key={userData._id} className="mb-10 p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold text-yellow-300 mb-1">User: {userData.username}</h2>
            <p className="text-sm text-gray-400 mb-4">Email: {userData.email}</p>

            <h3 className="text-lg font-medium text-gray-200 mt-4 mb-2">Gói Đăng Ký ({userData.subscriptions.length}):</h3>
            {userData.subscriptions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-600">
                    <TableHead className="text-yellow-400">Loại</TableHead>
                    <TableHead className="text-yellow-400">Chi tiết</TableHead>
                    <TableHead className="text-yellow-400">Trạng thái</TableHead>
                    <TableHead className="text-yellow-400 text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userData.subscriptions.map(sub => (
                    <TableRow key={sub._id} className="border-gray-600">
                      <TableCell>
                        {sub.hasFullAccess ? 
                          <Badge className="bg-blue-500">Full Access</Badge> : 
                          <Badge className="bg-green-600">Bài lẻ</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-gray-300">
                          {sub.subscribedItem?.title || (sub.hasFullAccess ? 'Tất cả nội dung' : 'N/A')}
                      </TableCell>
                      <TableCell>
                        {sub.isActive ? 
                          <Badge variant="outline" className="border-green-500 text-green-400">Active</Badge> : 
                          <Badge variant="outline" className="border-red-500 text-red-400">Inactive</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(sub._id)} disabled={isProcessing} aria-label="Toggle Status">
                           {sub.isActive ? <PowerOff className="h-4 w-4 text-orange-400"/> : <Power className="h-4 w-4 text-green-400"/>}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(sub)} disabled={isProcessing} aria-label="Delete Subscription">
                           <Trash2 className="h-4 w-4 text-red-500"/>
                        </Button>
                      </TableCell>
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
      
      {/* Modal Xác Nhận Xóa */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white">Xác nhận Xóa</h3>
            <p className="my-4 text-gray-300">
              Bạn có chắc chắn muốn xóa vĩnh viễn gói đăng ký <br/>
              <span className="font-bold text-yellow-400">
                {deleteConfirm.hasFullAccess ? "Full Access" : `"${deleteConfirm.subscribedItem?.title || 'này'}"`}
              </span>?
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="text-white border-gray-500">Hủy</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isProcessing}>
                {isProcessing ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

// This export is needed for your project, but won't be used in this isolated environment.
// In a real project, you would have a file structure where `useNavigate` would be available.
// For now, we mock it to prevent further errors.
const useNavigate = () => (path: string) => {
  console.log(`Navigating to ${path}`);
};

export default AdminUserSubscriptionsPage;
