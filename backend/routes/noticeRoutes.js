// file: routes/noticeRoutes.js
import express from 'express';
import Notice from '../models/Notice.js';
import authenticateToken from '../config/authMiddleware.js'; // Giả sử bạn có middleware này
import { isAdmin } from '../config/adminMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTE ---
// Lấy danh sách notices, có thể lọc theo type
router.get('/', async (req, res) => {
  try {
    const { type, keyword, province } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }
    if (province) {
      query.province = province;
    }
    // Tìm kiếm theo từ khóa bằng text index
    if (keyword) {
      query.$text = { $search: keyword };
    }

    const notices = await Notice.find(query).sort({ order: 1, createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});
router.get('/provinces', async (req, res) => {
  try {
      // Lấy danh sách các giá trị 'province' không trùng lặp
      const provinces = await Notice.distinct('province', { 
          type: 'exam_schedule', 
          province: { $ne: null, $ne: "" } // Chỉ lấy các tỉnh có giá trị
      });
      res.json(provinces.sort()); // Sắp xếp theo alphabet
  } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
  }
});

// --- ADMIN ROUTES ---

// POST: Tạo một notice mới (lịch thi hoặc thông báo)
router.post('/', [authenticateToken, isAdmin], async (req, res) => {
    const { title, description, type, order } = req.body;
    if (!title || !type) {
        return res.status(400).json({ message: 'Tiêu đề và loại thông báo là bắt buộc.' });
    }
    try {
        const newNotice = new Notice({ title, description, type, order });
        await newNotice.save();
        res.status(201).json(newNotice);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo thông báo mới.'});
    }
});

// DELETE: Xóa một notice
router.delete('/:id', [authenticateToken, isAdmin], async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa thông báo thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa thông báo.' });
    }
});

// (Tùy chọn) PUT: Cập nhật một notice
router.put('/:id', [authenticateToken, isAdmin], async (req, res) => {
    const { title, description, order } = req.body;
    try {
        const updatedNotice = await Notice.findByIdAndUpdate(
            req.params.id,
            { title, description, order },
            { new: true }
        );
        if (!updatedNotice) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }
        res.json(updatedNotice);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật thông báo.' });
    }
});

export default router;