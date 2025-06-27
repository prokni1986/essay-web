import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './NewsManagement.css';
import axiosInstance from '../lib/axiosInstance';

// --- Interfaces ---
interface Tag {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface NewsArticle {
  _id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl?: string;
  status: 'draft' | 'published';
  createdAt: string;
  tags?: Tag[];
}

interface Notice {
  _id: string;
  title: string;
  description?: string;
  type: string;
  order?: number;
}

// --- Helper Function ---
function slugify(text: string): string {
    const a = 'àáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳýỵỷỹ';
    const b = 'aaaaaeeeiioooouuadiiuouaaaaaaaaaaaaaaaeeeeeeeeeeiiooooooooooooooouuuuuuuuuuyyyyy';
    const p = new RegExp(a.split('').join('|'), 'g');
    return text.toString().toLowerCase()
      .replace(p, c => b.charAt(a.indexOf(c)))
      .replace(/<[^>]*>/g, '').replace(/&/g, '-and-')
      .replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
}

// --- Component Chính ---
const NewsManagement: React.FC = () => {
  // State chung
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'news' | 'tags' | 'schedules'>('news');

  // State cho quản lý bài viết
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<NewsArticle> | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  
  // State cho quản lý Tags
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState<string>('');
  const [isSubmittingTag, setIsSubmittingTag] = useState<boolean>(false);

  // State cho Lịch thi
  const [examSchedules, setExamSchedules] = useState<Notice[]>([]);
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleDesc, setNewScheduleDesc] = useState('');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  // --- Fetch Dữ liệu ---
  const fetchArticles = useCallback(async () => {
    const response = await axiosInstance.get('/api/news/admin/all');
    setArticles(response.data);
  }, []);

