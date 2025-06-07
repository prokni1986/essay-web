// ...
// import Essay from '../models/Essay.js'; // Sửa thành:
import Exam from '../models/Exam.js';
// ...
// import UserSubscription from '../models/UserSubscription.js'; // Vẫn cần
// ...

// 2. Lấy một đề thi theo id
router.get('/:id', authenticateTokenOptional, async (req, res) => {
    try {
        // Thay đổi ở đây
        const exam = await Exam.findById(req.params.id).populate('topic');
        if (!exam) {
            return res.status(404).json({ error: "Không tìm thấy đề thi." });
        }

        // ... (Logic kiểm tra subscription cần được cập nhật)
        // Khi kiểm tra subscription cho item cụ thể, bạn cần query cả onModel
        // Ví dụ:
        // const specificSub = await UserSubscription.findOne({
        //   user: userId,
        //   subscribedItem: exam._id,
        //   onModel: 'Exam', // << Thêm điều kiện này
        //   isActive: true
        // });
        // ... (phần logic còn lại tương tự)

        // Trả về dữ liệu
        res.json(/* ... dữ liệu exam và quyền truy cập ... */);

    } catch (err) { /* ... */ }
});

export default router;