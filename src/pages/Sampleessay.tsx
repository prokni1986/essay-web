import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Still needed for axios.isAxiosError
import axiosInstance from '../lib/axiosInstance'; // Import axiosInstance
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';

// Helper function
const stripHtml = (html: string): string => {
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
  return '';
};

interface Essay {
  _id: string;
  title: string;
  outline?: string;
  content: string;
  essay2?: string;
  essay3?: string;
  audioFiles?: string[];
  topic?: string | { _id: string; name: string } | null;
}

const SampleEssay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topicName, setTopicName] = useState<string>('');
  const [topicId, setTopicId] = useState<string>('');

  useEffect(() => {
    const fetchEssay = async () => {
      if (!id) {
        setError('ID bài luận không hợp lệ.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        // Use axiosInstance and relative path
        const response = await axiosInstance.get<Essay>(`/api/essays/${id}`);
        setEssay(response.data);

        if (response.data.topic) {
          if (typeof response.data.topic === 'string') {
            setTopicId(response.data.topic);
          } else if (
            typeof response.data.topic === 'object' &&
            response.data.topic !== null &&
            '_id' in response.data.topic
          ) {
            setTopicId(response.data.topic._id);
            setTopicName(response.data.topic.name || '');
          } else {
            setTopicId('');
            setTopicName('');
          }
        } else {
            setTopicId('');
            setTopicName('');
        }
      } catch (err) {
        console.error("Lỗi khi tải bài luận:", err);
        if (axios.isAxiosError(err) && err.response?.status === 404) { // axios.isAxiosError is still valid
            setError('Không tìm thấy bài luận được yêu cầu.');
        } else {
            setError('Không thể tải chi tiết bài luận. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEssay();
  }, [id]);

  useEffect(() => {
    if (topicId && (!topicName || (essay?.topic && typeof essay.topic === 'string' && essay.topic === topicId))) {
      // Use axiosInstance and relative path
      axiosInstance
        .get<{ name: string }>(`/api/topics/${topicId}`)
        .then(res => setTopicName(res.data.name || 'Chủ đề không tên'))
        .catch(() => {
            console.warn(`Không thể tải tên cho chủ đề ID: ${topicId}`);
            setTopicName('Chủ đề không xác định');
        });
    }
  }, [topicId, essay?.topic, topicName]);

  const getShortTitle = (title: string | undefined, maxLength: number = 30) => {
    if (!title) return '';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trimEnd() + '...';
  };

  const renderAudioPlayer = (audioSrc: string | undefined) => {
    if (!audioSrc) return null;
    return (
      <audio
        controls
        controlsList="nodownload"
        className="rounded-lg custom-audio-controls"
        style={{ maxWidth: '280px', minWidth: '220px' }}
      >
        <source src={audioSrc} />
        Trình duyệt của bạn không hỗ trợ phát audio.
      </audio>
    );
  };

  if (loading) {
    return (
      <Layout>
        <section className="py-10 px-4 text-center" style={{ background: "#23232b", minHeight: "100vh" }}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl mb-8">
              <h1 className="text-3xl font-bold text-white">Đang tải chi tiết bài luận...</h1>
              <div className="mt-6 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-yellow-400 motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="py-10 px-4 text-center" style={{ background: "#23232b", minHeight: "100vh" }}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl mb-8">
              <h1 className="text-3xl font-bold text-red-500 mb-4">Lỗi</h1>
              <p className="text-gray-300 mb-6">{error}</p>
              <Link to="/essays" className="mt-4 inline-block text-yellow-400 hover:underline font-semibold py-2 px-4 border border-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-gray-900 transition-colors">
                Quay lại Thư viện Bài luận
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (!essay) {
    return (
      <Layout>
        <section className="py-10 px-4 text-center" style={{ background: "#23232b", minHeight: "100vh" }}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#23232b] rounded-2xl px-8 py-10 shadow-xl mb-8">
              <h1 className="text-3xl font-bold text-gray-400">Không tìm thấy bài luận</h1>
               <Link to="/essays" className="mt-6 inline-block text-yellow-400 hover:underline font-semibold py-2 px-4 border border-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-gray-900 transition-colors">
                Quay lại Thư viện Bài luận
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const pageTitle = essay?.title || "Chi tiết Bài luận";

  return (
    <Layout>
      {/* Hero section */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#23232b] rounded-2xl px-8 py-6 shadow-xl mb-0">
            <nav className="mb-10 text-sm flex flex-wrap items-center text-gray-400 space-x-1 md:space-x-2">
              <Link to="/" className="hover:underline text-yellow-400 font-semibold">Trang chủ</Link>
              <span className="mx-1 text-gray-400">/</span>
              <Link to="/essays" className="hover:underline text-yellow-400 font-semibold">Thư viện Bài luận</Link>
              {topicId && topicName && topicName !== 'Chủ đề không xác định' && topicName !== 'Chủ đề không tên' && (
                <>
                  <span className="mx-1 text-gray-400">/</span>
                  <Link to={`/topic/${topicId}`} className="hover:underline text-yellow-400 font-semibold">
                    {topicName}
                  </Link>
                </>
              )}
              <span className="mx-1 text-gray-400">/</span>
              <span className="text-gray-200 font-semibold truncate" title={essay?.title}>
                {getShortTitle(essay.title)}
              </span>
            </nav>
            <h1 className="text-2xl md:text-2xl font-heading font-bold mb-3 text-white text-justify break-words">
              {pageTitle}
            </h1>
          </div>
        </div>
      </section>

      {/* Nội dung bài luận chi tiết */}
      <section className="py-4 px-4 bg-[#18181B]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#18181B] shadow-2xl rounded-2xl p-6 md:p-0 mb-10">
            <article>
              {essay.outline && (
                <details className="essay-section mt-10" >
                  <summary className="flex items-center justify-between border-b border-gray-700 py-3 px-3 cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181B] rounded-md group summary-interactive mb-0">
                    <div className="flex items-center group-hover:text-yellow-400 transition-colors duration-150">
                        <span className="mr-3 text-yellow-400 text-xl transition-transform duration-200 ease-in-out transform disclosure-arrow">❯</span>
                        <h2 className="text-2xl font-semibold text-yellow-400">Dàn ý chi tiết</h2>
                    </div>
                    <div className="flex items-center flex-shrink-0 ml-4">
                        {renderAudioPlayer(essay.audioFiles?.[0])}
                    </div>
                  </summary>
                  <div
                    className="mt-2 p-3 px-8 bg-gray-700/30 rounded prose prose-invert prose-lg max-w-none text-gray-200 text-justify"
                    style={{ lineHeight: '1.85', fontSize: '1.1rem' }}
                    dangerouslySetInnerHTML={{ __html: essay.outline }}
                  />
                </details>
              )}

              <details className="essay-section" >
                <summary className="flex items-center justify-between border-b border-gray-700 py-3 px-3 cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181B] rounded-md group summary-interactive mb-0">
                  <div className="flex items-center group-hover:text-yellow-400 transition-colors duration-150">
                    <span className="mr-3 text-yellow-400 text-xl transition-transform duration-200 ease-in-out transform disclosure-arrow">❯</span>
                    <h2 className="text-2xl font-semibold text-yellow-400">Bài luận tham khảo 1</h2>
                  </div>
                  <div className="flex items-center flex-shrink-0 ml-4">
                    {renderAudioPlayer(essay.audioFiles?.[1])}
                  </div>
                </summary>
                <div
                  className="mt-2 p-3 px-8 bg-gray-700/30 rounded prose prose-invert prose-lg max-w-none text-gray-200 text-justify"
                  style={{ lineHeight: '1.85', fontSize: '1.1rem' }}
                  dangerouslySetInnerHTML={{ __html: essay.content }}
                />
              </details>

              {essay.essay2 && (
                <details className="essay-section">
                  <summary className="flex items-center justify-between border-b border-gray-700 py-3 px-3 cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181B] rounded-md group summary-interactive mb-0">
                    <div className="flex items-center group-hover:text-yellow-400 transition-colors duration-150">
                        <span className="mr-3 text-yellow-400 text-xl transition-transform duration-200 ease-in-out transform disclosure-arrow">❯</span>
                        <h2 className="text-2xl font-semibold text-yellow-400">Bài luận tham khảo 2</h2>
                    </div>
                    <div className="flex items-center flex-shrink-0 ml-4">
                        {renderAudioPlayer(essay.audioFiles?.[2])}
                    </div>
                  </summary>
                  <div
                    className="mt-2 p-3 px-8 bg-gray-700/30 rounded prose prose-invert prose-lg max-w-none text-gray-200 text-justify"
                    style={{ lineHeight: '1.85', fontSize: '1.1rem' }}
                    dangerouslySetInnerHTML={{ __html: essay.essay2 }}
                  />
                </details>
              )}

              {essay.essay3 && (
                <details className="essay-section">
                  <summary className="flex items-center justify-between border-b border-gray-700 py-3 px-3 cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181B] rounded-md group summary-interactive mb-0">
                     <div className="flex items-center group-hover:text-yellow-400 transition-colors duration-150">
                        <span className="mr-3 text-yellow-400 text-xl transition-transform duration-200 ease-in-out transform disclosure-arrow">❯</span>
                        <h2 className="text-2xl font-semibold text-yellow-400">Bài luận tham khảo 3</h2>
                    </div>
                     <div className="flex items-center flex-shrink-0 ml-4">
                        {renderAudioPlayer(essay.audioFiles?.[3])}
                    </div>
                  </summary>
                  <div
                    className="mt-2 p-3 px-8 bg-gray-700/30 rounded prose prose-invert prose-lg max-w-none text-gray-200 text-justify"
                    style={{ lineHeight: '1.85', fontSize: '1.1rem' }}
                    dangerouslySetInnerHTML={{ __html: essay.essay3 }}
                  />
                </details>
              )}
            </article>
          </div>
        </div>
      </section>
      <style>{`
        .custom-audio-controls {
          filter: invert(1) brightness(0.8) hue-rotate(180deg) saturate(0.5);
        }
        
        .essay-section + .essay-section {
            margin-top: 0.5rem;
            padding-top: 0; 
            border-top: none; 
        }
        
        summary {
          list-style: none; 
        }
        summary::-webkit-details-marker {
          display: none; 
        }
        summary::marker {
          display: none; 
        }

        .disclosure-arrow {
          transition: transform 0.2s ease-in-out;
          display: inline-block; 
        }
        details summary div.group-hover\\:text-yellow-300 h2,
        details summary div.group-hover\\:text-yellow-300 .disclosure-arrow {
            color: #fef08a !important;
        }
        details summary h2 {
             color: #fde047; 
        }
        details summary .disclosure-arrow {
             color: #fde047; 
        }

        details[open] > summary .disclosure-arrow {
          transform: rotate(90deg);
        }

        details[open] > summary.summary-interactive {
          background-color: rgba(42, 42, 51, 0.5); 
        }

        .prose-invert {
            --tw-prose-body: #d1d5db; 
            --tw-prose-headings: #ffffff; 
            --tw-prose-lead: #9ca3af; 
            --tw-prose-links: #fde047; 
            --tw-prose-bold: #ffffff; 
            --tw-prose-counters: #9ca3af; 
            --tw-prose-bullets: #4b5563; 
            --tw-prose-hr: #374151; 
            --tw-prose-quotes: #e5e7eb; 
            --tw-prose-quote-borders: #374151; 
            --tw-prose-captions: #9ca3af; 
            --tw-prose-code: #ffffff; 
            --tw-prose-pre-code: #d1d5db; 
            --tw-prose-pre-bg: #1f2937; 
            --tw-prose-th-borders: #4b5563; 
            --tw-prose-td-borders: #374151; 
        }
        .prose-invert a { color: var(--tw-prose-links); }
        .prose-invert strong { color: var(--tw-prose-bold); }
        body { 
          font-family: 'Inter', sans-serif; 
        }
        .font-heading { 
          font-family: 'Georgia', serif; 
        }
      `}</style>
    </Layout>
  );
};

export default SampleEssay;