// File: routes/topicRoutes.js

import express from 'express';
import Topic from '../models/Topic.js';
import Category from '../models/Category.js'; // Import Category model for validation
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
const router = express.Router();

// --- Multer and Cloudinary setup (remains the same) ---
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép tải lên tệp hình ảnh.'), false);
    }
  }
});

const uploadToCloudinary = (fileBuffer, originalFilename) => {
  return new Promise((resolve, reject) => {
    const uniqueFilename = `${Date.now()}-${originalFilename.replace(/\s+/g, '_')}`;
    const folder = 'essay_topic_images';
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

const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

const getPublicIdFromUrl = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return null;
  try {
    const parts = imageUrl.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) return null;
    let publicIdWithFormatAndOptionalFolder = parts.slice(uploadIndex + 2).join('/');
    const lastDotIndex = publicIdWithFormatAndOptionalFolder.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      publicIdWithFormatAndOptionalFolder = publicIdWithFormatAndOptionalFolder.substring(0, lastDotIndex);
    }
    return publicIdWithFormatAndOptionalFolder;
  } catch (e) {
    console.error("Error extracting public_id:", e);
    return null;
  }
};

// Lấy danh sách topic - MODIFIED to populate category
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find()
                              .populate('category', 'name description') // Populate category name and description
                              .sort({ name: 1 }); // Sort by topic name
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: "Lỗi máy chủ khi lấy danh sách chủ đề." });
  }
});

// Lấy 1 topic theo id - MODIFIED to populate category
router.get('/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
                             .populate('category', 'name description'); // Populate category
    if (!topic) return res.status(404).json({ error: "Không tìm thấy chủ đề" });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tạo mới topic (có xử lý ảnh với Cloudinary) - MODIFIED
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, categoryId } = req.body; // ADD categoryId
    let imageUrl = null;
    // let imagePublicId = null; // Consider adding imagePublicId to schema for easier management

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Tên chủ đề không được để trống." });
    }
    if (!categoryId) { // ADD categoryId validation
        return res.status(400).json({ error: "Chủ đề cha (Category) là bắt buộc." });
    }

    // Validate categoryId
    const parentCategory = await Category.findById(categoryId);
    if (!parentCategory) {
        return res.status(400).json({ error: "Chủ đề cha (Category) không hợp lệ." });
    }

    const existingTopic = await Topic.findOne({ name: name.trim() });
    if (existingTopic) {
      return res.status(409).json({ error: `Chủ đề "${name.trim()}" đã tồn tại.` });
    }

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      imageUrl = uploadResult.secure_url;
      // imagePublicId = uploadResult.public_id;
    }

    // ADD categoryId to new Topic
    const topic = new Topic({ name: name.trim(), imageUrl, category: categoryId });
    await topic.save();
    // Populate category info for the response
    const populatedTopic = await Topic.findById(topic._id).populate('category', 'name');
    res.status(201).json(populatedTopic);
  } catch (err) {
    console.error("Lỗi khi tạo chủ đề:", err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Lỗi máy chủ khi tạo chủ đề mới." });
  }
});

// Sửa tên, ảnh và/hoặc category chủ đề (với Cloudinary) - MODIFIED
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, categoryId, removeCurrentImage } = req.body; // ADD categoryId
    const topicId = req.params.id;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Tên chủ đề không được để trống." });
    }
    // If categoryId is provided, validate it
    if (categoryId) {
        const parentCategory = await Category.findById(categoryId);
        if (!parentCategory) {
            return res.status(400).json({ error: "Chủ đề cha (Category) được cung cấp không hợp lệ." });
        }
    }

    const existingTopicWithSameName = await Topic.findOne({ name: name.trim(), _id: { $ne: topicId } });
    if (existingTopicWithSameName) {
        return res.status(409).json({ error: `Tên chủ đề "${name.trim()}" đã được sử dụng bởi một chủ đề khác.` });
    }

    const topicToUpdate = await Topic.findById(topicId);
    if (!topicToUpdate) {
        return res.status(404).json({ error: "Không tìm thấy chủ đề để cập nhật" });
    }

    let newImageUrl = topicToUpdate.imageUrl;
    // let newImagePublicId = topicToUpdate.imagePublicId; // If you store public_id

    if (req.file) { // Nếu có ảnh mới được tải lên
      if (topicToUpdate.imageUrl) {
        const oldPublicId = getPublicIdFromUrl(topicToUpdate.imageUrl);
        // const oldPublicId = topicToUpdate.imagePublicId; // If you store public_id
        if (oldPublicId) {
            await deleteFromCloudinary(oldPublicId);
        }
      }
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      newImageUrl = uploadResult.secure_url;
      // newImagePublicId = uploadResult.public_id;
    } else if (removeCurrentImage === 'true' && topicToUpdate.imageUrl) {
      const publicIdToDelete = getPublicIdFromUrl(topicToUpdate.imageUrl);
      // const publicIdToDelete = topicToUpdate.imagePublicId; // If you store public_id
      if (publicIdToDelete) {
          await deleteFromCloudinary(publicIdToDelete);
      }
      newImageUrl = null;
      // newImagePublicId = null;
    }

    const updatedTopicData = {
      name: name.trim(),
      imageUrl: newImageUrl,
      // imagePublicId: newImagePublicId,
    };
    if (categoryId) { // Update category if provided
        updatedTopicData.category = categoryId;
    }


    const updated = await Topic.findByIdAndUpdate(
      topicId,
      updatedTopicData,
      { new: true, runValidators: true }
    ).populate('category', 'name'); // Populate category info for the response

    if (!updated) return res.status(404).json({ error: "Không tìm thấy chủ đề sau khi cập nhật." });
    res.json(updated);
  } catch (err) {
    console.error("Lỗi khi cập nhật chủ đề:", err);
     if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Lỗi máy chủ khi cập nhật chủ đề." });
  }
});

// Xoá topic (và ảnh liên quan trên Cloudinary) - No change needed here regarding category logic
router.delete('/:id', async (req, res) => {
  try {
    const topicToDelete = await Topic.findById(req.params.id);
    if (!topicToDelete) return res.status(404).json({ error: "Không tìm thấy chủ đề để xoá" });

    if (topicToDelete.imageUrl) {
      const publicId = getPublicIdFromUrl(topicToDelete.imageUrl);
      // const publicId = topicToDelete.imagePublicId; // If you store public_id
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    await Topic.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa chủ đề' });
  } catch (err) {
    console.error("Lỗi khi xóa chủ đề:", err);
    res.status(500).json({ error: "Lỗi máy chủ khi xóa chủ đề." });
  }
});

export default router;