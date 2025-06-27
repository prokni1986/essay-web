// File: src/contexts/AuthContext.ts
import { createContext } from 'react';

// Định nghĩa các kiểu dữ liệu
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin'; // Đảm bảo role được định nghĩa ở đây
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  userRole?: 'user' | 'admin' | null; // <-- THÊM DÒNG NÀY ĐỂ KHẮC PHỤC LỖI
                                     // Dùng kiểu cụ thể cho role và có thể là null/undefined
}

// Tạo và export Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);