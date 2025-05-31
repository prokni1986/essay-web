// file: components/AdminDashboard.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios, { AxiosProgressEvent, AxiosError } from 'axios'; // Still needed for types and axios.isAxiosError
import axiosInstance from '../lib/axiosInstance'; // Import axiosInstance
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const stripHtml = (html: string): string => {
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
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
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

  const fetchMetaData = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const [categoriesRes, topicsRes] = await Promise.all([
        axiosInstance.get<Category[]>('/api/categories'), // Use axiosInstance
        axiosInstance.get<Topic[]>('/api/topics')         // Use axiosInstance
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
      setAllCategories([{ _id: 'Tất cả', name: 'Tất cả Chuyên mục' }]);
      setActualCategoriesForForm([]);
      setTopicsForFilterDropdown([{ _id: 'Tất cả', name: 'Tất cả Chủ đề' }]);
    } finally {
      setLoadingMeta(false);
    }
  }, [selectedCategoryInForm]);

  const fetchEssays = useCallback(async () => {
    setLoadingEssays(true);
    try {
      const response = await axiosInstance.get<Essay[]>('/api/essays'); // Use axiosInstance
      setAllFetchedEssays(response.data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (error) {
      setFormMessage('Lỗi');
      setFormErrorDetails('Không thể lấy danh sách bài luận.');
      console.error("Lỗi fetchEssays:", error);
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
        await axiosInstance.put(`/api/essays/${editingEssay._id}`, formData, config); // Use axiosInstance
      } else {
        await axiosInstance.post('/api/essays/upload', formData, config); // Use axiosInstance
      }
      setFormMessage(`${actionText} bài luận thành công!`);
      resetForm();
      fetchEssays();
    } catch (error: unknown) {
      const actionText = editingEssay ? 'Cập nhật' : 'Tạo mới';
      setFormMessage(`${actionText} bài luận thất bại!`);
      if (axios.isAxiosError(error)) { // This check is still valid with axiosInstance errors
        const errData = error.response?.data as { error?: string };
        setFormErrorDetails(errData?.error || error.message || `Lỗi không xác định khi ${actionText.toLowerCase()} bài luận.`);
      }
      else if (error instanceof Error) { setFormErrorDetails(error.message); }
      else { setFormErrorDetails(`Lỗi không xác định khi ${actionText.toLowerCase()} bài luận.`);}
      console.error(`Lỗi ${actionText.toLowerCase()} bài luận:`, error);
    } finally {
      setIsSubmittingEssay(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 1500);
      setTimeout(() => {
        setFormMessage('');
        setFormErrorDetails('');
      }, 7000);
    }
  };

  const handleDelete = async (id: string) => {
    const essayToDelete = allFetchedEssays.find(e => e._id === id);
    const confirmDelete = window.confirm(
        `Bạn có chắc chắn muốn xóa bài luận "${essayToDelete?.title || 'này'}" không? \nHành động này không thể hoàn tác.`
    );
    if (!confirmDelete) return;

    setFormMessage(''); setFormErrorDetails('');

    try {
      await axiosInstance.delete(`/api/essays/${id}`); // Use axiosInstance
      fetchEssays();
      setFormMessage(`Đã xóa bài luận "${essayToDelete?.title || ''}" thành công.`);
      if (editingEssay?._id === id) {
        resetForm();
      }
    } catch (error) {
        setFormMessage('Xóa bài luận thất bại!');
        if (axios.isAxiosError(error)) { // This check is still valid
            const errData = error.response?.data as { error?: string };
            setFormErrorDetails(errData?.error || 'Lỗi không xác định khi xóa bài luận.');
        } else {
            setFormErrorDetails('Lỗi không xác định khi xóa bài luận.');
        }
    } finally {
        setTimeout(() => {
            setFormMessage('');
            setFormErrorDetails('');
        }, 7000);
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
          if (typeof category === 'object' && category._id) {
            return category._id === selectedAdminCategoryFilter;
          }
          return category === selectedAdminCategoryFilter;
        }
        return false;
      });
    }
    if (adminSelectedTopicFilter !== 'Tất cả') {
      filteredResults = filteredResults.filter(essay => {
        const topic = essay.topic;
        if (topic && typeof topic === 'object' && topic._id) {
          return topic._id === adminSelectedTopicFilter;
        }
        return topic === adminSelectedTopicFilter;
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
          (essay.essay2 && stripHtml(essay.essay2).toLowerCase().includes(lowerSearch)) ||
          (essay.essay3 && stripHtml(essay.essay3).toLowerCase().includes(lowerSearch)) ||
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
    const pageNumbers = []; const maxPageButtons = 3; let startPage: number, endPage: number;
    if (adminTotalPages <= maxPageButtons) { startPage = 1; endPage = adminTotalPages; }
    else { const maxPagesBeforeCurrentPage = Math.floor(maxPageButtons / 2); const maxPagesAfterCurrentPage = Math.ceil(maxPageButtons / 2) - 1; if (adminCurrentPage <= maxPagesBeforeCurrentPage) { startPage = 1; endPage = maxPageButtons; } else if (adminCurrentPage + maxPagesAfterCurrentPage >= adminTotalPages) { startPage = adminTotalPages - maxPageButtons + 1; endPage = adminTotalPages; } else { startPage = adminCurrentPage - maxPagesBeforeCurrentPage; endPage = adminCurrentPage + maxPagesAfterCurrentPage; }}
    if (startPage > 1) { pageNumbers.push(<button key="admin-1" onClick={() => handleAdminPageChange(1)} className="py-2 px-4 mx-1 border rounded-md text-sm bg-[#2c2c34] text-gray-300 border-gray-600 hover:bg-gray-600">1</button>); if (startPage > 2) { pageNumbers.push(<span key="admin-start-ellipsis" className="py-2 px-4 mx-1 text-gray-400">...</span>);}}
    for (let i = startPage; i <= endPage; i++) { pageNumbers.push( <button key={`admin-${i}`} onClick={() => handleAdminPageChange(i)} className={`py-2 px-4 mx-1 border rounded-md text-sm ${adminCurrentPage === i ? 'bg-yellow-500 text-gray-900 border-yellow-500' : 'bg-[#2c2c34] text-gray-300 border-gray-600 hover:bg-gray-600'}`}>{i}</button> );}
    if (endPage < adminTotalPages) { if (endPage < adminTotalPages - 1) { pageNumbers.push(<span key="admin-end-ellipsis" className="py-2 px-4 mx-1 text-gray-400">...</span>); } pageNumbers.push(<button key={`admin-${adminTotalPages}`} onClick={() => handleAdminPageChange(adminTotalPages)} className="py-2 px-4 mx-1 border rounded-md text-sm bg-[#2c2c34] text-gray-300 border-gray-600 hover:bg-gray-600">{adminTotalPages}</button>);}
    return pageNumbers;
  };

  const isLoadingOverall = loadingEssays || loadingMeta;
  if (isLoadingOverall) {
    return (
      <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen flex justify-center items-center">
        <div>
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-yellow-400 motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-3 text-xl">Đang tải dữ liệu Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">Admin Dashboard - Quản lý Bài Luận</h1>
      {!editingEssay && ( <button onClick={startNewEssayMode} className="mb-6 py-2 px-4 rounded bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg transition-colors"> + Tạo Bài Luận Mới </button> )}
      
      {formMessage && (
        <div
            className={`mb-4 p-3 rounded ${formErrorDetails || formMessage.includes('Lỗi') || formMessage.includes('thất bại') ?
                'bg-red-700 border border-red-500' :
                'bg-green-700 border border-green-500'
            } text-white shadow-md`}
        >
            {formMessage}
        </div>
      )}
      {formErrorDetails && (
        <div className="mb-4 p-3 rounded bg-red-700 border border-red-500 text-white whitespace-pre-wrap shadow-md">
            Chi tiết lỗi: {formErrorDetails}
        </div>
      )}
      {uploadProgress > 0 && uploadProgress < 100 && isSubmittingEssay && (
        <div className="w-full bg-gray-700 rounded-full mb-4 overflow-hidden border border-gray-600 shadow-inner">
            <div
                className="bg-blue-500 text-xs font-bold text-white text-center p-1 leading-none rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
            >
                {uploadProgress > 5 ? `${uploadProgress}%` : ''}
            </div>
        </div>
      )}

      <form id="essay-form-section" onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8 border border-gray-700" encType="multipart/form-data" >
        <h2 className="text-2xl font-bold mb-6 text-yellow-400 border-b border-gray-700 pb-3"> {editingEssay ? `Chỉnh sửa: ${editingEssay.title}` : 'Tạo Bài Luận Mới'} </h2>
        
        <div className="mb-4"> <label className="block text-gray-300 font-semibold mb-1">Tiêu đề:<span className="text-red-500">*</span></label> <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none" required disabled={isSubmittingEssay}/> </div>
        <div className="mb-4"> <label className="block text-gray-300 font-semibold mb-1">Dàn ý:</label> <ReactQuill readOnly={isSubmittingEssay} value={outline} onChange={setOutline} theme="snow" modules={quillModules} className="bg-gray-700 text-white quill-dark-theme rounded" style={{ minHeight: '150px' }}/> </div>
        <div className="mb-4"> <label className="block text-gray-300 font-semibold mb-1">Bài luận 1 (Nội dung chính):<span className="text-red-500">*</span></label> <ReactQuill readOnly={isSubmittingEssay} value={content} onChange={setContent} theme="snow" modules={quillModules} className="bg-gray-700 text-white quill-dark-theme rounded" style={{ minHeight: '250px' }}/> </div>
        <div className="mb-4"> <label className="block text-gray-300 font-semibold mb-1">Bài luận 2 (Nếu có):</label> <ReactQuill readOnly={isSubmittingEssay} value={essay2} onChange={setEssay2} theme="snow" modules={quillModules} className="bg-gray-700 text-white quill-dark-theme rounded" style={{ minHeight: '200px' }}/> </div>
        <div className="mb-4"> <label className="block text-gray-300 font-semibold mb-1">Bài luận 3 (Nếu có):</label> <ReactQuill readOnly={isSubmittingEssay} value={essay3} onChange={setEssay3} theme="snow" modules={quillModules} className="bg-gray-700 text-white quill-dark-theme rounded" style={{ minHeight: '200px' }}/> </div>
        
        <div className="mb-4">
          <label htmlFor="formCategorySelect" className="block text-gray-300 font-semibold mb-1">Chuyên mục (Category):<span className="text-red-500">*</span></label>
          <select
            id="formCategorySelect"
            value={selectedCategoryInForm}
            onChange={e => setSelectedCategoryInForm(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
            required
            disabled={isSubmittingEssay || (actualCategoriesForForm.length === 0 && !loadingMeta)}
          >
            <option value="">-- Chọn chuyên mục --</option>
            {actualCategoriesForForm.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
           {actualCategoriesForForm.length === 0 && !loadingMeta && <p className="text-xs text-yellow-400 mt-1">Vui lòng tạo Chuyên mục ở trang "Quản lý Chuyên mục" trước.</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="formTopicSelect" className="block text-gray-300 font-semibold mb-1">Chủ đề (Topic):<span className="text-red-500">*</span></label>
          <select
            id="formTopicSelect"
            value={selectedTopicForm}
            onChange={e => setSelectedTopicForm(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
            required
            disabled={isSubmittingEssay || !selectedCategoryInForm || topicsForEssayFormDropdown.length === 0 || loadingMeta}
          >
            <option value="">
                {!selectedCategoryInForm
                    ? "-- Vui lòng chọn chuyên mục trước --"
                    : (topicsForEssayFormDropdown.length > 0
                        ? "-- Chọn chủ đề --"
                        : "-- Không có chủ đề trong chuyên mục này --")
                }
            </option>
            {topicsForEssayFormDropdown.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
          {selectedCategoryInForm && topicsForEssayFormDropdown.length === 0 && !loadingMeta && <p className="text-xs text-yellow-400 mt-1">Chuyên mục này chưa có Chủ đề nào. Vui lòng tạo Chủ đề ở trang "Quản lý Chủ đề" trước.</p>}
        </div>

        {[1, 2, 3, 4].map(num => {
            let currentFileState: File | null = null;
            let setFileState: React.Dispatch<React.SetStateAction<File | null>> = () => {};
            let fileRef: React.RefObject<HTMLInputElement | null> = audioFile1Ref;
            const existingAudioUrl = editingEssay?.audioFiles?.[num - 1];
            switch (num) {
                case 1: currentFileState = audioFile1; setFileState = setAudioFile1; fileRef = audioFile1Ref; break;
                case 2: currentFileState = audioFile2; setFileState = setAudioFile2; fileRef = audioFile2Ref; break;
                case 3: currentFileState = audioFile3; setFileState = setAudioFile3; fileRef = audioFile3Ref; break;
                case 4: currentFileState = audioFile4; setFileState = setAudioFile4; fileRef = audioFile4Ref; break;
            }
          return (
            <div className="mb-4" key={`audio-upload-${num}`}>
                <label className="block text-gray-300 font-semibold mb-1">File Âm Thanh {num} (Tùy chọn):</label>
                <input
                    ref={fileRef}
                    type="file"
                    accept="audio/*"
                    onChange={e => setFileState(e.target.files?.[0] || null)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-400"
                    disabled={isSubmittingEssay}
                />
                {existingAudioUrl && !currentFileState && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-1">File hiện tại ({num}):</p>
                        <audio controls className="w-full rounded-lg custom-audio-controls">
                            <source src={existingAudioUrl} /> Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
                {currentFileState && ( <span className="text-sm text-green-400 mt-1 block">Đã chọn: {currentFileState.name}</span> )}
            </div>
          );
        })}

        <div className="mt-6 flex gap-3">
            <button
                type="submit"
                className="py-2 px-6 rounded bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold transition-colors shadow-md disabled:opacity-50"
                disabled={isSubmittingEssay || (uploadProgress > 0 && uploadProgress < 100 && !formMessage.includes('thành công')) || !selectedTopicForm || !selectedCategoryInForm || loadingMeta}
            >
                {isSubmittingEssay ? (editingEssay ? 'Đang cập nhật...' : 'Đang tạo...') : (editingEssay ? 'Lưu Chỉnh Sửa' : 'Tạo Bài Luận')}
            </button>
            <button
                type="button"
                onClick={startNewEssayMode}
                className="py-2 px-6 rounded bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors shadow-md"
                disabled={isSubmittingEssay}
            >
                {editingEssay ? 'Hủy Chỉnh Sửa' : 'Làm Mới Form'}
            </button>
        </div>
      </form>

      <div id="admin-essay-list-section" className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-yellow-400 border-b border-gray-700 pb-3">Danh Sách Bài Luận Hiện Có ({adminDisplayedEssays.length})</h2>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6 border border-gray-700">
            <div className="mb-4"> <input type="text" value={adminSearchTerm} onChange={e => setAdminSearchTerm(e.target.value)} placeholder="Tìm kiếm trong danh sách bài luận..." className="w-full p-3 bg-[#2c2c34] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none placeholder-gray-400" /> </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="categoryFilterAdmin" className="block text-md font-semibold mb-2 text-gray-300">Lọc theo Chuyên mục (Category):</label>
                    <select
                        id="categoryFilterAdmin"
                        value={selectedAdminCategoryFilter}
                        onChange={e => setSelectedAdminCategoryFilter(e.target.value)}
                        className="w-full p-3 bg-[#2c2c34] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    >
                        {allCategories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="topicFilterAdmin" className="block text-md font-semibold mb-2 text-gray-300">Lọc theo Chủ đề (Topic):</label>
                    <select
                        id="topicFilterAdmin"
                        value={adminSelectedTopicFilter}
                        onChange={e => setAdminSelectedTopicFilter(e.target.value)}
                        className="w-full p-3 bg-[#2c2c34] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                        disabled={topicsForFilterDropdown.length <=1 && selectedAdminCategoryFilter === 'Tất cả'}
                    >
                        {topicsForFilterDropdown.map(topic => (
                            <option key={topic._id} value={topic._id}>{topic.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
        {adminEssaysForCurrentPage.length === 0 && !loadingEssays && ( <p className="text-gray-400 text-center py-4 bg-gray-800 rounded-lg"> Không có bài luận nào {adminSearchTerm || adminSelectedTopicFilter !== 'Tất cả' || selectedAdminCategoryFilter !== 'Tất cả' ? "phù hợp với tiêu chí lọc/tìm kiếm" : "hiện có"}. </p> )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminEssaysForCurrentPage.map(essay => {
            const { topicName, categoryName } = getTopicDisplayInfo(essay.topic);
            return (
              <div key={essay._id} className="bg-gray-800 p-5 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-1 truncate" title={essay.title}>{essay.title}</h3>
                  <p className="text-sm text-blue-400 mb-1">Chuyên mục: {categoryName}</p>
                  <p className="text-sm text-indigo-400 mb-3">Chủ đề: {topicName}</p>
                  {essay.outline && ( <details className="mb-2 text-sm"><summary className="cursor-pointer text-gray-400 hover:text-gray-200 outline-none focus:ring-1 focus:ring-yellow-500 rounded p-1 font-medium">Xem Dàn Ý</summary><div className="mt-1 p-3 bg-gray-700/50 rounded prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: essay.outline }} /></details> )}
                  <details className="mb-2 text-sm"> <summary className="cursor-pointer text-gray-400 hover:text-gray-200 outline-none focus:ring-1 focus:ring-yellow-500 rounded p-1 font-medium">Xem Bài luận 1 (Chính)</summary> <div className="mt-1 p-3 bg-gray-700/50 rounded prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: essay.content }} /> </details>
                  {essay.essay2 && ( <details className="mb-2 text-sm"><summary className="cursor-pointer text-gray-400 hover:text-gray-200 outline-none focus:ring-1 focus:ring-yellow-500 rounded p-1 font-medium">Xem Bài luận 2</summary><div className="mt-1 p-3 bg-gray-700/50 rounded prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: essay.essay2 }} /></details> )}
                  {essay.essay3 && ( <details className="mb-2 text-sm"><summary className="cursor-pointer text-gray-400 hover:text-gray-200 outline-none focus:ring-1 focus:ring-yellow-500 rounded p-1 font-medium">Xem Bài luận 3</summary><div className="mt-1 p-3 bg-gray-700/50 rounded prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: essay.essay3 }} /></details> )}
                  {essay.audioFiles && essay.audioFiles.length > 0 && ( <div className="mt-4 pt-3 border-t border-gray-700/50"> <p className="text-xs text-gray-400 mb-2 font-semibold">File âm thanh ({essay.audioFiles.length}):</p> {essay.audioFiles.map((file, idx_audio) => ( <audio controls key={idx_audio} className="mb-2 w-full h-10 rounded-lg custom-audio-controls"> <source src={file} /> Your browser does not support the audio element. </audio> ))} </div> )}
                </div>
                <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleEdit(essay)}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm font-semibold transition-colors shadow-md"
                    disabled={isSubmittingEssay}
                  > Sửa </button>
                  <button
                    onClick={() => handleDelete(essay._id)}
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-sm font-semibold transition-colors shadow-md"
                    disabled={isSubmittingEssay}
                  > Xóa </button>
                </div>
              </div>
            );
          })}
        </div>
        {adminTotalPages > 1 && ( <div className="mt-10 flex justify-center items-center space-x-1"> <button onClick={() => handleAdminPageChange(adminCurrentPage - 1)} disabled={adminCurrentPage === 1} className="py-2 px-4 border rounded-md text-sm bg-[#2c2c34] text-gray-300 border-gray-600 hover:bg-gray-600 disabled:opacity-50">« Trước</button> {renderAdminPageNumbers()} <button onClick={() => handleAdminPageChange(adminCurrentPage + 1)} disabled={adminCurrentPage === adminTotalPages} className="py-2 px-4 border rounded-md text-sm bg-[#2c2c34] text-gray-300 border-gray-600 hover:bg-gray-600 disabled:opacity-50">Sau »</button> </div> )}
      </div>
      <style>
        {`
        .quill-dark-theme .ql-toolbar { border-color: #4A5568 !important; background-color: #2D3748 !important; border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem; }
        .quill-dark-theme .ql-toolbar .ql-stroke, .quill-dark-theme .ql-toolbar .ql-picker-label { stroke: #E2E8F0 !important; color: #E2E8F0 !important; }
        .quill-dark-theme .ql-toolbar .ql-fill { fill: #E2E8F0 !important; }
        .quill-dark-theme .ql-container { border-color: #4A5568 !important; color: #E2E8F0 !important; background-color: #222730 !important; border-bottom-left-radius: 0.375rem; border-bottom-right-radius: 0.375rem; font-size: 1rem; }
        .quill-dark-theme .ql-editor { color: #E2E8F0 !important; padding: 12px 15px !important; }
        .quill-dark-theme .ql-editor.ql-blank::before { color: rgba(226, 232, 240, 0.5) !important; font-style: normal !important; }
        .quill-dark-theme .ql-picker-options { background-color: #2D3748 !important; border-color: #4A5568 !important; color: #E2E8F0 !important; }
        .quill-dark-theme .ql-picker-item { color: #E2E8F0 !important; }
        .quill-dark-theme .ql-picker-item:hover, .quill-dark-theme .ql-picker-item.ql-selected { background-color: #4A5568 !important; color: #FFF !important; }
        .custom-audio-controls { filter: invert(1) brightness(0.8) hue-rotate(180deg) saturate(0.5); }
        .prose-invert { --tw-prose-body: #d1d5db; --tw-prose-headings: #ffffff; --tw-prose-lead: #9ca3af; --tw-prose-links: #fde047; --tw-prose-bold: #ffffff; --tw-prose-counters: #9ca3af; --tw-prose-bullets: #4b5563; --tw-prose-hr: #374151; --tw-prose-quotes: #e5e7eb; --tw-prose-quote-borders: #374151; --tw-prose-captions: #9ca3af; --tw-prose-code: #ffffff; --tw-prose-pre-code: #d1d5db; --tw-prose-pre-bg: #1f2937; --tw-prose-th-borders: #4b5563; --tw-prose-td-borders: #374151; }
      `}
      </style>
    </div>
  );
};

export default AdminDashboard;