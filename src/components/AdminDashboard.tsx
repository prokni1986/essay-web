// file: src/components/AdminDashboard.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios, { AxiosProgressEvent } from 'axios';
import axiosInstance from '../lib/axiosInstance';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import theme snow mặc định
import { ChevronUp, ChevronDown } from 'lucide-react';

const stripHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

interface Category {
  _id: string;
  name: string;
}
interface Topic {
  _id: string;
  name: string;
  category?: Category | string;
}
interface Essay {
  _id:string;
  title: string;
  outline?: string;
  content: string;
  essay2?: string;
  essay3?: string;
  audioFiles: string[];
  topic?: Topic | string | null;
  createdAt?: string;
  updatedAt?: string;
}

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ],
};
const ITEMS_PER_PAGE_ADMIN = 4;

const AdminDashboard: React.FC = () => {
  const [allFetchedEssays, setAllFetchedEssays] = useState<Essay[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [actualCategoriesForForm, setActualCategoriesForForm] = useState<Category[]>([]);
  const [selectedAdminCategoryFilter, setSelectedAdminCategoryFilter] = useState<string>('Tất cả');
  const [allFetchedTopics, setAllFetchedTopics] = useState<Topic[]>([]);
  const [topicsForFilterDropdown, setTopicsForFilterDropdown] = useState<Topic[]>([]);
  const [editingEssay, setEditingEssay] = useState<Essay | null>(null);
  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState('');
  const [content, setContent] = useState('');
  const [essay2, setEssay2] = useState('');
  const [essay3, setEssay3] = useState('');
  const [selectedCategoryInForm, setSelectedCategoryInForm] = useState<string>('');
  const [topicsForEssayFormDropdown, setTopicsForEssayFormDropdown] = useState<Topic[]>([]);
  const [selectedTopicForm, setSelectedTopicForm] = useState<string>('');
  const [audioFile1, setAudioFile1] = useState<File | null>(null);
  const [audioFile2, setAudioFile2] = useState<File | null>(null);
  const [audioFile3, setAudioFile3] = useState<File | null>(null);
  const [audioFile4, setAudioFile4] = useState<File | null>(null);
  const [isSubmittingEssay, setIsSubmittingEssay] = useState<boolean>(false);
  const [formMessage, setFormMessage] = useState<string>('');
  const [formErrorDetails, setFormErrorDetails] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingEssays, setLoadingEssays] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const audioFile1Ref = useRef<HTMLInputElement | null>(null);
  const audioFile2Ref = useRef<HTMLInputElement | null>(null);
  const audioFile3Ref = useRef<HTMLInputElement | null>(null);
  const audioFile4Ref = useRef<HTMLInputElement | null>(null);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminSelectedTopicFilter, setAdminSelectedTopicFilter] = useState<string>('Tất cả');
  const [adminDisplayedEssays, setAdminDisplayedEssays] = useState<Essay[]>([]);
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [isEssayListVisible, setIsEssayListVisible] = useState(true);

  const fetchMetaData = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const [categoriesRes, topicsRes] = await Promise.all([
        axiosInstance.get<Category[]>('/api/categories'),
        axiosInstance.get<Topic[]>('/api/topics')
      ]);
      const fetchedCategories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      setAllCategories([{ _id: 'Tất cả', name: 'Tất cả Chuyên mục' }, ...fetchedCategories]);
      setActualCategoriesForForm(fetchedCategories);
      const fetchedTopics = Array.isArray(topicsRes.data) ? topicsRes.data : [];
      setAllFetchedTopics(fetchedTopics);
      setTopicsForFilterDropdown([{ _id: 'Tất cả', name: 'Tất cả Chủ đề' }, ...fetchedTopics]);
      if (fetchedCategories.length > 0 && !selectedCategoryInForm) {
         setSelectedCategoryInForm(fetchedCategories[0]._id);
      } else if (fetchedCategories.length === 0 && selectedCategoryInForm !== '') {
        setSelectedCategoryInForm('');
      }
    } catch (error) {
      console.error("Lỗi fetchMetaData (categories/topics):", error);
      setFormMessage('Lỗi');
      setFormErrorDetails('Không thể tải dữ liệu chuyên mục hoặc chủ đề.');
    } finally {
      setLoadingMeta(false);
    }
  }, [selectedCategoryInForm]);

  const fetchEssays = useCallback(async () => {
    setLoadingEssays(true);
    try {
      const response = await axiosInstance.get<Essay[]>('/api/essays');
      setAllFetchedEssays(response.data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (error) {
      setFormMessage('Lỗi');
      setFormErrorDetails('Không thể lấy danh sách bài luận.');
    } finally {
      setLoadingEssays(false);
    }
  }, []);

  useEffect(() => {
    fetchMetaData();
    fetchEssays();
  }, [fetchMetaData, fetchEssays]);

  useEffect(() => {
    if (selectedAdminCategoryFilter === 'Tất cả') {
      setTopicsForFilterDropdown([{ _id: 'Tất cả', name: 'Tất cả Chủ đề' }, ...allFetchedTopics]);
    } else {
      const filtered = allFetchedTopics.filter(topic => {
        const topicCategory = topic.category;
        if (typeof topicCategory === 'object' && topicCategory !== null) {
          return topicCategory._id === selectedAdminCategoryFilter;
        }
        return topicCategory === selectedAdminCategoryFilter;
      });
      setTopicsForFilterDropdown([{ _id: 'Tất cả', name: 'Tất cả Chủ đề (thuộc chuyên mục này)' }, ...filtered]);
    }
    setAdminSelectedTopicFilter('Tất cả');
  }, [selectedAdminCategoryFilter, allFetchedTopics]);

  useEffect(() => {
    if (selectedCategoryInForm && selectedCategoryInForm !== 'Tất cả' && allFetchedTopics.length > 0) {
      const filteredTopics = allFetchedTopics.filter(topic => {
        const topicCategory = topic.category;
        if (typeof topicCategory === 'object' && topicCategory !== null) {
          return topicCategory._id === selectedCategoryInForm;
        }
        return topicCategory === selectedCategoryInForm;
      });
      setTopicsForEssayFormDropdown(filteredTopics);
      if (!editingEssay) {
         setSelectedTopicForm(filteredTopics.length > 0 ? filteredTopics[0]._id : '');
      } else {
        const currentTopicBelongsToNewCategory = filteredTopics.some(t => t._id === selectedTopicForm);
        if (!currentTopicBelongsToNewCategory) {
            setSelectedTopicForm(filteredTopics.length > 0 ? filteredTopics[0]._id : '');
        }
      }
    } else {
      setTopicsForEssayFormDropdown([]);
      if (!editingEssay || (editingEssay && selectedCategoryInForm === '')) {
          setSelectedTopicForm('');
      }
    }
  }, [selectedCategoryInForm, allFetchedTopics, editingEssay, selectedTopicForm]);

  const resetForm = () => {
    setTitle(''); setOutline(''); setContent(''); setEssay2(''); setEssay3('');
    if (actualCategoriesForForm.length > 0) {
      setSelectedCategoryInForm(actualCategoriesForForm[0]._id);
    } else {
      setSelectedCategoryInForm('');
    }
    setAudioFile1(null); setAudioFile2(null); setAudioFile3(null); setAudioFile4(null);
    setEditingEssay(null);
    setFormErrorDetails(''); setFormMessage('');
    setUploadProgress(0);
    setIsSubmittingEssay(false);
    [audioFile1Ref, audioFile2Ref, audioFile3Ref, audioFile4Ref].forEach(ref => {
        if (ref.current) ref.current.value = '';
    });
  };

  const handleEdit = (essay: Essay) => {
    setEditingEssay(essay);
    setTitle(essay.title);
    setOutline(essay.outline || '');
    setContent(essay.content);
    setEssay2(essay.essay2 || '');
    setEssay3(essay.essay3 || '');
    const essayTopic = essay.topic;
    let initialCategoryInForm = '';
    let initialTopicInForm = '';
    if (essayTopic && typeof essayTopic === 'object' && essayTopic._id) {
      initialTopicInForm = essayTopic._id;
      const topicCategory = essayTopic.category;
      if (topicCategory && typeof topicCategory === 'object' && topicCategory._id) {
        initialCategoryInForm = topicCategory._id;
      } else if (typeof topicCategory === 'string') {
        initialCategoryInForm = topicCategory;
      }
    } else if (typeof essayTopic === 'string') {
        initialTopicInForm = essayTopic;
        const foundTopicDetails = allFetchedTopics.find(t => t._id === essayTopic);
        if (foundTopicDetails?.category) {
            const topicCategory = foundTopicDetails.category;
            if (typeof topicCategory === 'object' && topicCategory._id) {
                initialCategoryInForm = topicCategory._id;
            } else if (typeof topicCategory === 'string') {
                initialCategoryInForm = topicCategory;
            }
        }
    }
    if (initialCategoryInForm) {
      setSelectedCategoryInForm(initialCategoryInForm);
      setSelectedTopicForm(initialTopicInForm);
    } else {
      setSelectedCategoryInForm(actualCategoriesForForm.length > 0 ? actualCategoriesForForm[0]._id : '');
    }
    setAudioFile1(null); setAudioFile2(null); setAudioFile3(null); setAudioFile4(null);
    [audioFile1Ref, audioFile2Ref, audioFile3Ref, audioFile4Ref].forEach(ref => {
        if (ref.current) ref.current.value = '';
     });
    setFormErrorDetails(''); setFormMessage(''); setUploadProgress(0);
    setIsSubmittingEssay(false);
    const formElement = document.getElementById('essay-form-section');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(''); setFormErrorDetails(''); setUploadProgress(0);
    if (!title.trim() || !content.trim()) {
        setFormMessage('Lỗi'); setFormErrorDetails('Tiêu đề và Bài luận 1 là bắt buộc.'); return;
    }
    if (!selectedCategoryInForm) {
        setFormMessage('Lỗi'); setFormErrorDetails('Vui lòng chọn một chuyên mục.'); return;
    }
    if (!selectedTopicForm) {
        setFormMessage('Lỗi'); setFormErrorDetails('Vui lòng chọn một chủ đề cho bài luận.'); return;
    }

    setIsSubmittingEssay(true);
    const formData = new FormData();
    formData.append('title', title); formData.append('outline', outline);
    formData.append('content', content); formData.append('essay2', essay2); formData.append('essay3', essay3);
    formData.append('topic', selectedTopicForm);
    const audioFilesToUpload = [audioFile1, audioFile2, audioFile3, audioFile4].filter(file => file !== null);
    audioFilesToUpload.forEach(file => {
        if (file) formData.append('audioFiles', file);
    });
    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const total = progressEvent.total ?? audioFilesToUpload.reduce((acc, file) => acc + (file?.size || 0), 0);
          const percent = total > 0 ? Math.round((progressEvent.loaded * 100) / total) : 0;
          setUploadProgress(percent);
        },
      };
      const actionText = editingEssay ? 'Cập nhật' : 'Tạo mới';
      if (editingEssay) {
        await axiosInstance.put(`/api/essays/${editingEssay._id}`, formData, config);
      } else {
        await axiosInstance.post('/api/essays/upload', formData, config);
      }
      setFormMessage(`${actionText} bài luận thành công!`);
      resetForm();
      await fetchEssays();
    } catch (error: unknown) {
      const actionText = editingEssay ? 'Cập nhật' : 'Tạo mới';
      setFormMessage(`${actionText} bài luận thất bại!`);
      if (axios.isAxiosError(error)) {
        const errData = error.response?.data as { error?: string };
        setFormErrorDetails(errData?.error || error.message || `Lỗi không xác định.`);
      }
      else if (error instanceof Error) { setFormErrorDetails(error.message); }
      else { setFormErrorDetails(`Lỗi không xác định.`);}
    } finally {
      setIsSubmittingEssay(false);
      setTimeout(() => { setUploadProgress(0); }, 1500);
      setTimeout(() => { setFormMessage(''); setFormErrorDetails(''); }, 7000);
    }
  };

  const handleDelete = async (id: string) => {
    const essayToDelete = allFetchedEssays.find(e => e._id === id);
    if (!window.confirm(`Bạn có chắc muốn xóa bài luận "${essayToDelete?.title || 'này'}" không?`)) return;
    setFormMessage(''); setFormErrorDetails('');
    try {
      await axiosInstance.delete(`/api/essays/${id}`);
      await fetchEssays();
      setFormMessage(`Đã xóa bài luận "${essayToDelete?.title || ''}" thành công.`);
      if (editingEssay?._id === id) resetForm();
    } catch (error) {
        setFormMessage('Xóa bài luận thất bại!');
        if (axios.isAxiosError(error)) {
            const errData = error.response?.data as { error?: string };
            setFormErrorDetails(errData?.error || 'Lỗi không xác định.');
        } else {
            setFormErrorDetails('Lỗi không xác định.');
        }
    } finally {
        setTimeout(() => { setFormMessage(''); setFormErrorDetails(''); }, 7000);
    }
  };

  const startNewEssayMode = () => {
    resetForm();
    const formElement = document.getElementById('essay-form-section');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };
  
  const getTopicDisplayInfo = useCallback((essayTopic?: Topic | string | null): { topicName: string; categoryName: string } => {
    if (!essayTopic) return { topicName: 'Chưa phân loại', categoryName: 'N/A' };
    if (typeof essayTopic === 'object' && essayTopic !== null) {
      const topicName = essayTopic.name || 'Không rõ chủ đề';
      let categoryName = 'N/A';
      const topicCategory = essayTopic.category;
      if (topicCategory && typeof topicCategory === 'object' && topicCategory.name) {
        categoryName = topicCategory.name;
      } else if (typeof topicCategory === 'string') {
        const foundCat = actualCategoriesForForm.find(c => c._id === topicCategory);
        categoryName = foundCat ? foundCat.name : 'ID Category không khớp';
      }
      return { topicName, categoryName };
    }
    const foundTopic = allFetchedTopics.find(t => t._id === essayTopic);
    if (foundTopic) {
        let categoryName = 'N/A';
        const topicCategory = foundTopic.category;
        if(topicCategory && typeof topicCategory === 'object' && topicCategory.name){
            categoryName = topicCategory.name;
        } else if (typeof topicCategory === 'string') {
            const foundCat = actualCategoriesForForm.find(c => c._id === topicCategory);
            categoryName = foundCat ? foundCat.name : 'ID Category không khớp';
        }
        return { topicName: foundTopic.name, categoryName };
    }
    return { topicName: 'ID Topic không rõ', categoryName: 'N/A' };
  }, [allFetchedTopics, actualCategoriesForForm]);

  useEffect(() => {
    let filteredResults = [...allFetchedEssays];
    if (selectedAdminCategoryFilter !== 'Tất cả') {
      filteredResults = filteredResults.filter(essay => {
        const topic = essay.topic;
        if (topic && typeof topic === 'object' && topic.category) {
          const category = topic.category;
          return (typeof category === 'object' && category._id) ? category._id === selectedAdminCategoryFilter : category === selectedAdminCategoryFilter;
        } return false;
      });
    }
    if (adminSelectedTopicFilter !== 'Tất cả') {
      filteredResults = filteredResults.filter(essay => {
        const topic = essay.topic;
        return (topic && typeof topic === 'object' && topic._id) ? topic._id === adminSelectedTopicFilter : topic === adminSelectedTopicFilter;
      });
    }
    if (adminSearchTerm.trim()) {
      const lowerSearch = adminSearchTerm.toLowerCase().trim();
      filteredResults = filteredResults.filter(essay => {
        const { topicName, categoryName } = getTopicDisplayInfo(essay.topic);
        return (
          essay.title.toLowerCase().includes(lowerSearch) ||
          stripHtml(essay.content).toLowerCase().includes(lowerSearch) ||
          (essay.outline && stripHtml(essay.outline).toLowerCase().includes(lowerSearch)) ||
          topicName.toLowerCase().includes(lowerSearch) ||
          categoryName.toLowerCase().includes(lowerSearch)
        );
      });
    }
    setAdminDisplayedEssays(filteredResults);
    setAdminCurrentPage(1);
  }, [adminSearchTerm, adminSelectedTopicFilter, selectedAdminCategoryFilter, allFetchedEssays, getTopicDisplayInfo]);

  const adminTotalPages = Math.ceil(adminDisplayedEssays.length / ITEMS_PER_PAGE_ADMIN);
  const adminIndexOfLastEssay = adminCurrentPage * ITEMS_PER_PAGE_ADMIN;
  const adminIndexOfFirstEssay = adminIndexOfLastEssay - ITEMS_PER_PAGE_ADMIN;
  const adminEssaysForCurrentPage = adminDisplayedEssays.slice(adminIndexOfFirstEssay, adminIndexOfLastEssay);
  
  const handleAdminPageChange = (page: number) => {
    if (page > 0 && page <= adminTotalPages) {
      setAdminCurrentPage(page);
       const listContainer = document.getElementById('admin-essay-list-section');
        if (listContainer) { listContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  };
  const renderAdminPageNumbers = () => { 
      const pages = [];
      for(let i = 1; i <= adminTotalPages; i++) {
          pages.push(
            <button key={i} onClick={() => handleAdminPageChange(i)} disabled={i === adminCurrentPage} className={`py-2 px-4 border rounded-md text-sm disabled:opacity-100 ${i === adminCurrentPage ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}>
                {i}
            </button>
          )
      }
      return pages;
  };

  if (loadingEssays || loadingMeta) {
    return (
      <div className="container mx-auto p-4 bg-slate-50 text-slate-800 min-h-screen flex justify-center items-center">
        <div>
            <div className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-xl">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-slate-50 text-slate-800 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center text-slate-800">Quản lý Bài Luận</h1>
      
      {!editingEssay && ( 
        <button onClick={startNewEssayMode} className="mb-6 py-2 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200">
          + Tạo Bài Luận Mới
        </button> 
      )}
      
      {formMessage && (
        <div className={`mb-4 p-4 rounded-lg border text-center ${formErrorDetails || formMessage.includes('Lỗi') || formMessage.includes('thất bại') ? 'bg-red-100 border-red-300 text-red-800' : 'bg-green-100 border-green-300 text-green-800'} shadow-sm`}>
            <p className="font-medium">{formMessage}</p>
            {formErrorDetails && <p className="text-sm mt-1 whitespace-pre-wrap">{`Chi tiết: ${formErrorDetails}`}</p>}
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && isSubmittingEssay && (
        <div className="w-full bg-slate-200 rounded-full mb-4 border border-slate-300">
            <div className="bg-blue-500 text-xs font-bold text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${uploadProgress}%` }}>
                {uploadProgress > 10 ? `${uploadProgress}%` : ''}
            </div>
        </div>
      )}

      {/* FORM SOẠN THẢO */}
      <form id="essay-form-section" onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-slate-200" encType="multipart/form-data">
        <h2 className="text-2xl font-bold mb-6 text-slate-700 border-b border-slate-200 pb-4">
          {editingEssay ? `Chỉnh sửa: ${editingEssay.title}` : 'Soạn Bài Luận Mới'}
        </h2>
        
        <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 mb-6">
            <h3 className="text-lg font-semibold text-slate-600 mb-3">1. Phân loại Bài luận</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="formCategorySelect" className="block text-sm text-slate-600 font-medium mb-1">Chuyên mục:<span className="text-red-500">*</span></label>
                    <select id="formCategorySelect" value={selectedCategoryInForm} onChange={e => setSelectedCategoryInForm(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" required disabled={isSubmittingEssay || (actualCategoriesForForm.length === 0)}>
                        <option value="">-- Chọn chuyên mục --</option>
                        {actualCategoriesForForm.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="formTopicSelect" className="block text-sm text-slate-600 font-medium mb-1">Chủ đề:<span className="text-red-500">*</span></label>
                    <select id="formTopicSelect" value={selectedTopicForm} onChange={e => setSelectedTopicForm(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" required disabled={isSubmittingEssay || !selectedCategoryInForm || topicsForEssayFormDropdown.length === 0}>
                        <option value="">{!selectedCategoryInForm ? "-- Chọn chuyên mục trước --" : (topicsForEssayFormDropdown.length > 0 ? "-- Chọn chủ đề --" : "-- Không có chủ đề --")}</option>
                        {topicsForEssayFormDropdown.map(t => (<option key={t._id} value={t._id}>{t.name}</option>))}
                    </select>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 flex flex-col">
                <h3 className="text-lg font-semibold text-slate-600 mb-3">2. Tiêu đề & Dàn ý</h3>
                <div className="mb-4">
                    <label className="block text-sm text-slate-600 font-medium mb-1">Tiêu đề:<span className="text-red-500">*</span></label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" required disabled={isSubmittingEssay}/>
                </div>
                 <div className="flex-grow">
                    <label className="block text-sm text-slate-600 font-medium mb-1">Dàn ý (tùy chọn):</label>
                    <ReactQuill readOnly={isSubmittingEssay} value={outline} onChange={setOutline} theme="snow" modules={quillModules} className="bg-white text-slate-900 custom-quill-light"/>
                </div>
            </div>

            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-600 mb-3">3. Tải lên Âm thanh</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(num => {
                        const currentFile = [audioFile1, audioFile2, audioFile3, audioFile4][num - 1];
                        const setFileState = [setAudioFile1, setAudioFile2, setAudioFile3, setAudioFile4][num - 1];
                        const fileRef = [audioFile1Ref, audioFile2Ref, audioFile3Ref, audioFile4Ref][num - 1];
                        const existingAudioUrl = editingEssay?.audioFiles?.[num - 1];
                    return (
                        <div key={`audio-upload-${num}`}>
                            <label className="block text-sm text-slate-500 mb-1">File Âm Thanh {num} (tùy chọn):</label>
                            <input ref={fileRef} type="file" accept="audio/*" onChange={e => setFileState(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-colors cursor-pointer" disabled={isSubmittingEssay}/>
                            {existingAudioUrl && !currentFile && (
                                <div className="mt-2"><p className="text-xs text-slate-500 mb-1">File hiện tại:</p><audio controls src={existingAudioUrl} className="w-full h-8 rounded-lg" /></div>
                            )}
                            {currentFile && ( <span className="text-xs text-green-600 mt-1 block">Đã chọn file mới: {currentFile.name}</span> )}
                        </div>
                    );
                    })}
                </div>
            </div>
        </div>

        <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-600 mb-3">4. Nội dung chi tiết</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm text-slate-600 font-medium mb-1">Bài luận 1 (Nội dung chính):<span className="text-red-500">*</span></label>
                    <ReactQuill readOnly={isSubmittingEssay} value={content} onChange={setContent} theme="snow" modules={quillModules} className="bg-white text-slate-900 custom-quill-light" style={{ minHeight: '250px' }}/>
                </div>
                <div>
                    <label className="block text-sm text-slate-600 font-medium mb-1">Bài luận 2 (Nếu có):</label>
                    <ReactQuill readOnly={isSubmittingEssay} value={essay2} onChange={setEssay2} theme="snow" modules={quillModules} className="bg-white text-slate-900 custom-quill-light" style={{ minHeight: '200px' }}/>
                </div>
                <div>
                    <label className="block text-sm text-slate-600 font-medium mb-1">Bài luận 3 (Nếu có):</label>
                    <ReactQuill readOnly={isSubmittingEssay} value={essay3} onChange={setEssay3} theme="snow" modules={quillModules} className="bg-white text-slate-900 custom-quill-light" style={{ minHeight: '200px' }}/>
                </div>
            </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
             <button type="submit" className={`py-2.5 px-6 rounded-lg font-semibold text-white transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${editingEssay ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`} disabled={isSubmittingEssay || !selectedTopicForm || !selectedCategoryInForm}>
                {isSubmittingEssay ? (editingEssay ? 'Đang cập nhật...' : 'Đang tạo...') : (editingEssay ? 'Lưu Chỉnh Sửa' : 'Tạo Bài Luận')}
            </button>
            <button type="button" onClick={startNewEssayMode} className="py-2.5 px-6 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors shadow-md" disabled={isSubmittingEssay}>
                {editingEssay ? 'Hủy & Tạo mới' : 'Làm Mới Form'}
            </button>
        </div>
      </form>

      <div id="admin-essay-list-section" className="mt-12">
        <div className="border-b border-slate-300 mb-6">
            <button onClick={() => setIsEssayListVisible(!isEssayListVisible)} className="w-full flex justify-between items-center py-3 text-2xl font-bold text-slate-700 focus:outline-none">
                <span>Danh Sách Bài Luận ({adminDisplayedEssays.length})</span>
                {isEssayListVisible ? <ChevronUp className="w-7 h-7" /> : <ChevronDown className="w-7 h-7" />}
            </button>
        </div>

        {isEssayListVisible && (
            <div className="animate-slideDown">
                <div className="bg-white p-4 rounded-lg shadow-lg mb-6 border border-slate-200">
                    <div className="mb-4">
                        <input type="text" value={adminSearchTerm} onChange={e => setAdminSearchTerm(e.target.value)} placeholder="Tìm kiếm tiêu đề, nội dung, chủ đề..." className="w-full p-3 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="categoryFilterAdmin" className="block text-sm font-medium mb-1 text-slate-600">Lọc theo Chuyên mục:</label>
                            <select id="categoryFilterAdmin" value={selectedAdminCategoryFilter} onChange={e => setSelectedAdminCategoryFilter(e.target.value)} className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                {allCategories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="topicFilterAdmin" className="block text-sm font-medium mb-1 text-slate-600">Lọc theo Chủ đề:</label>
                            <select id="topicFilterAdmin" value={adminSelectedTopicFilter} onChange={e => setAdminSelectedTopicFilter(e.target.value)} className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" disabled={topicsForFilterDropdown.length <=1 && selectedAdminCategoryFilter === 'Tất cả'}>
                                {topicsForFilterDropdown.map(topic => (<option key={topic._id} value={topic._id}>{topic.name}</option>))}
                            </select>
                        </div>
                    </div>
                </div>

                {adminEssaysForCurrentPage.length === 0 && !loadingEssays && ( <div className="text-center py-10 bg-white rounded-lg shadow-md border border-slate-200"><p className="text-slate-500">Không tìm thấy bài luận nào phù hợp.</p></div> )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adminEssaysForCurrentPage.map(essay => {
                      const { topicName, categoryName } = getTopicDisplayInfo(essay.topic);
                      return (
                          <div key={essay._id} className="bg-white p-5 rounded-lg shadow-md border border-slate-200 flex flex-col justify-between hover:shadow-xl transition-shadow duration-200">
                              <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 truncate" title={essay.title}>{essay.title}</h3>
                                <p className="text-sm text-indigo-600 mb-1 font-medium">Chuyên mục: {categoryName}</p>
                                <p className="text-sm text-teal-600 mb-4 font-medium">Chủ đề: {topicName}</p>
                                {essay.outline && ( <details className="mb-2 text-sm"><summary className="cursor-pointer text-slate-500 hover:text-slate-800 font-medium">Xem Dàn Ý</summary><div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: essay.outline }} /></details> )}
                                <details className="mb-2 text-sm"> <summary className="cursor-pointer text-slate-500 hover:text-slate-800 font-medium">Xem Bài luận 1</summary> <div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: essay.content }} /> </details>
                                {essay.essay2 && ( <details className="mb-2 text-sm"><summary className="cursor-pointer text-slate-500 hover:text-slate-800 font-medium">Xem Bài luận 2</summary><div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: essay.essay2 }} /></details> )}
                                {essay.essay3 && ( <details className="mb-2 text-sm"><summary className="cursor-pointer text-slate-500 hover:text-slate-800 font-medium">Xem Bài luận 3</summary><div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: essay.essay3 }} /></details> )}
                                {essay.audioFiles && essay.audioFiles.length > 0 && ( <div className="mt-4 pt-3 border-t border-slate-200"> <p className="text-xs text-slate-500 mb-2 font-semibold">FILE ÂM THANH:</p> {essay.audioFiles.map((file, idx) => ( <audio controls key={idx} src={file} className="mb-2 w-full h-8 rounded-lg" /> ))} </div> )}
                              </div>
                              <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <button onClick={() => handleEdit(essay)} className="bg-amber-500 text-white py-2 px-4 rounded-md hover:bg-amber-600 text-sm font-semibold transition-colors" disabled={isSubmittingEssay}>Sửa</button>
                                <button onClick={() => handleDelete(essay._id)} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 text-sm font-semibold transition-colors" disabled={isSubmittingEssay}>Xóa</button>
                              </div>
                          </div>
                      );
                  })}
                </div>

                {adminTotalPages > 1 && ( <div className="mt-10 flex justify-center items-center flex-wrap gap-2"> 
                    <button onClick={() => handleAdminPageChange(adminCurrentPage - 1)} disabled={adminCurrentPage === 1} className="py-2 px-4 border rounded-md text-sm bg-white text-slate-700 border-slate-300 hover:bg-slate-100 disabled:opacity-50">« Trước</button> 
                    {renderAdminPageNumbers()} 
                    <button onClick={() => handleAdminPageChange(adminCurrentPage + 1)} disabled={adminCurrentPage === adminTotalPages} className="py-2 px-4 border rounded-md text-sm bg-white text-slate-700 border-slate-300 hover:bg-slate-100 disabled:opacity-50">Sau »</button> 
                </div> )}
            </div>
        )}
      </div>
      <style>
        {`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
        
        .custom-quill-light .ql-toolbar {
          background-color: #f8fafc;
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-color: #e2e8f0;
        }
        .custom-quill-light .ql-container {
          background-color: #ffffff;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          border-color: #e2e8f0;
          color: #1e293b;
          min-height: 150px;
        }
        .custom-quill-light .ql-editor {
           font-size: 1rem;
           line-height: 1.6;
        }
        .custom-quill-light .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        .prose { color: #334155; }
        .prose h1, .prose h2, .prose h3 { color: #1e293b; }
        .prose a { color: #4f46e5; }
        .prose blockquote { border-left-color: #cbd5e1; }
        .prose code { color: #be123c; }
      `}
      </style>
    </div>
  );
};

export default AdminDashboard;