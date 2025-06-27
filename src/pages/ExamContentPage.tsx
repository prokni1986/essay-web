// src/pages/ExamContentPage.tsx

import React, { useEffect, useState, CSSProperties, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// --- Khai báo kiểu cho MathJax ---
declare global {
  interface Window {
    MathJax: {
      startup?: {
        ready?: () => void;
        defaultReady?: () => void;
        promise?: Promise<void>;
      };
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      tex?: {
        inlineMath?: [string, string][];
        displayMath?: [string, string][];
        processEscapes?: boolean;
      };
      options?: {
        skipHtmlTags?: string[];
      };
      // Thêm khai báo kiểu cho chtml
      chtml?: {
        scale?: number;
        matchFontHeight?: boolean;
      };
    };
  }
}

interface ExamData {
  htmlContent: string | null;
  title: string;
  canViewFullContent: boolean;
  previewContent?: string;
}

interface ApiErrorResponse {
  message?: string;
}

const centeredMessageStyle: CSSProperties = {
  textAlign: 'center',
  padding: '50px',
  fontFamily: 'sans-serif',
  lineHeight: '1.6'
};

const ExamContentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [examContent, setExamContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Hàm khởi tạo MathJax với kiểm tra type an toàn
  const initMathJax = () => {
    if (!window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.id = 'MathJax-script';
      
      script.onload = () => {
        window.MathJax = {
          startup: {
            ready: () => {
              window.MathJax.startup?.defaultReady?.();
              window.MathJax.startup?.promise?.then(() => {
                if (contentRef.current && window.MathJax.typesetPromise) {
                  window.MathJax.typesetPromise([contentRef.current]);
                }
              });
            }
          },
          tex: {
            inlineMath: [['\\(', '\\)']],
            displayMath: [['\\[', '\\]']],
            processEscapes: true,
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
          },
          chtml: {
            scale: 1.4, // <-- Đặt giá trị bạn muốn ở đây
            matchFontHeight: false,
          }
        };
      };
      
      document.head.appendChild(script);
    } else if (contentRef.current && window.MathJax.typesetPromise) {
      // --- BẮT ĐẦU THAY ĐỔI QUAN TRỌNG ---
      // Nếu MathJax đã tồn tại, ta cần cập nhật lại cấu hình trước khi render
      if (window.MathJax.chtml) {
         window.MathJax.chtml.scale = 1.4; // <-- Cập nhật lại giá trị scale ở đây
      }
      
      // Sau đó mới yêu cầu MathJax render lại với cấu hình mới
      window.MathJax.typesetPromise([contentRef.current]);
      // --- KẾT THÚC THAY ĐỔI ---
    }
  };

  // Hàm xử lý nội dung toán học
  const processMathContent = (content: string): string => {
    // Các thay thế này có thể không cần thiết nếu nguồn HTML đã đúng định dạng MathJax
    // Nhưng giữ lại để xử lý các trường hợp đặc biệt
    return content
      .replace(/\\langle/g, '\\(')
      .replace(/\\rangle/g, '\\)')
      .replace(/\\text{frac}/g, '\\frac')
      .replace(/\\text{sqrt}/g, '\\sqrt')
      .replace(/\\text{vdot}/g, '\\cdot')
      .replace(/\\text{ne}/g, '\\neq')
      .replace(/\\bigcup/g, '\\begin')
      .replace(/\\lor/g, '\\\\');
  };

  useEffect(() => {
    const fetchExamContent = async () => {
      if (!id) {
        setError('ID đề thi không hợp lệ.');
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get<ExamData>(`/api/exams/${id}`);
        const data = response.data;
        document.title = data.title || "Nội dung đề thi";

        if (data.canViewFullContent && data.htmlContent) {
          const processedContent = processMathContent(data.htmlContent);
          setExamContent(processedContent);
        } else {
          setExamContent(`
            <div style="text-align: center; padding: 50px; font-family: sans-serif;">
              <h2 style="color: #007bff;">Nội dung bị giới hạn</h2>
              <p>Vui lòng quay lại trang chi tiết để đăng ký xem toàn bộ nội dung.</p>
            </div>
          `);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const errorData = err.response?.data as ApiErrorResponse;
          setError(errorData?.message || 'Không thể tải nội dung đề thi.');
        } else {
          setError('Đã xảy ra lỗi không xác định.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExamContent();
  }, [id]);

  useEffect(() => {
    if (examContent) {
      initMathJax();
      
      const observer = new ResizeObserver(() => {
        const height = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        window.parent.postMessage({ type: 'iframeResize', height: height }, '*');
      });

      if (document.body) {
        observer.observe(document.body);
      }
      
      return () => {
        if (document.body) {
          observer.unobserve(document.body);
        }
      };
    }
  }, [examContent]);

  if (loading) {
    return <div style={centeredMessageStyle}>Đang tải nội dung...</div>;
  }

  if (error) {
    return <div style={{ ...centeredMessageStyle, color: 'red' }}>Lỗi: {error}</div>;
  }

  return (
    <div 
      ref={contentRef}
      style={{
        padding: '20px',
        fontFamily: 'sans-serif',
        lineHeight: '1.6',
        fontSize: '16px'
      }}
      dangerouslySetInnerHTML={{ __html: examContent || '' }}
    />
  );
};

export default ExamContentPage;