import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';
import Layout from '@/components/Layout';

// Interface cho Lịch thi/Notice
interface Schedule {
  _id: string;
  title: string;
  description?: string;
  province?: string;
  createdAt: string;
}

const LichThiPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State cho các bộ lọc
  const [keyword, setKeyword] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  // Hàm để fetch dữ liệu lịch thi dựa trên các bộ lọc
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: 'exam_schedule',
      });
      if (keyword) {
        params.append('keyword', keyword);
      }
      if (selectedProvince) {
        params.append('province', selectedProvince);
      }

      const response = await axiosInstance.get(`/api/notices`, { params });
      setSchedules(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu lịch thi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedProvince]);

  // Fetch dữ liệu lần đầu (danh sách tỉnh và lịch thi ban đầu)
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [schedulesRes, provincesRes] = await Promise.all([
          axiosInstance.get('/api/notices?type=exam_schedule'),
          axiosInstance.get('/api/notices/provinces')
        ]);
        setSchedules(schedulesRes.data);
        setProvinces(provincesRes.data);
      } catch (err) {
        setError('Không thể tải dữ liệu trang.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Gọi lại hàm search khi người dùng thay đổi bộ lọc
  // (useEffect này được tách riêng để không load lại danh sách tỉnh mỗi lần tìm kiếm)
  useEffect(() => {
    // Dùng debounce để tránh gọi API liên tục khi người dùng gõ
    const handler = setTimeout(() => {
        fetchSchedules();
    }, 500); // Chờ 500ms sau khi người dùng ngừng gõ

    return () => {
        clearTimeout(handler);
    };
  }, [keyword, selectedProvince, fetchSchedules]);


  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Tra cứu Lịch thi</h1>
          <p className="text-lg text-muted-foreground mt-2">Tìm kiếm lịch thi tuyển sinh, thi tốt nghiệp trên cả nước.</p>
        </div>

        {/* --- Thanh tìm kiếm và bộ lọc --- */}
        <div className="bg-card shadow-md rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
            <input
              type="text"
              placeholder="Nhập từ khóa (VD: tốt nghiệp, lớp 10...)"
              className="w-full pl-12 pr-4 py-3 border rounded-lg bg-background"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto md:min-w-[200px]">
            <select
              className="w-full px-4 py-3 border rounded-lg bg-background"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
            >
              <option value="">Tất cả Tỉnh/Thành</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- Khu vực hiển thị kết quả --- */}
        <div>
          {loading && <div className="text-center py-10">Đang tải kết quả...</div>}
          {error && <div className="text-center py-10 text-destructive">{error}</div>}
          
          {!loading && !error && (
            schedules.length > 0 ? (
              <div className="space-y-4">
                {schedules.map(schedule => (
                  <div key={schedule._id} className="bg-card border rounded-lg p-5 flex items-start gap-4">
                     <div className="bg-primary/10 text-primary rounded-lg p-3 text-xl mt-1"><i className="fas fa-calendar-check"></i></div>
                     <div>
                        <h3 className="font-bold text-lg text-foreground">{schedule.title}</h3>
                        {schedule.description && <p className="text-muted-foreground mt-1">{schedule.description}</p>}
                        {schedule.province && <p className="text-sm font-semibold text-primary mt-2">{schedule.province}</p>}
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-card rounded-lg">
                <p className="text-muted-foreground">Không tìm thấy kết quả phù hợp.</p>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LichThiPage;