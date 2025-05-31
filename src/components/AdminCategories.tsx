// file: src/components/AdminCategories.tsx
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios, { AxiosError } from 'axios'; // Still needed for axios.isAxiosError and AxiosError type
import axiosInstance from '../lib/axiosInstance'; // Corrected path

type Category = {
  _id: string;
  name: string;
  description?: string;
};

interface ApiErrorResponse {
  error: string;
  hasTopics?: boolean; // For delete error
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
  const [message, setMessage] = useState<string>(''); // General messages
  const [errorMessage, setErrorMessage] = useState<string>(''); // Error messages

  const [currentPage, setCurrentPage] = useState<number>(1);

  const CATEGORIES_API_PATH = '/api/categories';

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get<Category[]>(CATEGORIES_API_PATH);
      setCategories(Array.isArray(res.data) ? res.data : []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Lỗi khi tải danh sách chuyên mục:", err);
      setErrorMessage("Không thể tải danh sách chuyên mục.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
      fetchCategories();
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
      }, 3000);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category._id);
    setEditingName(category.name);
    setEditingDescription(category.description || '');
    setMessage('');
    setErrorMessage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingDescription('');
    setIsLoading(false);
    setMessage('');
    setErrorMessage('');
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
      fetchCategories();
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
      fetchCategories();
      if (editingId === id) cancelEdit();
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
      }, 5000);
    }
  };

  const indexOfLastCategory = currentPage * CATEGORIES_PER_PAGE;
  const indexOfFirstCategory = indexOfLastCategory - CATEGORIES_PER_PAGE;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);

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
    if (startPage > 1) pageNumbers.push(<button key={1} onClick={() => paginate(1)} className="mx-1 px-3 py-1 border rounded text-sm bg-white text-blue-500 hover:bg-blue-100">1</button>);
    if (startPage > 2) pageNumbers.push(<span key="start-ellipsis" className="mx-1 px-2 py-1">...</span>);
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(<button key={i} onClick={() => paginate(i)} className={`mx-1 px-3 py-1 border rounded text-sm ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-100'}`}>{i}</button>);
    }
    if (endPage < totalPages) pageNumbers.push(<span key="end-ellipsis" className="mx-1 px-2 py-1">...</span>);
    if (endPage < totalPages) pageNumbers.push(<button key={totalPages} onClick={() => paginate(totalPages)} className="mx-1 px-3 py-1 border rounded text-sm bg-white text-blue-500 hover:bg-blue-100">{totalPages}</button>);
    return pageNumbers;
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center text-gray-800">Quản lý Chuyên mục (Categories)</h1>

      {message && <div className="mb-4 p-3 rounded bg-green-100 text-green-700 border border-green-300">{message}</div>}
      {errorMessage && <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300">{errorMessage}</div>}

      {!editingId && (
        <form onSubmit={handleAddCategory} className="mb-8 sm:mb-10 p-5 sm:p-6 bg-white shadow-xl rounded-lg">
          <h2 className="text-xl sm:text-2xl font-medium mb-5 sm:mb-6 text-gray-700">Thêm Chuyên mục mới</h2>
          <div className="mb-4">
            <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-600 mb-1">Tên Chuyên mục:<span className="text-red-500">*</span></label>
            <input
              id="newCategoryName" type="text" value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="VD: Nghị luận xã hội"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              disabled={isLoading} required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="newCategoryDescription" className="block text-sm font-medium text-gray-600 mb-1">Mô tả (tùy chọn):</label>
            <textarea
              id="newCategoryDescription" value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="Mô tả ngắn về chuyên mục này"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              disabled={isLoading}
            />
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full font-medium py-2.5 px-5 rounded-lg text-white transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xử lý...' : 'Thêm Chuyên mục'}
          </button>
        </form>
      )}

      {editingId && (
        <form onSubmit={handleEditCategory} className="mb-8 sm:mb-10 p-5 sm:p-6 bg-white shadow-xl rounded-lg border-2 border-yellow-400">
          <h2 className="text-xl sm:text-2xl font-medium mb-5 text-gray-700">Chỉnh sửa Chuyên mục: <span className="font-bold">{editingName}</span></h2>
          <div className="mb-4">
            <label htmlFor="editingName" className="block text-sm font-medium text-gray-600 mb-1">Tên Chuyên mục:<span className="text-red-500">*</span></label>
            <input
              id="editingName" type="text" value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
              disabled={isLoading} required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="editingDescription" className="block text-sm font-medium text-gray-600 mb-1">Mô tả (tùy chọn):</label>
            <textarea
              id="editingDescription" value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-900"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={isLoading}
              className="flex-1 font-medium py-2.5 px-5 rounded-lg text-white transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-green-500 hover:bg-green-600 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu Thay đổi'}
            </button>
            <button type="button" onClick={cancelEdit} disabled={isLoading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2.5 px-5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div>
        <h2 className="text-xl sm:text-2xl font-medium mb-5 text-gray-700">Danh sách Chuyên mục ({categories.length})</h2>
        {isLoading && categories.length === 0 && <p className="text-gray-500">Đang tải chuyên mục...</p>}
        {!isLoading && categories.length === 0 && !editingId && (
          <p className="text-gray-500 text-center py-4 bg-white rounded-md shadow">Không có chuyên mục nào. Hãy thêm một chuyên mục mới.</p>
        )}
        {currentCategories.length > 0 && (
          <div className="space-y-3">
            {currentCategories.map((category) => (
              <div key={category._id} className="p-4 bg-white shadow-md rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-grow mb-3 sm:mb-0">
                  <h3 className="text-lg font-semibold text-indigo-700">{category.name}</h3>
                  {category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">ID: {category._id}</p>
                </div>
                <div className="flex space-x-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => startEdit(category)}
                    disabled={isLoading && editingId === category._id}
                    className="py-1 px-3 text-xs sm:text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors disabled:opacity-50"
                  >Sửa</button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    disabled={isLoading}
                    className="py-1 px-3 text-xs sm:text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
                  >Xoá</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="mx-1 px-3 py-1 border rounded text-sm bg-white text-blue-500 hover:bg-blue-100 disabled:opacity-50">&laquo; Trước</button>
            {renderPageNumbers()}
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="mx-1 px-3 py-1 border rounded text-sm bg-white text-blue-500 hover:bg-blue-100 disabled:opacity-50">Sau &raquo;</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;