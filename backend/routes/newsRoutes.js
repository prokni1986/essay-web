import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import News from '../models/News.js';
import authenticateToken from '../config/authMiddleware.js';
import { isAdmin } from '../config/adminMiddleware.js';

const router = express.Router();

// --- Cấu hình Multer và Cloudinary ---
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

// --- Các hàm helper để xử lý upload/delete với Cloudinary ---
const uploadToCloudinary = (fileBuffer, originalFilename) => {
  return new Promise((resolve, reject) => {
    const uniqueFilename = `news-${Date.now()}-${originalFilename.replace(/\s+/g, '_')}`;
    const folder = 'news_thumbnails';
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

// --- PUBLIC ROUTES ---
router.get('/', async (req, res) => {
    try {
        const newsList = await News.find({ status: 'published' })
             .sort({ publishedAt: -1 })
             .populate('tags'); // THAY ĐỔI: Lấy thông tin chi tiết của tags
        res.json(newsList);
    } catch (error) { res.status(500).json({ message: "Lỗi máy chủ." }); }
});

router.get('/:slug', async (req, res) => {
    try {
        const newsArticle = await News.findOne({ slug: req.params.slug, status: 'published' })
            .populate('tags'); // THAY ĐỔỔI: Lấy thông tin chi tiết của tags
        if (!newsArticle) return res.status(404).json({ message: "Không tìm thấy bài viết." });
        res.json(newsArticle);
    } catch (error) { res.status(500).json({ message: "Lỗi máy chủ." }); }
});


// --- ADMIN ROUTES ---

// Tạo bài viết mới
router.post('/admin', [authenticateToken, isAdmin], upload.single('image'), async (req, res) => {
  try {
    // THAY ĐỔI: Thêm 'tags' vào destructuring
    const { title, content, status, slug, tags } = req.body;
    if (!title || !content || !slug) {
        return res.status(400).json({ message: 'Tiêu đề, nội dung và slug là bắt buộc.' });
    }

    // THAY ĐỔI: Parse chuỗi JSON tags thành mảng
    const parsedTags = tags ? JSON.parse(tags) : [];

    let thumbnailUrl = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      thumbnailUrl = uploadResult.secure_url;
    }
    const newNews = new News({
      title, content, slug, status, thumbnailUrl,
      tags: parsedTags, // THAY ĐỔI: Thêm tags vào bài viết mới
      publishedAt: status === 'published' ? new Date() : null,
    });
    await newNews.save();
    res.status(201).json(newNews);
  } catch (error) {
    console.error("Lỗi khi tạo tin tức:", error);
    res.status(500).json({ message: error.message });
  }
});

// Cập nhật bài viết
router.put('/admin/:id', [authenticateToken, isAdmin], upload.single('image'), async (req, res) => {
  try {
      const { title, content, status, slug, tags } = req.body;

      // THAY ĐỔI 1: Đảm bảo mảng tags luôn là duy nhất (unique)
      // Dùng `new Set` để tự động loại bỏ các phần tử trùng lặp từ frontend gửi lên
      const uniqueParsedTags = [...new Set(tags ? JSON.parse(tags) : [])];

      const updateData = { 
          title, 
          content, 
          status, 
          slug, 
          tags: uniqueParsedTags // Sử dụng mảng tags đã được làm sạch
      };

      const newsToUpdate = await News.findById(req.params.id);
      if (!newsToUpdate) {
           return res.status(404).json({ message: "Không tìm thấy bài viết để cập nhật." });
      }
      
      // Giữ lại ảnh cũ nếu không có ảnh mới được tải lên
      updateData.thumbnailUrl = newsToUpdate.thumbnailUrl;

      if (req.file) {
          if (newsToUpdate.thumbnailUrl) {
              const publicId = getPublicIdFromUrl(newsToUpdate.thumbnailUrl);
              if (publicId) await deleteFromCloudinary(publicId);
          }
          const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
          updateData.thumbnailUrl = uploadResult.secure_url;
      }
      
      // THAY ĐỔI 2: Dùng $set để đảm bảo an toàn và tường minh
      // Lệnh $set sẽ thay thế hoàn toàn giá trị của các trường được chỉ định
      const updatedNews = await News.findByIdAndUpdate(
          req.params.id, 
          { $set: updateData }, // Dùng $set để thay thế dữ liệu
          { new: true }
      ).populate('tags'); // Populate lại để trả về dữ liệu mới nhất

      res.json(updatedNews);
  } catch (error) {
      console.error("Lỗi khi cập nhật tin tức:", error);
      res.status(500).json({ message: error.message });
  }
});

// Xóa bài viết
router.delete('/admin/:id', [authenticateToken, isAdmin], async (req, res) => {
    try {
        const newsToDelete = await News.findById(req.params.id);
        if (!newsToDelete) {
            return res.status(404).json({ message: "Không tìm thấy bài viết để xóa." });
        }
        if (newsToDelete.thumbnailUrl) {
            const publicId = getPublicIdFromUrl(newsToDelete.thumbnailUrl);
            if (publicId) await deleteFromCloudinary(publicId);
        }
        await News.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa bài viết thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa tin tức:", error);
        res.status(500).json({ message: error.message });
    }
});

// Lấy tất cả bài viết cho trang Admin
router.get('/admin/all', [authenticateToken, isAdmin], async (req, res) => {
    try {
        const allNews = await News.find({})
            .sort({ createdAt: -1 })
            .populate('tags'); // THAY ĐỔI: Lấy thông tin chi tiết của tags
        res.json(allNews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
});


export default router;