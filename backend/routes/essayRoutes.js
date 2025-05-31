// file: routes/essayRoutes.js
import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinaryConfig.js'; // Đảm bảo đường dẫn đúng
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Essay from '../models/Essay.js'; // Đảm bảo đường dẫn đúng
import Topic from '../models/Topic.js'


const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'essay_audio_uploads', // Có thể đổi tên folder cho audio
    resource_type: 'auto',
    // transformation: [{ fetch_format: 'mp3', bit_rate: "128k" }] // Ví dụ chuyển đổi audio
  },
});
const upload = multer({ storage });


// 1. Lấy tất cả bài luận (hoặc lọc theo topic hoặc category)
router.get('/', async (req, res) => {
  try {
    const { topic: topicId, category: categoryId } = req.query; // Thêm categoryId
    let essays;

    // Ưu tiên lọc theo categoryId nếu có
    if (categoryId) {
      // 1. Tìm tất cả topics thuộc categoryId này
      const topicsInCagegory = await Topic.find({ category: categoryId }).select('_id');
      const topicIds = topicsInCagegory.map(t => t._id);
      
      // 2. Tìm tất cả essays thuộc danh sách topicIds này
      essays = await Essay.find({ topic: { $in: topicIds } })
        .populate({
          path: 'topic',
          select: 'name category',
          populate: {
            path: 'category',
            select: 'name _id'
          }
        })
        .sort({ createdAt: -1 });

    } else if (topicId) { // Nếu không có categoryId, lọc theo topicId
      essays = await Essay.find({ topic: topicId })
        .populate({
          path: 'topic',
          select: 'name category',
          populate: {
            path: 'category',
            select: 'name _id'
          }
        })
        .sort({ createdAt: -1 });
    } else { // Không có filter nào, lấy tất cả
      essays = await Essay.find({})
        .populate({
          path: 'topic',
          select: 'name category',
          populate: {
            path: 'category',
            select: 'name _id'
          }
        })
        .sort({ createdAt: -1 });
    }
    res.json(essays);
  } catch (err) {
    console.error("Error fetching essays:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Lấy một bài luận theo id - MODIFIED
router.get('/:id', async (req, res) => {
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
    if (!essay) return res.status(404).json({ error: "Không tìm thấy bài luận." });
    res.json(essay);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Upload bài luận mới - Giữ nguyên, topicId đã được gửi từ form
router.post('/upload', upload.array('audioFiles', 4), async (req, res) => { // Cho phép upload tới 4 file audio
  try {
    const { title, outline, content, essay2, essay3, topic } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Thiếu tiêu đề hoặc Bài luận 1." });
    }

    const files = req.files ? req.files.map(file => file.path) : [];

    const newEssay = new Essay({
      title, outline, content, essay2, essay3,
      audioFiles: files,
      topic, // topic ở đây là topicId
    });

    await newEssay.save();
    // Populate để trả về response đầy đủ hơn cho client nếu cần
    const populatedEssay = await Essay.findById(newEssay._id)
        .populate({
            path: 'topic',
            select: 'name category',
            populate: { path: 'category', select: 'name' }
        });
    res.status(201).json({ message: 'Upload thành công!', data: populatedEssay });
  } catch (error) {
    console.error("Error uploading essay:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Sửa bài luận - Giữ nguyên, topicId đã được gửi từ form
router.put('/:id', upload.array('audioFiles', 4), async (req, res) => {
  try {
    const { title, outline, content, essay2, essay3, topic, keepExistingAudios } = req.body;
    const essay = await Essay.findById(req.params.id);
    if (!essay) {
      return res.status(404).json({ error: "Không tìm thấy bài luận." });
    }

    let updatedAudioFiles = essay.audioFiles || [];
    if (req.files && req.files.length > 0) {
      // TODO: Xóa file cũ trên Cloudinary nếu cần thiết trước khi cập nhật
      // Cloudinary auto-generates names, so direct replacement might not be ideal
      // You might need to store public_ids of audio files if you want to delete them
      updatedAudioFiles = req.files.map(file => file.path);
    } else if (req.body.audioFiles === null || (Array.isArray(req.body.audioFiles) && req.body.audioFiles.length === 0 && keepExistingAudios !== 'true')) {
        // If explicitly sending null or empty array for audioFiles and not keeping existing
        // TODO: Delete existing files from Cloudinary
        updatedAudioFiles = [];
    } else if (keepExistingAudios === 'true') {
        // Keep current files, no change
    }


    essay.title = title || essay.title;
    essay.outline = outline !== undefined ? outline : essay.outline;
    essay.content = content || essay.content;
    essay.essay2 = essay2 !== undefined ? essay2 : essay.essay2;
    essay.essay3 = essay3 !== undefined ? essay3 : essay.essay3;
    essay.audioFiles = updatedAudioFiles;
    if (topic) essay.topic = topic; // topic là topicId

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
    res.status(500).json({ error: err.message });
  }
});


// 5. Xoá bài luận - Giữ nguyên
router.delete('/:id', async (req, res) => {
  try {
    const essayToDelete = await Essay.findById(req.params.id);
    if (!essayToDelete) {
        return res.status(404).json({ error: "Không tìm thấy bài luận để xóa." });
    }
    // TODO: Xóa audio files từ Cloudinary nếu chúng được lưu trữ ở đó
    // Điều này đòi hỏi bạn phải lưu public_id của các file audio
    // Ví dụ:
    // if (essayToDelete.audioFiles && essayToDelete.audioFiles.length > 0) {
    //   const publicIds = essayToDelete.audioFiles.map(url => getPublicIdFromAudioUrl(url)); // Bạn cần hàm getPublicIdFromAudioUrl
    //   await Promise.all(publicIds.map(pid => cloudinary.uploader.destroy(pid, { resource_type: 'video' }))); // type 'video' cho audio
    // }
    await Essay.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xoá bài luận' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;