  const fetchTags = useCallback(async () => {
    const response = await axiosInstance.get('/api/tags');
    setAllTags(response.data.sort((a: Tag, b: Tag) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);
  
  const fetchSchedules = useCallback(async () => {
    const response = await axiosInstance.get('/api/notices?type=exam_schedule');
    setExamSchedules(response.data);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchArticles(), fetchTags(), fetchSchedules()]);
            setError(null);
        } catch (err) {
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchInitialData();
  }, [fetchArticles, fetchTags, fetchSchedules]);

  // --- Logic cho Quản lý Bài viết ---
  useEffect(() => {
    if (!currentArticle?._id && !isSlugManuallyEdited) setSlug(slugify(title));
  }, [title, currentArticle, isSlugManuallyEdited]);
  
  const resetNewsForm = () => {
    setTitle(''); setSlug(''); setContent(''); setStatus('draft');
    setThumbnailFile(null); setCurrentArticle(null);
    setIsSlugManuallyEdited(false); setSelectedTags([]);
  };

  const handleOpenModal = (article?: NewsArticle) => {
    if (article) {
      setCurrentArticle(article); setTitle(article.title);
      setSlug(article.slug); setContent(article.content);
      setStatus(article.status);
      setSelectedTags(article.tags?.map(tag => tag._id) || []);
      setIsSlugManuallyEdited(true);
    } else {
      resetNewsForm();
    }
    setThumbnailFile(null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => { setIsModalOpen(false); resetNewsForm(); };
  
  const handleNewsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) return alert('Vui lòng điền đủ Tiêu đề, Slug và Nội dung.');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('content', content);
    formData.append('status', status);
    formData.append('tags', JSON.stringify(selectedTags));
    if (thumbnailFile) formData.append('image', thumbnailFile);

    try {
      if (currentArticle?._id) {
        await axiosInstance.put(`/api/news/admin/${currentArticle._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Cập nhật thành công!');
      } else {
        await axiosInstance.post('/api/news/admin', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Tạo mới thành công!');
      }
      fetchArticles();
      handleCloseModal();
    } catch (err) {
      let message = 'Lỗi không xác định';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      alert(`Thao tác thất bại: ${message}`);
    }
  };

  const handleNewsDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      try {
        await axiosInstance.delete(`/api/news/admin/${id}`);
        alert('Đã xóa bài viết.');
        fetchArticles();
      } catch (err) {
        alert('Không thể xóa bài viết.');
      }
    }
  };
  
  // --- Logic cho Quản lý Tags ---
  const handleTagSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return alert('Vui lòng nhập tên tag.');
    setIsSubmittingTag(true);
    try {
      await axiosInstance.post('/api/tags', { name: newTagName });
      setNewTagName('');
      fetchTags();
      alert('Tạo tag mới thành công!');
    } catch (err) {
      let message = 'Đã xảy ra lỗi';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      alert(`Lỗi: ${message}`);
    } finally {
      setIsSubmittingTag(false);
    }
  };

  const handleTagDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa tag này?")) {
      try {
        await axiosInstance.delete(`/api/tags/${id}`);
        fetchTags();
        alert('Đã xóa tag.');
      } catch (err) {
        let message = 'Không thể xóa tag';
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          message = err.response.data.message;
        }
        alert(`Lỗi: ${message}`);
      }
    }
  };

  // --- Logic cho Quản lý Lịch thi ---
  const handleScheduleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newScheduleTitle.trim()) return alert('Vui lòng nhập tiêu đề lịch thi.');
    setIsSubmittingSchedule(true);
    try {
        await axiosInstance.post('/api/notices', {
            title: newScheduleTitle,
            description: newScheduleDesc,
            type: 'exam_schedule'
        });
        setNewScheduleTitle('');
        setNewScheduleDesc('');
        fetchSchedules();
        alert('Thêm lịch thi thành công!');
    } catch (err) {
        let message = 'Lỗi khi thêm lịch thi';
        if (axios.isAxiosError(err) && err.response?.data?.message) message = err.response.data.message;
        alert(`Lỗi: ${message}`);
    } finally {
        setIsSubmittingSchedule(false);
    }
  };

  const handleScheduleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch thi này?")) {
        try {
            await axiosInstance.delete(`/api/notices/${id}`);
            fetchSchedules();
            alert('Đã xóa lịch thi.');
        } catch (err) {
            alert('Không thể xóa lịch thi.');
        }
    }
  };

  // --- Render Component ---
  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="news-management-container">
      <div className="tabs-nav">
        <button onClick={() => setActiveTab('news')} className={activeTab === 'news' ? 'active' : ''}>Quản lý Bài viết</button>
        <button onClick={() => setActiveTab('tags')} className={activeTab === 'tags' ? 'active' : ''}>Quản lý Tags</button>
        <button onClick={() => setActiveTab('schedules')} className={activeTab === 'schedules' ? 'active' : ''}>Quản lý Lịch thi</button>
      </div>

      <div className="tab-content">
        {activeTab === 'news' && (
          <div>
            <div className="header">
              <h1>Danh sách Bài viết</h1>
              <button onClick={() => handleOpenModal()} className="btn-create">+ Tạo bài viết mới</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Trạng thái</th>
                  <th>Tags</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {articles.length > 0 ? articles.map(article => (
                  <tr key={article._id}>
                    <td>{article.title}</td>
                    <td><span className={`status ${article.status}`}>{article.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</span></td>
                    <td>
                        {article.tags && article.tags.length > 0
                            ? article.tags.map(tag => tag.name).join(', ')
                            : '—'
                        }
                    </td>
                    <td>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="actions">
                      <button onClick={() => handleOpenModal(article)} className="btn-edit">Sửa</button>
                      <button onClick={() => handleNewsDelete(article._id)} className="btn-delete">Xóa</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={5}>Không có bài viết nào.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tags' && (
          <div>
             <div className="header"><h1>Quản lý Tags</h1></div>
             <div className="card-form mb-4" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>Tạo Tag Mới</h3>
                <form onSubmit={handleTagSubmit}>
                    <div className="form-group"><label htmlFor="tagName">Tên Tag</label>
                        <input type="text" id="tagName" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-create" disabled={isSubmittingTag}>{isSubmittingTag ? 'Đang tạo...' : '+ Tạo mới'}</button>
                </form>
             </div>
             <table>
              <thead><tr><th>Tên Tag</th><th>Đường dẫn (Slug)</th><th>Ngày tạo</th><th>Hành động</th></tr></thead>
              <tbody>
                {allTags.length > 0 ? allTags.map(tag => (
                  <tr key={tag._id}>
                    <td>{tag.name}</td>
                    <td>{tag.slug}</td>
                    <td>{new Date(tag.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="actions"><button onClick={() => handleTagDelete(tag._id)} className="btn-delete">Xóa</button></td>
                  </tr>
                )) : <tr><td colSpan={4}>Chưa có tag nào.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'schedules' && (
          <div>
            <div className="header"><h1>Quản lý Lịch thi quan trọng</h1></div>
            <div className="card-form mb-4" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3>Thêm Lịch thi mới</h3>
                <form onSubmit={handleScheduleSubmit}>
                    <div className="form-group">
                        <label htmlFor="scheduleTitle">Tiêu đề</label>
                        <input type="text" id="scheduleTitle" value={newScheduleTitle} onChange={(e) => setNewScheduleTitle(e.target.value)} placeholder="VD: Lịch thi THPT Quốc gia 2025" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="scheduleDesc">Mô tả (tùy chọn)</label>
                        <input type="text" id="scheduleDesc" value={newScheduleDesc} onChange={(e) => setNewScheduleDesc(e.target.value)} placeholder="VD: Từ ngày 26/06 đến 28/06/2025"/>
                    </div>
                    <button type="submit" className="btn-create" disabled={isSubmittingSchedule}>
                        {isSubmittingSchedule ? 'Đang thêm...' : '+ Thêm lịch thi'}
                    </button>
                </form>
            </div>
            <table>
              <thead><tr><th>Tiêu đề</th><th>Mô tả</th><th>Hành động</th></tr></thead>
              <tbody>
                {examSchedules.length > 0 ? examSchedules.map(schedule => (
                  <tr key={schedule._id}>
                    <td>{schedule.title}</td>
                    <td>{schedule.description || '—'}</td>
                    <td className="actions">
                        <button onClick={() => handleScheduleDelete(schedule._id)} className="btn-delete">Xóa</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={3}>Chưa có lịch thi nào.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{currentArticle?._id ? `Chỉnh sửa: ${title}` : 'Tạo bài viết mới'}</h2>
            <form onSubmit={handleNewsSubmit}>
                <div className="form-group"><label>Tiêu đề</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                <div className="form-group"><label>Đường dẫn (Slug)</label><input type="text" value={slug} onChange={(e) => {setSlug(e.target.value); setIsSlugManuallyEdited(true);}} required /></div>
                <div className="form-group"><label>Nội dung</label><ReactQuill theme="snow" value={content} onChange={setContent} /></div>
                <div className="form-group"><label>Ảnh bìa</label><input type="file" onChange={(e: ChangeEvent<HTMLInputElement>) => setThumbnailFile(e.target.files ? e.target.files[0] : null)} accept="image/*" /></div>
                <div className="form-group"><label>Trạng thái</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
                        <option value="draft">Bản nháp</option><option value="published">Xuất bản</option>
                    </select>
                </div>
                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-container" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                    {allTags.map(tag => (
                      <div key={tag._id}>
                        <input
                          type="checkbox"
                          id={`tag-${tag._id}`}
                          value={tag._id}
                          checked={selectedTags.includes(tag._id)}
                          onChange={(e) => {
                            const tagId = e.target.value;
                            if (e.target.checked) {
                              setSelectedTags(prev => [...prev, tagId]);
                            } else {
                              setSelectedTags(prev => prev.filter(id => id !== tagId));
                            }
                          }}
                        />
                        <label htmlFor={`tag-${tag._id}`} style={{ marginLeft: '8px' }}>
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-actions">
                    <button type="submit" className="btn-save">Lưu</button>
                    <button type="button" onClick={handleCloseModal} className="btn-cancel">Hủy</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;