// file: models/UserSubscription.js
import mongoose from 'mongoose';

const UserSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscribedEssay: { // Nếu subscribe bài luận cụ thể
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Essay',
    default: null, // null nếu là full access
  },
  hasFullAccess: { // Nếu subscribe toàn bộ
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: { // null có nghĩa là vĩnh viễn hoặc sẽ được cập nhật sau (ví dụ, sau khi thanh toán)
    type: Date,
    default: null,
  },
  planType: { // Ví dụ: 'single_essay_free', 'full_access_monthly_paid'
    type: String,
    required: false,
  },
  isActive: { // Để quản lý trạng thái (ví dụ sau khi thanh toán hoặc hủy)
    type: Boolean,
    default: true,
  },
  // Thêm các trường liên quan đến thanh toán nếu cần: stripePaymentId, status, etc.
}, {
  timestamps: true,
});

// Đảm bảo một user không subscribe cùng một bài luận nhiều lần (nếu không có thời hạn khác nhau)
// Hoặc chỉ có một bản ghi full_access (nếu không quản lý theo thời gian)
// Cần xem xét kỹ logic unique của bạn. Ví dụ:
UserSubscriptionSchema.index({ user: 1, subscribedEssay: 1 }, { unique: true, partialFilterExpression: { subscribedEssay: { $ne: null } } });
UserSubscriptionSchema.index({ user: 1, hasFullAccess: 1 }, { unique: true, partialFilterExpression: { hasFullAccess: true } });


const UserSubscription = mongoose.model('UserSubscription', UserSubscriptionSchema);
export default UserSubscription;