import Lecture from '../models/Lecture.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import slugify from 'slugify'; // Cần import thư viện slugify

// --- Helper Functions for Cloudinary (tương tự newsRoutes.js) ---
const uploadToCloudinary = (fileBuffer, originalFilename) => {
  return new Promise((resolve, reject) => {
    const uniqueFilename = `lecture-${Date.now()}-${originalFilename.replace(/\s+/g, '_')}`;
    const folder = 'lecture_thumbnails'; // Thư mục lưu ảnh bài giảng trên Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, public_id: uniqueFilename },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload failed, no result.'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const getPublicIdFromUrl = (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return null;
    try {
        const parts = imageUrl.split('/');
        const uploadIndex = parts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) return null;
        let publicIdWithFormat = parts.slice(uploadIndex + 2).join('/');
        const lastDotIndex = publicIdWithFormat.lastIndexOf('.');
        return lastDotIndex !== -1 ? publicIdWithFormat.substring(0, lastDotIndex) : publicIdWithFormat;
    } catch (e) { console.error("Error extracting public_id:", e); return null; }
};

const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

// @desc    Get all lectures
// @route   GET /api/lectures
// @access  Public
export const getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find({}).populate('lectureCategory');
    res.status(200).json(lectures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single lecture by ID
// @route   GET /api/lectures/:id
// @access  Public
export const getLectureById = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate('lectureCategory');
    if (!lecture) {
      return res.status(404).json({ message: 'Bài giảng không tìm thấy.' });
    }
    res.status(200).json(lecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single lecture by slug
// @route   GET /api/lectures/slug/:slug
// @access  Public
export const getLectureBySlug = async (req, res) => {
  try {
    const lecture = await Lecture.findOne({ slug: req.params.slug }).populate('lectureCategory');
    if (!lecture) {
      return res.status(404).json({ message: 'Bài giảng không tìm thấy.' });
    }
    res.status(200).json(lecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Create a lecture
// @route   POST /api/lectures
// @access  Private/Admin (Bạn có thể thêm middleware authenticateToken, isAdmin nếu cần)
export const createLecture = async (req, res) => {
  const { name, description, videoUrl, content, lectureCategory, grade } = req.body;

  try {
    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }
    
    // Tạo slug từ tên bài giảng
    const newSlug = slugify(name, { lower: true, strict: true });

    const newLecture = new Lecture({
      name,
      slug: newSlug, // Lưu slug vào model
      description,
      imageUrl,
      imagePublicId, // Lưu public_id
      videoUrl,
      content, // Lưu nội dung chi tiết
      lectureCategory,
      grade,
    });

    const createdLecture = await newLecture.save();
    res.status(201).json(createdLecture);
  } catch (error) {
    console.error("Error creating lecture:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a lecture
// @route   PUT /api/lectures/:id
// @access  Private/Admin
export const updateLecture = async (req, res) => {
  const { name, description, videoUrl, content, lectureCategory, grade, removeCurrentImage } = req.body;

  try {
    const lectureToUpdate = await Lecture.findById(req.params.id);

    if (!lectureToUpdate) {
      return res.status(404).json({ message: 'Bài giảng không tìm thấy.' });
    }

    // Cập nhật các trường
    lectureToUpdate.name = name;
    lectureToUpdate.description = description;
    lectureToUpdate.videoUrl = videoUrl;
    lectureToUpdate.content = content; // Cập nhật nội dung chi tiết
    lectureToUpdate.lectureCategory = lectureCategory;
    lectureToUpdate.grade = grade;
    
    // Tự động cập nhật slug nếu tên bài giảng thay đổi
    if (lectureToUpdate.name !== name) {
      lectureToUpdate.slug = slugify(name, { lower: true, strict: true });
    }

    // Xử lý ảnh bìa
    if (req.file) {
      // Nếu có ảnh mới, xóa ảnh cũ (nếu có)
      if (lectureToUpdate.imagePublicId) {
        await deleteFromCloudinary(lectureToUpdate.imagePublicId);
      }
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      lectureToUpdate.imageUrl = uploadResult.secure_url;
      lectureToUpdate.imagePublicId = uploadResult.public_id;
    } else if (removeCurrentImage === 'true' && lectureToUpdate.imagePublicId) {
        // Nếu không có file mới và có yêu cầu xóa ảnh hiện tại
        await deleteFromCloudinary(lectureToUpdate.imagePublicId);
        lectureToUpdate.imageUrl = undefined;
        lectureToUpdate.imagePublicId = undefined;
    }

    const updatedLecture = await lectureToUpdate.save();
    res.status(200).json(updatedLecture);
  } catch (error) {
    console.error("Error updating lecture:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a lecture
// @route   DELETE /api/lectures/:id
// @access  Private/Admin
export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: 'Bài giảng không tìm thấy.' });
    }

    // Xóa ảnh khỏi Cloudinary nếu có
    if (lecture.imagePublicId) {
      await deleteFromCloudinary(lecture.imagePublicId);
    }

    await Lecture.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Bài giảng đã được xóa thành công.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};