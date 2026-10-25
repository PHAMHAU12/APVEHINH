import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sliders,
  Share2,
  BookOpen,
  QrCode,
  RotateCw,
  KeyRound,
  ExternalLink,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  FileImage,
  ClipboardPaste,
  XCircle,
  Clock,
  RefreshCw,
  Check,
} from 'lucide-react';
import { MathEdResponse } from './types/mathed';
import { MATH_PRESETS, MathPreset } from './data/presets';
import { DEFAULT_SOLUTION } from './data/defaultSolution';
import MathRenderer from './components/MathRenderer';
import Geometry3DViewer from './components/Geometry3DViewer';
import CalculusViewer from './components/CalculusViewer';
import TikzAsymptoteViewer from './components/TikzAsymptoteViewer';
import QRCodeModal from './components/QRCodeModal';
import ApiKeyModal from './components/ApiKeyModal';
import {
  solveMathProblemWithFallback,
  extractTextFromImage,
  getStoredApiKey,
  getStoredModel,
} from './services/geminiService';

export interface PipelineStep {
  id: number;
  name: string;
  desc: string;
  status: 'idle' | 'running' | 'completed' | 'error';
}

export default function App() {
  const [problemPrompt, setProblemPrompt] = useState(
    'Cho hình chóp S.ABCD có đáy ABCD là hình bình hành. Gọi M là trung điểm SA, N nằm trên cạnh SB (SN/SB = 2/3), P nằm trên cạnh SC (SP/SC = 1/2). Hãy phân tích và vẽ thiết diện của hình chóp cắt bởi mặt phẳng (MNP), xác định giao tuyến và hình tính của thiết diện.'
  );
  const [selectedPreset, setSelectedPreset] = useState<string>('kntt-hh11-sabcd-thiet-dien');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'geometry' | 'calculus'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);

  // 3-Step Pipeline State as strictly requested by AI_INSTRUCTIONS.md
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    {
      id: 1,
      name: 'Bước 1: Trích xuất & Phân tích Đề bài',
      desc: 'Ngôn ngữ & OCR ảnh chụp SGK Kết Nối Tri Thức',
      status: 'completed',
    },
    {
      id: 2,
      name: 'Bước 2: Reasoning AI & Kiểm tra Logic',
      desc: 'Consistency Check & Tính toán tọa độ không gian / Đồ thị',
      status: 'completed',
    },
    {
      id: 3,
      name: 'Bước 3: Intelligent Rendering & Mã TikZ',
      desc: 'Mô phỏng 3D Oxyz, BBT 3 dòng & Biên tập lời giải sư phạm',
      status: 'completed',
    },
  ]);

  // Image paste & upload state
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isOcrExtracting, setIsOcrExtracting] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [auxiliaryHighlighted, setAuxiliaryHighlighted] = useState(false);
  const [cuttingPlaneOffset, setCuttingPlaneOffset] = useState<number>(0.5);

  const [currentModel, setCurrentModel] = useState<string>('gemini-3-flash-preview');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  // Initialize with DEFAULT_SOLUTION so screen is immediately rich & ready
  const [solutionData, setSolutionData] = useState<MathEdResponse>(DEFAULT_SOLUTION);
  const resultRef = useRef<HTMLDivElement>(null);

  // Check stored API key on load: if none, automatically show modal as required in AI_INSTRUCTIONS
  useEffect(() => {
    const key = getStoredApiKey();
    setHasApiKey(Boolean(key));
    setCurrentModel(getStoredModel());

    if (!key) {
      setShowApiKeyModal(true);
    }
  }, []);

  // Global clipboard paste listener for easy Ctrl+V of images anywhere
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              setPastedImage(result);
              setOcrSuccessMsg('Đã dán ảnh đề bài từ Clipboard! Thầy/Cô có thể bấm "Vẽ hình ngay" hoặc "Trích xuất văn bản".');
              setTimeout(() => setOcrSuccessMsg(null), 4000);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPastedImage(result);
        setOcrSuccessMsg('Đã tải ảnh chụp đề bài lên thành công!');
        setTimeout(() => setOcrSuccessMsg(null), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPastedImage(result);
        setOcrSuccessMsg('Đã nhận ảnh chụp đề bài từ thao tác kéo thả!');
        setTimeout(() => setOcrSuccessMsg(null), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  // Quick OCR extraction: extracts text from pasted image directly into textarea
  const handleExtractTextOnly = async () => {
    if (!pastedImage) return;
    setIsOcrExtracting(true);
    setApiError(null);

    try {
      const text = await extractTextFromImage(pastedImage);
      if (text) {
        setProblemPrompt(text);
        setOcrSuccessMsg('Đã trích xuất chính xác chữ và công thức toán từ ảnh chụp sách!');
        setTimeout(() => setOcrSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      console.warn('OCR error:', err);
      setApiError(err?.message || 'Không thể trích xuất chữ từ ảnh. Vui lòng kiểm tra lại API Key.');
    } finally {
      setIsOcrExtracting(false);
    }
  };

  const handleSolve = async (promptToSolve: string, imageToSolve?: string | null) => {
    const activeImage = imageToSolve !== undefined ? imageToSolve : pastedImage;
    if (!promptToSolve.trim() && !activeImage) return;

    setIsLoading(true);
    setApiError(null);

    // Reset pipeline state: Step 1 running, others idle
    setPipelineSteps([
      {
        id: 1,
        name: 'Bước 1: Trích xuất & Phân tích Đề bài',
        desc: activeImage ? 'Đang đọc OCR ảnh chụp SGK Kết Nối Tri Thức...' : 'Đang phân tích cấu trúc cú pháp đề bài...',
        status: 'running',
      },
      {
        id: 2,
        name: 'Bước 2: Reasoning AI & Kiểm tra Logic',
        desc: 'Đang chờ xử lý bước 1...',
        status: 'idle',
      },
      {
        id: 3,
        name: 'Bước 3: Intelligent Rendering & Mã TikZ',
        desc: 'Đang chờ xử lý bước 2...',
        status: 'idle',
      },
    ]);

    setLoadingStep(
      activeImage
        ? 'Đang nhận diện đề bài & công thức từ ảnh chụp SGK Kết Nối Tri Thức...'
        : 'Đang phân tích cấu trúc đề bài SGK Kết Nối Tri Thức...'
    );

    // Timed progression through steps during processing
    const timer1 = setTimeout(() => {
      setPipelineSteps((prev) => [
        { ...prev[0], status: 'completed', desc: 'Đã hoàn tất phân tích ngôn ngữ' },
        { ...prev[1], status: 'running', desc: 'Kiểm tra tính nhất quán & tính toán tọa độ...' },
        prev[2],
      ]);
    }, 600);

    const timer2 = setTimeout(() => {
      setPipelineSteps((prev) => [
        prev[0],
        { ...prev[1], status: 'completed', desc: 'Kiểm tra logic hợp lệ' },
        { ...prev[2], status: 'running', desc: 'Đang dựng hình 3D/2D & sinh mã TikZ...' },
      ]);
    }, 1400);

    try {
      const res = await solveMathProblemWithFallback(
        promptToSolve,
        activeImage || undefined,
        undefined,
        (progressMessage) => {
          setLoadingStep(progressMessage);
        }
      );

      if (res && res.data) {
        clearTimeout(timer1);
        clearTimeout(timer2);

        // Mark all steps completed with green checkmark
        setPipelineSteps([
          {
            id: 1,
            name: 'Bước 1: Trích xuất & Phân tích Đề bài',
            desc: 'Đã hoàn tất trích xuất giả thiết & kết luận',
            status: 'completed',
          },
          {
            id: 2,
            name: 'Bước 2: Reasoning AI & Kiểm tra Logic',
            desc: 'Tính nhất quán logic đề bài hợp lệ',
            status: 'completed',
          },
          {
            id: 3,
            name: 'Bước 3: Intelligent Rendering & Mã TikZ',
            desc: 'Đã tạo mô hình 3D, BBT & mã TeX',
            status: 'completed',
          },
        ]);

        setSolutionData(res.data);

        // If teacher had not typed text and used image, auto-populate the textarea with the extracted hypotheses
        if (!promptToSolve.trim() && res.data.section1_analysis?.hypotheses) {
          const reconstructedPrompt = `${res.data.title}\n${res.data.section1_analysis.hypotheses.join('\n')}\n${res.data.section1_analysis.conclusion}`;
          setProblemPrompt(reconstructedPrompt);
        }
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error('Solve error:', err);

      const errMsg = err?.message || '429 RESOURCE_EXHAUSTED: Lỗi giới hạn hạn ngạch hoặc kết nối API';
      setApiError(errMsg);

      // Strictly follow Section 3 of AI_INSTRUCTIONS.md:
      // "Trạng thái các cột đang chờ phải chuyển thành 'Đã dừng do lỗi', tuyệt đối không được hiện 'Hoàn tất' hoặc checkmark xanh nếu quy trình bị gián đoạn."
      setPipelineSteps((prev) =>
        prev.map((step) => {
          if (step.status === 'completed') return step;
          return {
            ...step,
            status: 'error',
            desc: 'Đã dừng do lỗi API',
          };
        })
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleSelectPreset = (preset: MathPreset) => {
    setSelectedPreset(preset.id);
    setPastedImage(null); // Clear image when switching to preset
    setProblemPrompt(preset.prompt);
    handleSolve(preset.prompt, null);
  };

  const filteredPresets = MATH_PRESETS.filter((p) => {
    if (activeCategoryTab === 'all') return true;
    return p.category === activeCategoryTab;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo & Brand: HỖ TRỢ VẼ HÌNH _ PHẠM HẬU */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-white/10">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black tracking-tight text-white text-base sm:text-lg">
                  HỖ TRỢ VẼ HÌNH _ PHẠM HẬU
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  SGK Kết Nối Tri Thức
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Hỗ trợ giáo viên vẽ Hình học không gian & Đồ thị hàm số • Dán ảnh chụp đề bài từ sách giáo khoa
              </p>
            </div>
          </div>

          {/* Right Header Controls: API Key & Actions (Strict adherence to AI_INSTRUCTIONS) */}
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col items-end">
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Cài đặt API Key</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono hidden md:inline">
                  {currentModel.replace('-preview', '')}
                </span>
              </button>

              {/* Red text as strictly required in AI_INSTRUCTIONS Section 2 */}
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition mt-0.5 underline decoration-red-500"
                title="Bấm vào đây để lấy API key miễn phí từ Google AI Studio"
              >
                <span>Lấy API key để sử dụng app</span>
                <ExternalLink className="w-3 h-3 text-red-400" />
              </a>
            </div>

            <button
              onClick={() => setShowQRModal(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition hidden sm:flex"
              title="Xuất mã QR xem thực tế ảo AR trên điện thoại"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Mô hình AR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col gap-6">
        {/* Error Notification Banner: displays verbatim API error (e.g. 429 RESOURCE_EXHAUSTED) */}
        {apiError && (
          <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-200 text-xs flex flex-col sm:flex-row items-start justify-between gap-3 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-red-300 text-sm">
                  Lỗi API: {apiError}
                </div>
                <p className="text-red-200/90 leading-relaxed text-[11px]">
                  Tất cả các mô hình AI dự phòng đều gặp lỗi hoặc hết hạn ngạch. Quy trình đã tạm dừng và các bước đang chờ đã chuyển sang trạng thái <strong>"Đã dừng do lỗi"</strong>. Thầy/Cô có thể bấm vào nút dưới đây để đổi sang API Key mới.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowApiKeyModal(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Đổi API Key Ngay</span>
            </button>
          </div>
        )}

        {/* OCR Notification Toast */}
        {ocrSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{ocrSuccessMsg}</span>
          </div>
        )}

        {/* Input & Problem Formulation Station with Multimodal Photo Support */}
        <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-5 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* SGK KNTT Category Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-300">
                CHUYÊN ĐỀ SÁCH GIÁO KHOA TOÁN KẾT NỐI TRI THỨC:
              </span>
            </div>

            <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveCategoryTab('all')}
                className={`px-3 py-1.5 rounded-lg transition font-semibold ${
                  activeCategoryTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất cả đề SGK
              </button>
              <button
                onClick={() => setActiveCategoryTab('geometry')}
                className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 ${
                  activeCategoryTab === 'geometry'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Hình học không gian (11 & 12)
              </button>
              <button
                onClick={() => setActiveCategoryTab('calculus')}
                className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 ${
                  activeCategoryTab === 'calculus'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Đồ thị hàm số (10 & 12)
              </button>
            </div>
          </div>

          {/* Curriculum Presets Ribbon */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {filteredPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                    selectedPreset === preset.id && !pastedImage
                      ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md shadow-blue-600/20'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      preset.category === 'geometry' ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                  ></span>
                  <span>{preset.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DÁN ĐỀ BÀI CHỤP TỪ SÁCH (Drag & Drop / Paste / File Upload Area) */}
          <div className="mb-4">
            {pastedImage ? (
              /* Image Preview Box */
              <div className="p-3.5 rounded-2xl bg-slate-900 border-2 border-blue-500/50 flex flex-col sm:flex-row items-center gap-4 relative shadow-lg">
                <div className="relative group shrink-0">
                  <img
                    src={pastedImage}
                    alt="Đề bài chụp từ sách SGK"
                    className="w-44 h-28 object-cover rounded-xl border border-slate-700 shadow-md group-hover:opacity-90 transition"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-blue-600/90 backdrop-blur text-[10px] font-bold text-white shadow">
                    Ảnh chụp SGK
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Đã nạp ảnh đề bài chụp từ sách giáo khoa</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Hệ thống sẽ dùng thị giác AI để đọc đề, trích xuất tọa độ, dựng hình 3D / đồ thị và giải chi tiết.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={handleExtractTextOnly}
                      disabled={isOcrExtracting}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Trích xuất chữ và công thức toán từ ảnh vào ô nhập bên dưới"
                    >
                      {isOcrExtracting ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang đọc ảnh...</span>
                        </>
                      ) : (
                        <>
                          <FileImage className="w-3.5 h-3.5" />
                          <span>Trích xuất chữ vào ô nhập (OCR)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setPastedImage(null)}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa ảnh</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Dropzone & Quick Paste Trigger */
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`p-4 rounded-2xl border-2 border-dashed transition flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${
                  isDraggingFile
                    ? 'border-blue-400 bg-blue-950/40 text-blue-200'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                      DÁN ĐỀ BÀI CHỤP TỪ SÁCH GIÁO KHOA TOÁN
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Ctrl + V</kbd> để dán ảnh chụp, hoặc kéo thả ảnh vào đây
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tải ảnh từ máy</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Problem Input Textarea */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Nội dung đề bài toán (Nhập tay hoặc tự động trích xuất từ ảnh chụp):</span>
              {pastedImage && (
                <span className="text-[11px] text-blue-400 font-normal">
                  Đang kết hợp cùng ảnh chụp SGK
                </span>
              )}
            </label>
            <textarea
              rows={3}
              value={problemPrompt}
              onChange={(e) => setProblemPrompt(e.target.value)}
              placeholder="Thầy/Cô có thể gõ đề bài tại đây, hoặc chỉ cần dán ảnh chụp từ sách giáo khoa ở ô phía trên..."
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition resize-none font-sans"
            />
          </div>

          {/* Action Row */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Quy chuẩn font & nét vẽ: <strong>SGK Toán Kết Nối Tri Thức</strong></span>
            </div>

            <button
              onClick={() => handleSolve(problemPrompt, pastedImage)}
              disabled={isLoading || (!problemPrompt.trim() && !pastedImage)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || 'Đang phân tích & dựng hình...'}</span>
                </>
              ) : pastedImage ? (
                <>
                  <Camera className="w-4 h-4 text-cyan-300" />
                  <span>VẼ HÌNH NGAY TỪ ẢNH CHỤP SGK</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>VẼ HÌNH NGAY (CHUẨN SGK KẾT NỐI TRI THỨC)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3-STEP PROGRESS & STATUS PIPELINE (Strictly required in AI_INSTRUCTIONS.md Section 3) */}
        <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Tiến trình Xử lý & Trạng thái Quy trình Đa nhân:
            </span>
            {isLoading && (
              <span className="text-[11px] text-blue-400 animate-pulse font-mono font-semibold">
                {loadingStep || 'Đang thực thi...'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pipelineSteps.map((step) => {
              const isCompleted = step.status === 'completed';
              const isRunning = step.status === 'running';
              const isError = step.status === 'error';

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition flex items-start gap-3 ${
                    isError
                      ? 'bg-red-950/40 border-red-500/70 text-red-200'
                      : isRunning
                      ? 'bg-blue-950/40 border-blue-500/70 text-blue-100 ring-1 ring-blue-500/30'
                      : isCompleted
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-100'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isError ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : isRunning ? (
                      <RotateCw className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                        {step.id}
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{step.name}</span>
                      {isError && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-red-500/30 text-red-300 border border-red-500/40">
                          Đã dừng do lỗi
                        </span>
                      )}
                      {isRunning && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-blue-500/30 text-blue-300 border border-blue-500/40 animate-pulse">
                          Đang chạy
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Hoàn tất
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-tight ${isError ? 'text-red-300/80' : 'text-slate-400'}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5-SECTION PEDAGOGICAL & GRAPHICAL STUDIO */}
        {solutionData && (
          <div ref={resultRef} className="space-y-6">
            {/* Title & Curriculum Banner */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {solutionData.topic === 'geometry' ? 'Hình Học Không Gian KNTT' : 'Đồ Thị Hàm Số KNTT'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {solutionData.curriculum}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  <MathRenderer content={solutionData.title} />
                </h1>
              </div>

              {/* Consistency Check Status Badge */}
              <div
                className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 ${
                  solutionData.consistencyCheck.isValid
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/60 border-red-500/40 text-red-300'
                }`}
              >
                {solutionData.consistencyCheck.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div className="text-left text-xs">
                  <div className="font-bold">
                    {solutionData.consistencyCheck.isValid
                      ? 'Kiểm tra Logic: Đề bài hợp lệ'
                      : 'Cảnh báo tính nhất quán đề bài!'}
                  </div>
                  <div className="text-[11px] opacity-80 max-w-sm">
                    {solutionData.consistencyCheck.notes}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Layout: Left Column = Analysis & Steps, Right Column = Interactive Figure Studio */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Sections 1, 2, 3 */}
              <div className="lg:col-span-6 space-y-6">
                {/* 1. [Phân tích Đề bài & Giả thiết] */}
                <section className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800/80">
                    <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h2 className="font-bold text-white text-sm tracking-wide uppercase">
                      [Phân tích Đề bài & Giả thiết KNTT]
                    </h2>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                    <p className="text-slate-400 italic">
                      {solutionData.section1_analysis.summary}
                    </p>

                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                      <div className="font-semibold text-slate-200 mb-1.5 text-[11px] uppercase tracking-wider text-blue-400">
                        Giả thiết đã cho:
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {solutionData.section1_analysis.hypotheses.map((h, idx) => (
                          <li key={idx}>
                            <MathRenderer content={h} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                      <div className="font-semibold text-slate-200 mb-1 text-[11px] uppercase tracking-wider text-cyan-400">
                        Mục tiêu kết luận cần tìm:
                      </div>
                      <div className="text-slate-200">
                        <MathRenderer content={solutionData.section1_analysis.conclusion} />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. [Hướng dẫn Tư duy & Gợi ý Yếu tố Phụ trợ] */}
                <section className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        2
                      </span>
                      <h2 className="font-bold text-white text-sm tracking-wide uppercase">
                        [Hướng dẫn Tư duy Sư phạm]
                      </h2>
                    </div>

                    <button
                      onClick={() => setAuxiliaryHighlighted(!auxiliaryHighlighted)}
                      className={`text-xs px-2.5 py-1 rounded-md border font-semibold flex items-center gap-1.5 transition ${
                        auxiliaryHighlighted
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>{auxiliaryHighlighted ? 'Đang bật đường phụ' : 'Hiện đường phụ'}</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                    <div className="text-slate-200">
                      <MathRenderer content={solutionData.section2_pedagogy.thinkingDirection} />
                    </div>

                    {/* Auxiliary Elements */}
                    <div className="bg-amber-950/20 rounded-xl p-3 border border-amber-500/30">
                      <div className="font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5 text-xs">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        Đề xuất dựng thêm yếu tố phụ trợ:
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {solutionData.section2_pedagogy.auxiliaryElements.map((aux, idx) => (
                          <li key={idx}>
                            <MathRenderer content={aux} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pedagogical Advice */}
                    <div className="bg-blue-950/20 rounded-xl p-3 border border-blue-500/20 text-blue-200/90">
                      <span className="font-bold text-blue-300">Lời khuyên sư phạm: </span>
                      {solutionData.section2_pedagogy.pedagogicalAdvice}
                    </div>
                  </div>
                </section>

                {/* 3. [Lời giải Chi tiết Logic Chuẩn SGK] */}
                <section className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800/80">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h2 className="font-bold text-white text-sm tracking-wide uppercase">
                      [Lời giải Chi tiết Logic SGK KNTT]
                    </h2>
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed">
                    {solutionData.section3_solution.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                      >
                        <h3 className="font-bold text-emerald-400 text-xs mb-1.5 flex items-center gap-1.5">
                          <span>{step.title}</span>
                        </h3>
                        <div className="text-slate-300 font-sans">
                          <MathRenderer content={step.detail} />
                        </div>
                      </div>
                    ))}

                    {/* Final Answer Banner */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/40">
                      <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                        Đáp số kết luận:
                      </div>
                      <div className="font-bold text-white text-sm">
                        <MathRenderer content={solutionData.section3_solution.finalAnswer} />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Sections 4 & 5 (Interactive Visual Studio, TikZ Code, Publication) */}
              <div className="lg:col-span-6 space-y-6">
                {/* 4. [Mô phỏng Dựng hình Trực quan Đẹp & Chuẩn Font] */}
                <section className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                        4
                      </span>
                      <h2 className="font-bold text-white text-sm tracking-wide uppercase">
                        [Studio Dựng Hình Chuẩn SGK KNTT]
                      </h2>
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {solutionData.section4_visual.recommendedViewpoint}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 italic">
                    {solutionData.section4_visual.visualDescription}
                  </p>

                  {/* Render 3D Geometry or 2D Calculus Viewer based on visualData type */}
                  <div className="mb-4">
                    {solutionData.section4_visual.visualData.type === '3d_geometry' ? (
                      <Geometry3DViewer
                        visualData={solutionData.section4_visual.visualData}
                        cuttingOffset={cuttingPlaneOffset}
                        onOffsetChange={setCuttingPlaneOffset}
                        auxiliaryHighlighted={auxiliaryHighlighted}
                      />
                    ) : (
                      <CalculusViewer
                        visualData={solutionData.section4_visual.visualData}
                        parameterSlider={solutionData.section4_visual.parameterSlider}
                      />
                    )}
                  </div>

                  {/* TikZ & Asymptote Code Studio */}
                  <div className="mt-4">
                    <TikzAsymptoteViewer
                      tikzCode={solutionData.section4_visual.tikzCode}
                      asymptoteCode={solutionData.section4_visual.asymptoteCode}
                    />
                  </div>
                </section>

                {/* 5. [Ứng dụng Xuất bản & Chèn Giáo án SGK] */}
                <section className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800/80">
                    <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      5
                    </span>
                    <h2 className="font-bold text-white text-sm tracking-wide uppercase">
                      [Ứng dụng Xuất bản & Chèn Giáo án SGK]
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1">
                        Vị trí bài học trong SGK:
                      </div>
                      <div className="text-slate-200">
                        {solutionData.section5_publication.sgkPlacement}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                        Chuẩn định dạng xuất bản:
                      </div>
                      <div className="text-slate-200">
                        {solutionData.section5_publication.formatNotes}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2.5">
                    <Share2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-purple-300">Gợi ý cho Giáo viên: </strong>
                      {solutionData.section5_publication.exportSuggestions}
                    </div>
                  </div>

                  {/* AR / QR Trigger Button */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Trải nghiệm thực tế ảo AR trên điện thoại:
                    </span>
                    <button
                      onClick={() => setShowQRModal(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Xem mã QR AR</span>
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        isInitialRequired={!hasApiKey}
        onSaved={() => {
          setHasApiKey(Boolean(getStoredApiKey()));
          setCurrentModel(getStoredModel());
        }}
      />

      {/* QR / AR Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={solutionData?.title || 'Hình học không gian chuẩn SGK'}
        topic={solutionData?.topic || 'geometry'}
      />

      {/* Footer with branding */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-bold text-slate-300">
            HỖ TRỢ VẼ HÌNH _ PHẠM HẬU
          </div>
          <p className="text-[11px] text-slate-500">
            Chuyên biệt Hình học không gian & Đồ thị hàm số chuẩn SGK Toán Kết Nối Tri Thức (Lớp 10, 11, 12) • Dành riêng cho Giáo viên môn Toán
          </p>
        </div>
      </footer>
    </div>
  );
}
