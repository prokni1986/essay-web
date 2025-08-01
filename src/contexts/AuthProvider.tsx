// File: src/contexts/AuthProvider.tsx
import React, { useState, useEffect, ReactNode, useCallback, useMemo } from 'react'; // Thêm useMemo
import axios from 'axios';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'sonner';
import { AuthContext, AuthContextType, User, AuthResult } from './AuthContext';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Không cần state isAuthenticated riêng biệt nữa, nó sẽ được dẫn xuất từ user

  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const response = await axiosInstance.get('/api/auth/me');
        console.log("AuthProvider received user data:", response.data.user);
        setUser(response.data.user);
      } catch (error) {
        console.error("Token invalid, removing token.", error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (emailOrUsername: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/login', { email: emailOrUsername, password });
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user); // Cập nhật user state
      toast.success(`Chào mừng trở lại, ${user.username}!`);
      return { success: true, message: `Chào mừng trở lại, ${user.username}!` };
    } catch (err) {
      let errorMessage = 'Đăng nhập thất bại.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/register', { username, email, password });
      toast.success(response.data.message || 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      return { success: true, message: response.data.message };
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null); // Xóa user state
    toast.success('Bạn đã đăng xuất thành công.');
  }, []);

  const authContextValue: AuthContextType = useMemo(() => ({
    isAuthenticated: !!user, // Dẫn xuất từ user state
    user,
    isLoading,
    login,
    register,
    logout,
    userRole: user ? user.role : null,
  }), [user, isLoading, login, register, logout]); // Dependencies chỉ còn user, isLoading, và các hàm callback

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};