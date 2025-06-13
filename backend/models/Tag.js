// file: models/Tag.js
import mongoose from 'mongoose';

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: { // Dùng để tạo URL thân thiện nếu cần
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  }
}, { timestamps: true });

const Tag = mongoose.model('Tag', TagSchema);
export default Tag;