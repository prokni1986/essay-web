// File: src/contexts/AuthProvider.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'sonner';
import { AuthContext, AuthContextType, User } from './AuthContext';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axiosInstance.get('/api/auth/me');
          console.log("AuthProvider received user data:", response.data.user); // <-- CHECK THIS LOG
          setUser(response.data.user);
        } catch (error) {
          console.error("Token invalid, removing token.", error);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkAuthStatus();
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { email: emailOrUsername, password });
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success(`Chào mừng trở lại, ${user.username}!`);
      return true;
    } catch (err) {
      let errorMessage = 'Đăng nhập thất bại.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    toast.info("Chức năng đăng ký chưa được cài đặt.");
    return false;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Bạn đã đăng xuất thành công.');
  };

  const authContextValue: AuthContextType = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    register,
    logout,
    userRole: user ? user.role : null, // <-- THÊM DÒNG NÀY ĐỂ TRUYỀN GIÁ TRỊ userRole
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};