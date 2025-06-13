// file: routes/examRoutes.js (Phiên bản cuối cùng, tích hợp LỚP và TYPE MỚI)

import express from 'express';
const router = express.Router();

// Import các models và middleware cần thiết
import Exam from '../models/Exam.js';
import UserSubscription from '../models/UserSubscription.js';
import authenticateToken from '../config/authMiddleware.js';
import authenticateTokenOptional from '../config/authMiddlewareOptional.js';
import { isAdmin } from '../config/adminMiddleware.js';

// === Import Cloudinary và Puppeteer ===
import cloudinary from '../config/cloudinaryConfig.js';
import puppeteer from 'puppeteer';

// Helper function to generate and upload thumbnail (Giữ nguyên)
const generateAndUploadThumbnail = async (htmlContent, examTitle) => {
    let browser = null;
    try {
        console.log(`[Thumbnail] Starting thumbnail generation for: ${examTitle}`);

        const headerHtmlMatch = htmlContent.match(/<div class="info-header">[\s\S]*?<p class="text-center mb-6"><em>Đề gồm 01 trang<\/em><\/p>/i);
        let contentToRender = '';

        if (headerHtmlMatch && headerHtmlMatch[0]) {
            contentToRender = headerHtmlMatch[0];
            console.log('[Thumbnail] Extracted header HTML for thumbnail.');
        } else {
            const strippedHtml = htmlContent.replace(/<[^>]*>/g, ' ');
            contentToRender = `<div style="text-align: center; padding: 20px;">
                                <h2 style="font-size: 24px; color: #0056b3;">${examTitle || 'Đề thi'}</h2>
                                <p style="font-size: 16px; color: #555;">${strippedHtml.substring(0, 200) + (strippedHtml.length > 200 ? '...' : '')}</p>
                                <p style="font-size: 14px; color: #888; margin-top: 20px;">(Xem đầy đủ)</p>
                             </div>`;
            console.warn('[Thumbnail] Could not find specific header HTML. Using text preview as fallback.');
        }

        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #FFFFFF;
                        color: #333;
                        padding: 20px;
                        margin: 0;
                        box-sizing: border-box;
                        width: 800px;
                        height: 420px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 16px;
                    }

                    p {
                        margin-bottom: 0.5em;
                        line-height: 1.4;
                    }
                    h1, h2, h3, h4 {
                        margin-bottom: 0.5em;
                    }

                    .info-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        width: 100%;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #e5e7eb;
                        margin-bottom: 15px;
                        font-size: 0.85em;
                    }
                    .info-header > div {
                        flex: 1;
                        padding: 0 5px;
                    }
                    .info-header div:first-child { text-align: left; }
                    .info-header div:nth-child(2) { text-align: center; flex: 2; }
                    .info-header div:last-child { text-align: right; }

                    .font-semibold { font-weight: 600; }
                    .font-bold { font-weight: 700; }
                    .text-lg { font-size: 1.05em; }
                    .italic { font-style: italic; }
                    .text-center { text-align: center; }
                    .mb-6 { margin-bottom: 1em; }
                    .my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
                    .border-gray-300 { border-color: #d1d5db; }
                    .w-1\/2 { width: 50%; }
                    .mr-auto { margin-right: auto; }
                    .ml-0 { margin-left: 0; }

                    hr { border-top: 1px solid #e5e7eb; }

                    .exam-page-count {
                        text-align: center;
                        margin-top: 10px;
                        margin-bottom: 15px;
                        font-style: italic;
                        font-size: 0.85em;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                ${contentToRender}
            </body>
            </html>
        `;

        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--no-zygote',
                '--single-process',
                '--hide-scrollbars',
                '--mute-audio',
                '--disable-dev-shm-usage'
            ],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 420 });

        await page.setContent(fullHtml, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const imageBuffer = await page.screenshot({
            type: 'jpeg',
            quality: 85,
            fullPage: false
        });

        const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageBuffer.toString('base64')}`, {
            folder: "exam_thumbnails",
            public_id: `exam_header_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            transformation: [
                { width: 400, height: 210, crop: "fill", gravity: "center" }
            ]
        });

        console.log(`[Cloudinary] Uploaded thumbnail URL: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error("[Thumbnail Error] Failed to generate thumbnail from header:", error);
        return null;
    } finally {
        if (browser) {
            console.log('[Thumbnail] Closing browser.');
            await browser.close();
        }
    }
};


// ===================================================================
// === ROUTE CÔNG KHAI (PUBLIC ROUTES) ===
// ===================================================================

// Lấy danh sách tất cả đề thi (bao gồm trường 'grade' mới)
router.get('/', async (req, res) => {
    try {
        const exams = await Exam.find({})
                                .select('-htmlContent -__v') // Sẽ tự động bao gồm 'grade'
                                .sort({ year: -1, createdAt: -1 });
        res.json(exams);
    } catch (err) {
        console.error("Error fetching exams list:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách đề thi." });
    }
});

// Lấy chi tiết một đề thi theo id (bao gồm trường 'grade' mới cho preview)
router.get('/:id', authenticateTokenOptional, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate('topic');
        if (!exam) return res.status(404).json({ message: "Không tìm thấy đề thi." });

        let canViewFullContent = false;
        if (req.user) {
            const fullAccessSub = await UserSubscription.findOne({ user: req.user.id, hasFullAccess: true, isActive: true });
            if (fullAccessSub) canViewFullContent = true;
            else {
                const specificExamSub = await UserSubscription.findOne({ user: req.user.id, subscribedItem: exam._id, onModel: 'Exam', isActive: true });
                if (specificExamSub) canViewFullContent = true;
            }
        }
        
        if (canViewFullContent) {
            res.json({ ...exam.toObject(), canViewFullContent: true });
        } else {
            res.json({
                _id: exam._id,
                title: exam.title,
                description: exam.description,
                subject: exam.subject,
                year: exam.year,
                province: exam.province,
                topic: exam.topic,
                thumbnailUrl: exam.thumbnailUrl,
                canViewFullContent: false,
                previewContent: exam.description || "Vui lòng đăng ký để xem nội dung đầy đủ.",
                htmlContent: null,
                type: exam.type,
                duration: exam.duration,
                questions: exam.questions,
                difficulty: exam.difficulty,
                grade: exam.grade, // BAO GỒM TRƯỜNG MỚI 'grade' CHO PREVIEW
            });
        }
    } catch (err) {
        console.error("Error fetching exam details:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết đề thi." });
    }
});


