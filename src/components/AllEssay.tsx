import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Essay {
  _id: string;
  title: string;
  content: string;
  audioFiles: string[];
}

const AllEssay: React.FC = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEssays = async () => {
      try {
        const res = await axios.get<Essay[]>('http://localhost:5000/api/essays');
        setEssays(res.data);
      } catch (err) {
        // Có thể bổ sung thông báo lỗi nếu muốn
      } finally {
        setLoading(false);
      }
    };
    fetchEssays();
  }, []);

  if (loading) return <div className="p-4">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Tổng hợp các bài Essay</h1>
      {essays.length === 0 ? (
        <div className="text-center text-gray-600">Chưa có bài luận nào.</div>
      ) : (
        essays.map(essay => (
          <div key={essay._id} className="bg-white p-4 mb-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">{essay.title}</h2>
            <div className="mb-2 whitespace-pre-line">{essay.content}</div>
            {essay.audioFiles && essay.audioFiles.length > 0 && (
              <div className="space-y-2 mt-2">
                {essay.audioFiles.map((file, idx) => (
                  <audio controls key={idx} className="w-full">
                    <source src={`http://localhost:5000/${file}`} />
                    Trình duyệt của bạn không hỗ trợ audio.
                  </audio>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AllEssay;