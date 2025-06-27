// src/pages/ExamSolutionPage.tsx

import React, { useEffect, useState, CSSProperties, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../lib/axiosInstance';
import 'katex/dist/katex.min.css';

// --- Khai báo kiểu cho MathJax (giữ nguyên) ---
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
      chtml?: {
        scale?: number;
        matchFontHeight?: boolean;
      };
    };
  }
}

// MỚI: Interface cần có cả solutionHtml
interface ExamData {
  solutionHtml: string | null;
  title: string;
  canViewFullContent: boolean;
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

const ExamSolutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [solutionContent, setSolutionContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Hàm khởi tạo MathJax không thay đổi
  const initMathJax = () => {
    // ... (Giữ nguyên toàn bộ hàm initMathJax từ ExamContentPage.tsx)
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
            scale: 1.4,
            matchFontHeight: false,
          }
        };
      };
      
      document.head.appendChild(script);
    } else if (contentRef.current && window.MathJax.typesetPromise) {
      if (window.MathJax.chtml) {
         window.MathJax.chtml.scale = 1.4;
      }
      window.MathJax.typesetPromise([contentRef.current]);
    }
  };

  // Hàm xử lý toán học không thay đổi
  const processMathContent = (content: string): string => {
    // ... (Giữ nguyên toàn bộ hàm processMathContent từ ExamContentPage.tsx)
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
    const fetchExamSolution = async () => {
      if (!id) {
        setError('ID đề thi không hợp lệ.');
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get<ExamData>(`/api/exams/${id}`);
        const data = response.data;
        document.title = `Lời giải: ${data.title || "Nội dung đề thi"}`;

        // THAY ĐỔI: Kiểm tra solutionHtml thay vì htmlContent
        if (data.canViewFullContent && data.solutionHtml) {
          const processedContent = processMathContent(data.solutionHtml);
          setSolutionContent(processedContent);
        } else if (data.canViewFullContent && !data.solutionHtml) {
           setSolutionContent(`
            <div style="${Object.entries(centeredMessageStyle).map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`).join(';')}}">
              <h2 style="color: #6c757d;">Chưa có lời giải</h2>
              <p>Lời giải cho đề thi này hiện chưa có sẵn. Vui lòng quay lại sau.</p>
            </div>
          `);
        }
        else {
          setSolutionContent(`
            <div style="${Object.entries(centeredMessageStyle).map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`).join(';')}}">
              <h2 style="color: #007bff;">Nội dung bị giới hạn</h2>
              <p>Vui lòng quay lại trang chi tiết để đăng ký xem toàn bộ nội dung.</p>
            </div>
          `);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const errorData = err.response?.data as ApiErrorResponse;
          setError(errorData?.message || 'Không thể tải lời giải.');
        } else {
          setError('Đã xảy ra lỗi không xác định.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExamSolution();
  }, [id]);

  // useEffect để xử lý resize iframe không đổi
  useEffect(() => {
    if (solutionContent) {
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
  }, [solutionContent]);

  if (loading) {
    return <div style={centeredMessageStyle}>Đang tải lời giải...</div>;
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
      dangerouslySetInnerHTML={{ __html: solutionContent || '' }}
    />
  );
};

export default ExamSolutionPage;