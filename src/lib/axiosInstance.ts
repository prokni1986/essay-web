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
    const token = localStorage.getItem('authToken');

    if (token) {
      // ĐẢM BẢO TIỀN TỐ "Bearer " ĐƯỢC THÊM VÀO.
      // Nếu token đã có "Bearer ", nó sẽ không ảnh hưởng. Nếu chưa, nó sẽ thêm vào.
      config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
