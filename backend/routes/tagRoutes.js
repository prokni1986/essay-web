// file: routes/tagRoutes.js
import express from 'express';
import Tag from '../models/Tag.js';

const router = express.Router();

// Hàm tạo slug, bạn có thể đặt ở một file utils riêng nếu muốn
function slugify(text) {
  const a = 'àáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳýỵỷỹ'
  const b = 'aaaaaeeeiioooouuadiiuouaaaaaaaaaaaaaaaeeeeeeeeeeiiooooooooooooooouuuuuuuuuuyyyyy'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text.toString().toLowerCase()
    .replace(p, c => b.charAt(a.indexOf(c)))
    .replace(/<[^>]*>/g, '') 
    .replace(/&/g, '-and-')
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


// GET all tags
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ createdAt: -1 });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

// THÊM MỚI: POST a new tag (cho admin)
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Tên tag là bắt buộc.' });
  }

  const slug = slugify(name);

  try {
    const existingTag = await Tag.findOne({ $or: [{ name }, { slug }] });
    if (existingTag) {
        return res.status(400).json({ message: 'Tag này đã tồn tại.' });
    }

    const newTag = new Tag({ name, slug });
    await newTag.save();
    res.status(201).json(newTag);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo tag mới.' });
  }
});

// THÊM MỚI: DELETE a tag (cho admin)
router.delete('/:id', async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({ message: 'Không tìm thấy tag.' });
        }
        
        // (Tùy chọn) Kiểm tra xem tag có đang được sử dụng ở bài viết nào không trước khi xóa
        // const newsUsingTag = await News.countDocuments({ tags: req.params.id });
        // if (newsUsingTag > 0) {
        //     return res.status(400).json({ message: `Không thể xóa, tag đang được dùng trong ${newsUsingTag} bài viết.`});
        // }

        await Tag.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa tag thành công.' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi xóa tag.' });
    }
});


export default router;