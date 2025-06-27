// file: src/components/AdminCategories.tsx
import React, { useEffect, useState, ChangeEvent, FormEvent, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import axiosInstance from '../lib/axiosInstance';

type Category = {
  _id: string;
  name: string;
  description?: string;
};

interface ApiErrorResponse {
  error: string;
  hasTopics?: boolean;
}

const CATEGORIES_PER_PAGE = 6;

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDescription, setNewCategoryDescription] = useState<string>('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingDescription, setEditingDescription] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [currentPage, setCurrentPage] = useState<number>(1);

  const CATEGORIES_API_PATH = '/api/categories';

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get<Category[]>(CATEGORIES_API_PATH);
      const fetchedCategories = Array.isArray(res.data) ? res.data : [];
      setCategories(fetchedCategories);

      // Adjust current page if the last item on it was deleted
      const totalPages = Math.ceil(fetchedCategories.length / CATEGORIES_PER_PAGE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }

    } catch (err) {
      console.error("Lỗi khi tải danh sách chuyên mục:", err);
      setErrorMessage("Không thể tải danh sách chuyên mục.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetAddForm = () => {
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setErrorMessage("Tên chuyên mục không được để trống.");
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setIsLoading(true);
    setMessage('Đang thêm chuyên mục...');
    setErrorMessage('');

    try {
      await axiosInstance.post(CATEGORIES_API_PATH, {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
      });
      setMessage('Thêm chuyên mục thành công!');
      resetAddForm();
      setCurrentPage(1); 
      await fetchCategories();
    } catch (error) {
      console.error("Lỗi khi thêm chuyên mục:", error);
      let errMsg = 'Lỗi không xác định khi thêm chuyên mục.';
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiErrorResponse;
        errMsg = serverError?.error || error.message;
      } else if (error instanceof Error) { errMsg = error.message; }
      setErrorMessage(`Lỗi: ${errMsg}`);
      setMessage('');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setMessage('');
        setErrorMessage('');
      }, 3000);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category._id);
    setEditingName(category.name);
    setEditingDescription(category.description || '');
    setMessage('');
    setErrorMessage('');
    const formElement = document.getElementById('edit-category-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingDescription('');
    setIsLoading(false);
  };

  const handleEditCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingName.trim() || !editingId) {
      setErrorMessage("Tên chuyên mục không được để trống.");
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setIsLoading(true);
    setMessage('Đang cập nhật chuyên mục...');
    setErrorMessage('');

    try {
      await axiosInstance.put(`${CATEGORIES_API_PATH}/${editingId}`, {
        name: editingName.trim(),
        description: editingDescription.trim(),
      });
      setMessage('Cập nhật chuyên mục thành công!');
      await fetchCategories();
      setTimeout(() => { cancelEdit(); }, 1500);
    } catch (error) {
      console.error("Lỗi khi sửa chuyên mục:", error);
      let errMsg = 'Lỗi không xác định khi sửa chuyên mục.';
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiErrorResponse;
        errMsg = serverError?.error || error.message;
      } else if (error instanceof Error) { errMsg = error.message; }
      setErrorMessage(`Lỗi: ${errMsg}`);
      setMessage('');
       setIsLoading(false);
    } finally {
       setTimeout(() => {
        setMessage('');
        setErrorMessage('');
      }, 3000);
    }
  };

  const handleDelete = async (id: string) => {
    const categoryToDelete = categories.find(c => c._id === id);
    const confirmMessage = `Bạn có chắc chắn muốn xóa chuyên mục "${categoryToDelete?.name || id}" không? Hành động này không thể hoàn tác.`;
    if (!window.confirm(confirmMessage)) return;

    setIsLoading(true);
    setMessage(`Đang xóa chuyên mục ${categoryToDelete?.name}...`);
    setErrorMessage('');
    try {
      await axiosInstance.delete(`${CATEGORIES_API_PATH}/${id}`);
      setMessage(`Chuyên mục "${categoryToDelete?.name || id}" đã được xóa.`);
      if (editingId === id) cancelEdit();
      await fetchCategories();
    } catch (error) {
      console.error("Lỗi khi xóa chuyên mục:", error);
      let errMsg = 'Lỗi không xác định khi xóa chuyên mục.';
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiErrorResponse;
        errMsg = serverError?.error || error.message;
        if (serverError?.hasTopics) {
            errMsg = `Không thể xóa: ${serverError.error}`;
        }
      } else if (error instanceof Error) { errMsg = error.message; }
      setErrorMessage(`Lỗi: ${errMsg}`);
      setMessage('');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
          setMessage('');
          setErrorMessage('');
      }, 5000);
    }
  };
    
  const indexOfLastCategory = currentPage * CATEGORIES_PER_PAGE;
  const indexOfFirstCategory = indexOfLastCategory - CATEGORIES_PER_PAGE;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 1) return null;
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
            <button key={i} onClick={() => paginate(i)} disabled={i === currentPage} className={`py-2 px-4 border rounded-md text-sm disabled:opacity-100 ${i === currentPage ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}>
                {i}
            </button>
        );
    }
    return pageNumbers;
  };
  
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto bg-slate-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center text-slate-800">Quản lý Chuyên mục</h1>

      {message && <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 border border-green-300 text-center">{message}</div>}
      {errorMessage && <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-300 text-center">{errorMessage}</div>}

      {!editingId && (
        <form onSubmit={handleAddCategory} className="mb-10 p-6 bg-white shadow-lg rounded-lg border border-slate-200">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Thêm Chuyên mục mới</h2>
          <div className="mb-4">
            <label htmlFor="newCategoryName" className="block text-sm font-medium text-slate-600 mb-1">Tên Chuyên mục:<span className="text-red-500">*</span></label>
            <input
              id="newCategoryName" type="text" value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="VD: Nghị luận xã hội"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
              disabled={isLoading} required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="newCategoryDescription" className="block text-sm font-medium text-slate-600 mb-1">Mô tả (tùy chọn):</label>
            <textarea
              id="newCategoryDescription" value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="Mô tả ngắn về chuyên mục này"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
              disabled={isLoading}
            />
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full font-semibold py-2.5 px-5 rounded-lg text-white transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xử lý...' : 'Thêm Chuyên mục'}
          </button>
        </form>
      )}

      {editingId && (
        <form id="edit-category-form" onSubmit={handleEditCategory} className="mb-10 p-6 bg-white shadow-lg rounded-lg border-2 border-amber-400">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700">Chỉnh sửa Chuyên mục</h2>
          <div className="mb-4">
            <label htmlFor="editingName" className="block text-sm font-medium text-slate-600 mb-1">Tên Chuyên mục:<span className="text-red-500">*</span></label>
            <input
              id="editingName" type="text" value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900"
              disabled={isLoading} required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="editingDescription" className="block text-sm font-medium text-slate-600 mb-1">Mô tả (tùy chọn):</label>
            <textarea
              id="editingDescription" value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={isLoading}
              className="flex-1 font-semibold py-2.5 px-5 rounded-lg text-white transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 disabled:bg-amber-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu Thay đổi'}
            </button>
            <button type="button" onClick={cancelEdit} disabled={isLoading}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2.5 px-5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-5 text-slate-700">Danh sách Chuyên mục ({categories.length})</h2>
        {isLoading && categories.length === 0 && <p className="text-slate-500 text-center py-4">Đang tải chuyên mục...</p>}
        {!isLoading && categories.length === 0 && !editingId && (
          <div className="text-center py-10 bg-white rounded-lg shadow-md border border-slate-200">
             <p className="text-slate-500">Không có chuyên mục nào.</p>
             <p className="text-slate-400 text-sm mt-1">Hãy bắt đầu bằng việc thêm một chuyên mục mới ở trên.</p>
          </div>
        )}
        {currentCategories.length > 0 && (
          <div className="space-y-4">
            {currentCategories.map((category) => (
              <div key={category._id} className="p-4 bg-white shadow-md rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-indigo-700">{category.name}</h3>
                  {category.description && <p className="text-sm text-slate-600 mt-1">{category.description}</p>}
                  <p className="text-xs text-slate-400 mt-2">ID: {category._id}</p>
                </div>
                <div className="flex space-x-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => startEdit(category)}
                    disabled={isLoading && editingId === category._id}
                    className="py-2 px-4 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors disabled:opacity-50"
                  >Sửa</button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    disabled={isLoading}
                    className="py-2 px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                  >Xoá</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center flex-wrap gap-2">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="py-2 px-4 border rounded-md text-sm bg-white text-slate-700 border-slate-300 hover:bg-slate-100 disabled:opacity-50">&laquo; Trước</button>
            {renderPageNumbers()}
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="py-2 px-4 border rounded-md text-sm bg-white text-slate-700 border-slate-300 hover:bg-slate-100 disabled:opacity-50">Sau &raquo;</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;