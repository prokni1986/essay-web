// backend/controllers/lectureController.js
import Lecture from '../models/Lecture.js';
import LectureCategory from '../models/LectureCategory.js'; // Cần để xác thực category
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import asyncHandler from 'express-async-handler'; // Dùng để bọc các hàm, xử lý lỗi async

// --- Các hàm tiện ích cho Cloudinary (Lấy từ topicRoutes.js) ---
const uploadToCloudinary = (fileBuffer, originalFilename) => {
  return new Promise((resolve, reject) => {
    // Tạo tên file duy nhất để tránh ghi đè trên Cloudinary
    const uniqueFilename = `${Date.now()}-${originalFilename.replace(/\s+/g, '_')}`;
    const folder = 'lecture_thumbnail_images'; // Thư mục lưu ảnh cho bài giảng

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, public_id: uniqueFilename },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload failed, no result.'));
        // Resolve với cả URL và public_id
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

// --- CRUD Controllers for Lectures ---

/**
 * @desc    Lấy tất cả bài giảng
 * @route   GET /api/lectures
 * @access  Public
 */
export const getLectures = asyncHandler(async (req, res) => {
  const lectures = await Lecture.find({}).populate('lectureCategory', 'name').sort({ createdAt: -1 });
  res.json(lectures);
});

/**
 * @desc    Lấy một bài giảng theo ID
 * @route   GET /api/lectures/:id
 * @access  Public
 */
export const getLectureById = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id).populate('lectureCategory', 'name');
  if (lecture) {
    res.json(lecture);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy bài giảng');
  }
});

/**
 * @desc    Tạo bài giảng mới (có xử lý ảnh)
 * @route   POST /api/lectures
 * @access  Private/Admin
 */
export const createLecture = asyncHandler(async (req, res) => {
  const { name, description, videoUrl, content, lectureCategory, grade } = req.body;

  // --- Xử lý upload ảnh ---
  let imageUrl = undefined; // Dùng undefined để không ghi trường rỗng vào DB
  let imagePublicId = undefined;

  if (req.file) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    } catch (uploadError) {
      res.status(500);
      throw new Error(`Lỗi upload ảnh: ${uploadError.message}`);
    }
  }

  const lecture = new Lecture({
    name,
    description,
    videoUrl,
    content,
    lectureCategory,
    grade,
    imageUrl,
    imagePublicId,
  });

  const createdLecture = await lecture.save();
  const populatedLecture = await Lecture.findById(createdLecture._id).populate('lectureCategory', 'name');
  res.status(201).json(populatedLecture);
});

/**
 * @desc    Cập nhật một bài giảng (có xử lý ảnh)
 * @route   PUT /api/lectures/:id
 * @access  Private/Admin
 */
export const updateLecture = asyncHandler(async (req, res) => {
  const { name, description, videoUrl, content, lectureCategory, grade, removeCurrentImage } = req.body;
  const lectureId = req.params.id;

  const lecture = await Lecture.findById(lectureId);

  if (!lecture) {
    res.status(404);
    throw new Error('Không tìm thấy bài giảng');
  }

  // Cập nhật các trường thông tin
  lecture.name = name || lecture.name;
  lecture.description = description !== undefined ? description : lecture.description;
  lecture.videoUrl = videoUrl !== undefined ? videoUrl : lecture.videoUrl;
  lecture.content = content !== undefined ? content : lecture.content;
  lecture.lectureCategory = lectureCategory || lecture.lectureCategory;
  lecture.grade = grade || lecture.grade;

  // --- Xử lý cập nhật/xóa ảnh ---
  // Trường hợp 1: Có file ảnh mới được tải lên
  if (req.file) {
    // Nếu có ảnh cũ, xóa nó khỏi Cloudinary
    if (lecture.imagePublicId) {
      await deleteFromCloudinary(lecture.imagePublicId);
    }
    // Upload ảnh mới
    const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    lecture.imageUrl = uploadResult.secure_url;
    lecture.imagePublicId = uploadResult.public_id;
  }
  // Trường hợp 2: Người dùng muốn xóa ảnh hiện tại và không tải lên ảnh mới
  else if (removeCurrentImage === 'true' && lecture.imagePublicId) {
    await deleteFromCloudinary(lecture.imagePublicId);
    lecture.imageUrl = 'https://via.placeholder.com/400x225?text=Bài+Giảng'; // Reset về ảnh mặc định
    lecture.imagePublicId = null;
  }

  const updatedLecture = await lecture.save();
  const populatedLecture = await Lecture.findById(updatedLecture._id).populate('lectureCategory', 'name');
  res.json(populatedLecture);
});

/**
 * @desc    Xóa một bài giảng (có xóa ảnh)
 * @route   DELETE /api/lectures/:id
 * @access  Private/Admin
 */
export const deleteLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  if (lecture) {
    // Nếu bài giảng có ảnh, xóa ảnh đó khỏi Cloudinary trước
    if (lecture.imagePublicId) {
      try {
        await deleteFromCloudinary(lecture.imagePublicId);
      } catch (deleteError) {
          // Ghi lại lỗi nhưng vẫn tiếp tục xóa bản ghi trong DB
          console.error(`Không thể xóa ảnh ${lecture.imagePublicId} từ Cloudinary: `, deleteError);
      }
    }
    await lecture.deleteOne(); // Sử dụng deleteOne() thay vì remove()
    res.json({ message: 'Đã xóa bài giảng' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy bài giảng');
  }
});