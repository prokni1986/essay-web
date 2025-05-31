import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';

// Helpers
const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};
const getFirstParagraph = (html: string) => {
  const match = html.match(/<p.*?>(.*?)<\/p>/is);
  if (match && match[1]) return stripHtml(match[1]);
  return stripHtml(html).split('\n')[0] || '';
};

interface Essay {
  _id: string;
  title: string;
  content: string;
  topic?: string | { _id: string; name: string } | null;
}

const EssaysByTopic: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [topicName, setTopicName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        let name = '';
        try {
          const topicRes = await axios.get(`http://localhost:5050/api/topics/${topicId}`);
          name = topicRes.data?.name || '';
        } catch {
          name = '';
        }
        setTopicName(name);
        const res = await axios.get<Essay[]>(`http://localhost:5050/api/essays?topic=${topicId}`);
        setEssays(res.data);
      } catch {
        setError('Không thể tải danh sách bài luận.');
      } finally {
        setLoading(false);
      }
    };
    if (topicId) fetchData();
  }, [topicId]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-10 px-4" style={{ background: "#23232b" }}>
        <div className="max-w-5xl mx-auto">
          {/* HERO section */}
          <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl mb-8">
            <nav className="mb-6 text-sm flex flex-wrap items-center text-light/80 space-x-2">
              <Link to="/" className="hover:underline text-yellow-400 font-semibold">Trang chủ</Link>
              <span className="mx-1 text-gray-400">/</span>
              <Link to="/alltopic" className="hover:underline text-yellow-400 font-semibold">Tất cả chủ đề</Link>
              <span className="mx-1 text-gray-400">/</span>
              <span className="text-light/90 font-semibold">{topicName || topicId}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3 text-white text-center">
              Bài luận chủ đề: <span style={{ color: "#fde047" }}>{topicName || topicId}</span>
            </h1>
            <p className="text-center mb-0 text-gray-300" style={{ fontSize: "1.15rem" }}>
              Dưới đây là danh sách các bài luận tiêu biểu của chủ đề này.
            </p>
          </div>

          {/* GRID bài luận */}
          <ul className="space-y-8">
            {essays.map((essay, idx) => (
              <li
                key={essay._id}
                className="bg-[#18181B] rounded-2xl shadow-lg overflow-hidden transition-all duration-200 hover:scale-[1.02] px-0"
              >
                <Link to={`/sampleessay/${essay._id}`} className="block">
                  <div className="flex items-center gap-3 px-8 pt-7 pb-2">
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#2563EB',  // Xanh dương hoặc vàng tươi "#fde047"
                      color: '#fff',
                      width: '2.3rem',
                      height: '2.3rem',
                      borderRadius: '50%',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      userSelect: 'none',
                      flexShrink: 0,
                      lineHeight: '1',
                      boxSizing: 'border-box'
                    }}>
                      {idx + 1}
                    </span>
                    <h2 className="text-2xl font-bold text-white mb-0">{essay.title}</h2>
                  </div>
                  <div className="px-8 pb-7 pt-0">
                    <p className="text-gray-200 text-base mb-2">
                      {getFirstParagraph(essay.content)}
                    </p>
                    <span className="inline-block mt-1 text-yellow-300 font-semibold hover:underline">
                      Xem chi tiết →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
};

export default EssaysByTopic;