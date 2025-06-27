// backend/controllers/lectureCategoryController.js
import LectureCategory from '../models/LectureCategory.js'; // Thay đổi require thành import và thêm .js

// Get all lecture categories
export const getLectureCategories = async (req, res) => {
  try {
    const categories = await LectureCategory.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy chuyên mục bài giảng', error: error.message });
  }
};

// Get single lecture category by ID
export const getLectureCategoryById = async (req, res) => {
  try {
    const category = await LectureCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy chuyên mục bài giảng' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy chuyên mục bài giảng', error: error.message });
  }
};

// Create a new lecture category
export const createLectureCategory = async (req, res) => {
  try {
    const newCategory = await LectureCategory.create(req.body);
    res.status(201).json(newCategory);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tên chuyên mục bài giảng đã tồn tại.' });
    }
    res.status(400).json({ message: 'Lỗi khi tạo chuyên mục bài giảng', error: error.message });
  }
};

// Update a lecture category
export const updateLectureCategory = async (req, res) => {
  try {
    const category = await LectureCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy chuyên mục bài giảng để cập nhật' });
    }
    res.status(200).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tên chuyên mục bài giảng đã tồn tại.' });
    }
    res.status(400).json({ message: 'Lỗi khi cập nhật chuyên mục bài giảng', error: error.message });
  }
};

// Delete a lecture category
export const deleteLectureCategory = async (req, res) => {
  try {
    const category = await LectureCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy chuyên mục bài giảng để xóa' });
    }
    // TODO: Consider deleting or re-assigning related Lectures here
    res.status(200).json({ message: 'Chuyên mục bài giảng đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xóa chuyên mục bài giảng', error: error.message });
  }
};