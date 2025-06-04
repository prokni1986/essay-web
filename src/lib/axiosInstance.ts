// file: lib/axiosInstance.ts (hoặc đường dẫn tương tự trong dự án React của bạn)
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Lấy base URL từ biến môi trường Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sử dụng interceptor để thêm token vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (hoặc nơi bạn lưu trữ token sau khi đăng nhập)
    // Giả sử bạn lưu token với key là 'authToken'
    const token = localStorage.getItem('authToken');

    if (token) {
      // Gắn token vào header Authorization
      // Backend của bạn mong đợi token theo định dạng "Bearer <token>"
      config.headers['Authorization'] = token; // Token đã bao gồm "Bearer " khi bạn lưu từ response của API login
    }
    return config;
  },
  (error) => {
    // Xử lý lỗi request
    return Promise.reject(error);
  }
);

// (Tùy chọn) Bạn cũng có thể thêm interceptor cho response để xử lý lỗi chung
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Xử lý lỗi 401 (Unauthorized) - ví dụ: redirect về trang login, xóa token cũ
//       console.error("Unauthorized! Redirecting to login...");
//       localStorage.removeItem('authToken');
//       // window.location.href = '/login'; // Hoặc sử dụng React Router để điều hướng
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;