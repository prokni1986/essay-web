// file: models/News.js
import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Tiêu đề tin tức là bắt buộc."],
    trim: true,
  },
  slug: { // Dùng để tạo URL thân thiện, ví dụ: /tin-tuc/bai-viet-moi-nhat
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  
  content: { // Nội dung bài viết, bạn có thể lưu dưới dạng HTML
    type: String,
    required: [true, "Nội dung là bắt buộc."],
  },
  thumbnailUrl: { // URL của ảnh bìa/ảnh đại diện cho bài viết
    type: String,
    required: false,
  },
  author: {
    type: String,
    default: 'Admin',
  },
  status: { // Trạng thái: 'published' (đã xuất bản) hoặc 'draft' (bản nháp)
    type: String,
    enum: ['published', 'draft'],
    default: 'draft',
  },
  publishedAt: { // Ngày xuất bản, để sắp xếp
      type: Date,
      default: Date.now,
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }]
}, {
  timestamps: true, // Tự động tạo createdAt và updatedAt
});

const News = mongoose.model('News', NewsSchema);
export default News;