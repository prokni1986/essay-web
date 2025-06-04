// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../lib/axiosInstance'; // Đường dẫn tới axiosInstance của bạn
import { toast } from 'sonner'; // Hoặc react-hot-toast

interface User {
  id: string;
  username: string;
  email: string;
  // roles?: string[]; // Nếu bạn có roles
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // loadUserFromToken: () => Promise<void>; // Có thể không cần nếu chỉ dựa vào token
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true); // Để kiểm tra token ban đầu

  useEffect(() => {
    const validateTokenAndLoadUser = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        // Gửi token này tới một endpoint backend để xác thực và lấy thông tin user
        // Ví dụ: endpoint /api/auth/me (bạn cần tạo endpoint này ở backend)
        try {
          // axiosInstance đã tự động gắn token vào header
          const response = await axiosInstance.get('/api/auth/me'); // Backend trả về user info
          if (response.data && response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
            toast.success(`Chào mừng trở lại, ${response.data.user.username}!`);
          } else {
            // Token không hợp lệ hoặc không lấy được user
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Failed to validate token or load user:', error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          // Không nên toast lỗi ở đây vì nó sẽ hiện mỗi khi refresh nếu token cũ
        }
      }
      setIsLoading(false);
    };

    validateTokenAndLoadUser();
  }, []);


  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email: emailOrUsername, // Backend của bạn đang dùng 'email' làm usernameField
        password,
      });
      if (response.data && response.data.token && response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success(response.data.message || 'Đăng nhập thành công!');
        setIsLoading(false);
        return true;
      }
      throw new Error(response.data.message || 'Thông tin đăng nhập không hợp lệ.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Giả sử backend trả về errors là một mảng object { msg: '...' }
      const response = await axiosInstance.post('/api/auth/register', {
        username,
        email,
        password,
        password2: password, // Backend route register của bạn có thể cần password2
      });
      toast.success(response.data.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((err: { msg: string }) => err.msg).join('\n');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage, { duration: 5000 });
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Bạn đã đăng xuất.');
    // Có thể cần gọi API backend /api/auth/logout nếu bạn có xử lý session phía server
    // Hoặc nếu JWT là HttpOnly cookie thì backend phải xóa nó.
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};