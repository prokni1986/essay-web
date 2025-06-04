// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button"; // Giả sử bạn dùng Shadcn UI
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from '@/components/Layout'; // Giả sử bạn có Layout component

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/"; // Để redirect về trang trước đó

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Layout> {/* Hoặc một container phù hợp */}
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-center text-yellow-400">Đăng Nhập</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password"className="block text-sm font-medium text-gray-300">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <Button type="submit" disabled={isLoading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out">
                {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
              </Button>
            </div>
          </form>
          <p className="text-sm text-center text-gray-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" state={{ from: location.state?.from }} className="font-medium text-yellow-400 hover:text-yellow-300">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;