// ===================================================================
// === ROUTE CHO ADMIN (CẦN XÁC THỰC VÀ QUYỀN ADMIN) ===
// ===================================================================

// 1. TẠO MỚI MỘT ĐỀ THI (POST) - Đã bao gồm trường 'grade' và các tùy chọn 'type' mới
router.post(
    '/create-html-post',
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            // Lấy TẤT CẢ các trường từ req.body
            const { title, description, htmlContent, subject, year, province, type, duration, questions, difficulty, grade } = req.body;
            
            if (!title || !htmlContent || !subject || !year) {
                return res.status(400).json({ message: 'Thiếu các trường thông tin bắt buộc: Tiêu đề, Nội dung HTML, Môn học, Năm.' });
            }

            const thumbnailUrl = await generateAndUploadThumbnail(htmlContent, title);

            const newExam = new Exam({
                title,
                description,
                htmlContent,
                subject,
                year: Number(year),
                province,
                thumbnailUrl,
                type,
                duration: Number(duration) || undefined,
                questions: Number(questions) || undefined,
                difficulty,
                grade: Number(grade) || undefined, // LƯU TRƯỜNG MỚI 'grade' VÀO DB
            });

            await newExam.save();
            res.status(201).json(newExam);
        } catch(err) {
            console.error("Error creating exam:", err);
            res.status(500).json({ message: "Lỗi máy chủ khi tạo đề thi mới." });
        }
    }
);

// 2. CẬP NHẬT MỘT ĐỀ THI (PUT) - Đã bao gồm trường 'grade' và các tùy chọn 'type' mới
router.put(
    '/:id',
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            // Lấy TẤT CẢ các trường từ req.body
            const { title, description, htmlContent, subject, year, province, type, duration, questions, difficulty, grade } = req.body;

            const exam = await Exam.findById(req.params.id);
            if (!exam) {
                return res.status(404).json({ message: 'Không tìm thấy đề thi để cập nhật.' });
            }

            // Cập nhật các trường thông tin một cách tường minh
            exam.title = title;
            exam.description = description;
            exam.subject = subject;
            exam.year = Number(year);
            exam.province = province;
            exam.type = type;
            exam.duration = Number(duration) || undefined;
            exam.questions = Number(questions) || undefined;
            exam.difficulty = difficulty;
            exam.grade = Number(grade) || undefined; // CẬP NHẬT TRƯỜNG MỚI 'grade'

            if (exam.htmlContent !== htmlContent) {
                console.log("[Update Exam] htmlContent changed, regenerating thumbnail.");
                const thumbnailUrl = await generateAndUploadThumbnail(htmlContent, title);
                exam.htmlContent = htmlContent;
                exam.thumbnailUrl = thumbnailUrl;
            } else {
                exam.htmlContent = htmlContent;
            }

            await exam.save();
            res.status(200).json(exam);
        } catch(err) {
            console.error("Error updating exam:", err);
            res.status(500).json({ message: "Lỗi máy chủ khi cập nhật đề thi." });
        }
    }
);


// 3. XÓA MỘT ĐỀ THI (DELETE) - Giữ nguyên
router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const examToDelete = await Exam.findByIdAndDelete(req.params.id);
      if (!examToDelete) {
        return res.status(404).json({ message: 'Không tìm thấy đề thi để xóa.' });
      }
      res.status(200).json({ message: 'Đã xóa đề thi thành công.' });
    } catch (error) {
      console.error("Server error deleting exam:", error);
      res.status(500).json({ message: 'Lỗi máy chủ khi xóa đề thi.' });
    }
  }
);

export default router;