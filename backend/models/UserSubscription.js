// file: models/UserSubscription.js
import mongoose from 'mongoose';

const UserSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // SỬA ĐỔI LỚN: Thay thế 'subscribedEssay' bằng một cấu trúc linh hoạt hơn
  // Trường này sẽ lưu ID của bài luận hoặc đề thi được đăng ký
  subscribedItem: {
    type: mongoose.Schema.Types.ObjectId,
    // Bắt buộc phải có giá trị nếu đây không phải là gói Full Access
    required: function() { return !this.hasFullAccess; },
    // 'refPath' cho phép Mongoose tham chiếu động đến model được chỉ định trong trường 'onModel'
    refPath: 'onModel'
  },
  
  // Trường này cho biết 'subscribedItem' thuộc về model nào ('Essay' hay 'Exam')
  onModel: {
    type: String,
    // Bắt buộc phải có giá trị nếu đây không phải là gói Full Access
    required: function() { return !this.hasFullAccess; },
    // Chỉ cho phép hai giá trị này để đảm bảo tính nhất quán của dữ liệu
    enum: ['Essay', 'Exam']
  },
  
  hasFullAccess: { // Giữ nguyên: Nếu là true, subscribedItem và onModel sẽ không có giá trị
    type: Boolean,
    default: false,
  },
  
  startDate: {
    type: Date,
    default: Date.now,
  },
  
  endDate: {
    type: Date,
    default: null,
  },
  
  planType: {
    type: String,
    required: false,
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// SỬA ĐỔI LỚN: Cập nhật Unique Indexes để hoạt động với cấu trúc mới
// Đảm bảo một user không thể subscribe cùng một item (cùng loại) nhiều lần khi đang active
UserSubscriptionSchema.index(
  { user: 1, subscribedItem: 1, onModel: 1 },
  {
    unique: true,
    // Index này chỉ áp dụng cho các document có subscribedItem (tức không phải full access)
    // và đang ở trạng thái active.
    partialFilterExpression: { subscribedItem: { $ne: null }, isActive: true }
  }
);

// Index cho gói Full Access (giữ nguyên nhưng logic vẫn đúng)
UserSubscriptionSchema.index(
  { user: 1, hasFullAccess: 1 },
  {
    unique: true,
    // Chỉ áp dụng cho các document là gói full access và đang active.
    partialFilterExpression: { hasFullAccess: true, isActive: true }
  }
);


const UserSubscription = mongoose.model('UserSubscription', UserSubscriptionSchema);
export default UserSubscription;