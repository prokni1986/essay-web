// File: src/contexts/AuthContext.ts
import { createContext } from 'react';

// Định nghĩa các kiểu dữ liệu
export interface User {
  id: string; // Đảm bảo khớp với _id nếu từ MongoDB
  email: string;
  username: string;
  role: 'user' | 'admin';
}

// Định nghĩa kiểu trả về cho các hàm login/register
export interface AuthResult {
  success: boolean;
  message?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<AuthResult>; // Sửa kiểu trả về
  register: (username: string, email: string, password: string) => Promise<AuthResult>; // Sửa kiểu trả về
  logout: () => void;
  userRole?: 'user' | 'admin' | null;
}

// Tạo và export Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);