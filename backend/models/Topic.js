// file: models/Topic.js
import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: false },
  // ADD THIS LINE
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, "Parent category is required for a topic."],
  },
  // You might want to add imagePublicId here as discussed in your topicRoutes.js comments
  // imagePublicId: { type: String, required: false }
});

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;