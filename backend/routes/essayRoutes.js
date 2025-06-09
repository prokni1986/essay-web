// file: routes/essayRoutes.js
import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinaryConfig.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Essay from '../models/Essay.js';
import Topic from '../models/Topic.js';
import authenticateTokenOptional from '../config/authMiddlewareOptional.js';
import UserSubscription from '../models/UserSubscription.js';

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'essay_audio_uploads',
    resource_type: 'auto',
  },
});
const upload = multer({ storage });

// 1. Lấy tất cả bài luận
router.get('/', async (req, res) => {
  try {
    const { topic: topicId, category: categoryId } = req.query;
    let essays;

    if (categoryId) {
      const topicsInCagegory = await Topic.find({ category: categoryId }).select('_id');
      const topicIds = topicsInCagegory.map(t => t._id);
      essays = await Essay.find({ topic: { $in: topicIds } })
        .populate({
          path: 'topic',
          select: 'name category',
          populate: { path: 'category', select: 'name _id' }
        })
        .sort({ createdAt: -1 });
    } else if (topicId) {
      essays = await Essay.find({ topic: topicId })
        .populate({
          path: 'topic',
          select: 'name category',
          populate: { path: 'category', select: 'name _id' }
        })
        .sort({ createdAt: -1 });
    } else {
      essays = await Essay.find({})
        .populate({
          path: 'topic',
          select: 'name category',
          populate: { path: 'category', select: 'name _id' }
        })
        .sort({ createdAt: -1 });
    }
    res.json(essays);
  } catch (err) {
    console.error("Error fetching essays:", err);
    res.status(500).json({ error: "Lỗi máy chủ khi lấy danh sách bài luận." });
  }
});

// 2. Lấy một bài luận theo id - ĐÃ ĐƯỢC SỬA LỖI
router.get('/:id', authenticateTokenOptional, async (req, res) => {
  try {
    const essay = await Essay.findById(req.params.id)
      .populate({
        path: 'topic',
        select: 'name category',
        populate: {
          path: 'category',
          select: 'name',
        },
      });

    if (!essay) {
      return res.status(404).json({ error: "Không tìm thấy bài luận." });
    }

    let canViewFullContent = false;
    let subscriptionStatus = 'none';
    const previewContentText = essay.outline || (essay.content ? essay.content.substring(0, 250) + '...' : "Nội dung giới hạn, vui lòng đăng ký để xem toàn bộ.");

    if (req.user) {
      const userId = req.user.id;
      // 1. Kiểm tra quyền truy cập toàn bộ
      const fullAccessSub = await UserSubscription.findOne({
        user: userId,
        hasFullAccess: true,
        isActive: true
      });

      if (fullAccessSub) {
        canViewFullContent = true;
        subscriptionStatus = 'full_access';
      } else {
        // 2. Nếu không, kiểm tra subscription cho bài luận cụ thể này
        // ---- ĐOẠN MÃ ĐÃ SỬA ----
        const specificEssaySub = await UserSubscription.findOne({
          user: userId,
          subscribedItem: essay._id, // Sửa từ 'subscribedEssay' thành 'subscribedItem'
          onModel: 'Essay',         // Thêm điều kiện 'onModel'
          isActive: true
        });
        // ---- KẾT THÚC SỬA ĐỔI ----

        if (specificEssaySub) {
          canViewFullContent = true;
          subscriptionStatus = 'subscribed_specific';
        }
      }
    }

    if (canViewFullContent) {
      // Nếu có quyền, trả về toàn bộ dữ liệu
      res.json({
        ...essay.toObject(),
        canViewFullContent: true,
        subscriptionStatus: subscriptionStatus,
        previewContent: null
      });
    } else {
      // Nếu không có quyền, chỉ trả về thông tin cơ bản và xem trước
      res.json({
        _id: essay._id,
        title: essay.title,
        topic: essay.topic,
        audioFiles: [],
        outline: essay.outline,
        canViewFullContent: false,
        previewContent: previewContentText,
        subscriptionStatus: subscriptionStatus,
        content: null,
        essay2: null,
        essay3: null,
        message: "Bạn cần đăng nhập và đăng ký để xem toàn bộ nội dung bài luận này."
      });
    }

  } catch (err) {
    console.error("Error fetching single essay detail:", err);
    res.status(500).json({ error: "Lỗi máy chủ khi lấy chi tiết bài luận." });
  }
});

// 3. Upload bài luận mới
router.post('/upload', authenticateTokenOptional, upload.array('audioFiles', 4), async (req, res) => {
  try {
    const { title, outline, content, essay2, essay3, topic } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Thiếu tiêu đề hoặc Bài luận 1." });
    }

    const files = (req.files && Array.isArray(req.files)) ? req.files.map(file => file.path) : [];

    const newEssay = new Essay({
      title, outline, content, essay2, essay3,
      audioFiles: files,
      topic,
    });

    await newEssay.save();
    const populatedEssay = await Essay.findById(newEssay._id)
        .populate({
            path: 'topic',
            select: 'name category',
            populate: { path: 'category', select: 'name' }
        });
    res.status(201).json({ message: 'Upload thành công!', data: populatedEssay });
  } catch (error) {
    console.error("Error uploading essay:", error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || "Lỗi máy chủ khi upload bài luận."});
  }
});

// 4. Sửa bài luận
router.put('/:id', authenticateTokenOptional, upload.array('audioFiles', 4), async (req, res) => {
  try {
    const { title, outline, content, essay2, essay3, topic, keepExistingAudios } = req.body;
    const essay = await Essay.findById(req.params.id);
    if (!essay) {
      return res.status(404).json({ error: "Không tìm thấy bài luận." });
    }

    let updatedAudioFiles = essay.audioFiles || [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      updatedAudioFiles = req.files.map(file => file.path);
    } else if (req.body.audioFiles === null || (Array.isArray(req.body.audioFiles) && req.body.audioFiles.length === 0 && keepExistingAudios !== 'true')) {
        updatedAudioFiles = [];
    } else if (keepExistingAudios === 'true') {
        // Giữ nguyên các file audio hiện có
    }

    essay.title = title || essay.title;
    essay.outline = outline !== undefined ? outline : essay.outline;
    essay.content = content || essay.content;
    essay.essay2 = essay2 !== undefined ? essay2 : essay.essay2;
    essay.essay3 = essay3 !== undefined ? essay3 : essay.essay3;
    essay.audioFiles = updatedAudioFiles;
    if (topic) essay.topic = topic;

    await essay.save();
    const populatedEssay = await Essay.findById(essay._id)
        .populate({
            path: 'topic',
            select: 'name category',
            populate: { path: 'category', select: 'name' }
        });
    res.json(populatedEssay);
  } catch (err) {
    console.error("Error updating essay:", err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || "Lỗi máy chủ khi cập nhật bài luận." });
  }
});

// 5. Xoá bài luận
router.delete('/:id', authenticateTokenOptional, async (req, res) => {
  try {
    const essayToDelete = await Essay.findById(req.params.id);
    if (!essayToDelete) {
        return res.status(404).json({ error: "Không tìm thấy bài luận để xóa." });
    }
    await Essay.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xoá bài luận' });
  } catch (error) {
    console.error("Error deleting essay:", error);
    res.status(500).json({ error: error.message || "Lỗi máy chủ khi xóa bài luận." });
  }
});

export default router;