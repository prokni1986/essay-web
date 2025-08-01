// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from '@/components/Layout';
import { toast } from 'sonner';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    console.log("Đang gửi đăng ký với:");
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password ? '********' : 'Không có mật khẩu');
    console.log("Confirm Password:", confirmPassword ? '********' : 'Không có xác nhận mật khẩu');

    // TypeScript giờ sẽ hiểu `result` là AuthResult
    const result = await register(username, email, password);

    console.log("Kết quả đăng ký:", result);

    if (result.success) { // Kiểm tra thuộc tính 'success'
      toast.success(result.message || 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } else {
      toast.error(result.message || 'Đăng ký thất bại. Vui lòng thử lại.'); // Truy cập thuộc tính 'message'
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-center text-yellow-400">Đăng Ký Tài Khoản</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-300">Tên người dùng</Label>
              <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                     className="mt-1 block w-full bg-gray-700 border-gray-600 text-white" placeholder="yourusername" />
            </div>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                     className="mt-1 block w-full bg-gray-700 border-gray-600 text-white" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password"className="block text-sm font-medium text-gray-300">Mật khẩu</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                     className="mt-1 block w-full bg-gray-700 border-gray-600 text-white" placeholder="••••••••" />
            </div>
            <div>
              <Label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-300">Xác nhận mật khẩu</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                     className="mt-1 block w-full bg-gray-700 border-gray-600 text-white" placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900">
              {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
            </Button>
          </form>
          <p className="text-sm text-center text-gray-400">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-yellow-400 hover:text-yellow-300">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;