import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill'; // Thêm React Quill
import 'react-quill/dist/quill.snow.css'; // Thêm CSS của React Quill

// 1. Định nghĩa type Topic
type Topic = {
  _id: string;
  name: string;
};

const AdminUpload = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Nội dung giờ sẽ là HTML từ React Quill
  const [audioFile1, setAudioFile1] = useState<File | null>(null);
  const [audioFile2, setAudioFile2] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  // 2. State cho chủ đề
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // 3. State cho hiệu ứng loading
  const [isUploading, setIsUploading] = useState(false);

  // 4. Tham chiếu đến input file để reset được trường file
  const audioFile1Ref = useRef<HTMLInputElement | null>(null);
  const audioFile2Ref = useRef<HTMLInputElement | null>(null);

  // 5. Lấy danh sách chủ đề khi load trang
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get('http://localhost:5050/api/topics');
        if (Array.isArray(res.data)) {
          setTopics(res.data);
          if (res.data.length > 0) setSelectedTopic(res.data[0]._id);
        } else if (Array.isArray(res.data.topics)) {
          setTopics(res.data.topics);
          if (res.data.topics.length > 0) setSelectedTopic(res.data.topics[0]._id);
        } else if (Array.isArray(res.data.data)) {
          setTopics(res.data.data);
          if (res.data.data.length > 0) setSelectedTopic(res.data.data[0]._id);
        } else {
          setTopics([]);
        }
      } catch (err) {
        setMessage('Không lấy được danh sách chủ đề!');
        setTopics([]);
      }
    };
    fetchTopics();
  }, []);

  // 6. Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setErrorDetails('');
    setIsUploading(true);

    if (!audioFile1 && !audioFile2) {
      setMessage('❌ Vui lòng chọn ít nhất một file âm thanh!');
      setIsUploading(false);
      return;
    }
    if (!selectedTopic) {
      setMessage('❌ Vui lòng chọn chủ đề!');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content); // Nội dung giờ là HTML từ React Quill
    formData.append('topic', selectedTopic);

    if (audioFile1) formData.append('audioFiles', audioFile1);
    if (audioFile2) formData.append('audioFiles', audioFile2);

    try {
      const response = await axios.post('http://localhost:5050/api/essays/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (response.status === 201) {
        setMessage('✅ Upload thành công!');
        setTitle('');
        setContent(''); // Reset nội dung về rỗng
        setAudioFile1(null);
        setAudioFile2(null);
        setSelectedTopic(topics.length > 0 ? topics[0]._id : '');

        // Reset trường file input về rỗng
        if (audioFile1Ref.current) audioFile1Ref.current.value = '';
        if (audioFile2Ref.current) audioFile2Ref.current.value = '';
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage('❌ Đã có lỗi khi upload!');
        setErrorDetails(error.response ? error.response.data : "Lỗi không xác định");
      } else {
        setMessage('❌ Đã có lỗi khi upload!');
        setErrorDetails('Lỗi không xác định');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // 7. Cấu hình toolbar của React Quill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Upload Bài Luận</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">

        {/* Chọn chủ đề */}
        <div className="mb-4">
          <label className="block text-black font-semibold">Chủ đề:</label>
          <select
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
            className="w-full p-2 border border-gray-400 rounded text-black"
            required
          >
            {topics.length === 0 && <option>Không có chủ đề nào</option>}
            {topics.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Tiêu đề */}
        <div className="mb-4">
          <label className="block text-black font-semibold">Tiêu đề:</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-400 rounded text-black text-base"
            required
          />
        </div>

        {/* Nội dung - Sử dụng React Quill thay cho textarea */}
        <div className="mb-4">
          <label className="block text-black font-semibold">Nội dung:</label>
          <ReactQuill
            value={content}
            onChange={setContent}
            modules={quillModules}
            className="bg-white text-black"
            theme="snow"
          />
        </div>

        {/* File âm thanh 1 */}
        <div className="mb-4">
          <label className="block text-black font-semibold">File Âm Thanh 1:</label>
          <input
            ref={audioFile1Ref}
            type="file"
            accept="audio/*"
            onChange={e => setAudioFile1(e.target.files ? e.target.files[0] : null)}
            className="w-full p-2 border border-gray-400 rounded text-black"
          />
          {audioFile1 && <span className="text-sm text-green-700">Đã chọn: {audioFile1.name}</span>}
        </div>

        {/* File âm thanh 2 */}
        <div className="mb-4">
          <label className="block text-black font-semibold">File Âm Thanh 2:</label>
          <input
            ref={audioFile2Ref}
            type="file"
            accept="audio/*"
            onChange={e => setAudioFile2(e.target.files ? e.target.files[0] : null)}
            className="w-full p-2 border border-gray-400 rounded text-black"
          />
          {audioFile2 && <span className="text-sm text-green-700">Đã chọn: {audioFile2.name}</span>}
        </div>

        {/* Progress/loading */}
        {isUploading && (
          <div className="mb-4 flex items-center text-blue-500">
            <svg className="animate-spin mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Đang upload, vui lòng chờ...
          </div>
        )}

        {/* Nút Submit */}
        <button
          type="submit"
          className={`bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isUploading}
        >
          Upload
        </button>

        {/* Thông báo */}
        {message && <p className={`mt-4 ${message.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
        {errorDetails && <p className="mt-2 text-red-600">Chi tiết lỗi: {errorDetails}</p>}
      </form>
    </div>
  );
};

export default AdminUpload;