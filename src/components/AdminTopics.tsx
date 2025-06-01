// file: components/AdminTopics.tsx
import React, { useEffect, useState, ChangeEvent, FormEvent, useCallback } from 'react';
import axios, { AxiosError } from 'axios'; // Still needed for types and axios.isAxiosError
import axiosInstance from '../lib/axiosInstance'; // <<--- CORRECT: Uses axiosInstance

type Topic = {
  _id: string;
  name: string;
  imageUrl?: string;
  category?: {
    _id: string;
    name: string;
  } | string;
};

type CategoryType = {
  _id: string;
  name: string;
};

interface ApiErrorResponse {
  error: string;
}

const TOPICS_PER_PAGE = 6;

// Define API paths relative to the baseURL in axiosInstance
const API_TOPICS_PATH = '/api/topics';           // <<--- CORRECT: Relative path
const API_CATEGORIES_PATH = '/api/categories';   // <<--- CORRECT: Relative path

const AdminTopics: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);

  const [newTopicName, setNewTopicName] = useState<string>('');
  const [newTopicImageFile, setNewTopicImageFile] = useState<File | null>(null);
  const [newTopicImagePreview, setNewTopicImagePreview] = useState<string | null>(null);
  const [newTopicCategoryId, setNewTopicCategoryId] = useState<string>('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null);
  const [editingImagePreview, setEditingImagePreview] = useState<string | null>(null);
  const [currentEditingImageUrl, setCurrentEditingImageUrl] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string>('');

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editMessage, setEditMessage] = useState<string>('');

  const [generalMessage, setGeneralMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchTopics = useCallback(async () => {
    try {
      // Uses axiosInstance and relative path
      const res = await axiosInstance.get<Topic[]>(API_TOPICS_PATH);
      setTopics(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách chủ đề:", err);
      setErrorMessage("Không thể tải danh sách chủ đề. Vui lòng thử lại sau.");
    }
  }, []); // Removed API_TOPICS_URL from dependencies as it's a constant path now

  const fetchCategoriesForForm = useCallback(async () => {
    try {
      // Uses axiosInstance and relative path
      const res = await axiosInstance.get<CategoryType[]>(API_CATEGORIES_PATH);
      const fetchedCategories = Array.isArray(res.data) ? res.data : [];
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0 && !editingId) {
        if (!newTopicCategoryId || !fetchedCategories.find(cat => cat._id === newTopicCategoryId)) {
          setNewTopicCategoryId(fetchedCategories[0]._id);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách chuyên mục:", err);
      setErrorMessage("Không thể tải danh sách chuyên mục cho form.");
    }
  }, [editingId, newTopicCategoryId]); // Removed API_CATEGORIES_URL

  useEffect(() => {
    fetchTopics();
    fetchCategoriesForForm();
  }, [fetchTopics, fetchCategoriesForForm]);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const resetAddForm = () => {
    setNewTopicName('');
    setNewTopicImageFile(null);
    setNewTopicImagePreview(null);
    setNewTopicCategoryId(categories.length > 0 ? categories[0]._id : '');
    const fileInput = document.getElementById('newTopicImage') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleAddTopic = async (e: FormEvent) => {
    e.preventDefault();
    setUploadMessage(''); setEditMessage(''); setGeneralMessage(''); setErrorMessage('');

    if (!newTopicName.trim()) {
      setErrorMessage("Tên chủ đề không được để trống.");
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (!newTopicCategoryId) {
        setErrorMessage("Vui lòng chọn một chuyên mục cha.");
        setTimeout(() => setErrorMessage(''), 3000);
        return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('name', newTopicName.trim());
    formData.append('categoryId', newTopicCategoryId);
    if (newTopicImageFile) {
      formData.append('image', newTopicImageFile);
    }

    try {
      // Uses axiosInstance and relative path
      await axiosInstance.post(API_TOPICS_PATH, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMessage('Thêm chủ đề thành công!');
      resetAddForm();
      await fetchTopics();
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi khi thêm chủ đề:", error);
      let errMsg = 'Lỗi không xác định khi thêm chủ đề.';
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiErrorResponse;
        errMsg = serverError?.error || error.message;
      } else if (error instanceof Error) { errMsg = error.message; }
      setUploadMessage('');
      setErrorMessage(`Thêm thất bại: ${errMsg}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadMessage('');
        setErrorMessage('');
      }, 5000);
    }
  };

  const startEdit = (topic: Topic) => {
    setEditingId(topic._id);
    setEditingName(topic.name);
    setEditingImageFile(null);
    setCurrentEditingImageUrl(topic.imageUrl || null);
    setEditingImagePreview(topic.imageUrl || null);

    if (topic.category && typeof topic.category === 'object') {
        setEditingCategoryId(topic.category._id);
    } else if (typeof topic.category === 'string') {
        setEditingCategoryId(topic.category);
    } else {
        setEditingCategoryId(categories.length > 0 ? categories[0]._id : '');
    }
    setUploadMessage(''); setEditMessage(''); setGeneralMessage(''); setErrorMessage('');
    const editFormElement = document.getElementById('edit-topic-form');
    if (editFormElement) editFormElement.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingImageFile(null);
    setEditingImagePreview(null);
    setCurrentEditingImageUrl(null);
    setEditingCategoryId(categories.length > 0 ? categories[0]._id : '');
    setIsEditing(false);
    setEditMessage('');
  };

  const handleEditTopic = async (e: FormEvent) => {
    e.preventDefault();
    setUploadMessage(''); setEditMessage(''); setGeneralMessage(''); setErrorMessage('');

    if (!editingName.trim() || !editingId) {
      setErrorMessage("Tên chủ đề không được để trống khi sửa.");
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (!editingCategoryId) {
        setErrorMessage("Vui lòng chọn một chuyên mục cha khi sửa.");
        setTimeout(() => setErrorMessage(''), 3000);
        return;
    }

    setIsEditing(true);

    const formData = new FormData();
    formData.append('name', editingName.trim());
    formData.append('categoryId', editingCategoryId);
    if (editingImageFile) {
      formData.append('image', editingImageFile);
    } else if (!editingImagePreview && currentEditingImageUrl) {
      formData.append('removeCurrentImage', 'true');
    }

    try {
      // Uses axiosInstance and relative path
      await axiosInstance.put(`${API_TOPICS_PATH}/${editingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditMessage('Cập nhật chủ đề thành công!');
      await fetchTopics();
      setTimeout(() => { cancelEdit(); }, 2000);
    } catch (error) {
      console.error("Lỗi khi sửa chủ đề:", error);
      let errMsg = 'Lỗi không xác định khi sửa chủ đề.';
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiErrorResponse;
        errMsg = serverError?.error || error.message;
      } else if (error instanceof Error) { errMsg = error.message; }
      setEditMessage('');
      setErrorMessage(`Sửa thất bại: ${errMsg}`);
      setIsEditing(false);
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

  const handleDelete = async (id: string) => {
    const topicToDelete = topics.find(t => t._id === id);
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa chủ đề "${topicToDelete?.name || id}" không? \nLưu ý: Hình ảnh của chủ đề (nếu có) cũng sẽ bị xóa vĩnh viễn.`
    );

    if (!confirmDelete) return;

    setUploadMessage(''); setEditMessage(''); setGeneralMessage(''); setErrorMessage('');

    try {
      // Uses axiosInstance and relative path
      await axiosInstance.delete(`${API_TOPICS_PATH}/${id}`);
      setGeneralMessage(`Đã xóa chủ đề "${topicToDelete?.name || 'đã chọn'}" thành công.`);
      await fetchTopics();
      if (editingId === id) {
        cancelEdit();
      }
      if (currentTopics.length === 1 && currentPage > 1 && topics.length > 1) {
        setCurrentPage(currentPage - 1);
      } else if (topics.length === 1 && currentTopics.length === 1) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Lỗi khi xóa chủ đề:", error);
      let errMsg = 'Lỗi không xác định khi xóa chủ đề.';
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiErrorResponse;
        errMsg = serverError?.error || error.message;
      } else if (error instanceof Error) { errMsg = error.message; }
      setErrorMessage(`Xóa thất bại: ${errMsg}`);
    } finally {
        setTimeout(() => {
            setGeneralMessage('');
            setErrorMessage('');
        }, 5000);
    }
  };

  const getCategoryName = (categoryData?: CategoryType | string | null): string => {
    if (!categoryData) return 'Chưa có';
    if (typeof categoryData === 'object' && categoryData.name) return categoryData.name;
    if (typeof categoryData === 'string') {
        const foundCat = categories.find(c => c._id === categoryData);
        return foundCat ? foundCat.name : 'Không xác định';
    }
    return 'Không xác định';
  };

  const indexOfLastTopic = currentPage * TOPICS_PER_PAGE;
  const indexOfFirstTopic = indexOfLastTopic - TOPICS_PER_PAGE;
  const currentTopics = topics.slice(indexOfFirstTopic, indexOfLastTopic);
  const totalPages = Math.ceil(topics.length / TOPICS_PER_PAGE);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 1) return null;
    const maxPageButtons = 3;
    let startPage: number, endPage: number;

    if (totalPages <= maxPageButtons) { startPage = 1; endPage = totalPages; }
    else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPageButtons / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPageButtons / 2) - 1;
      if (currentPage <= maxPagesBeforeCurrentPage) { startPage = 1; endPage = maxPageButtons; }
      else if (currentPage + maxPagesAfterCurrentPage >= totalPages) { startPage = totalPages - maxPageButtons + 1; endPage = totalPages; }
      else { startPage = currentPage - maxPagesBeforeCurrentPage; endPage = currentPage + maxPagesAfterCurrentPage; }
    }
    if (startPage > 1) { pageNumbers.push( <button key={1} onClick={() => paginate(1)} className="mx-1 px-3 py-1 border rounded text-sm bg-white text-blue-500 hover:bg-blue-100">1</button> ); if (startPage > 2) { pageNumbers.push(<span key="start-ellipsis" className="py-2 px-4 mx-1 text-gray-400">...</span>); } }
    for (let i = startPage; i <= endPage; i++) { pageNumbers.push( <button key={i} onClick={() => paginate(i)} className={`mx-1 px-3 py-1 border rounded text-sm ${ currentPage === i ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-100' }`} > {i} </button> ); }
    if (endPage < totalPages) { if (endPage < totalPages - 1) { pageNumbers.push(<span key="end-ellipsis" className="py-2 px-4 mx-1 text-gray-400">...</span>); } pageNumbers.push( <button key={totalPages} onClick={() => paginate(totalPages)} className="mx-1 px-3 py-1 border rounded text-sm bg-white text-blue-500 hover:bg-blue-100">{totalPages}</button> ); }
    return pageNumbers;
  };
  // JSX for rendering the component (forms, list, pagination) remains the same
  // ... (rest of the return statement from your original AdminTopics.tsx) ...
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center text-gray-800">Quản lý Chủ đề (Topics)</h1>

      {generalMessage && <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700 border border-blue-300 text-center">{generalMessage}</div>}
      {errorMessage && <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300 text-center">{errorMessage}</div>}

      {!editingId && (
        <form onSubmit={handleAddTopic} className="mb-8 sm:mb-10 p-5 sm:p-6 bg-white shadow-xl rounded-lg">
          <h2 className="text-xl sm:text-2xl font-medium mb-5 sm:mb-6 text-gray-700">
            Thêm Chủ đề mới
          </h2>
          {uploadMessage && (
            <p className={`mb-3 p-2 text-sm rounded ${uploadMessage.includes('thất bại') || uploadMessage.includes('Lỗi:') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {uploadMessage}
            </p>
          )}
          <div className="mb-4 sm:mb-5">
            <label htmlFor="newTopicCategoryId" className="block text-sm font-medium text-gray-600 mb-1">
              Thuộc Chuyên mục (Category):<span className="text-red-500">*</span>
            </label>
            <select
              id="newTopicCategoryId"
              value={newTopicCategoryId}
              onChange={(e) => setNewTopicCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              disabled={isUploading || categories.length === 0}
              required
            >
              {categories.length === 0 && <option value="">-- Vui lòng tạo Chuyên mục trước --</option>}
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="newTopicName" className="block text-sm font-medium text-gray-600 mb-1">
              Tên chủ đề:<span className="text-red-500">*</span>
            </label>
            <input
              id="newTopicName" type="text" value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Nhập tên chủ đề"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              disabled={isUploading} required
            />
          </div>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="newTopicImage" className="block text-sm font-medium text-gray-600 mb-1">
              Hình ảnh chủ đề (tùy chọn):
            </label>
            <input
              id="newTopicImage" type="file" accept="image/*"
              key={newTopicImageFile?.name || 'newFileKeyAddForm'}
              onChange={(e) => handleFileChange(e, setNewTopicImageFile, setNewTopicImagePreview)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              disabled={isUploading}
            />
          </div>
          {newTopicImagePreview && (
            <div className="mb-4 sm:mb-5">
              <p className="text-xs text-gray-500 mb-1">Xem trước:</p>
               <div className="relative inline-block">
                <img
                src={newTopicImagePreview} alt="Xem trước ảnh mới"
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md border border-gray-200"
                />
                <button
                    type="button"
                    onClick={() => {
                        if (isUploading) return;
                        setNewTopicImagePreview(null); setNewTopicImageFile(null);
                        const fileInput = document.getElementById('newTopicImage') as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                    }}
                    disabled={isUploading}
                    className="absolute top-0 right-0 mt-1 mr-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none hover:bg-red-600 disabled:opacity-50"
                    title="Gỡ ảnh này"
                >✕</button>
            </div>
            </div>
          )}
          <button
            type="submit"
            disabled={isUploading || categories.length === 0}
            className="w-full font-medium py-2.5 px-5 rounded-lg text-white transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Đang thêm...' : (categories.length === 0 ? 'Hãy tạo Chuyên mục trước' : 'Thêm Chủ đề')}
          </button>
        </form>
      )}

      {editingId && (
        <form id="edit-topic-form" onSubmit={handleEditTopic} className="mb-8 sm:mb-10 p-5 sm:p-6 bg-white shadow-xl rounded-lg border-2 border-yellow-400">
          <h2 className="text-xl sm:text-2xl font-medium mb-5 sm:mb-6 text-gray-700">
            Chỉnh sửa Chủ đề: <span className="font-bold">{editingName}</span>
          </h2>
          {editMessage && (
            <p className={`mb-3 p-2 text-sm rounded ${editMessage.includes('thất bại') || editMessage.includes('Lỗi:') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {editMessage}
            </p>
          )}
          <div className="mb-4 sm:mb-5">
            <label htmlFor="editingCategoryId" className="block text-sm font-medium text-gray-600 mb-1">
              Thuộc Chuyên mục (Category):<span className="text-red-500">*</span>
            </label>
            <select
              id="editingCategoryId"
              value={editingCategoryId}
              onChange={(e) => setEditingCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
              disabled={isEditing || categories.length === 0}
              required
            >
              {categories.length === 0 && <option value="">-- Không có chuyên mục --</option>}
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="editingTopicName" className="block text-sm font-medium text-gray-600 mb-1">
              Tên chủ đề:<span className="text-red-500">*</span>
            </label>
            <input
              id="editingTopicName" type="text" value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="Nhập tên chủ đề"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
              disabled={isEditing} required
            />
          </div>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="editingTopicImage" className="block text-sm font-medium text-gray-600 mb-1">
              Thay đổi hình ảnh (tùy chọn):
            </label>
            <input
              id="editingTopicImage" type="file" accept="image/*"
              key={editingImageFile?.name || 'editFileKeyForm'}
              onChange={(e) => handleFileChange(e, setEditingImageFile, setEditingImagePreview)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer"
              disabled={isEditing}
            />
          </div>
          {editingImagePreview && (
            <div className="mb-4 sm:mb-5">
              <p className="text-xs text-gray-500 mb-1">Xem trước:</p>
               <div className="relative inline-block">
                <img
                  src={editingImagePreview} alt="Xem trước ảnh sửa đổi"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                      if (isEditing) return;
                      setEditingImagePreview(null);
                      setEditingImageFile(null);
                      const fileInput = document.getElementById('editingTopicImage') as HTMLInputElement;
                      if (fileInput) fileInput.value = "";
                  }}
                  disabled={isEditing}
                  className="absolute top-0 right-0 mt-1 mr-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none hover:bg-red-600 disabled:opacity-50"
                  title="Gỡ ảnh này (nếu lưu và không chọn ảnh mới, ảnh hiện tại sẽ bị xóa)"
                >✕</button>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={isEditing || categories.length === 0}
              className="w-full font-medium py-2.5 px-5 rounded-lg text-white transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-green-500 hover:bg-green-600 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {isEditing ? 'Đang lưu...' : (categories.length === 0 ? 'Hãy chọn Chuyên mục' : 'Lưu Thay đổi')}
            </button>
            <button
              type="button" onClick={cancelEdit}
              disabled={isEditing}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2.5 px-5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div>
        <h2 className="text-xl sm:text-2xl font-medium mb-5 sm:mb-6 text-gray-700">
          Danh sách Chủ đề ({topics.length})
        </h2>
        {topics.length === 0 && !editingId && !errorMessage && (
          <p className="text-gray-500 text-center py-4 bg-white rounded-md shadow">
            Không có chủ đề nào. Hãy thêm một chủ đề mới.
          </p>
        )}
        {currentTopics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {currentTopics.map((topic) => (
              <div
                key={topic._id}
                className="p-3 sm:p-4 bg-white shadow-lg rounded-lg flex flex-col"
              >
                <div className="flex items-start mb-2 flex-grow min-w-0">
                  {topic.imageUrl && (
                    <img
                      src={topic.imageUrl} alt={topic.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md mr-3 sm:mr-4 border border-gray-200 flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; target.src = 'https://via.placeholder.com/80?text=Lỗi';
                      }}
                    />
                  )}
                  <div className="flex-grow overflow-hidden">
                    <span className="text-md sm:text-lg font-medium text-gray-800 block truncate" title={topic.name}>
                        {topic.name}
                    </span>
                    <span className="text-xs text-indigo-600 block mt-1">
                        Chuyên mục: {getCategoryName(topic.category)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 self-end flex-shrink-0 mt-auto pt-2">
                  <button
                    onClick={() => startEdit(topic)}
                    disabled={isEditing && editingId === topic._id}
                    className="py-1 px-3 sm:py-1.5 sm:px-4 text-xs sm:text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors disabled:opacity-50"
                  >Sửa</button>
                  <button
                    onClick={() => handleDelete(topic._id)}
                    disabled={isUploading || isEditing}
                    className="py-1 px-3 sm:py-1.5 sm:px-4 text-xs sm:text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
                  >Xoá</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="mx-1 px-3 py-1 border rounded text-sm bg-white text-blue-500 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &laquo; Trước
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="mx-1 px-3 py-1 border rounded text-sm bg-white text-blue-500 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTopics;